
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  initializeJourney,
  trackAddressEntered,
  trackAnalysisCompleted,
  trackServicesViewed,
  trackOptionSelected,
  trackAuthCompleted,
  trackDashboardAccessed,
  getUserDashboardData
} from '@/services/userJourneyService';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

export const useJourneyTracking = () => {
  const { user } = useAuth();
  const { address, analysisResults, addressCoordinates } = useGoogleMap();

  // Initialize journey tracking when the hook is first used
  useEffect(() => {
    const initJourney = async () => {
      await initializeJourney();
    };
    
    initJourney();
  }, []);

  // Enhanced authentication completion tracking with comprehensive data repair
  useEffect(() => {
    if (user) {
      const handleAuthCompletion = async () => {
        console.log('🔐 User authenticated, linking journey data:', user.id);
        await trackAuthCompleted(user.id);
        
        // Trigger comprehensive data repair
        const { repairJourneySummaryData } = await import('@/services/dataRecoveryService');
        await repairJourneySummaryData(user.id);
        
        // Small delay to ensure all processing is complete
        setTimeout(() => {
          console.log('🔄 Auth completion and data repair processed');
        }, 2000);
      };
      
      handleAuthCompletion();
    }
  }, [user]);

  // Tracking functions
  const trackAddress = useCallback(async (address: string, coordinates?: any) => {
    return await trackAddressEntered(address, coordinates);
  }, []);

  const trackAnalysis = useCallback(async (
    address: string, 
    results: AnalysisResults, 
    coordinates?: any,
    analysisId?: string
  ) => {
    console.log('📊 Tracking analysis completion for journey');
    return await trackAnalysisCompleted(address, results, coordinates, analysisId);
  }, []);

  const trackServices = useCallback(async (services: string[]) => {
    return await trackServicesViewed(services);
  }, []);

  const trackOption = useCallback(async (option: 'manual' | 'concierge') => {
    console.log('📊 Tracking option selection:', option);
    const result = await trackOptionSelected(option);
    console.log('📊 Option selection tracked, result:', result);
    return result;
  }, []);

  const trackDashboard = useCallback(async () => {
    return await trackDashboardAccessed();
  }, []);

  const getDashboardData = useCallback(async () => {
    if (!user) return null;
    return await getUserDashboardData(user.id);
  }, [user]);

  return {
    trackAddress,
    trackAnalysis,
    trackServices,
    trackOption,
    trackDashboard,
    getDashboardData
  };
};
