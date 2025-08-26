
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProperties } from '@/hooks/useUserProperties';
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
  const { 
    properties, 
    selectedProperty, 
    selectedPropertyId, 
    selectProperty, 
    loading: dataLoading, 
    error, 
    refetch: refreshProperties,
    propertiesCount
  } = useUserProperties();

  console.log('📊 Dashboard render state:', {
    authLoading,
    dataLoading,
    user: !!user,
    userId: user?.id,
    error,
    propertiesCount,
    selectedPropertyId,
    selectedProperty: selectedProperty ? {
      address: selectedProperty.address,
      revenue: selectedProperty.totalMonthlyRevenue,
      opportunities: selectedProperty.totalOpportunities,
    } : null
  });

  // Auto-refresh properties data when user first authenticates
  useEffect(() => {
    if (user && !dataLoading && properties.length === 0) {
      console.log('🔄 User authenticated but no properties found, attempting refresh...');
      setTimeout(() => {
        refreshProperties();
      }, 2000); // Give time for auth linking to complete
    }
  }, [user, dataLoading, properties.length, refreshProperties]);

  // Periodic refresh to catch any delayed data updates
  useEffect(() => {
    if (user && properties.length === 0) {
      const intervalId = setInterval(() => {
        console.log('🔄 Periodic refresh attempt...');
        refreshProperties();
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
  }, [user, properties.length, refreshProperties]);

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
          onRefresh={refreshProperties}
          onReload={refreshProperties}
        />
      )}

      {/* Show empty state if no properties found */}
      {!authLoading && user && !dataLoading && !error && properties.length === 0 && (
        <DashboardLayout>
          <JourneyTracker />
          <DashboardEmptyState />
        </DashboardLayout>
      )}

      {/* Show dashboard content if we have properties */}
      {!authLoading && user && !dataLoading && !error && selectedProperty && (() => {
        // Extract coordinates from analysis results
        const coordinates = selectedProperty.coordinates || 
                          selectedProperty.analysisResults?.coordinates ||
                          selectedProperty.analysisResults?.propertyCoordinates ||
                          null;

        console.log('🗺️ Coordinates found for satellite image:', coordinates);
        console.log('🏠 Using property address:', selectedProperty.address);

        // Convert property data to the format expected by DashboardContent
        const latestAnalysis = {
          id: selectedProperty.id,
          analysis_results: selectedProperty.analysisResults,
          total_monthly_revenue: selectedProperty.totalMonthlyRevenue,
          total_opportunities: selectedProperty.totalOpportunities,
          created_at: selectedProperty.createdAt,
          satellite_image_url: selectedProperty.satelliteImageUrl,
          coordinates: coordinates
        };

        return (
          <DashboardLayout>
            <JourneyTracker />
            <DashboardContent
              primaryAddress={selectedProperty.address}
              latestAnalysis={latestAnalysis}
              totalMonthlyRevenue={selectedProperty.totalMonthlyRevenue}
              totalOpportunities={selectedProperty.totalOpportunities}
              analysesCount={propertiesCount}
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={selectProperty}
              onRefresh={refreshProperties}
            />
          </DashboardLayout>
        );
      })()}
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
