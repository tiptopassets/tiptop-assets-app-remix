
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
    if (!progressData || typeof progressData !== 'object') {
      return {
        stepsCompleted: [],
        currentStep: 'site_entry',
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
      stepsCompleted: progressData.steps_completed || [],
      currentStep: progressData.current_step || 'site_entry',
      journeyStart: progressData.journey_start || new Date().toISOString(),
      lastActivity: progressData.last_activity || new Date().toISOString()
    };
  };

  const processJourneyData = (data: any): DashboardJourneyData | null => {
    if (!data) return null;

    try {
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
        propertyAddress,
        analysisResults,
        totalMonthlyRevenue: totalRevenue,
        totalOpportunities,
        selectedServices: Array.isArray(selectedServices) ? selectedServices : [],
        selectedOption: data.selected_option || 'manual',
        journeyProgress: parseJourneyProgress(journeyProgress)
      };
      
      console.log('✅ Processed dashboard data:', transformedData);
      return transformedData;

    } catch (error) {
      console.error('❌ Error processing journey data:', error);
      return null;
    }
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
        
        const processedData = processJourneyData(data);
        setJourneyData(processedData);
        
        if (!processedData) {
          console.log('❌ No valid dashboard data found');
        }
        
      } catch (err) {
        console.error('❌ Error loading journey data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load journey data';
        setError(errorMessage);
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
      
      const processedData = processJourneyData(data);
      setJourneyData(processedData);
      
      console.log('✅ Dashboard data refreshed successfully');
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
