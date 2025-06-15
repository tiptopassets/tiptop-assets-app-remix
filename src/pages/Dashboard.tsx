
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
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    addresses, 
    analyses, 
    assetSelections, 
    loading, 
    error,
    loadUserData,
    getPrimaryAddress,
    getLatestAnalysis 
  } = useUserData();

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const primaryAddress = getPrimaryAddress();
  const latestAnalysis = getLatestAnalysis();

  console.log('📊 Dashboard render:', {
    user: !!user,
    loading,
    error,
    addressesCount: addresses.length,
    analysesCount: analyses.length,
    assetSelectionsCount: assetSelections.length,
    primaryAddress: primaryAddress?.address,
    latestAnalysis: !!latestAnalysis
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Error loading dashboard data</p>
              <Button onClick={loadUserData} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // No analysis data found
  if (!latestAnalysis) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <DashboardEmptyState />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total revenue from analysis results
  const analysisResults = latestAnalysis.analysis_results;
  const totalMonthlyRevenue = latestAnalysis.total_monthly_revenue || 0;
  const totalOpportunities = latestAnalysis.total_opportunities || 0;

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
            <Button asChild variant="outline">
              <Link to="/">
                <MapPin className="mr-2 h-4 w-4" />
                Analyze New Property
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <DashboardStats 
            totalMonthlyRevenue={totalMonthlyRevenue}
            totalOpportunities={totalOpportunities}
            analysesCount={analyses.length}
          />
        </motion.div>

        {/* Property Overview */}
        <DashboardPropertyOverview 
          address={primaryAddress?.address || "Property Address"}
          createdAt={latestAnalysis.created_at}
          totalOpportunities={totalOpportunities}
          totalMonthlyRevenue={totalMonthlyRevenue}
        />

        {/* Assets Table */}
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

        {/* Revenue Charts */}
        <DashboardCharts 
          analysisResults={analysisResults}
          totalMonthlyRevenue={totalMonthlyRevenue}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
