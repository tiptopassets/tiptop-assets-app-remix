import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Wifi, Download, Upload, DollarSign, TrendingUp, Globe, Shield, Activity, Clock, Settings, Router, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import SpeedTestWidget from "@/components/internet/SpeedTestWidget";
import { AIEarningsAnalysis } from "@/components/internet/AIEarningsAnalysis";
import { useInternetSpeed } from "@/hooks/useInternetSpeed";

const InternetDashboard = () => {
  const { 
    latestResult, 
    testHistory, 
    isTestRunning,
    runSpeedTest,
    calculateAverageSpeed, 
    getNetworkQuality,
    getBandwidthSharingPotential,
    aiEarningsAnalysis,
    isAnalyzingEarnings,
    getAIOptimizationTips,
    getMarketFactors,
    getBestSharingSchedule
  } = useInternetSpeed();

  // Auto-run speed test when component mounts if no recent test exists
  useEffect(() => {
    const shouldAutoRun = !latestResult || 
      (Date.now() - latestResult.timestamp.getTime()) > 5 * 60 * 1000; // 5 minutes

    if (shouldAutoRun && !isTestRunning) {
      console.log('🔄 Auto-running speed test on dashboard load...');
      runSpeedTest();
    }
  }, []); // Empty dependency array to run only on mount

  // Use real data if available, otherwise fall back to mock data
  const averageSpeeds = calculateAverageSpeed();
  const networkQuality = getNetworkQuality();
  const sharingPotential = getBandwidthSharingPotential();
  const optimizationTips = getAIOptimizationTips();
  const marketFactors = getMarketFactors();
  const sharingSchedule = getBestSharingSchedule();

  // Enhanced bandwidth data with AI predictions
  const bandwidthData = {
    totalBandwidth: latestResult?.downloadSpeed || 1000,
    sharedBandwidth: sharingPotential.shareable || 250,
    monthlyEarnings: aiEarningsAnalysis?.monthlyEarnings.average || sharingPotential.potential || 42,
    totalEarnings: (aiEarningsAnalysis?.monthlyEarnings.average || sharingPotential.potential || 42) * 12,
    connectedDevices: 8,
    dataShared: 2.4,
    uptime: 99.8,
    avgSpeed: latestResult?.downloadSpeed || 850
  };

  // Convert test history to chart data format
  const usageData = testHistory.slice(-6).map((result, index) => ({
    time: result.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    personal: Math.round(result.downloadSpeed * 0.6),
    shared: Math.round(result.downloadSpeed * 0.25),
    available: Math.round(result.downloadSpeed * 0.15),
  }));

  // If no test history, use mock data
  const chartData = usageData.length > 0 ? usageData : [
    { time: '00:00', personal: 120, shared: 45, available: 835 },
    { time: '04:00', personal: 80, shared: 35, available: 885 },
    { time: '08:00', personal: 280, shared: 85, available: 635 },
    { time: '12:00', personal: 180, shared: 65, available: 755 },
    { time: '16:00', personal: 320, shared: 95, available: 585 },
    { time: '20:00', personal: 450, shared: 120, available: 430 },
  ];

  // Mock data for other charts (these would be enhanced in a full implementation)
  const earningsData = [
    { month: 'Jan', earnings: 38, data: 2.1, devices: 6 },
    { month: 'Feb', earnings: 35, data: 1.9, devices: 7 },
    { month: 'Mar', earnings: 41, data: 2.3, devices: 8 },
    { month: 'Apr', earnings: 39, data: 2.2, devices: 7 },
    { month: 'May', earnings: 44, data: 2.5, devices: 9 },
    { month: 'Jun', earnings: sharingPotential.potential || 42, data: 2.4, devices: 8 },
  ];

  const deviceTypeData = [
    { name: 'Smartphones', value: 45, color: '#8b5cf6' },
    { name: 'Laptops', value: 25, color: '#06b6d4' },
    { name: 'Tablets', value: 15, color: '#10b981' },
    { name: 'Smart TV', value: 10, color: '#f59e0b' },
    { name: 'IoT Devices', value: 5, color: '#ef4444' },
  ];

  const networkPerformance = testHistory.slice(-6).map((result, index) => ({
    hour: result.timestamp.getHours().toString().padStart(2, '0'),
    latency: result.ping,
    speed: Math.round(result.downloadSpeed),
    uptime: 99 + Math.random() * 1
  }));

  // Fallback to mock data if no test history
  const performanceData = networkPerformance.length > 0 ? networkPerformance : [
    { hour: '00', latency: 12, speed: 920, uptime: 100 },
    { hour: '04', latency: 8, speed: 950, uptime: 100 },
    { hour: '08', latency: 15, speed: 880, uptime: 99 },
    { hour: '12', latency: 18, speed: 850, uptime: 100 },
    { hour: '16', latency: 22, speed: 780, uptime: 98 },
    { hour: '20', latency: 25, speed: 720, uptime: 99 },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg">
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Internet Bandwidth Sharing</h1>
              <p className="text-gray-600">AI-powered earnings optimization and bandwidth monetization</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Activity className="h-4 w-4 mr-2" />
              Live Monitor
            </Button>
          </div>
        </div>

        {/* Speed Test and AI Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpeedTestWidget />
          <AIEarningsAnalysis 
            analysis={aiEarningsAnalysis} 
            isAnalyzing={isAnalyzingEarnings}
          />
        </div>

        {/* Enhanced Key Metrics Cards with AI Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Predicted Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${bandwidthData.monthlyEarnings}
                  </p>
                  <p className="text-xs text-green-600">
                    {aiEarningsAnalysis ? 'AI-optimized' : 'Basic calculation'}
                  </p>
                </div>
                <Brain className={`h-8 w-8 ${aiEarningsAnalysis ? 'text-purple-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Bandwidth</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(bandwidthData.totalBandwidth)} Mbps</p>
                  <p className="text-xs text-blue-600">Sharing: {Math.round(bandwidthData.sharedBandwidth)} Mbps</p>
                </div>
                <Router className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Market Demand</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{marketFactors.demandLevel}</p>
                  <p className="text-xs text-purple-600">{marketFactors.locationPremium}x location premium</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Network Quality</p>
                  <p className="text-2xl font-bold text-gray-900">{networkQuality}%</p>
                  <p className="text-xs text-green-600">
                    {networkQuality >= 80 ? 'Excellent' : networkQuality >= 60 ? 'Good' : 'Fair'}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs with AI Insights */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border-gray-200">
            <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">AI Insights</TabsTrigger>
            <TabsTrigger value="bandwidth" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Bandwidth</TabsTrigger>
            <TabsTrigger value="devices" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Devices</TabsTrigger>
            <TabsTrigger value="security" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connection Overview */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Connection Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-300">Download Speed</p>
                      <p className="text-xl font-bold text-white">{Math.round(bandwidthData.avgSpeed)} Mbps</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Upload Speed</p>
                      <p className="text-xl font-bold text-white">{latestResult?.uploadSpeed ? Math.round(latestResult.uploadSpeed) : Math.round(bandwidthData.avgSpeed * 0.1)} Mbps</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Connected Devices</p>
                      <p className="text-xl font-bold text-white">{bandwidthData.connectedDevices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Active Sharing</p>
                      <Badge variant="outline" className="text-green-400 border-green-400/50">
                        {latestResult ? 'Active' : 'Setup Required'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Bandwidth Utilization</span>
                      <span className="text-white">{Math.round((bandwidthData.sharedBandwidth / bandwidthData.totalBandwidth) * 100)}%</span>
                    </div>
                    <Progress value={(bandwidthData.sharedBandwidth / bandwidthData.totalBandwidth) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Usage */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Real-time Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgb(31, 41, 55)', 
                          border: '1px solid rgb(75, 85, 99)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area type="monotone" dataKey="personal" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="shared" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="available" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Summary */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-gray-300">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-400">${bandwidthData.totalEarnings}</p>
                    <p className="text-xs text-gray-400">Projected yearly</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-gray-300">Per GB Rate</p>
                    <p className="text-2xl font-bold text-blue-400">$0.020</p>
                    <p className="text-xs text-gray-400">Market rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-gray-300">This Week</p>
                    <p className="text-2xl font-bold text-purple-400">${Math.round(bandwidthData.monthlyEarnings * 0.25)}</p>
                    <p className="text-xs text-gray-400">Week earnings</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <p className="text-sm text-gray-300">Projected</p>
                    <p className="text-2xl font-bold text-orange-400">${Math.round(bandwidthData.monthlyEarnings * 1.08)}</p>
                    <p className="text-xs text-gray-400">Next month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {/* AI Optimization Tips */}
            <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI-Powered Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimizationTips.length > 0 ? (
                  <ul className="space-y-3">
                    {optimizationTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    Run a speed test to get personalized AI optimization recommendations
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Optimal Sharing Schedule */}
            <Card className="bg-gradient-to-br from-blue-900/10 to-green-900/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  AI-Recommended Sharing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-green-700 mb-2">Peak Earning Hours</h4>
                    <ul className="space-y-1">
                      {sharingSchedule.peakHours.map((hour, index) => (
                        <li key={index} className="text-green-600 text-sm">{hour}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-medium text-blue-700 mb-2">Recommended Uptime</h4>
                    <p className="text-2xl font-bold text-blue-600">{sharingSchedule.recommendedUptime}h</p>
                    <p className="text-blue-600 text-sm">per day for optimal earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bandwidth" className="space-y-6">
            {/* Bandwidth Performance */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-tiptop-purple" />
                  Bandwidth Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgb(31, 41, 55)', 
                        border: '1px solid rgb(75, 85, 99)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings ($)" />
                    <Line type="monotone" dataKey="data" stroke="#8b5cf6" strokeWidth={2} name="Data Shared (TB)" />
                    <Line type="monotone" dataKey="devices" stroke="#06b6d4" strokeWidth={2} name="Connected Devices" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Network Performance */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Network Performance {testHistory.length > 0 ? '(Real Data)' : '(Demo)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgb(31, 41, 55)', 
                        border: '1px solid rgb(75, 85, 99)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="speed" fill="#06b6d4" name="Speed (Mbps)" />
                    <Bar dataKey="latency" fill="#8b5cf6" name="Latency (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Distribution */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Router className="h-5 w-5 text-orange-500" />
                    Connected Device Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deviceTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgb(31, 41, 55)', 
                          border: '1px solid rgb(75, 85, 99)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Management */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-400" />
                    Device Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div>
                        <p className="text-white text-sm font-medium">iPhone 14 Pro</p>
                        <p className="text-gray-300 text-xs">192.168.1.45</p>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400/50">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div>
                        <p className="text-white text-sm font-medium">MacBook Pro</p>
                        <p className="text-gray-300 text-xs">192.168.1.22</p>
                      </div>
                      <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                        Sharing
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div>
                        <p className="text-white text-sm font-medium">Smart TV</p>
                        <p className="text-gray-300 text-xs">192.168.1.18</p>
                      </div>
                      <Badge variant="outline" className="text-gray-400 border-gray-400/50">
                        Idle
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Manage All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Status */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security & Privacy Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Network Security</p>
                    <p className="text-lg font-bold text-green-400">Secure</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Data Encryption</p>
                    <p className="text-lg font-bold text-blue-400">AES-256</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Privacy Level</p>
                    <p className="text-lg font-bold text-purple-400">High</p>
                  </div>
                </div>
                
                <Separator className="bg-gray-600" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Firewall Protection</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">VPN Tunneling</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Data Anonymization</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Traffic Monitoring</span>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                      24/7
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 text-sm font-medium">Data Sharing Policy</span>
                  </div>
                  <p className="text-xs text-gray-300">Only anonymous bandwidth is shared. No personal data or browsing history is ever transmitted.</p>
                </div>
                
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">Bandwidth Limits</span>
                  </div>
                  <p className="text-xs text-gray-300">You maintain full control over how much bandwidth to share and when.</p>
                </div>
                
                <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-400 text-sm font-medium">Network Isolation</span>
                  </div>
                  <p className="text-xs text-gray-300">Shared bandwidth operates in an isolated environment separate from your personal network.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default InternetDashboard;
