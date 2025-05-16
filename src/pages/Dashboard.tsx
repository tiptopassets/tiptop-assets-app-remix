
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PropertyOverviewCard } from '@/components/dashboard/PropertyOverviewCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AssetsTable } from '@/components/dashboard/AssetsTable';
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from '@/components/dashboard/RevenueCharts';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { analysisResults, address } = useGoogleMap();
  const { toast } = useToast();
  const { contentFromGPT, googleImages } = useModelGeneration();
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your dashboard",
        variant: "destructive"
      });
    }
  }, [user, toast]);

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

  // Generate dummy data for charts if we have analysis results
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

  const chartData = getChartData();
  
  // Generate property description
  const getPropertyDescription = () => {
    if (!analysisResults) return "";
    
    return `${analysisResults.propertyType} with ${analysisResults.rooftop.area} sq ft roof area, ${analysisResults.parking.spaces} parking spaces, and ${analysisResults.garden.area} sq ft garden space. Potential monthly revenue: $${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}.`;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {analysisResults ? (
          <>
            {/* Property Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <PropertyOverviewCard 
                  address={address} 
                  description={getPropertyDescription()} 
                  imageUrl={analysisResults ? "https://picsum.photos/id/1048/600/400" : undefined} 
                />
              </div>
              <div>
                <StatsCard 
                  title="Monthly Revenue Potential"
                  value={`$${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}`}
                  description="Based on your property analysis"
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
                  <AssetDistributionChart data={chartData.assetDistribution} />
                </div>
                <div>
                  <TodayRevenueChart 
                    amount={chartData.todayRevenue} 
                    increasePercentage={chartData.increasePercentage} 
                  />
                </div>
                <div className="md:col-span-1">
                  <RevenueOverTimeChart 
                    data={chartData.monthlyData}
                    keys={chartData.assetKeys}
                  />
                </div>
              </div>
            )}
            
            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4">Your Assets</h2>
              <AssetsTable analysisResults={analysisResults} />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No property analysis data available. Please analyze a property first.
            </p>
            <Link 
              to="/" 
              className="mt-4 inline-block bg-tiptop-purple hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              Analyze Property
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
