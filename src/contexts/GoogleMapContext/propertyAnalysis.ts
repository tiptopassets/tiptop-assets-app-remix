
import { supabase } from '@/integrations/supabase/client';
import { imageUrlToBase64, generateMapImageUrls } from '@/contexts/ModelGeneration/utils';
import { AnalysisResults } from './types';
import { generateLocalMockAnalysis } from './mockAnalysisGenerator';
import { processPropertyAnalysis } from './dataFlowManager';
import { ensureCoordinates } from './coordinateService';
import { toast } from '@/hooks/use-toast';

interface AnalysisParams {
  propertyAddress: string;
  addressCoordinates: google.maps.LatLngLiteral | null;
  useLocalAnalysis: boolean;
  setIsGeneratingAnalysis: (value: boolean) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  setAnalysisComplete: (value: boolean) => void;
  setUseLocalAnalysis: (value: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  toast: typeof toast;
  // Database integration parameters
  saveAddress?: ((address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>) | null;
  savePropertyAnalysis?: ((addressId: string, analysisResults: AnalysisResults, coordinates?: any) => Promise<string | null>) | null;
  refreshUserData?: (() => Promise<void>) | null;
  userId?: string;
  // Context state setters for tracking IDs
  setCurrentAnalysisId?: (id: string | null) => void;
  setCurrentAddressId?: (id: string | null) => void;
}

export const generatePropertyAnalysis = async ({
  propertyAddress,
  addressCoordinates,
  useLocalAnalysis,
  setIsGeneratingAnalysis,
  setIsAnalyzing,
  setAnalysisResults,
  setAnalysisComplete,
  setUseLocalAnalysis,
  setAnalysisError,
  toast,
  saveAddress,
  savePropertyAnalysis,
  refreshUserData,
  userId,
  setCurrentAnalysisId,
  setCurrentAddressId
}: AnalysisParams): Promise<void> => {
  if (!propertyAddress) {
    toast({
      title: "Address Required",
      description: "Please enter a property address to analyze",
      variant: "destructive"
    });
    return;
  }

  try {
    // Reset error state when starting a new analysis
    setAnalysisError(null);
    setIsGeneratingAnalysis(true);
    setIsAnalyzing(true);
    
    console.log('🏠 Starting property analysis:', { 
      propertyAddress, 
      useLocalAnalysis, 
      hasUserId: !!userId,
      hasSaveFunctions: !!(saveAddress && savePropertyAnalysis)
    });
    
    // Ensure coordinates are always available using centralized service
    const coordinateResult = await ensureCoordinates(propertyAddress, addressCoordinates);
    console.log("📍 Ensured coordinates:", coordinateResult);
    
    // If using local analysis (fallback mode), generate mock data with guaranteed coordinates
    if (useLocalAnalysis) {
      setTimeout(async () => {
        const mockResults = await generateLocalMockAnalysis(propertyAddress, coordinateResult.coordinates);
        setAnalysisResults(mockResults);
        setAnalysisComplete(true);
        setIsGeneratingAnalysis(false);
        setIsAnalyzing(false);
        
        // Save to database if user is authenticated
        await saveToDatabaseIfAuthenticated(
          propertyAddress,
          mockResults,
          coordinateResult.coordinates,
          saveAddress,
          savePropertyAnalysis,
          refreshUserData,
          userId,
          setCurrentAnalysisId,
          setCurrentAddressId
        );
        
        toast({
          title: "Analysis Complete",
          description: `Found ${mockResults.topOpportunities.length} monetization opportunities for your property (Demo mode)`,
        });
      }, 2000);
      return;
    }
    
    // Get satellite image if we have coordinates
    let satelliteImage = null;
    if (coordinateResult.coordinates) {
      try {
        const mapUrls = await generateMapImageUrls(coordinateResult.coordinates);
        satelliteImage = await imageUrlToBase64(mapUrls.satelliteImageUrl);
        console.log("📸 Captured satellite image for analysis");
      } catch (err) {
        console.error("❌ Failed to capture satellite image:", err);
      }
    }
    
    // Show toast notification about processing
    toast({
      title: "Processing Property",
      description: coordinateResult.source === 'provided' 
        ? "Using precise coordinates for analysis"
        : `Using ${coordinateResult.source} coordinates (confidence: ${Math.round(coordinateResult.confidence * 100)}%)`,
    });
    
    // Call Supabase Edge Function with guaranteed coordinates
    const { data, error } = await supabase.functions.invoke('analyze-property', {
      body: { 
        address: propertyAddress,
        coordinates: coordinateResult.coordinates,
        satelliteImage: satelliteImage,
        forceLocalAnalysis: false
      }
    });
    
    if (error) {
      // Check if it's a quota error
      if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
        console.log("💡 API quota exceeded, switching to fallback mode");
        setUseLocalAnalysis(true);
        toast({
          title: "API Quota Exceeded",
          description: "Using fallback mode for analysis. Results will be approximate.",
        });
        // Retry with local analysis
        return generatePropertyAnalysis({
          propertyAddress,
          addressCoordinates: coordinateResult.coordinates,
          useLocalAnalysis: true,
          setIsGeneratingAnalysis,
          setIsAnalyzing,
          setAnalysisResults,
          setAnalysisComplete,
          setUseLocalAnalysis,
          setAnalysisError,
          toast,
          saveAddress,
          savePropertyAnalysis,
          refreshUserData,
          userId
        });
      }
      throw new Error(error.message);
    }
    
    if (data && data.analysis) {
      // Process the analysis results through centralized data flow manager
      const processedResult = await processPropertyAnalysis(data.analysis, {
        address: propertyAddress,
        coordinates: coordinateResult.coordinates,
        propertyType: data.analysis.propertyType,
        useRealData: true
      });
      
      setAnalysisResults(processedResult.analysisResults);
      setAnalysisComplete(true);
      
      // Save to database if user is authenticated
      await saveToDatabaseIfAuthenticated(
        propertyAddress,
        processedResult.analysisResults,
        coordinateResult.coordinates,
        saveAddress,
        savePropertyAnalysis,
        refreshUserData,
        userId,
        setCurrentAnalysisId,
        setCurrentAddressId
      );
      
      // Show toast with validation summary
      const validationSummary = processedResult.validationLog.join(', ');
      const savedToDashboard = userId && saveAddress && savePropertyAnalysis ? " and saved to dashboard" : "";
      toast({
        title: "Analysis Complete",
        description: `Found ${processedResult.analysisResults.topOpportunities.length} opportunities${savedToDashboard}. ${validationSummary}`,
      });
    } else {
      throw new Error("No analysis data received");
    }
    
  } catch (error) {
    console.error("❌ Error generating property analysis:", error);
    
    // If we encounter any API error, fall back to local analysis with guaranteed coordinates
    if (error instanceof Error && 
        (error.message.includes('OpenAI') || 
         error.message.includes('quota') || 
         error.message.includes('insufficient_quota') ||
         error.message.includes('geocode') ||
         error.message.includes('coordinates'))) {
      
      console.log("💡 API error, switching to fallback mode with guaranteed coordinates");
      setUseLocalAnalysis(true);
      toast({
        title: "API Connection Issue",
        description: "Switching to demo mode with market-based estimates.",
      });
      
      // Try again with local analysis and guaranteed coordinates
      const coordinateResult = await ensureCoordinates(propertyAddress, addressCoordinates);
      return generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates: coordinateResult.coordinates,
        useLocalAnalysis: true,
        setIsGeneratingAnalysis,
        setIsAnalyzing,
        setAnalysisResults,
        setAnalysisComplete,
        setUseLocalAnalysis,
        setAnalysisError,
        toast,
        saveAddress,
        savePropertyAnalysis,
        refreshUserData,
        userId
      });
    }
    
    setAnalysisError("We couldn't analyze this property. Please try again later or switch to manual mode.");
    setAnalysisComplete(false);
    
    toast({
      title: "Analysis Failed",
      description: "We couldn't analyze this property automatically. Try manual entry mode.",
      variant: "destructive"
    });
  } finally {
    if (!useLocalAnalysis) {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  }
};

// Helper function to save analysis to database if user is authenticated
async function saveToDatabaseIfAuthenticated(
  propertyAddress: string,
  analysisResults: AnalysisResults,
  coordinates: google.maps.LatLngLiteral | null,
  saveAddress: ((address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>) | null | undefined,
  savePropertyAnalysis: ((addressId: string, analysisResults: AnalysisResults, coordinates?: any) => Promise<string | null>) | null | undefined,
  refreshUserData: (() => Promise<void>) | null | undefined,
  userId?: string,
  setCurrentAnalysisId?: (id: string | null) => void,
  setCurrentAddressId?: (id: string | null) => void
) {
  // Always track the analysis completion for journey tracking (authenticated or not)
  try {
    const { trackAnalysisCompleted } = await import('@/services/userJourneyService');
    console.log('📊 Tracking analysis completion for journey...');
    
    // Track analysis completion - this works for both authenticated and anonymous users
    await trackAnalysisCompleted(propertyAddress, analysisResults, coordinates);
    console.log('✅ Analysis completion tracked in journey');
  } catch (error) {
    console.error('❌ Error tracking analysis completion:', error);
  }

  if (!userId || !saveAddress || !savePropertyAnalysis) {
    // Save anonymously via RPC so we still get an analysis_id linked to session
    try {
      const { getSessionId, updateAssetSelectionsWithAnalysisId, storeAnalysisIdForSession } = await import('@/services/sessionStorageService');
      const sessionId = getSessionId();
      const totalRevenue = (analysisResults.topOpportunities || []).reduce((sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0);
      const totalOpportunities = (analysisResults.topOpportunities || []).length;

      console.log('📝 Saving anonymous analysis via RPC...', { sessionId, totalRevenue, totalOpportunities });

      const { data, error } = await supabase.rpc('save_property_analysis', {
        p_user_id: null,
        p_session_id: sessionId,
        p_property_address: propertyAddress,
        p_coordinates: coordinates as any,
        p_analysis_results: analysisResults as any,
        p_total_monthly_revenue: totalRevenue,
        p_total_opportunities: totalOpportunities,
        p_satellite_image_url: null
      });

      if (error) {
        console.warn('⚠️ Anonymous analysis RPC failed (non-blocking):', error);
        return;
      }

      const analysisId = data as unknown as string | null;
      if (analysisId) {
        console.log('✅ Anonymous analysis saved with ID:', analysisId);
        // Persist and update context + pending selections
        storeAnalysisIdForSession(analysisId);
        if (setCurrentAnalysisId) setCurrentAnalysisId(analysisId);
        try {
          const updated = await updateAssetSelectionsWithAnalysisId(sessionId, analysisId);
          console.log('🔗 Linked', updated, 'pending selections to analysis');
        } catch (linkErr) {
          console.warn('Could not link pending selections:', linkErr);
        }
      }
    } catch (anonErr) {
      console.warn('Anonymous save path encountered an error (non-blocking):', anonErr);
    }
    return;
  }

  try {
    console.log('💾 Saving analysis results to database...');
    
    // First, save the address to get an addressId
    const addressId = await saveAddress(propertyAddress, coordinates, propertyAddress);
    if (!addressId) {
      console.error('❌ Failed to save address, cannot save analysis');
      return;
    }
    
    console.log('✅ Address saved with ID:', addressId);
    
    // Store the address ID in context for asset saving
    if (setCurrentAddressId) {
      setCurrentAddressId(addressId);
    }
    
    // Then save the analysis results
    const analysisId = await savePropertyAnalysis(addressId, analysisResults, coordinates);
    if (analysisId) {
      console.log('✅ Analysis saved to database with ID:', analysisId);
      
      // Store the analysis ID in context for asset saving
      if (setCurrentAnalysisId) {
        setCurrentAnalysisId(analysisId);
      }

      // Update journey tracking with the analysis ID now that we have it
      try {
        const { trackAnalysisCompleted } = await import('@/services/userJourneyService');
        console.log('🔗 Updating journey tracking with analysis ID:', analysisId);
        await trackAnalysisCompleted(propertyAddress, analysisResults, coordinates, analysisId);
      } catch (error) {
        console.error('❌ Error updating journey tracking with analysis ID:', error);
      }

      // Update any existing asset selections with the analysis ID
      try {
        const { updateAssetSelectionsWithAnalysisId, getSessionId } = await import('@/services/sessionStorageService');
        const sessionId = getSessionId();
        console.log('🔗 Updating asset selections with analysis ID:', { sessionId, analysisId });
        const updatedCount = await updateAssetSelectionsWithAnalysisId(sessionId, analysisId);
        console.log('✅ Updated', updatedCount, 'asset selections with analysis ID');
      } catch (error) {
        console.error('❌ Error updating asset selections with analysis ID:', error);
      }
      
      // Refresh user data to update dashboard
      if (refreshUserData) {
        await refreshUserData();
        console.log('🔄 User data refreshed for dashboard update');
      }
    } else {
      console.error('❌ Failed to save analysis to database');
    }
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    // Don't throw error here - we don't want to break the analysis flow
  }
}
