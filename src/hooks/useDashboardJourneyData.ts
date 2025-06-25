
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';

interface DashboardJourneyData {
  journeyId: string;
  propertyAddress: string;
  analysisResults: any; // Using any to handle the JSON type from database
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
          
          // Parse analysis results if it's a string
          let analysisResults = data.analysis_results;
          if (typeof analysisResults === 'string') {
            try {
              analysisResults = JSON.parse(analysisResults);
            } catch (e) {
              console.warn('Failed to parse analysis results:', e);
              analysisResults = {};
            }
          }
          
          // If we have analysis results with opportunities, calculate revenue
          if (analysisResults && typeof analysisResults === 'object' && analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
            const calculatedRevenue = analysisResults.topOpportunities.reduce(
              (sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0
            );
            
            // Use the higher of stored revenue or calculated revenue
            totalRevenue = Math.max(totalRevenue, calculatedRevenue);
          }
          
          // Ensure we have proper opportunities count
          const totalOpportunities = data.total_opportunities || 
            (analysisResults?.topOpportunities?.length || 0);

          // Parse selected services if it's a string
          let selectedServices = data.selected_services || [];
          if (typeof selectedServices === 'string') {
            try {
              selectedServices = JSON.parse(selectedServices);
            } catch (e) {
              selectedServices = [];
            }
          }

          // Parse journey progress if it's a string
          let journeyProgress = data.journey_progress;
          if (typeof journeyProgress === 'string') {
            try {
              journeyProgress = JSON.parse(journeyProgress);
            } catch (e) {
              journeyProgress = {
                stepsCompleted: [],
                currentStep: 'site_entry',
                journeyStart: new Date().toISOString(),
                lastActivity: new Date().toISOString()
              };
            }
          }

          const transformedData: DashboardJourneyData = {
            journeyId: data.journey_id,
            propertyAddress,
            analysisResults,
            totalMonthlyRevenue: totalRevenue,
            totalOpportunities,
            selectedServices: Array.isArray(selectedServices) ? selectedServices : [],
            selectedOption: data.selected_option || 'manual',
            journeyProgress: journeyProgress || {
              stepsCompleted: [],
              currentStep: 'site_entry',
              journeyStart: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            }
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
        
        let analysisResults = data.analysis_results;
        if (typeof analysisResults === 'string') {
          try {
            analysisResults = JSON.parse(analysisResults);
          } catch (e) {
            analysisResults = {};
          }
        }
        
        if (analysisResults && typeof analysisResults === 'object' && analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
          const calculatedRevenue = analysisResults.topOpportunities.reduce(
            (sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0
          );
          totalRevenue = Math.max(totalRevenue, calculatedRevenue);
        }
        
        const totalOpportunities = data.total_opportunities || 
          (analysisResults?.topOpportunities?.length || 0);

        let selectedServices = data.selected_services || [];
        if (typeof selectedServices === 'string') {
          try {
            selectedServices = JSON.parse(selectedServices);
          } catch (e) {
            selectedServices = [];
          }
        }

        let journeyProgress = data.journey_progress;
        if (typeof journeyProgress === 'string') {
          try {
            journeyProgress = JSON.parse(journeyProgress);
          } catch (e) {
            journeyProgress = {
              stepsCompleted: [],
              currentStep: 'site_entry',
              journeyStart: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
          }
        }

        setJourneyData({
          journeyId: data.journey_id,
          propertyAddress,
          analysisResults,
          totalMonthlyRevenue: totalRevenue,
          totalOpportunities,
          selectedServices: Array.isArray(selectedServices) ? selectedServices : [],
          selectedOption: data.selected_option || 'manual',
          journeyProgress: journeyProgress || {
            stepsCompleted: [],
            currentStep: 'site_entry',
            journeyStart: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          }
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
