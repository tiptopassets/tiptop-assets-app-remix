
import { supabase } from '@/integrations/supabase/client';
import { saveUnauthenticatedAnalysis } from '@/services/unauthenticatedAnalysisService';
import { getSessionId } from '@/services/sessionStorageService';

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

  console.log('🔄 Syncing analysis to database deprecated - use UserData service functions directly');
  console.warn('⚠️ syncAnalysisToDatabase is deprecated. Use saveAddress and savePropertyAnalysis from UserData service instead.');
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
        satelliteImage: satelliteImageBase64,
        sessionId: getSessionId(),
        userId: userId
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
