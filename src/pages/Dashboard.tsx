
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardPropertyOverview } from '@/components/dashboard/DashboardPropertyOverview';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to view your dashboard</p>
              <Button asChild>
                <Link to="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state while data is loading
  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => refreshUserData()} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button onClick={loadUserData} variant="outline" className="w-full">
                  Reload Dashboard
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show empty state if no analysis data is found
  if (analyses.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
              <p className="text-gray-600">Get started by analyzing your first property</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refreshUserData()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <Link to="/">
                  <MapPin className="mr-2 h-4 w-4" />
                  Analyze Property
                </Link>
              </Button>
            </div>
          </div>
          <DashboardEmptyState />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total revenue from analysis results
  const analysisResults = latestAnalysis?.analysis_results;
  const totalMonthlyRevenue = latestAnalysis?.total_monthly_revenue || 0;
  const totalOpportunities = latestAnalysis?.total_opportunities || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Property Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
              <p className="text-gray-600">
                {primaryAddress?.address || 'Your monetization overview'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refreshUserData()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  <MapPin className="mr-2 h-4 w-4" />
                  Analyze New Property
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <DashboardStats 
            totalMonthlyRevenue={totalMonthlyRevenue}
            totalOpportunities={totalOpportunities}
            analysesCount={analyses.length}
          />
        </motion.div>

        {/* Property Overview */}
        {latestAnalysis && (
          <DashboardPropertyOverview 
            address={primaryAddress?.address || "Property Address"}
            createdAt={latestAnalysis.created_at}
            totalOpportunities={totalOpportunities}
            totalMonthlyRevenue={totalMonthlyRevenue}
          />
        )}

        {/* Assets Table */}
        {analysisResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Asset Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of your property's monetization potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetsTable analysisResults={analysisResults} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Revenue Charts */}
        {analysisResults && (
          <DashboardCharts 
            analysisResults={analysisResults}
            totalMonthlyRevenue={totalMonthlyRevenue}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
