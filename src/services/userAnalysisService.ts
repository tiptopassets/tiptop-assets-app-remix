
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
    const totalRevenue = analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0);
    
    const { data, error } = await supabase
      .from('user_property_analyses')
      .insert({
        user_id: userId,
        address_id: addressId,
        analysis_results: analysisResults as any,
        total_monthly_revenue: totalRevenue,
        total_opportunities: analysisResults.topOpportunities.length,
        property_type: analysisResults.propertyType,
        coordinates,
        using_real_solar_data: analysisResults.rooftop.usingRealSolarData || false
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('Error saving property analysis:', err);
    throw err;
  }
};

export const loadUserAnalyses = async (userId: string): Promise<UserPropertyAnalysis[]> => {
  try {
    const { data, error } = await supabase
      .from('user_property_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const typedAnalysisData: UserPropertyAnalysis[] = (data || []).map(item => ({
      ...item,
      analysis_results: item.analysis_results as unknown as AnalysisResults
    }));
    
    return typedAnalysisData;
  } catch (err) {
    console.error('Error loading analyses:', err);
    throw err;
  }
};
