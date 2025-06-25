
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

  // Track authentication completion
  useEffect(() => {
    if (user) {
      trackAuthCompleted(user.id);
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
    return await trackAnalysisCompleted(address, results, coordinates);
  }, []);

  const trackServices = useCallback(async (services: string[]) => {
    return await trackServicesViewed(services);
  }, []);

  const trackOption = useCallback(async (option: 'manual' | 'concierge') => {
    return await trackOptionSelected(option);
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
