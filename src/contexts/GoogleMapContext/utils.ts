
import { supabase } from '@/integrations/supabase/client';
import { saveAddress } from '@/services/userAddressService';
import { savePropertyAnalysis } from '@/services/userAnalysisService';
import { saveUnauthenticatedAnalysis } from '@/services/unauthenticatedAnalysisService';

export const syncAnalysisToDatabase = async (
  userId: string | undefined,
  address: string,
  analysis: any,
  coordinates?: any,
  satelliteImageUrl?: string,
  refreshUserData?: () => Promise<void>
) => {
  if (!userId) {
    console.log('🔄 User not authenticated, saving to localStorage instead of database');
    // Save to localStorage for unauthenticated users
    saveUnauthenticatedAnalysis(address, analysis, coordinates, address);
    return;
  }

  try {
    console.log('🔄 Syncing analysis to database for authenticated user...', { address, userId });
    
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
      console.log('✅ Analysis synced successfully to database:', analysisId);
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
    
    // Handle saving based on authentication status
    if (userId && refreshUserData) {
      console.log('👤 User authenticated - saving directly to database');
      // Sync to database for authenticated users
      await syncAnalysisToDatabase(
        userId,
        address, 
        data.analysis, 
        coords || data.propertyInfo?.coordinates,
        data.satelliteImageUrl,
        refreshUserData
      );
    } else {
      console.log('🔄 User not authenticated - saving to localStorage');
      // Save to localStorage for unauthenticated users
      saveUnauthenticatedAnalysis(
        address, 
        data.analysis, 
        coords || data.propertyInfo?.coordinates, 
        address
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
