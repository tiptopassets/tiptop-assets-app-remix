
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
        
        const data = await getDashboardData();
        
        if (data) {
          setJourneyData({
            journeyId: data.journey_id,
            propertyAddress: data.property_address,
            analysisResults: data.analysis_results,
            totalMonthlyRevenue: data.total_monthly_revenue,
            totalOpportunities: data.total_opportunities,
            selectedServices: data.selected_services || [],
            selectedOption: data.selected_option,
            journeyProgress: data.journey_progress
          });
        } else {
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
      const data = await getDashboardData();
      if (data) {
        setJourneyData({
          journeyId: data.journey_id,
          propertyAddress: data.property_address,
          analysisResults: data.analysis_results,
          totalMonthlyRevenue: data.total_monthly_revenue,
          totalOpportunities: data.total_opportunities,
          selectedServices: data.selected_services || [],
          selectedOption: data.selected_option,
          journeyProgress: data.journey_progress
        });
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
