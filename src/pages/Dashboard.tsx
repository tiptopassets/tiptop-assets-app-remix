
import React, { useEffect, useState } from 'react';
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
import { FirstTimeUserOptionsBanner } from '@/components/dashboard/FirstTimeUserOptionsBanner';
import { isFirstTimeUser } from '@/services/firstTimeUserService';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [showFirstTimeBanner, setShowFirstTimeBanner] = useState(false);
  
  // Use the unified multi-property system
  const { 
    properties, 
    selectedProperty, 
    selectedPropertyId, 
    selectProperty, 
    loading: propertiesLoading, 
    error: propertiesError, 
    refetch: refreshProperties,
    propertiesCount
  } = useUserProperties();

  // Check if user is first-time user after authentication
  useEffect(() => {
    if (user && !authLoading) {
      setShowFirstTimeBanner(isFirstTimeUser());
    }
  }, [user, authLoading]);

  const loading = propertiesLoading;
  const error = propertiesError;
  const refreshData = refreshProperties;
  const hasProperties = properties.length > 0;

  console.log('📊 Dashboard unified system state:', {
    authLoading,
    loading,
    user: !!user,
    userId: user?.id,
    error,
    propertiesCount,
    hasProperties,
    selectedPropertyId,
    selectedProperty: selectedProperty ? {
      address: selectedProperty.address,
      revenue: selectedProperty.totalMonthlyRevenue,
      opportunities: selectedProperty.totalOpportunities,
    } : null
  });

  // Auto-refresh data when user first authenticates if no properties found
  useEffect(() => {
    if (user && !loading && propertiesCount === 0) {
      console.log('🔄 User authenticated but no data found, attempting refresh...');
      setTimeout(() => {
        refreshData();
      }, 2000); // Give time for any background processes to complete
    }
  }, [user, loading, propertiesCount, refreshData]);

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
      {!authLoading && user && loading && (
        <DashboardLoadingState message="Loading your dashboard data..." />
      )}

      {/* Show error state if there's an error */}
      {!authLoading && user && !loading && error && (
        <DashboardErrorState 
          error={error}
          onRefresh={refreshData}
          onReload={refreshData}
        />
      )}

      {/* Show empty state if no data found */}
      {!authLoading && user && !loading && !error && !hasProperties && (
        <DashboardLayout>
          <JourneyTracker />
          <DashboardEmptyState />
        </DashboardLayout>
      )}

      {/* Show dashboard content when properties are available */}
      {!authLoading && user && !loading && !error && hasProperties && selectedProperty && (() => {
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
          <DashboardLayout
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertySelect={selectProperty}
          >
            <JourneyTracker />
            
            {/* Show first-time user options banner */}
            {showFirstTimeBanner && (
              <FirstTimeUserOptionsBanner onDismiss={() => setShowFirstTimeBanner(false)} />
            )}
            
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
