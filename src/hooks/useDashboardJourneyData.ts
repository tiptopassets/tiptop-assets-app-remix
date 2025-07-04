
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';

interface DashboardJourneyData {
  journeyId: string;
  analysisId: string | null;
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
  const [retryCount, setRetryCount] = useState(0);

  const extractDataFromAnalysisResults = (analysisResults: any) => {
    let propertyAddress = '';
    let totalRevenue = 0;
    let totalOpportunities = 0;

    if (analysisResults && typeof analysisResults === 'object') {
      // Enhanced address extraction - try multiple possible locations
      propertyAddress = analysisResults.propertyAddress || 
                       analysisResults.address || 
                       analysisResults.property_address ||
                       analysisResults.formattedAddress ||
                       '';

      // Enhanced revenue calculation from topOpportunities
      if (analysisResults.topOpportunities && Array.isArray(analysisResults.topOpportunities)) {
        totalRevenue = analysisResults.topOpportunities.reduce(
          (sum: number, opp: any) => sum + (opp.monthlyRevenue || opp.revenue || 0), 0
        );
        totalOpportunities = analysisResults.topOpportunities.length;
      } else {
        // Enhanced fallback: calculate from individual asset types
        const assetRevenues = [
          analysisResults.rooftop?.revenue || 0,
          analysisResults.parking?.revenue || 0,
          analysisResults.garden?.revenue || 0,
          analysisResults.pool?.revenue || 0,
          analysisResults.storage?.revenue || 0,
          analysisResults.bandwidth?.revenue || 0,
          analysisResults.internet?.monthlyRevenue || analysisResults.internet?.revenue || 0,
          analysisResults.solar?.monthlyRevenue || analysisResults.solar?.revenue || 0,
          analysisResults.ev?.monthlyRevenue || analysisResults.ev?.revenue || 0
        ];
        
        totalRevenue = assetRevenues.reduce((sum, revenue) => sum + revenue, 0);
        totalOpportunities = assetRevenues.filter(revenue => revenue > 0).length;
      }

      // Use pre-calculated totals if available and higher
      if (analysisResults.totalMonthlyRevenue && analysisResults.totalMonthlyRevenue > totalRevenue) {
        totalRevenue = analysisResults.totalMonthlyRevenue;
      }
      
      // Additional fallback for total revenue
      if (totalRevenue === 0 && analysisResults.totalRevenue) {
        totalRevenue = analysisResults.totalRevenue;
      }

      console.log('📊 Extracted from analysis results:', {
        propertyAddress,
        totalRevenue,
        totalOpportunities,
        hasTopOpportunities: !!analysisResults.topOpportunities,
        hasIndividualAssets: !!(analysisResults.rooftop || analysisResults.parking || analysisResults.garden)
      });
    }

    return { propertyAddress, totalRevenue, totalOpportunities };
  };

  const parseJourneyProgress = (progressData: any) => {
    if (!progressData || typeof progressData !== 'object') {
      return {
        stepsCompleted: [],
        currentStep: 'analysis_completed', // Default to analysis_completed since we have data
        journeyStart: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }

    if (progressData.stepsCompleted && progressData.currentStep) {
      return {
        stepsCompleted: Array.isArray(progressData.stepsCompleted) ? progressData.stepsCompleted : [],
        currentStep: progressData.currentStep,
        journeyStart: progressData.journeyStart || new Date().toISOString(),
        lastActivity: progressData.lastActivity || new Date().toISOString()
      };
    }

    return {
      stepsCompleted: progressData.steps_completed || ['address_entered', 'analysis_completed'],
      currentStep: progressData.current_step || 'analysis_completed',
      journeyStart: progressData.journey_start || new Date().toISOString(),
      lastActivity: progressData.last_activity || new Date().toISOString()
    };
  };

  const processJourneyData = (data: any): DashboardJourneyData | null => {
    if (!data) return null;

    try {
      console.log('🔄 Processing raw journey data:', data);

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

      // Ensure we have analysis results
      if (!analysisResults || Object.keys(analysisResults).length === 0) {
        console.warn('⚠️ No analysis results found in journey data');
        return null;
      }

      // Extract data from analysis results
      const extracted = extractDataFromAnalysisResults(analysisResults);
      
      // Use stored values or extracted values (prefer stored for consistency)
      const propertyAddress = data.property_address || extracted.propertyAddress || 'Unknown Address';
      const totalRevenue = Math.max(
        data.total_monthly_revenue || 0,
        extracted.totalRevenue
      );
      const totalOpportunities = Math.max(
        data.total_opportunities || 0,
        extracted.totalOpportunities
      );

      // Ensure we have meaningful data
      if (!propertyAddress || propertyAddress === 'Unknown Address' || totalRevenue === 0) {
        console.warn('⚠️ Journey data lacks essential information:', {
          hasAddress: !!propertyAddress && propertyAddress !== 'Unknown Address',
          hasRevenue: totalRevenue > 0,
          hasOpportunities: totalOpportunities > 0
        });
      }

      // Parse selected services
      let selectedServices = data.selected_services || [];
      if (typeof selectedServices === 'string') {
        try {
          selectedServices = JSON.parse(selectedServices);
        } catch (e) {
          selectedServices = [];
        }
      }

      // Parse journey progress
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
        analysisId: data.analysis_id || null,
        propertyAddress,
        analysisResults,
        totalMonthlyRevenue: totalRevenue,
        totalOpportunities,
        selectedServices: Array.isArray(selectedServices) ? selectedServices : [],
        selectedOption: data.selected_option || 'manual',
        journeyProgress: parseJourneyProgress(journeyProgress)
      };
      
      console.log('✅ Successfully processed dashboard data:', transformedData);
      return transformedData;

    } catch (error) {
      console.error('❌ Error processing journey data:', error);
      return null;
    }
  };

  const loadJourneyData = async (isRetry: boolean = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      console.log(`🔍 ${isRetry ? 'Retrying' : 'Loading'} dashboard data for user:`, user.id);
      
      const data = await getDashboardData();
      
      console.log('📊 Raw dashboard data received:', data);
      
      const processedData = processJourneyData(data);
      
      if (processedData) {
        setJourneyData(processedData);
        setRetryCount(0); // Reset retry count on success
        console.log('✅ Dashboard data loaded successfully');
      } else {
        console.log('❌ No valid dashboard data found');
        
        // If this is not a retry and we have no data, try again after a short delay
        if (!isRetry && retryCount < 3) {
          console.log(`🔄 Scheduling retry ${retryCount + 1}/3 in 3 seconds...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadJourneyData(true);
          }, 3000);
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading journey data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load journey data';
      setError(errorMessage);
      
      // Retry logic for errors
      if (!isRetry && retryCount < 2) {
        console.log(`🔄 Scheduling error retry ${retryCount + 1}/2 in 5 seconds...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          loadJourneyData(true);
        }, 5000);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadJourneyData();
    } else {
      // Clear data when user logs out
      setJourneyData(null);
      setError(null);
      setRetryCount(0);
    }
  }, [user, getDashboardData]);

  const refreshJourneyData = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Manually refreshing dashboard data...');
      setError(null); // Clear any existing errors
      
      const data = await getDashboardData();
      const processedData = processJourneyData(data);
      
      setJourneyData(processedData);
      
      if (processedData) {
        console.log('✅ Dashboard data refreshed successfully');
      } else {
        console.log('❌ No data found during manual refresh');
      }
    } catch (err) {
      console.error('❌ Error refreshing journey data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh journey data';
      setError(errorMessage);
    }
  };

  return {
    journeyData,
    loading,
    error,
    refreshJourneyData
  };
};
