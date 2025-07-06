
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDashboardData } from '@/services/userJourneyService';
import { autoRecoverUserData, getRecentAnalysisId } from '@/services/dataRecoveryService';
import { supabase } from '@/integrations/supabase/client';

interface DashboardJourneyData {
  journeyId: string;
  analysisId?: string;
  propertyAddress: string;
  analysisResults: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  selectedServices: any[];
  selectedOption: string;
  journeyProgress: {
    steps_completed: string[];
    current_step: string;
    journey_start: string;
    last_activity: string;
  };
}

export const useDashboardJourneyData = () => {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<DashboardJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshJourneyData = useCallback(async () => {
    if (!user) {
      setJourneyData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [DASHBOARD] Fetching journey data for user:', user.id);
      
      // Run auto-recovery first
      await autoRecoverUserData(user.id);
      
      // Strategy 1: Try the user journey service
      let data = await getUserDashboardData(user.id);
      
      if (data) {
        console.log('✅ [DASHBOARD] Found journey data via service:', {
          journeyId: data.journey_id,
          analysisId: data.analysis_id,
          address: data.property_address,
          revenue: data.total_monthly_revenue
        });
        
        setJourneyData({
          journeyId: data.journey_id,
          analysisId: data.analysis_id,
          propertyAddress: data.property_address,
          analysisResults: data.analysis_results,
          totalMonthlyRevenue: data.total_monthly_revenue || 0,
          totalOpportunities: data.total_opportunities || 0,
          selectedServices: data.selected_services || [],
          selectedOption: data.selected_option || 'manual',
          journeyProgress: typeof data.journey_progress === 'object' && data.journey_progress !== null 
            ? data.journey_progress as {
                steps_completed: string[];
                current_step: string;
                journey_start: string;
                last_activity: string;
              }
            : {
                steps_completed: [],
                current_step: 'analysis_completed',
                journey_start: new Date().toISOString(),
                last_activity: new Date().toISOString()
              }
        });
        setLoading(false);
        return;
      }

      console.log('🔄 [DASHBOARD] No journey data found, trying direct analysis lookup...');
      
      // Strategy 2: Direct analysis lookup as fallback
      const recentAnalysisId = await getRecentAnalysisId(user.id);
      
      if (recentAnalysisId) {
        console.log('🔍 [DASHBOARD] Found recent analysis, fetching details:', recentAnalysisId);
        
        const { data: analysisData, error: analysisError } = await supabase
          .from('user_property_analyses')
          .select(`
            id,
            analysis_results,
            total_monthly_revenue,
            total_opportunities,
            coordinates,
            user_addresses!inner(
              address,
              formatted_address
            )
          `)
          .eq('id', recentAnalysisId)
          .eq('user_id', user.id)
          .single();

        if (!analysisError && analysisData) {
          console.log('✅ [DASHBOARD] Created fallback journey data from analysis');
          
          const fallbackJourneyData: DashboardJourneyData = {
            journeyId: `fallback_${recentAnalysisId}`,
            analysisId: analysisData.id,
            propertyAddress: analysisData.user_addresses?.formatted_address || analysisData.user_addresses?.address || 'Unknown Address',
            analysisResults: analysisData.analysis_results,
            totalMonthlyRevenue: analysisData.total_monthly_revenue || 0,
            totalOpportunities: analysisData.total_opportunities || 0,
            selectedServices: [],
            selectedOption: 'manual',
            journeyProgress: {
              steps_completed: ['analysis_completed'],
              current_step: 'analysis_completed',
              journey_start: new Date().toISOString(),
              last_activity: new Date().toISOString()
            }
          };
          
          setJourneyData(fallbackJourneyData);
          setLoading(false);
          return;
        }
      }

      console.log('❌ [DASHBOARD] No journey or analysis data found');
      setJourneyData(null);
      
    } catch (err) {
      console.error('❌ [DASHBOARD] Error fetching journey data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setJourneyData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshJourneyData();
  }, [refreshJourneyData]);

  return {
    journeyData,
    loading,
    error,
    refreshJourneyData
  };
};
