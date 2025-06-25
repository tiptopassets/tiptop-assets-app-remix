
import { supabase } from '@/integrations/supabase/client';
import { saveUnauthenticatedAnalysis } from '@/services/unauthenticatedAnalysisService';
import { journeyTracker } from '@/services/journeyTrackingService';
import { createAvailableServices } from '@/services/availableServicesService';
import { saveAddress } from '@/services/userAddressService';
import { savePropertyAnalysis } from '@/services/userAnalysisService';

export const syncAnalysisToDatabase = async (
  userId: string | undefined,
  address: string,
  analysis: any,
  coordinates?: any,
  satelliteImageUrl?: string,
  refreshUserData?: () => Promise<void>
) => {
  console.log('🔄 Starting analysis sync to database:', { userId, address });
  
  try {
    if (!userId) {
      console.log('ℹ️ No user ID - skipping database sync');
      return null;
    }

    // Save address first
    const addressId = await saveAddress(userId, address, coordinates, address, true);
    if (!addressId) {
      throw new Error('Failed to save address');
    }

    // Save analysis
    const analysisId = await savePropertyAnalysis(userId, addressId, analysis, coordinates, satelliteImageUrl);
    if (!analysisId) {
      throw new Error('Failed to save analysis');
    }

    // Create available services from analysis
    await createAvailableServices(analysisId, analysis);

    // Update journey tracking
    await journeyTracker.updateStep('analysis_completed', {
      analysis_id: analysisId
    });

    console.log('✅ Analysis synced successfully');

    // Refresh user data
    if (refreshUserData) {
      await refreshUserData();
    }

    return analysisId;
  } catch (error) {
    console.error('❌ Failed to sync analysis:', error);
    throw error;
  }
};

export const generateAnalysis = async (
  address: string,
  coords: google.maps.LatLngLiteral | undefined,
  satelliteImageBase64: string | undefined,
  userId: string | undefined,
  refreshUserData: (() => Promise<void>) | undefined,
  toast: any
) => {
  if (!address.trim()) {
    console.warn('⚠️ Cannot generate analysis: address is empty');
    return null;
  }

  try {
    console.log('🔍 Generating analysis for:', address, { isAuthenticated: !!userId });
    
    const { data, error } = await supabase.functions.invoke('analyze-property', {
      body: {
        address: address.trim(),
        coordinates: coords,
        satelliteImage: satelliteImageBase64
      }
    });

    if (error) {
      console.error('❌ Analysis API error:', error);
      throw error;
    }

    if (!data?.success) {
      console.error('❌ Analysis failed:', data?.error);
      throw new Error(data?.error || 'Analysis failed');
    }

    console.log('✅ Analysis completed successfully');
    
    // Note: Database saving is now handled in the propertyAnalysis.ts file
    // through the integrated save functions passed from GoogleMapProvider
    
    return data.analysis;
  } catch (error) {
    console.error('❌ Error generating analysis:', error);
    toast({
      title: "Analysis Failed",
      description: error.message || "Failed to analyze property",
      variant: "destructive"
    });
    throw error;
  }
};
