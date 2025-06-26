
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';

interface DashboardJourneyData {
  journeyId: string;
  propertyAddress: string;
  analysisResults: any;
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

  const extractDataFromAnalysisResults = (analysisResults: any) => {
    let propertyAddress = '';
    let totalRevenue = 0;
    let totalOpportunities = 0;

    if (analysisResults && typeof analysisResults === 'object') {
      // Extract address - try multiple possible locations
      propertyAddress = analysisResults.propertyAddress || 
                       analysisResults.address || 
                       analysisResults.property_address || 
                       '';

      // Extract revenue from topOpportunities
      if (analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
        totalRevenue = analysisResults.topOpportunities.reduce(
          (sum: number, opp: any) => sum + (opp.monthlyRevenue || 0), 0
        );
        totalOpportunities = analysisResults.topOpportunities.length;
      }

      // Fallback: use totalMonthlyRevenue if available
      if (analysisResults.totalMonthlyRevenue && analysisResults.totalMonthlyRevenue > totalRevenue) {
        totalRevenue = analysisResults.totalMonthlyRevenue;
      }

      console.log('📊 Extracted from analysis results:', {
        propertyAddress,
        totalRevenue,
        totalOpportunities,
        hasTopOpportunities: !!analysisResults.topOpportunities
      });
    }

    return { propertyAddress, totalRevenue, totalOpportunities };
  };

  const parseJourneyProgress = (progressData: any) => {
    // Handle different journey progress data structures
    if (!progressData || typeof progressData !== 'object') {
      return {
        stepsCompleted: [],
        currentStep: 'site_entry',
        journeyStart: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }

    // If it's already in the correct format
    if (progressData.stepsCompleted && progressData.currentStep) {
      return {
        stepsCompleted: Array.isArray(progressData.stepsCompleted) ? progressData.stepsCompleted : [],
        currentStep: progressData.currentStep,
        journeyStart: progressData.journeyStart || new Date().toISOString(),
        lastActivity: progressData.lastActivity || new Date().toISOString()
      };
    }

    // Try to extract from different possible formats
    return {
      stepsCompleted: progressData.steps_completed || [],
      currentStep: progressData.current_step || 'site_entry',
      journeyStart: progressData.journey_start || new Date().toISOString(),
      lastActivity: progressData.last_activity || new Date().toISOString()
    };
  };

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

          // Extract data from analysis results
          const extracted = extractDataFromAnalysisResults(analysisResults);
          
          // Use stored values or extracted values (prefer extracted for address)
          const propertyAddress = extracted.propertyAddress || data.property_address || 'Unknown Address';
          const totalRevenue = Math.max(
            extracted.totalRevenue,
            data.total_monthly_revenue || 0
          );
          const totalOpportunities = Math.max(
            extracted.totalOpportunities,
            data.total_opportunities || 0
          );

          // Parse selected services
          let selectedServices = data.selected_services || [];
          if (typeof selectedServices === 'string') {
            try {
              selectedServices = JSON.parse(selectedServices);
            } catch (e) {
              selectedServices = [];
            }
          }

          // Parse journey progress with better handling
          let journeyProgress = data.journey_progress;
          if (typeof journeyProgress === 'string') {
            try {
              journeyProgress = JSON.parse(journeyProgress);
            } catch (e) {
              journeyProgress = null;
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
            journeyProgress: parseJourneyProgress(journeyProgress)
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
        let analysisResults = data.analysis_results;
        if (typeof analysisResults === 'string') {
          try {
            analysisResults = JSON.parse(analysisResults);
          } catch (e) {
            analysisResults = {};
          }
        }

        const extracted = extractDataFromAnalysisResults(analysisResults);
        
        const propertyAddress = extracted.propertyAddress || data.property_address || 'Unknown Address';
        const totalRevenue = Math.max(
          extracted.totalRevenue,
          data.total_monthly_revenue || 0
        );
        const totalOpportunities = Math.max(
          extracted.totalOpportunities,
          data.total_opportunities || 0
        );

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
            journeyProgress = null;
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
          journeyProgress: parseJourneyProgress(journeyProgress)
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
