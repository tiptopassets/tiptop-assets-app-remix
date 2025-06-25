
import { supabase } from '@/integrations/supabase/client';
import { saveUnauthenticatedAnalysis } from '@/services/unauthenticatedAnalysisService';
import { journeyTracker } from '@/services/journeyTrackingService';
import { createAvailableServices } from '@/services/availableServicesService';

export const syncAnalysisToDatabase = async (
  userId: string | undefined,
  address: string,
  analysis: any,
  coordinates?: any,
  satelliteImageUrl?: string,
  refreshUserData?: () => Promise<void>
): Promise<string | null> => {
  console.log('🔄 Starting analysis sync to database:', { userId, address });
  
  try {
    if (!userId) {
      console.log('ℹ️ No user ID - saving to unauthenticated storage');
      await saveUnauthenticatedAnalysis(
        address,
        analysis,
        coordinates,
        satelliteImageUrl
      );
      return null;
    }

    // Save address first
    const { data: addressData, error: addressError } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address: address,
        formatted_address: address,
        coordinates: coordinates,
        is_primary: false
      })
      .select()
      .single();

    if (addressError) throw addressError;

    // Save analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('user_property_analyses')
      .insert({
        user_id: userId,
        address_id: addressData.id,
        analysis_results: analysis,
        coordinates: coordinates,
        satellite_image_url: satelliteImageUrl,
        total_monthly_revenue: analysis.summary?.totalMonthlyRevenue || 0,
        total_opportunities: analysis.opportunities?.length || 0,
        property_type: analysis.propertyType || 'unknown'
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Create available services from analysis
    await createAvailableServices(analysisData.id, analysis);

    // Update journey tracking
    await journeyTracker.updateStep('analysis_completed', {
      analysis_id: analysisData.id
    });

    console.log('✅ Analysis synced successfully');

    // Refresh user data
    if (refreshUserData) {
      await refreshUserData();
    }

    return analysisData.id;
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
