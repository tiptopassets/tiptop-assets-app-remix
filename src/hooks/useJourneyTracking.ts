
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

  // Enhanced authentication completion tracking
  useEffect(() => {
    if (user) {
      const handleAuthCompletion = async () => {
        console.log('🔐 User authenticated, linking journey data:', user.id);
        await trackAuthCompleted(user.id);
        
        // Small delay to ensure the linking is processed
        setTimeout(() => {
          console.log('🔄 Auth completion processed, journey should be linked');
        }, 1000);
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
    coordinates?: any
  ) => {
    console.log('📊 Tracking analysis completion for journey');
    return await trackAnalysisCompleted(address, results, coordinates);
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
