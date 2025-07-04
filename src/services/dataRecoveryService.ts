import { supabase } from '@/integrations/supabase/client';
import { saveCompleteAnalysis } from './propertyAnalysisService';

// Recovery service to fix existing data and link orphaned records
export const recoverUserData = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 Starting data recovery for user:', userId);

    // Strategy 1: Find journey data without analysis_id but with analysis_results
    const { data: orphanedJourneys, error: journeyError } = await supabase
      .from('user_journey_complete')
      .select('*')
      .eq('user_id', userId)
      .is('analysis_id', null)
      .not('analysis_results', 'is', null)
      .not('property_address', 'is', null);

    if (journeyError) {
      console.error('❌ Error fetching orphaned journeys:', journeyError);
      return;
    }

    console.log('🔍 Found orphaned journeys:', orphanedJourneys?.length || 0);

    if (orphanedJourneys && orphanedJourneys.length > 0) {
      for (const journey of orphanedJourneys) {
        try {
          console.log('🔄 Processing orphaned journey:', journey.id);

          // Try to save the analysis to create proper records
          const analysisId = await saveCompleteAnalysis(
            userId,
            journey.property_address,
            journey.analysis_results as any, // Cast to any since it comes from jsonb
            journey.property_coordinates
          );

          if (analysisId) {
            // Link the journey to the new analysis
            const { error: updateError } = await supabase
              .from('user_journey_complete')
              .update({ analysis_id: analysisId })
              .eq('id', journey.id);

            if (updateError) {
              console.error('❌ Error linking journey to analysis:', updateError);
            } else {
              console.log('✅ Linked journey to analysis:', { journeyId: journey.id, analysisId });
            }
          }
        } catch (error) {
          console.error('❌ Error processing orphaned journey:', error);
          continue; // Continue with next journey
        }
      }
    }

    // Strategy 2: Find existing analyses without journey links
    const { data: unlinkedAnalyses, error: analysisError } = await supabase
      .from('user_property_analyses')
      .select('id, created_at')
      .eq('user_id', userId);

    if (!analysisError && unlinkedAnalyses && unlinkedAnalyses.length > 0) {
      console.log('🔍 Found existing analyses:', unlinkedAnalyses.length);

      // Try to link recent journeys to existing analyses
      for (const analysis of unlinkedAnalyses) {
        const { error: linkError } = await supabase
          .from('user_journey_complete')
          .update({ analysis_id: analysis.id })
          .eq('user_id', userId)
          .is('analysis_id', null)
          .gte('created_at', analysis.created_at)
          .limit(1);

        if (!linkError) {
          console.log('✅ Linked journey to existing analysis:', analysis.id);
        }
      }
    }

    console.log('✅ Data recovery completed for user:', userId);
  } catch (error) {
    console.error('❌ Error in data recovery:', error);
  }
};

// Function to get the most recent valid analysis ID for a user
export const getRecentAnalysisId = async (userId: string): Promise<string | null> => {
  try {
    // First, try to get analysis_id from journey data
    const { data: journeyData, error: journeyError } = await supabase
      .from('user_journey_complete')
      .select('analysis_id')
      .eq('user_id', userId)
      .not('analysis_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!journeyError && journeyData?.analysis_id) {
      console.log('✅ Found analysis ID from journey:', journeyData.analysis_id);
      return journeyData.analysis_id;
    }

    // Fallback: Get most recent analysis from user_property_analyses
    const { data: analysisData, error: analysisError } = await supabase
      .from('user_property_analyses')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysisError && analysisData?.id) {
      console.log('✅ Found analysis ID from analyses table:', analysisData.id);
      return analysisData.id;
    }

    console.log('❌ No analysis ID found for user:', userId);
    return null;
  } catch (error) {
    console.error('❌ Error getting recent analysis ID:', error);
    return null;
  }
};

// Auto-recovery function that runs when user authenticates
export const autoRecoverUserData = async (userId: string): Promise<void> => {
  try {
    console.log('🚀 Auto-recovery starting for user:', userId);
    
    // Run recovery process
    await recoverUserData(userId);
    
    // Give a moment for the data to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Auto-recovery completed for user:', userId);
  } catch (error) {
    console.error('❌ Auto-recovery failed:', error);
  }
};