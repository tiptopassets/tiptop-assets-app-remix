
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

interface DashboardJourneyData {
  journeyId: string;
  propertyAddress: string;
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  selectedServices: any[];
  selectedOption: string;
  journeyProgress: {
    stepsCompleted: string[];
    currentStep: string;
    journeyStart: string;
    lastActivity: string;
  };
}

export const useDashboardJourneyData = () => {
  const { user } = useAuth();
  const { getDashboardData } = useJourneyTracking();
  const [journeyData, setJourneyData] = useState<DashboardJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJourneyData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading dashboard data for user:', user.id);
        
        const data = await getDashboardData();
        
        console.log('📊 Raw dashboard data:', data);
        
        if (data) {
          // Ensure we have proper property address
          const propertyAddress = data.property_address || 'Unknown Address';
          
          // Ensure we have proper revenue calculation
          let totalRevenue = data.total_monthly_revenue || 0;
          
          // If we have analysis results, calculate revenue from opportunities
          if (data.analysis_results && data.analysis_results.topOpportunities) {
            const calculatedRevenue = data.analysis_results.topOpportunities.reduce(
              (sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0
            );
            
            // Use the higher of stored revenue or calculated revenue
            totalRevenue = Math.max(totalRevenue, calculatedRevenue);
          }
          
          // Ensure we have proper opportunities count
          const totalOpportunities = data.total_opportunities || 
            (data.analysis_results?.topOpportunities?.length || 0);

          const transformedData: DashboardJourneyData = {
            journeyId: data.journey_id,
            propertyAddress,
            analysisResults: data.analysis_results,
            totalMonthlyRevenue: totalRevenue,
            totalOpportunities,
            selectedServices: data.selected_services || [],
            selectedOption: data.selected_option,
            journeyProgress: data.journey_progress
          };
          
          console.log('✅ Transformed dashboard data:', transformedData);
          setJourneyData(transformedData);
        } else {
          console.log('❌ No dashboard data found');
          setJourneyData(null);
        }
      } catch (err) {
        console.error('❌ Error loading journey data:', err);
        setError('Failed to load journey data');
      } finally {
        setLoading(false);
      }
    };

    loadJourneyData();
  }, [user, getDashboardData]);

  const refreshJourneyData = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing dashboard data...');
      const data = await getDashboardData();
      
      if (data) {
        const propertyAddress = data.property_address || 'Unknown Address';
        
        let totalRevenue = data.total_monthly_revenue || 0;
        
        if (data.analysis_results && data.analysis_results.topOpportunities) {
          const calculatedRevenue = data.analysis_results.topOpportunities.reduce(
            (sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0
          );
          totalRevenue = Math.max(totalRevenue, calculatedRevenue);
        }
        
        const totalOpportunities = data.total_opportunities || 
          (data.analysis_results?.topOpportunities?.length || 0);

        setJourneyData({
          journeyId: data.journey_id,
          propertyAddress,
          analysisResults: data.analysis_results,
          totalMonthlyRevenue: totalRevenue,
          totalOpportunities,
          selectedServices: data.selected_services || [],
          selectedOption: data.selected_option,
          journeyProgress: data.journey_progress
        });
        
        console.log('✅ Dashboard data refreshed successfully');
      }
    } catch (err) {
      console.error('❌ Error refreshing journey data:', err);
    }
  };

  return {
    journeyData,
    loading,
    error,
    refreshJourneyData
  };
};
