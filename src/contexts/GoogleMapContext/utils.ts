
import { supabase } from '@/integrations/supabase/client';
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
  if (!userId) {
    console.warn('⚠️ No user authenticated, skipping database sync');
    return;
  }

  try {
    console.log('🔄 Syncing analysis to database...', { address, userId });
    
    // First, save or get the address
    const addressId = await saveAddress(userId, address, coordinates);
    if (!addressId) {
      console.error('❌ Failed to save address, cannot sync analysis');
      return;
    }

    // Then save the analysis with the satellite image URL
    const analysisId = await savePropertyAnalysis(
      userId, 
      addressId, 
      analysis, 
      coordinates,
      satelliteImageUrl
    );
    
    if (analysisId) {
      console.log('✅ Analysis synced successfully:', analysisId);
      // Refresh user data to reflect the new analysis
      if (refreshUserData) {
        await refreshUserData();
      }
    }
  } catch (error) {
    console.error('❌ Error syncing analysis to database:', error);
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
    console.log('🔍 Generating analysis for:', address);
    
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
    
    // Sync to database with satellite image URL if user is authenticated
    if (userId && refreshUserData) {
      await syncAnalysisToDatabase(
        userId,
        address, 
        data.analysis, 
        coords || data.propertyInfo?.coordinates,
        data.satelliteImageUrl,
        refreshUserData
      );
    }
    
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
