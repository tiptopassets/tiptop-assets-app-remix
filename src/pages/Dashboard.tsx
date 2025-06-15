
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PropertyOverviewCard } from '@/components/dashboard/PropertyOverviewCard';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from '@/components/dashboard/RevenueCharts';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, DollarSign, Home } from 'lucide-react';
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-tiptop-purple/10 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-tiptop-purple" />
                </div>
                <CardTitle className="text-2xl">No Property Analysis Yet</CardTitle>
                <CardDescription className="text-lg">
                  Start by analyzing your property to see monetization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Get started by analyzing your property to discover how you can monetize your home assets.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg">
                      <Link to="/">
                        <MapPin className="mr-2 h-4 w-4" />
                        Analyze Property
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/submit-property">
                        Submit Property Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total revenue from analysis results
  const analysisResults = latestAnalysis.analysis_results;
  const totalMonthlyRevenue = latestAnalysis.total_monthly_revenue || 0;
  const totalOpportunities = latestAnalysis.total_opportunities || 0;

  // Prepare chart data from analysis results
  const chartData = [];
  if (analysisResults?.rooftop?.revenue) {
    chartData.push({ name: 'Solar/Rooftop', value: analysisResults.rooftop.revenue });
  }
  if (analysisResults?.parking?.revenue) {
    chartData.push({ name: 'Parking', value: analysisResults.parking.revenue });
  }
  if (analysisResults?.garden?.revenue) {
    chartData.push({ name: 'Garden', value: analysisResults.garden.revenue });
  }
  if (analysisResults?.pool?.revenue) {
    chartData.push({ name: 'Pool', value: analysisResults.pool.revenue });
  }
  if (analysisResults?.storage?.revenue) {
    chartData.push({ name: 'Storage', value: analysisResults.storage.revenue });
  }
  if (analysisResults?.bandwidth?.revenue) {
    chartData.push({ name: 'Internet', value: analysisResults.bandwidth.revenue });
  }

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Monthly Revenue Potential"
              value={`$${totalMonthlyRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6" />}
              trend={totalMonthlyRevenue > 0 ? "up" : "neutral"}
              trendValue={totalMonthlyRevenue > 0 ? "Ready to earn" : "Analyze property"}
            />
            <StatsCard
              title="Monetization Opportunities"
              value={totalOpportunities.toString()}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={totalOpportunities > 0 ? "up" : "neutral"}
              trendValue={totalOpportunities > 0 ? "Available now" : "Get started"}
            />
            <StatsCard
              title="Properties Analyzed"
              value={analyses.length.toString()}
              icon={<Home className="h-6 w-6" />}
              trend={analyses.length > 0 ? "up" : "neutral"}
              trendValue={analyses.length > 1 ? `${analyses.length} properties` : "First property"}
            />
          </div>
        </motion.div>

        {/* Property Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PropertyOverviewCard 
            address={primaryAddress?.address || "Property Address"}
            description={`Property analysis completed on ${new Date(latestAnalysis.created_at).toLocaleDateString()}. Found ${totalOpportunities} monetization opportunities with potential monthly revenue of $${totalMonthlyRevenue}.`}
          />
        </motion.div>

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AssetDistributionChart data={chartData} />
            <TodayRevenueChart amount={totalMonthlyRevenue / 30} increasePercentage={15} />
            <RevenueOverTimeChart 
              data={[
                { name: 'Jan', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
                { name: 'Feb', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
                { name: 'Mar', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
              ]}
              keys={['Solar', 'Parking']}
            />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
