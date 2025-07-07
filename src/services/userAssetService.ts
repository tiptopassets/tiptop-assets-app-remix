
import { supabase } from '@/integrations/supabase/client';
import { UserAssetSelection } from '@/types/userData';

export const saveAssetSelection = async (
  userId: string,
  analysisId: string | null,
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

    // Enhanced validation with better error messages
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a valid string, got: ' + userId);
    }
    if (!assetType || typeof assetType !== 'string') {
      throw new Error('Asset type is required and must be a valid string, got: ' + assetType);
    }

    // Validate analysisId if provided (now optional)
    if (analysisId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        console.error('❌ Invalid analysis ID format:', analysisId);
        throw new Error(`Analysis ID must be a valid UUID, got: ${analysisId}`);
      }

      // Verify the analysis exists and belongs to the user
      const { data: analysisExists, error: verifyError } = await supabase
        .from('user_property_analyses')
        .select('id')
        .eq('id', analysisId)
        .eq('user_id', userId)
        .maybeSingle();

      if (verifyError) {
        console.error('❌ Error verifying analysis:', verifyError);
        throw new Error('Failed to verify analysis exists');
      }

      if (!analysisExists) {
        console.error('❌ Analysis not found or not owned by user:', { analysisId, userId });
        throw new Error(`Analysis ${analysisId} not found or not accessible to user ${userId}`);
      }

      console.log('✅ Analysis verification passed:', analysisExists.id);
    } else {
      console.log('⚠️ No analysis ID provided - saving asset selection without analysis link');
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
