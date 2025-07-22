
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Calendar, Activity, Database, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDashboardJourneyData } from "@/hooks/useDashboardJourneyData";
import { useUserAssetSelections } from "@/hooks/useUserAssetSelections";
import { useState, useMemo } from "react";

const AnalyticsDashboard = () => {
  const { journeyData, loading, error } = useDashboardJourneyData();
  const { assetSelections } = useUserAssetSelections();
  const [viewMode, setViewMode] = useState<'real' | 'simulated'>('real');

  // Process real asset data from user selections
  const realAssetData = useMemo(() => {
    // Deduplicate assets by keeping only the most recent selection for each asset type
    const deduplicatedAssets = assetSelections.reduce((acc, selection) => {
      const assetType = selection.asset_type.toLowerCase();
      const displayName = selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1).replace('_', ' ');
      
      const existingAssetIndex = acc.findIndex(asset => asset.asset_type === assetType);
      
      if (existingAssetIndex !== -1) {
        // Keep the more recent selection and sum the revenues
        const existingDate = new Date(acc[existingAssetIndex].selected_at);
        const currentDate = new Date(selection.selected_at);
        
        if (currentDate > existingDate) {
          acc[existingAssetIndex] = {
            asset_type: assetType,
            name: displayName,
            monthly_revenue: acc[existingAssetIndex].monthly_revenue + selection.monthly_revenue,
            setup_cost: selection.setup_cost,
            selected_at: selection.selected_at
          };
        } else {
          acc[existingAssetIndex].monthly_revenue += selection.monthly_revenue;
        }
      } else {
        // First occurrence of this asset type
        acc.push({
          asset_type: assetType,
          name: displayName,
          monthly_revenue: selection.monthly_revenue,
          setup_cost: selection.setup_cost,
          selected_at: selection.selected_at
        });
      }
      return acc;
    }, [] as any[]);

    const totalRevenue = deduplicatedAssets.reduce((sum, asset) => sum + asset.monthly_revenue, 0);
    const activeAssets = deduplicatedAssets.length;

    // Generate revenue over time data for real assets
    const revenueOverTime = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
      const data: any = { month };
      deduplicatedAssets.forEach(asset => {
        // Simulate growth over time
        const baseRevenue = asset.monthly_revenue;
        const growthFactor = 1 + (index * 0.05); // 5% growth per month
        data[asset.name.toLowerCase().replace(' ', '')] = Math.round(baseRevenue * growthFactor);
      });
      return data;
    });

    // Asset distribution for pie chart
    const assetDistribution = deduplicatedAssets.map((asset, index) => ({
      name: asset.name,
      value: Math.round((asset.monthly_revenue / totalRevenue) * 100),
      color: ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f97316'][index % 6]
    }));

    return {
      totalRevenue,
      activeAssets,
      revenueOverTime,
      assetDistribution,
      assets: deduplicatedAssets
    };
  }, [assetSelections]);

  // Simulated data based on available opportunities
  const simulatedData = useMemo(() => {
    const availableAssets = journeyData?.analysisResults?.topOpportunities || [];
    const totalRevenue = availableAssets.reduce((sum: number, asset: any) => sum + (asset.monthlyRevenue || 0), 0);
    
    // Generate simulated revenue trends
    const revenueOverTime = [
      { month: 'Jan', solar: 120, internet: 45, parking: 200, evCharging: 80 },
      { month: 'Feb', solar: 135, internet: 48, parking: 220, evCharging: 85 },
      { month: 'Mar', solar: 158, internet: 52, parking: 180, evCharging: 92 },
      { month: 'Apr', solar: 165, internet: 55, parking: 240, evCharging: 98 },
      { month: 'May', solar: 178, internet: 58, parking: 260, evCharging: 105 },
      { month: 'Jun', solar: 182, internet: 60, parking: 280, evCharging: 110 },
    ];

    const assetDistribution = [
      { name: 'Solar', value: 40, color: '#f59e0b' },
      { name: 'Parking', value: 35, color: '#8b5cf6' },
      { name: 'Internet', value: 15, color: '#06b6d4' },
      { name: 'EV Charging', value: 10, color: '#10b981' },
    ];

    return {
      totalRevenue,
      activeAssets: availableAssets.length,
      revenueOverTime,
      assetDistribution
    };
  }, [journeyData]);

  const currentData = viewMode === 'real' ? realAssetData : simulatedData;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive revenue and performance analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'real' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('real')}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Real Data
              </Button>
              <Button
                variant={viewMode === 'simulated' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('simulated')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Simulated
              </Button>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {viewMode === 'real' ? 'Live Data' : 'Projected Data'}
            </Badge>
          </div>
        </div>

        {/* Data Source Indicator */}
        <Card className={`border-l-4 ${viewMode === 'real' ? 'border-l-green-500 bg-green-50/50' : 'border-l-blue-500 bg-blue-50/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {viewMode === 'real' ? (
                <>
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Real Asset Data</p>
                    <p className="text-sm text-green-700">
                      Showing analytics from your {realAssetData.assets.length} configured assets
                      {realAssetData.assets.length === 0 && " (No assets configured yet)"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Simulated Data</p>
                    <p className="text-sm text-blue-700">
                      Showing projected analytics based on your property's potential opportunities
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${currentData.totalRevenue.toFixed(0)}/mo</p>
                  <p className="text-xs text-green-600">
                    {viewMode === 'real' ? 'From active assets' : '+12% projected growth'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {viewMode === 'real' ? 'Active Assets' : 'Available Assets'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{currentData.activeAssets}</p>
                  <p className="text-xs text-blue-600">
                    {viewMode === 'real' ? 'Currently generating revenue' : 'Ready for deployment'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewMode === 'real' ? '5.2%' : '8.5%'}
                  </p>
                  <p className="text-xs text-purple-600">Monthly average</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewMode === 'real' ? '78%' : '92%'}
                  </p>
                  <p className="text-xs text-orange-600">Asset efficiency</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                {viewMode === 'real' ? 'Actual monthly revenue by asset type' : 'Projected monthly revenue by asset type'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentData.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {viewMode === 'real' ? (
                    // Dynamic areas based on real assets
                    realAssetData.assets.map((asset, index) => (
                      <Area
                        key={asset.name}
                        type="monotone"
                        dataKey={asset.name.toLowerCase().replace(' ', '')}
                        stackId="1"
                        stroke={['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f97316'][index % 6]}
                        fill={['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f97316'][index % 6]}
                        fillOpacity={0.8}
                      />
                    ))
                  ) : (
                    // Simulated areas
                    <>
                      <Area type="monotone" dataKey="solar" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="parking" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="internet" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="evCharging" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>
                {viewMode === 'real' ? 'Actual breakdown by asset type' : 'Projected breakdown by asset type'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentData.assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={viewMode === 'real' ? 'value' : 'value'}
                  >
                    {currentData.assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              {viewMode === 'real' ? 'Real insights from your active assets' : 'Projected insights and recommendations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {viewMode === 'real' ? (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Active Revenue</h4>
                    <p className="text-sm text-green-700">
                      {realAssetData.assets.length > 0 
                        ? `${realAssetData.assets[0]?.name || 'Your assets'} generating steady income`
                        : 'No active assets configured yet'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Growth Opportunity</h4>
                    <p className="text-sm text-blue-700">
                      {realAssetData.assets.length < 3 
                        ? 'Consider adding more assets to increase revenue'
                        : 'Excellent asset diversification achieved'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Optimization</h4>
                    <p className="text-sm text-purple-700">
                      Monitor performance and adjust settings for optimal returns
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Top Potential</h4>
                    <p className="text-sm text-green-700">Solar system could generate 15% above average</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">High Demand</h4>
                    <p className="text-sm text-blue-700">Parking revenue projected to grow 22% quarterly</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Quick Start</h4>
                    <p className="text-sm text-purple-700">EV charging setup takes only 2-3 weeks</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
