
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

const JourneyTracker = () => {
  const location = useLocation();
  const { trackAddress, trackAnalysis, trackServices, trackDashboard } = useJourneyTracking();
  const { address, analysisResults, addressCoordinates, analysisComplete } = useGoogleMap();

  // Track dashboard access
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      trackDashboard();
    }
  }, [location.pathname, trackDashboard]);

  // Track address entry
  useEffect(() => {
    if (address && address.trim()) {
      trackAddress(address, addressCoordinates);
    }
  }, [address, addressCoordinates, trackAddress]);

  // Track analysis completion
  useEffect(() => {
    if (analysisComplete && analysisResults && address) {
      trackAnalysis(address, analysisResults, addressCoordinates);
    }
  }, [analysisComplete, analysisResults, address, addressCoordinates, trackAnalysis]);

  // Track services viewed when user sees analysis results
  useEffect(() => {
    if (analysisResults?.topOpportunities) {
      const serviceNames = analysisResults.topOpportunities.map(opp => opp.title);
      trackServices(serviceNames);
    }
  }, [analysisResults, trackServices]);

  return null; // This component only tracks, doesn't render anything
};

export default JourneyTracker;
