
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PropertyOverviewCard } from '@/components/dashboard/PropertyOverviewCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { InteractiveCharts } from '@/components/dashboard/InteractiveCharts';
import { RealTimeMetrics } from '@/components/dashboard/RealTimeMetrics';
import { PropertyInsights } from '@/components/dashboard/PropertyInsights';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Home, ChartPie, Info, BarChart, Activity, Lightbulb } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { analysisResults, address } = useGoogleMap();
  const { toast } = useToast();
  const { contentFromGPT, googleImages } = useModelGeneration();
  const userData = useUserData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your dashboard",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, loading, toast, navigate]);

  const handleAnalyzeProperty = () => {
    navigate('/');
  };

  // Show loading screen while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-6">Authentication Required</h1>
        <p className="mb-8 text-gray-300">Please sign in to access your dashboard</p>
        <Link 
          to="/" 
          className="bg-tiptop-purple hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors"
        >
          Go to Home Page
        </Link>
      </div>
    );
  }

  // Use saved data if available, fall back to current analysis
  const currentAnalysis = userData.getLatestAnalysis();
  const displayResults = currentAnalysis?.analysis_results || analysisResults;
  const displayAddress = userData.getPrimaryAddress()?.formatted_address || address || "No address analyzed yet";

  // Generate property description
  const getPropertyDescription = () => {
    if (!displayResults) {
      return "No property analyzed yet. Try analyzing a property to see personalized insights.";
    }
    
    let description = `${displayResults.propertyType} with ${displayResults.rooftop.area} sq ft roof area`;
    
    if (displayResults.parking.spaces > 0) {
      description += `, ${displayResults.parking.spaces} parking spaces`;
    }
    
    if (displayResults.garden.area > 0) {
      description += `, and ${displayResults.garden.area} sq ft garden space`;
    }
    
    if (displayResults.pool && displayResults.pool.present) {
      description += `, includes a ${displayResults.pool.type} pool`;
    }
    
    description += `. Potential monthly revenue: $${displayResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}.`;
    
    return description;
  };

  // Calculate total revenue from user's saved data
  const getTotalRevenue = () => {
    if (currentAnalysis) {
      return currentAnalysis.total_monthly_revenue;
    }
    return displayResults ? 
      displayResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0) : 
      1200;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            {userData.addresses.length > 0 && (
              <div className="text-sm text-gray-400">
                {userData.addresses.length} saved {userData.addresses.length === 1 ? 'property' : 'properties'}
              </div>
            )}
          </div>
          
          {!displayResults ? (
            <div className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10 max-w-2xl mx-auto"
              >
                <div className="text-6xl mb-4 text-tiptop-purple flex justify-center">
                  <Info />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">No Property Analysis Yet</h2>
                <p className="text-gray-300 mb-6">
                  Analyze a property to see personalized monetization insights, revenue potential, and recommendations.
                </p>
                <Button
                  onClick={handleAnalyzeProperty}
                  className="bg-tiptop-purple hover:bg-purple-700 text-white px-6 py-6 rounded-full transition-colors"
                  size="lg"
                >
                  <Home className="mr-2 h-5 w-5" /> Analyze Your Property
                </Button>
              </motion.div>
            </div>
          ) : null}
          
          {/* Main Dashboard Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-600">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">
                <Home className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="realtime" className="text-white data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Real-time
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-white data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Property Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <PropertyOverviewCard 
                    address={displayAddress} 
                    description={getPropertyDescription()} 
                    imageUrl={displayResults ? "https://picsum.photos/id/1048/600/400" : "/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png"} 
                  />
                </div>
                <div>
                  <StatsCard 
                    title="Monthly Revenue Potential"
                    value={`$${getTotalRevenue()}`}
                    description={currentAnalysis ? "From saved analysis" : "Based on property analysis"}
                    trend="up"
                    trendValue="12.5%"
                    variant="purple"
                  />
                </div>
              </div>
              
              {/* GPT Content */}
              {contentFromGPT && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-4">Property Potential Analysis</h2>
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {contentFromGPT}
                  </div>
                </div>
              )}
              
              {/* Assets Table */}
              {displayResults ? (
                <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-4">Your Assets</h2>
                  <AssetsTable analysisResults={displayResults} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-4">Potential Assets</h2>
                  <div className="text-center py-8">
                    <ChartPie className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Analyze a property to see your specific asset breakdown and monetization opportunities
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <InteractiveCharts />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-6">
              <RealTimeMetrics />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <PropertyInsights 
                address={displayAddress}
                analysisResults={displayResults}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
