
import { supabase } from '@/integrations/supabase/client';

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

    console.log('⚠️ [RECOVERY] No analysis found in user_property_analyses, checking journey data...');

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

    // Only link the CURRENT BROWSER SESSION to the authenticated user to avoid cross-user leakage
    try {
      const { getSessionId } = await import('@/services/userJourneyService');
      const sessionId = getSessionId();

      // Check if this session's journey already contains analysis/address (potentially from another user)
      const { data: existingJourney } = await supabase
        .from('user_journey_complete')
        .select('id, user_id, analysis_id, property_address')
        .eq('session_id', sessionId)
        .maybeSingle();

      const hasAnalysisOrAddress = !!(existingJourney?.analysis_id || (existingJourney?.property_address && existingJourney.property_address.trim() !== ''));
      const linkedToAnotherUser = !!(existingJourney?.user_id && existingJourney.user_id !== userId);

      if (!existingJourney || (!hasAnalysisOrAddress && !linkedToAnotherUser)) {
        const { error: linkSessionErr } = await supabase.rpc('link_journey_to_user', {
          p_session_id: sessionId,
          p_user_id: userId,
        });
        if (linkSessionErr) {
          console.warn('⚠️ [REPAIR] Could not link current session to user:', linkSessionErr);
        } else {
          console.log('✅ [REPAIR] Linked current session to user for journey data');
        }
      } else {
        console.log('⏭️ [REPAIR] Skipping session linking to avoid cross-user leakage', { sessionId });
      }
    } catch (e) {
      console.warn('⚠️ [REPAIR] Unable to obtain session id for safe linking:', e);
    }

    // Ensure analysis_id is properly set in this user's journey records only
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

// Auto-recover user data on authentication (SAFE VERSION - no mass linking of unlinked data)
export const autoRecoverUserData = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 [AUTO-RECOVERY] Starting safe auto-recovery for user:', userId);
    
    // Only link analyses that are explicitly linked via journey data with proper user_id
    try {
      const { supabase } = await import('@/integrations/supabase/client');
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
    console.error('❌ [AUTO-RECOVERY] Error in auto-recovery:', error);
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
      } catch (selectionError) {
        errors.push(`Error validating selection ${selection.id}: ${selectionError}`);
      }
    }

    return { valid: validCount, fixed: fixedCount, errors };

  } catch (error) {
    return { valid: 0, fixed: 0, errors: [`Validation failed: ${error}`] };
  }
};
