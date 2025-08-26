
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProperties } from '@/hooks/useUserProperties';
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
  
  // Try new multi-property system first
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
  
  // Fallback to old single-property system if no properties found
  const { 
    journeyData, 
    loading: journeyLoading, 
    error: journeyError, 
    refreshJourneyData 
  } = useDashboardJourneyData();

  // Determine which system to use
  const hasProperties = properties.length > 0;
  const hasJourneyData = !!journeyData && !hasProperties;
  
  const loading = propertiesLoading || (journeyLoading && !hasProperties);
  const error = propertiesError || (!hasProperties ? journeyError : null);
  const refreshData = hasProperties ? refreshProperties : refreshJourneyData;

  console.log('📊 Dashboard system selection:', {
    hasProperties,
    hasJourneyData,
    propertiesCount,
    propertiesLoading,
    journeyLoading,
    selectedSystem: hasProperties ? 'multi-property' : 'single-property-fallback'
  });

  console.log('📊 Dashboard render state:', {
    authLoading,
    loading,
    user: !!user,
    userId: user?.id,
    error,
    hasProperties,
    hasJourneyData,
    propertiesCount,
    selectedPropertyId,
    selectedProperty: selectedProperty ? {
      address: selectedProperty.address,
      revenue: selectedProperty.totalMonthlyRevenue,
      opportunities: selectedProperty.totalOpportunities,
    } : null,
    journeyData: journeyData ? {
      address: journeyData.propertyAddress,
      revenue: journeyData.totalMonthlyRevenue,
      opportunities: journeyData.totalOpportunities,
    } : null
  });

  // Auto-refresh data when user first authenticates
  useEffect(() => {
    if (user && !loading && !hasProperties && !hasJourneyData) {
      console.log('🔄 User authenticated but no data found, attempting refresh...');
      setTimeout(() => {
        refreshData();
      }, 2000); // Give time for auth linking to complete
    }
  }, [user, loading, hasProperties, hasJourneyData, refreshData]);

  // Periodic refresh to catch any delayed data updates  
  useEffect(() => {
    if (user && !hasProperties && !hasJourneyData) {
      const intervalId = setInterval(() => {
        console.log('🔄 Periodic refresh attempt...');
        refreshData();
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
  }, [user, hasProperties, hasJourneyData, refreshData]);

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
      {!authLoading && user && !loading && !error && !hasProperties && !hasJourneyData && (
        <DashboardLayout>
          <JourneyTracker />
          <DashboardEmptyState />
        </DashboardLayout>
      )}

      {/* Show multi-property dashboard content */}
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

      {/* Show single-property fallback dashboard content */}
      {!authLoading && user && !loading && !error && hasJourneyData && !hasProperties && (() => {
        // Extract coordinates from analysis results - try multiple possible locations
        const coordinates = journeyData.analysisResults?.coordinates || 
                          journeyData.analysisResults?.propertyCoordinates ||
                          (journeyData.analysisResults?.rooftop?.coordinates) ||
                          null;

        console.log('🗺️ Using fallback system with coordinates:', coordinates);
        console.log('🏠 Using fallback property address:', journeyData.propertyAddress);

        // Convert journey data to the format expected by DashboardContent
        const latestAnalysis = {
          id: journeyData.analysisId || journeyData.journeyId,
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
              latestAnalysis={latestAnalysis}
              totalMonthlyRevenue={journeyData.totalMonthlyRevenue}
              totalOpportunities={journeyData.totalOpportunities}
              analysesCount={1} // Fallback system has 1 analysis
              onRefresh={refreshJourneyData}
            />
          </DashboardLayout>
        );
      })()}
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
