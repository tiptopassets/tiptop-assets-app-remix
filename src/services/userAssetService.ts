
import { supabase } from '@/integrations/supabase/client';
import { UserAssetSelection } from '@/types/userData';

export const saveAssetSelection = async (
  userId: string,
  analysisId: string,
  assetType: string,
  assetData: any,
  monthlyRevenue: number,
  setupCost: number = 0,
  roiMonths?: number
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_asset_selections')
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        asset_type: assetType,
        asset_data: assetData,
        monthly_revenue: monthlyRevenue,
        setup_cost: setupCost,
        roi_months: roiMonths,
        status: 'selected'
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('Error saving asset selection:', err);
    throw err;
  }
};

export const loadUserAssetSelections = async (userId: string): Promise<UserAssetSelection[]> => {
  try {
    const { data, error } = await supabase
      .from('user_asset_selections')
      .select('*')
      .eq('user_id', userId)
      .order('selected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error loading asset selections:', err);
    throw err;
  }
};
