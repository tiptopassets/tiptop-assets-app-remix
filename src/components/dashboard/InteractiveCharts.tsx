
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractiveChartsProps {
  revenueData?: any[];
  performanceData?: any[];
  assetDistribution?: any[];
}

const COLORS = ['#9b87f5', '#33C3F0', '#6E59A5', '#FF8042', '#FFBB28', '#00C49F'];

export const InteractiveCharts = ({ 
  revenueData = [], 
  performanceData = [], 
  assetDistribution = [] 
}: InteractiveChartsProps) => {
  // Generate enhanced sample data if none provided
  const defaultRevenueData = [
    { month: 'Jan', revenue: 1200, profit: 800, expenses: 400, growth: 5.2 },
    { month: 'Feb', revenue: 1350, profit: 920, expenses: 430, growth: 12.5 },
    { month: 'Mar', revenue: 1480, profit: 1050, expenses: 430, growth: 9.6 },
    { month: 'Apr', revenue: 1620, profit: 1180, expenses: 440, growth: 9.5 },
    { month: 'May', revenue: 1750, profit: 1290, expenses: 460, growth: 8.0 },
    { month: 'Jun', revenue: 1890, profit: 1420, expenses: 470, growth: 8.0 },
  ];

  const defaultPerformanceData = [
    { asset: 'Solar Panels', efficiency: 92, revenue: 650, trend: 'up', change: 8.5 },
    { asset: 'Parking Space', efficiency: 78, revenue: 420, trend: 'up', change: 12.3 },
    { asset: 'Garden Rental', efficiency: 85, revenue: 280, trend: 'down', change: -2.1 },
    { asset: 'Pool Access', efficiency: 89, revenue: 320, trend: 'up', change: 15.7 },
    { asset: 'Internet Sharing', efficiency: 95, revenue: 180, trend: 'up', change: 22.4 },
  ];

  const defaultAssetDistribution = [
    { name: 'Solar Energy', value: 650, percentage: 34.4, color: '#9b87f5' },
    { name: 'Parking', value: 420, percentage: 22.2, color: '#33C3F0' },
    { name: 'Pool', value: 320, percentage: 16.9, color: '#6E59A5' },
    { name: 'Garden', value: 280, percentage: 14.8, color: '#FF8042' },
    { name: 'Internet', value: 180, percentage: 9.5, color: '#FFBB28' },
    { name: 'Storage', value: 40, percentage: 2.1, color: '#00C49F' },
  ];

  const chartData = {
    revenue: revenueData.length > 0 ? revenueData : defaultRevenueData,
    performance: performanceData.length > 0 ? performanceData : defaultPerformanceData,
    distribution: assetDistribution.length > 0 ? assetDistribution : defaultAssetDistribution,
  };

  const totalRevenue = chartData.distribution.reduce((sum, item) => sum + item.value, 0);
  const averageGrowth = chartData.revenue.reduce((sum, item) => sum + item.growth, 0) / chartData.revenue.length;

  return (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="performance">Asset Performance</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#9b87f5" 
                      fill="url(#revenueGradient)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      fill="url(#profitGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Rate Chart */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="growth" fill="#33C3F0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Avg Growth: {averageGrowth.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Performance Table */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Asset Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                {chartData.performance.map((asset, index) => (
                  <motion.div 
                    key={asset.asset}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        asset.efficiency >= 90 ? 'bg-green-500' : 
                        asset.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{asset.asset}</p>
                        <p className="text-sm text-gray-600">{asset.efficiency}% efficient</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${asset.revenue}</p>
                      <div className="flex items-center gap-1">
                        {asset.trend === 'up' ? 
                          <TrendingUp className="h-3 w-3 text-green-500" /> : 
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        }
                        <span className={`text-xs ${
                          asset.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {asset.change > 0 ? '+' : ''}{asset.change}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Asset Distribution Pie Chart */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-purple-500" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [`$${value}`, name]}
                      />} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {chartData.distribution.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900">Solar Panels</p>
                  <p className="text-sm text-green-700">+8.5% this month</p>
                  <Badge className="mt-2 bg-green-500">Excellent ROI</Badge>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Monthly Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-900">${totalRevenue}</p>
                  <p className="text-sm text-blue-700">+{averageGrowth.toFixed(1)}% average growth</p>
                  <Badge className="mt-2 bg-blue-500">On Track</Badge>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-800 text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-900">87.8%</p>
                  <p className="text-sm text-purple-700">Average across all assets</p>
                  <Badge className="mt-2 bg-purple-500">Good Performance</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recommendations */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm"></div>
            <CardHeader className="relative z-10">
              <CardTitle>Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">🚀 Optimization Opportunity</p>
                <p className="text-sm text-blue-700">Consider adding EV charging to your parking space - potential +35% revenue increase</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">☀️ Solar Performance</p>
                <p className="text-sm text-green-700">Your solar panels are performing 12% above average - great installation!</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900">📈 Market Trend</p>
                <p className="text-sm text-yellow-700">Pool rental demand is up 23% in your area - consider premium pricing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
