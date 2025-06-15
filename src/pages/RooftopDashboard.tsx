
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Sun, Zap, DollarSign, TrendingUp, Calendar, Settings, Activity, Leaf, MapPin, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const RooftopDashboard = () => {
  // Mock data for solar system
  const solarSystemData = {
    totalCapacity: 8.5, // kW
    panelCount: 24,
    roofArea: 1200, // sq ft
    efficiency: 92,
    monthlyProduction: 1250, // kWh
    monthlyRevenue: 187,
    totalSavings: 4250,
    co2Saved: 890, // kg
    installDate: "2023-08-15",
    nextMaintenance: "2024-12-01"
  };

  // Performance data for charts
  const performanceData = [
    { month: 'Jan', production: 980, revenue: 147, savings: 156 },
    { month: 'Feb', production: 1120, revenue: 168, savings: 178 },
    { month: 'Mar', production: 1340, revenue: 201, savings: 213 },
    { month: 'Apr', production: 1450, revenue: 218, savings: 231 },
    { month: 'May', production: 1580, revenue: 237, savings: 251 },
    { month: 'Jun', production: 1620, revenue: 243, savings: 258 },
  ];

  const dailyProductionData = [
    { time: '6:00', production: 0.2 },
    { time: '8:00', production: 1.8 },
    { time: '10:00', production: 4.2 },
    { time: '12:00', production: 6.8 },
    { time: '14:00', production: 7.2 },
    { time: '16:00', production: 5.9 },
    { time: '18:00', production: 2.1 },
    { time: '20:00', production: 0.1 },
  ];

  const weatherImpactData = [
    { day: 'Mon', actual: 42, predicted: 45, weather: 'Sunny' },
    { day: 'Tue', actual: 38, predicted: 44, weather: 'Partly Cloudy' },
    { day: 'Wed', actual: 28, predicted: 43, weather: 'Cloudy' },
    { day: 'Thu', actual: 45, predicted: 46, weather: 'Sunny' },
    { day: 'Fri', actual: 41, predicted: 44, weather: 'Sunny' },
    { day: 'Sat', actual: 33, predicted: 42, weather: 'Rainy' },
    { day: 'Sun', actual: 39, predicted: 43, weather: 'Partly Cloudy' },
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
            <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg">
              <Sun className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Solar Rooftop System</h1>
              <p className="text-white/70">Monitor your solar energy production and savings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Activity className="h-4 w-4 mr-2" />
              Live Monitor
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">System Capacity</p>
                  <p className="text-2xl font-bold text-white">{solarSystemData.totalCapacity} kW</p>
                  <p className="text-xs text-green-400">Efficiency: {solarSystemData.efficiency}%</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Monthly Production</p>
                  <p className="text-2xl font-bold text-white">{solarSystemData.monthlyProduction} kWh</p>
                  <p className="text-xs text-green-400">+12% vs last month</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">${solarSystemData.monthlyRevenue}</p>
                  <p className="text-xs text-green-400">Est. savings</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-white">{solarSystemData.co2Saved} kg</p>
                  <p className="text-xs text-green-400">This month</p>
                </div>
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-tiptop-purple">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-tiptop-purple">Performance</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-tiptop-purple">Analytics</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-white data-[state=active]:bg-tiptop-purple">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70">Panel Count</p>
                      <p className="text-xl font-bold text-white">{solarSystemData.panelCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Roof Coverage</p>
                      <p className="text-xl font-bold text-white">{solarSystemData.roofArea} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Install Date</p>
                      <p className="text-sm text-white">{new Date(solarSystemData.installDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">System Age</p>
                      <p className="text-sm text-white">16 months</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Current Efficiency</span>
                      <span className="text-white">{solarSystemData.efficiency}%</span>
                    </div>
                    <Progress value={solarSystemData.efficiency} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Today's Production */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Today's Production
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dailyProductionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="production" 
                        stroke="#fbbf24" 
                        fill="url(#solarGradient)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-white/70">Total Savings</p>
                    <p className="text-2xl font-bold text-green-400">${solarSystemData.totalSavings}</p>
                    <p className="text-xs text-white/60">Since installation</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-white/70">Monthly Avg</p>
                    <p className="text-2xl font-bold text-blue-400">${Math.round(solarSystemData.totalSavings / 16)}</p>
                    <p className="text-xs text-white/60">Per month</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-white/70">ROI Progress</p>
                    <p className="text-2xl font-bold text-purple-400">34%</p>
                    <p className="text-xs text-white/60">6.2 years to payback</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm text-white/70">Energy Value</p>
                    <p className="text-2xl font-bold text-orange-400">$0.15</p>
                    <p className="text-xs text-white/60">Per kWh saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Monthly Performance Chart */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-tiptop-purple" />
                  6-Month Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line type="monotone" dataKey="production" stroke="#fbbf24" strokeWidth={2} name="Production (kWh)" />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" />
                    <Line type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={2} name="Savings ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weather Impact Analysis */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Weather Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weatherImpactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="predicted" fill="#6b7280" name="Predicted" />
                    <Bar dataKey="actual" fill="#fbbf24" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Environmental Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">CO₂ Avoided</span>
                      <span className="text-white font-semibold">{solarSystemData.co2Saved * 16} kg total</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Trees Equivalent</span>
                      <span className="text-white font-semibold">{Math.round((solarSystemData.co2Saved * 16) / 22)} trees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Miles Not Driven</span>
                      <span className="text-white font-semibold">{Math.round((solarSystemData.co2Saved * 16) * 2.4)} miles</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-white/70">Environmental Score</p>
                    <p className="text-3xl font-bold text-green-400">A+</p>
                    <p className="text-xs text-white/60">Excellent impact</p>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">Panel Performance</span>
                        <span className="text-green-400">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">Inverter Efficiency</span>
                        <span className="text-green-400">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">System Cleanliness</span>
                        <span className="text-yellow-400">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-green-400 border-green-400/30">
                      All Systems Operational
                    </Badge>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                      Cleaning Recommended
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            {/* Maintenance Schedule */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-tiptop-purple" />
                  Maintenance Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">Next Inspection</span>
                    </div>
                    <p className="text-sm text-white/70">Professional system check</p>
                    <p className="text-sm text-blue-400 font-medium">{new Date(solarSystemData.nextMaintenance).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium">Panel Cleaning</span>
                    </div>
                    <p className="text-sm text-white/70">Recommended cleaning</p>
                    <p className="text-sm text-yellow-400 font-medium">Due in 2 weeks</p>
                  </div>
                </div>
                
                <Separator className="bg-white/20" />
                
                <div>
                  <h4 className="text-white font-medium mb-3">Maintenance History</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Panel cleaning</span>
                      <span className="text-white">Aug 15, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">System inspection</span>
                      <span className="text-white">Jun 10, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Inverter check</span>
                      <span className="text-white">Mar 22, 2024</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Alerts */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Performance Alerts & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-medium">Panel Cleaning Needed</span>
                  </div>
                  <p className="text-xs text-white/70">Production efficiency has dropped to 85%. Schedule cleaning to restore optimal performance.</p>
                </div>
                
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">Excellent Performance</span>
                  </div>
                  <p className="text-xs text-white/70">System is performing above expected levels for this time of year.</p>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 text-sm font-medium">Weather Forecast</span>
                  </div>
                  <p className="text-xs text-white/70">Sunny weather expected next week - anticipate 15% increase in production.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default RooftopDashboard;
