import { supabase } from '@/integrations/supabase/client';

// Enhanced data repair service with comprehensive recovery capabilities
export const repairUserAnalysisData = async (userId: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🔧 [DATA-REPAIR] Starting comprehensive data repair for user:', userId);
    
    // Call the repair edge function
    const { data, error } = await supabase.functions.invoke('repair-user-data', {
      body: { userId, forceRepair: false }
    });

    if (error) {
      console.error('❌ [DATA-REPAIR] Edge function error:', error);
      throw error;
    }

    if (data?.success) {
      console.log('✅ [DATA-REPAIR] Repair completed:', data.details);
      return {
        success: true,
        message: data.message,
        details: data.details
      };
    } else {
      console.warn('⚠️ [DATA-REPAIR] Repair completed with warnings:', data);
      return {
        success: false,
        message: data?.error || 'Unknown repair error'
      };
    }

  } catch (error) {
    console.error('❌ [DATA-REPAIR] Failed to repair user data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during data repair'
    };
  }
};

// Get the most recent analysis ID for a user with robust error handling
export const getRecentAnalysisId = async (userId: string): Promise<string | null> => {
  try {
    console.log('🔍 [RECOVERY] Finding recent analysis for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // First try to get from user_property_analyses
    const { data: analysisData, error: analysisError } = await supabase
      .from('user_property_analyses')
      .select('id, created_at, analysis_results')
      .eq('user_id', userId)
      .not('analysis_results', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysisError && analysisData) {
      console.log('✅ [RECOVERY] Found recent analysis:', analysisData.id);
      return analysisData.id;
    }

    console.log('⚠️ [RECOVERY] No analysis found, attempting data repair...');
    
    // If no analysis found, try to repair the user's data
    const repairResult = await repairUserAnalysisData(userId);
    
    if (repairResult.success && repairResult.details?.analysisId) {
      console.log('✅ [RECOVERY] Data repair successful, analysis ID:', repairResult.details.analysisId);
      return repairResult.details.analysisId;
    }

    // Fallback: try to get from user_journey_complete
    const { data: journeyData, error: journeyError } = await supabase
      .from('user_journey_complete')
      .select('analysis_id, property_address, total_monthly_revenue')
      .eq('user_id', userId)
      .not('analysis_id', 'is', null)
      .not('property_address', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!journeyError && journeyData?.analysis_id) {
      console.log('✅ [RECOVERY] Found analysis ID from journey:', journeyData.analysis_id);
      return journeyData.analysis_id;
    }

    console.log('❌ [RECOVERY] No analysis ID found for user');
    return null;

  } catch (error) {
    console.error('❌ [RECOVERY] Error finding recent analysis:', error);
    return null;
  }
};

// Repair journey summary data with better user association
export const repairJourneySummaryData = async (userId: string): Promise<void> => {
  try {
    console.log('🔧 [REPAIR] Starting journey data repair for user:', userId);

    // Link any unlinked journey data that might belong to this user
    const { error: linkError } = await supabase
      .from('user_journey_complete')
      .update({ user_id: userId })
      .is('user_id', null)
      .not('property_address', 'is', null)
      .not('analysis_results', 'is', null)
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (linkError) {
      console.warn('⚠️ [REPAIR] Could not link unlinked journey data:', linkError);
    } else {
      console.log('✅ [REPAIR] Successfully linked unlinked journey data');
    }

    // Ensure analysis_id is properly set in journey records
    const { data: journeyWithoutAnalysisId } = await supabase
      .from('user_journey_complete')
      .select('id, property_address')
      .eq('user_id', userId)
      .is('analysis_id', null)
      .not('property_address', 'is', null);

    if (journeyWithoutAnalysisId && journeyWithoutAnalysisId.length > 0) {
      const latestAnalysisId = await getRecentAnalysisId(userId);
      
      if (latestAnalysisId) {
        const { error: updateError } = await supabase
          .from('user_journey_complete')
          .update({ analysis_id: latestAnalysisId })
          .eq('user_id', userId)
          .is('analysis_id', null);

        if (!updateError) {
          console.log('✅ [REPAIR] Updated journey records with analysis ID');
        }
      }
    }

  } catch (error) {
    console.error('❌ [REPAIR] Error repairing journey data:', error);
  }
};

// Auto-recover user data on authentication with enhanced repair
export const autoRecoverUserData = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 [AUTO-RECOVERY] Starting enhanced auto-recovery for user:', userId);
    
    // Run comprehensive data repair first
    const repairResult = await repairUserAnalysisData(userId);
    
    if (repairResult.success) {
      console.log('✅ [AUTO-RECOVERY] Data repair completed successfully');
    } else {
      console.warn('⚠️ [AUTO-RECOVERY] Data repair had issues:', repairResult.message);
    }
    
    // Run traditional repair operations
    await repairJourneySummaryData(userId);

    // Link any unlinked analyses from journey data
    try {
      const { data: linkedCount, error: linkError } = await supabase.rpc('link_user_analyses_from_journey', {
        p_user_id: userId
      });

      if (linkError) {
        console.warn('⚠️ [AUTO-RECOVERY] Could not link analyses from journey:', linkError);
      } else if (linkedCount > 0) {
        console.log('✅ [AUTO-RECOVERY] Linked', linkedCount, 'analyses from journey data');
      }
    } catch (linkError) {
      console.warn('⚠️ [AUTO-RECOVERY] Error linking analyses from journey:', linkError);
    }
    
    // Update context with recovered analysis ID
    const recentAnalysisId = await getRecentAnalysisId(userId);
    if (recentAnalysisId) {
      localStorage.setItem('currentAnalysisId', recentAnalysisId);
      console.log('✅ [AUTO-RECOVERY] Restored analysis ID to context:', recentAnalysisId);
    }

  } catch (error) {
    console.error('❌ [AUTO-RECOVERY] Error in enhanced auto-recovery:', error);
  }
};

// Validate and fix asset selection data integrity
export const validateAssetSelectionData = async (userId: string): Promise<{ valid: number; fixed: number; errors: string[] }> => {
  try {
    const errors: string[] = [];
    let validCount = 0;
    let fixedCount = 0;

    // Get all asset selections for user
    const { data: selections, error } = await supabase
      .from('user_asset_selections')
      .select('id, analysis_id, asset_type, monthly_revenue')
      .eq('user_id', userId);

    if (error) {
      errors.push(`Failed to fetch asset selections: ${error.message}`);
      return { valid: 0, fixed: 0, errors };
    }

    if (!selections || selections.length === 0) {
      return { valid: 0, fixed: 0, errors: ['No asset selections found'] };
    }

    // Validate each selection
    for (const selection of selections) {
      try {
        if (!selection.analysis_id) {
          // Try to fix orphaned selection by linking to user's latest analysis
          const latestAnalysisId = await getRecentAnalysisId(userId);
          if (latestAnalysisId) {
            const { error: updateError } = await supabase
              .from('user_asset_selections')
              .update({ analysis_id: latestAnalysisId })
              .eq('id', selection.id);

            if (!updateError) {
              fixedCount++;
            } else {
              errors.push(`Failed to fix selection ${selection.id}: ${updateError.message}`);
            }
          } else {
            errors.push(`No valid analysis found for orphaned selection ${selection.id}`);
          }
        } else {
          // Check if analysis exists
          const { data: analysis } = await supabase
            .from('user_property_analyses')
            .select('id')
            .eq('id', selection.analysis_id)
            .eq('user_id', userId)
            .maybeSingle();

          if (analysis) {
            validCount++;
          } else {
            // Try to fix by linking to user's latest analysis
            const latestAnalysisId = await getRecentAnalysisId(userId);
            if (latestAnalysisId) {
              const { error: updateError } = await supabase
                .from('user_asset_selections')
                .update({ analysis_id: latestAnalysisId })
                .eq('id', selection.id);

              if (!updateError) {
                fixedCount++;
              } else {
                errors.push(`Failed to fix selection ${selection.id}: ${updateError.message}`);
              }
            } else {
              errors.push(`No valid analysis found for selection ${selection.id}`);
            }
          }
        }
      } catch (selectionError) {
        errors.push(`Error validating selection ${selection.id}: ${selectionError}`);
      }
    }

    return { valid: validCount, fixed: fixedCount, errors };

  } catch (error) {
    return { valid: 0, fixed: 0, errors: [`Validation failed: ${error}`] };
  }
};