
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardErrorState from '@/components/dashboard/DashboardErrorState';
import DashboardAuthGuard from '@/components/dashboard/DashboardAuthGuard';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import JourneyTracker from '@/components/JourneyTracker';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { journeyData, loading: dataLoading, error, refreshJourneyData } = useDashboardJourneyData();

  console.log('📊 Dashboard render state:', {
    authLoading,
    dataLoading,
    user: !!user,
    userId: user?.id,
    error,
    hasJourneyData: !!journeyData,
    journeyData: journeyData ? {
      address: journeyData.propertyAddress,
      revenue: journeyData.totalMonthlyRevenue,
      opportunities: journeyData.totalOpportunities,
      selectedOption: journeyData.selectedOption,
      currentStep: journeyData.journeyProgress?.current_step,
      coordinates: journeyData.analysisResults?.coordinates || journeyData.analysisResults?.propertyCoordinates
    } : null
  });

  // Auto-refresh dashboard data when user first authenticates
  useEffect(() => {
    if (user && !dataLoading && !journeyData) {
      console.log('🔄 User authenticated but no data found, attempting refresh...');
      setTimeout(() => {
        refreshJourneyData();
      }, 2000); // Give time for auth linking to complete
    }
  }, [user, dataLoading, journeyData, refreshJourneyData]);

  // Periodic refresh to catch any delayed data updates
  useEffect(() => {
    if (user && !journeyData) {
      const intervalId = setInterval(() => {
        console.log('🔄 Periodic refresh attempt...');
        refreshJourneyData();
      }, 10000); // Check every 10 seconds

      // Clear interval after 2 minutes
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
      }, 120000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [user, journeyData, refreshJourneyData]);

  return (
    <DashboardErrorBoundary>
      {/* Show loading state while auth is loading */}
      {authLoading && (
        <DashboardLoadingState message="Loading authentication..." />
      )}

      {/* Redirect to login if not authenticated */}
      {!authLoading && !user && (
        <DashboardAuthGuard />
      )}

      {/* Show loading state while data is loading */}
      {!authLoading && user && dataLoading && (
        <DashboardLoadingState message="Loading your dashboard data..." />
      )}

      {/* Show error state if there's an error */}
      {!authLoading && user && !dataLoading && error && (
        <DashboardErrorState 
          error={error}
          onRefresh={refreshJourneyData}
          onReload={refreshJourneyData}
        />
      )}

      {/* Show empty state if no journey data is found */}
      {!authLoading && user && !dataLoading && !error && !journeyData && (
        <DashboardLayout>
          <JourneyTracker />
          <DashboardEmptyState />
        </DashboardLayout>
      )}

      {/* Show dashboard content if we have data */}
      {!authLoading && user && !dataLoading && !error && journeyData && (() => {
        // Extract coordinates from analysis results - try multiple possible locations
        const coordinates = journeyData.analysisResults?.coordinates || 
                          journeyData.analysisResults?.propertyCoordinates ||
                          (journeyData.analysisResults?.rooftop?.coordinates) ||
                          null;

        console.log('🗺️ Coordinates found for satellite image:', coordinates);
        console.log('🏠 Using property address:', journeyData.propertyAddress);

        // Convert journey data to the format expected by DashboardContent
        const mockLatestAnalysis = {
          id: journeyData.analysisId || journeyData.journeyId, // Use analysis_id if available, fallback to journey_id
          analysis_results: journeyData.analysisResults,
          total_monthly_revenue: journeyData.totalMonthlyRevenue,
          total_opportunities: journeyData.totalOpportunities,
          created_at: journeyData.journeyProgress?.journey_start || new Date().toISOString(),
          satellite_image_url: journeyData.analysisResults?.rooftop?.satelliteImageUrl,
          coordinates: coordinates
        };

        return (
          <DashboardLayout>
            <JourneyTracker />
            <DashboardContent
              primaryAddress={journeyData.propertyAddress}
              latestAnalysis={mockLatestAnalysis}
              totalMonthlyRevenue={journeyData.totalMonthlyRevenue}
              totalOpportunities={journeyData.totalOpportunities}
              analysesCount={1} // We have journey data, so at least 1 analysis
              onRefresh={refreshJourneyData}
            />
          </DashboardLayout>
        );
      })()}
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
