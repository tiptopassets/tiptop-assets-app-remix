
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardErrorState from '@/components/dashboard/DashboardErrorState';
import DashboardAuthGuard from '@/components/dashboard/DashboardAuthGuard';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    addresses, 
    analyses, 
    assetSelections, 
    loading: dataLoading, 
    error,
    loadUserData,
    refreshUserData,
    getPrimaryAddress,
    getLatestAnalysis 
  } = useUserData();

  const primaryAddress = getPrimaryAddress();
  const latestAnalysis = getLatestAnalysis();

  console.log('📊 Dashboard render state:', {
    authLoading,
    dataLoading,
    user: !!user,
    userId: user?.id,
    error,
    addressesCount: addresses.length,
    analysesCount: analyses.length,
    assetSelectionsCount: assetSelections.length,
    primaryAddress: primaryAddress?.address,
    latestAnalysis: !!latestAnalysis
  });

  // Show loading state while auth is loading
  if (authLoading) {
    return <DashboardLoadingState message="Loading authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <DashboardAuthGuard />;
  }

  // Show loading state while data is loading
  if (dataLoading) {
    return <DashboardLoadingState message="Loading your dashboard data..." />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <DashboardErrorState 
        error={error}
        onRefresh={refreshUserData}
        onReload={loadUserData}
      />
    );
  }

  // Show empty state if no analysis data is found
  if (analyses.length === 0) {
    return (
      <DashboardLayout>
        <DashboardEmptyState />
      </DashboardLayout>
    );
  }

  // Calculate total revenue from analysis results
  const totalMonthlyRevenue = latestAnalysis?.total_monthly_revenue || 0;
  const totalOpportunities = latestAnalysis?.total_opportunities || 0;

  return (
    <DashboardLayout>
      <DashboardContent
        primaryAddress={primaryAddress?.address}
        latestAnalysis={latestAnalysis}
        totalMonthlyRevenue={totalMonthlyRevenue}
        totalOpportunities={totalOpportunities}
        analysesCount={analyses.length}
        onRefresh={refreshUserData}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
