
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { UserPropertyAnalysis } from '@/types/userData';

export const savePropertyAnalysis = async (
  userId: string,
  addressId: string,
  analysisResults: AnalysisResults,
  coordinates?: any
): Promise<string | null> => {
  try {
    console.log('💾 Saving property analysis:', { userId, addressId });
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    
    if (!analysisResults) {
      throw new Error('Analysis results are required');
    }

    const totalRevenue = analysisResults.topOpportunities?.reduce((sum, opp) => sum + (opp.monthlyRevenue || 0), 0) || 0;
    
    const { data, error } = await supabase
      .from('user_property_analyses')
      .insert({
        user_id: userId,
        address_id: addressId,
        analysis_results: analysisResults as any,
        total_monthly_revenue: totalRevenue,
        total_opportunities: analysisResults.topOpportunities?.length || 0,
        property_type: analysisResults.propertyType,
        coordinates,
        using_real_solar_data: analysisResults.rooftop?.usingRealSolarData || false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting analysis:', error);
      throw error;
    }
    
    console.log('✅ Analysis saved successfully:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error saving property analysis:', err);
    throw err;
  }
};

export const loadUserAnalyses = async (userId: string): Promise<UserPropertyAnalysis[]> => {
  try {
    console.log('📊 Loading analyses for user:', userId);
    
    if (!userId) {
      console.warn('⚠️ No user ID provided for loading analyses');
      return [];
    }

    const { data, error } = await supabase
      .from('user_property_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error loading analyses:', error);
      throw error;
    }
    
    const typedAnalysisData: UserPropertyAnalysis[] = (data || []).map(item => ({
      ...item,
      analysis_results: item.analysis_results as unknown as AnalysisResults
    }));
    
    console.log('✅ Loaded analyses:', typedAnalysisData.length);
    return typedAnalysisData;
  } catch (err) {
    console.error('❌ Error loading analyses:', err);
    throw err;
  }
};
