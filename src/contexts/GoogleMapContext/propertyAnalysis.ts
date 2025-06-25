
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
  userId
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
        
        // Save to database if user is authenticated with comprehensive error handling
        await saveToDatabaseWithVerification(
          propertyAddress,
          mockResults,
          coordinateResult.coordinates,
          saveAddress,
          savePropertyAnalysis,
          refreshUserData,
          userId
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
      
      // Save to database if user is authenticated with comprehensive error handling
      await saveToDatabaseWithVerification(
        propertyAddress,
        processedResult.analysisResults,
        coordinateResult.coordinates,
        saveAddress,
        savePropertyAnalysis,
        refreshUserData,
        userId
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

// Enhanced helper function to save analysis to database with verification and retry logic
async function saveToDatabaseWithVerification(
  propertyAddress: string,
  analysisResults: AnalysisResults,
  coordinates: google.maps.LatLngLiteral | null,
  saveAddress: ((address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>) | null | undefined,
  savePropertyAnalysis: ((addressId: string, analysisResults: AnalysisResults, coordinates?: any) => Promise<string | null>) | null | undefined,
  refreshUserData: (() => Promise<void>) | null | undefined,
  userId?: string
) {
  if (!userId || !saveAddress || !savePropertyAnalysis) {
    console.log('📝 User not authenticated or save functions not available, skipping database save');
    return;
  }

  try {
    console.log('💾 Starting database save process...', {
      propertyAddress,
      userId,
      analysisResultsKeys: Object.keys(analysisResults),
      topOpportunitiesCount: analysisResults.topOpportunities?.length || 0
    });
    
    // Step 1: Save the address to get an addressId
    console.log('💾 Step 1: Saving address...');
    const addressId = await saveAddress(propertyAddress, coordinates, propertyAddress);
    if (!addressId) {
      throw new Error('Failed to save address - no addressId returned');
    }
    
    console.log('✅ Address saved successfully with ID:', addressId);
    
    // Step 2: Save the analysis results
    console.log('💾 Step 2: Saving property analysis...');
    const analysisId = await savePropertyAnalysis(addressId, analysisResults, coordinates);
    if (!analysisId) {
      throw new Error('Failed to save analysis - no analysisId returned');
    }
    
    console.log('✅ Analysis saved successfully with ID:', analysisId);
    
    // Step 3: Verify the save by checking if the data exists
    console.log('🔍 Step 3: Verifying database save...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_property_analyses')
      .select('id, total_monthly_revenue, total_opportunities')
      .eq('id', analysisId)
      .single();
    
    if (verificationError) {
      console.error('❌ Verification failed:', verificationError);
      throw new Error('Database save verification failed');
    }
    
    console.log('✅ Database save verified:', verificationData);
    
    // Step 4: Refresh user data to update dashboard
    if (refreshUserData) {
      console.log('🔄 Step 4: Refreshing user data...');
      await refreshUserData();
      console.log('✅ User data refreshed successfully');
    }
    
    console.log('🎉 Complete database save process finished successfully');
    
  } catch (error) {
    console.error('❌ Database save process failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      propertyAddress,
      analysisResultsKeys: analysisResults ? Object.keys(analysisResults) : 'null'
    });
    
    // Don't throw error here - we don't want to break the analysis flow
    // But we should log it prominently for debugging
    console.error('🚨 CRITICAL: Property analysis completed but failed to save to database');
  }
}
