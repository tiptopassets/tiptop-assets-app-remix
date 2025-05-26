
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PropertyOverviewCard } from '@/components/dashboard/PropertyOverviewCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from '@/components/dashboard/RevenueCharts';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, ChartPie, Info } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { analysisResults, address } = useGoogleMap();
  const { toast } = useToast();
  const { contentFromGPT, googleImages } = useModelGeneration();
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

  // Generate chart data from analysis results
  const getChartData = () => {
    if (!analysisResults) return null;
    
    // Asset distribution data for pie chart
    const assetDistributionData = [
      { name: 'Rooftop', value: analysisResults.rooftop.revenue },
      { name: 'Parking', value: analysisResults.parking.revenue },
      { name: 'Garden', value: analysisResults.garden.revenue },
    ];
    
    if (analysisResults.pool && analysisResults.pool.present) {
      assetDistributionData.push({ name: 'Pool', value: analysisResults.pool.revenue });
    }

    if (analysisResults.bandwidth && analysisResults.bandwidth.revenue) {
      assetDistributionData.push({ name: 'Internet', value: analysisResults.bandwidth.revenue });
    }
    
    // Monthly revenue data
    const monthlyData = [
      { name: 'Jan', Rooftop: 400, Parking: 240, Garden: 180 },
      { name: 'Feb', Rooftop: 420, Parking: 280, Garden: 190 },
      { name: 'Mar', Rooftop: 450, Parking: 300, Garden: 220 },
      { name: 'Apr', Rooftop: 470, Parking: 290, Garden: 230 },
      { name: 'May', Rooftop: 500, Parking: 310, Garden: 240 },
      { name: 'Jun', Rooftop: 520, Parking: 340, Garden: 260 },
    ];
    
    const assetKeys = ['Rooftop', 'Parking', 'Garden'];
    
    return {
      assetDistribution: assetDistributionData,
      monthlyData,
      assetKeys,
      todayRevenue: 45.2,
      increasePercentage: 12.5
    };
  };

  // Generate sample data for displaying in the dashboard when no analysis exists
  const getSampleData = () => {
    return {
      assetDistribution: [
        { name: 'Rooftop', value: 500 },
        { name: 'Parking', value: 300 },
        { name: 'Garden', value: 200 },
        { name: 'Pool', value: 100 },
      ],
      monthlyData: [
        { name: 'Jan', Rooftop: 400, Parking: 240, Garden: 180 },
        { name: 'Feb', Rooftop: 420, Parking: 280, Garden: 190 },
        { name: 'Mar', Rooftop: 450, Parking: 300, Garden: 220 },
        { name: 'Apr', Rooftop: 470, Parking: 290, Garden: 230 },
        { name: 'May', Rooftop: 500, Parking: 310, Garden: 240 },
        { name: 'Jun', Rooftop: 520, Parking: 340, Garden: 260 },
      ],
      assetKeys: ['Rooftop', 'Parking', 'Garden'],
      todayRevenue: 45.2,
      increasePercentage: 12.5
    };
  };

  // If we have analysis results, use them. Otherwise, use sample data
  const chartData = analysisResults ? getChartData() : getSampleData();
  
  // Generate property description
  const getPropertyDescription = () => {
    if (!analysisResults) {
      return "No property analyzed yet. Try analyzing a property to see personalized insights.";
    }
    
    let description = `${analysisResults.propertyType} with ${analysisResults.rooftop.area} sq ft roof area`;
    
    if (analysisResults.parking.spaces > 0) {
      description += `, ${analysisResults.parking.spaces} parking spaces`;
    }
    
    if (analysisResults.garden.area > 0) {
      description += `, and ${analysisResults.garden.area} sq ft garden space`;
    }
    
    if (analysisResults.pool && analysisResults.pool.present) {
      description += `, includes a ${analysisResults.pool.type} pool`;
    }
    
    description += `. Potential monthly revenue: $${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}.`;
    
    return description;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {!analysisResults ? (
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
        
        {/* Sample or Real Data Display */}
        <div>
          {/* Property Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PropertyOverviewCard 
                address={address || "No address analyzed yet"} 
                description={getPropertyDescription()} 
                imageUrl={analysisResults ? "https://picsum.photos/id/1048/600/400" : "/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png"} 
              />
            </div>
            <div>
              <StatsCard 
                title="Monthly Revenue Potential"
                value={`$${analysisResults ? 
                  analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0) : 
                  "1,200"}`}
                description="Based on property analysis"
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
          
          {/* If no GPT content but we need to display something */}
          {!contentFromGPT && !analysisResults && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4">Property Potential Analysis</h2>
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                <p>Analyze your property to receive AI-powered insights about monetization opportunities. Our system will:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Evaluate your property's solar potential</li>
                  <li>Identify parking space rental opportunities</li>
                  <li>Assess garden and outdoor space utilization</li>
                  <li>Check for pool rental potential</li>
                  <li>Calculate your estimated monthly earnings</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Google Images */}
          {googleImages && googleImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4">Property Inspiration Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {googleImages.map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`Property inspiration ${index + 1}`} 
                      className="w-full h-48 object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Charts Grid */}
          {chartData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4">Asset Distribution</h3>
                  <AssetDistributionChart data={chartData.assetDistribution} />
                </div>
              </div>
              <div>
                <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4">Today's Revenue</h3>
                  <TodayRevenueChart 
                    amount={chartData.todayRevenue} 
                    increasePercentage={chartData.increasePercentage} 
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                  <h3 className="text-lg font-medium mb-4">Revenue Over Time</h3>
                  <RevenueOverTimeChart 
                    data={chartData.monthlyData}
                    keys={chartData.assetKeys}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Assets Table */}
          {analysisResults ? (
            <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4">Your Assets</h2>
              <AssetsTable analysisResults={analysisResults} />
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
