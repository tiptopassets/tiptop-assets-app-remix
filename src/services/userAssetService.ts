
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
    console.log('🚀 ATTEMPTING TO SAVE ASSET SELECTION');
    console.log('🔄 saveAssetSelection called with:', {
      userId,
      analysisId,
      assetType,
      assetData,
      monthlyRevenue,
      setupCost,
      roiMonths,
      userIdType: typeof userId,
      analysisIdType: typeof analysisId,
      userIdLength: userId?.length,
      analysisIdLength: analysisId?.length
    });

    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required but was: ' + userId);
    }
    if (!analysisId) {
      throw new Error('Analysis ID is required but was: ' + analysisId);
    }
    if (!assetType) {
      throw new Error('Asset type is required but was: ' + assetType);
    }

    const insertData = {
      user_id: userId,
      analysis_id: analysisId,
      asset_type: assetType,
      asset_data: assetData || {},
      monthly_revenue: monthlyRevenue || 0,
      setup_cost: setupCost || 0,
      roi_months: roiMonths,
      status: 'selected'
    };

    console.log('💾 Inserting data to user_asset_selections:', insertData);

    const { data, error } = await supabase
      .from('user_asset_selections')
      .insert(insertData)
      .select()
      .single();

    console.log('📊 Supabase Insert Response:', { data, error });

    if (error) {
      console.error('🚨 Supabase insert error:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint
      });
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from insert operation');
    }
    
    console.log('✅ Asset selection saved successfully with ID:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error saving asset selection:', {
      error: err,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
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
