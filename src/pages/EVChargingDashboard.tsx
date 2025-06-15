
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BatteryCharging, Zap, DollarSign, TrendingUp, Car, MapPin, Clock, Settings, Activity, Users, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EVChargingDashboard = () => {
  // Mock data for EV charging station
  const chargingData = {
    stationCapacity: 22, // kW
    monthlyUsage: 850, // kWh
    monthlyRevenue: 127,
    totalRevenue: 1820,
    activeConnections: 2,
    totalSessions: 94,
    avgSessionTime: 4.2, // hours
    utilizationRate: 68, // %
    energyRate: 0.15 // $/kWh
  };

  // Usage data for charts
  const usageData = [
    { time: '00:00', power: 0, sessions: 0, revenue: 0 },
    { time: '04:00', power: 0, sessions: 0, revenue: 0 },
    { time: '08:00', power: 15, sessions: 2, revenue: 2.25 },
    { time: '12:00', power: 22, sessions: 1, revenue: 3.30 },
    { time: '16:00', power: 18, sessions: 3, revenue: 2.70 },
    { time: '20:00', power: 11, sessions: 1, revenue: 1.65 },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 98, sessions: 65, energy: 650 },
    { month: 'Feb', revenue: 105, sessions: 72, energy: 720 },
    { month: 'Mar', revenue: 118, sessions: 79, energy: 790 },
    { month: 'Apr', revenue: 122, sessions: 84, energy: 840 },
    { month: 'May', revenue: 135, sessions: 89, energy: 890 },
    { month: 'Jun', revenue: 127, sessions: 94, energy: 850 },
  ];

  const customerTypeData = [
    { name: 'Commuters', value: 45, color: '#8b5cf6' },
    { name: 'Residents', value: 30, color: '#06b6d4' },
    { name: 'Visitors', value: 15, color: '#10b981' },
    { name: 'Fleet', value: 10, color: '#f59e0b' },
  ];

  const peakHoursData = [
    { hour: '6AM', usage: 5, efficiency: 85 },
    { hour: '9AM', usage: 18, efficiency: 92 },
    { hour: '12PM', usage: 25, efficiency: 88 },
    { hour: '3PM', usage: 22, efficiency: 90 },
    { hour: '6PM', usage: 35, efficiency: 95 },
    { hour: '9PM', usage: 15, efficiency: 88 },
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
            <div className="p-2 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-lg">
              <BatteryCharging className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EV Charging Station</h1>
              <p className="text-white/70">Monitor your electric vehicle charging business</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Activity className="h-4 w-4 mr-2" />
              Live Status
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Station Capacity</p>
                  <p className="text-2xl font-bold text-white">{chargingData.stationCapacity} kW</p>
                  <p className="text-xs text-green-400">Level 2 Charging</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">${chargingData.monthlyRevenue}</p>
                  <p className="text-xs text-green-400">+12% vs last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Charging Sessions</p>
                  <p className="text-2xl font-bold text-white">{chargingData.totalSessions}</p>
                  <p className="text-xs text-blue-400">This month</p>
                </div>
                <Car className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Utilization Rate</p>
                  <p className="text-2xl font-bold text-white">{chargingData.utilizationRate}%</p>
                  <p className="text-xs text-purple-400">Excellent</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-tiptop-purple">Overview</TabsTrigger>
            <TabsTrigger value="usage" className="text-white data-[state=active]:bg-tiptop-purple">Usage Analytics</TabsTrigger>
            <TabsTrigger value="customers" className="text-white data-[state=active]:bg-tiptop-purple">Customers</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-white data-[state=active]:bg-tiptop-purple">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Station Status */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BatteryCharging className="h-5 w-5 text-green-500" />
                    Station Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70">Active Connections</p>
                      <p className="text-xl font-bold text-white">{chargingData.activeConnections}/2</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Energy Rate</p>
                      <p className="text-xl font-bold text-white">${chargingData.energyRate}/kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Avg Session</p>
                      <p className="text-xl font-bold text-white">{chargingData.avgSessionTime}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Station Health</p>
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        Excellent
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Current Utilization</span>
                      <span className="text-white">{chargingData.utilizationRate}%</span>
                    </div>
                    <Progress value={chargingData.utilizationRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Today's Activity */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Today's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={usageData}>
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
                        dataKey="power" 
                        stroke="#10b981" 
                        fill="url(#evGradient)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  Financial Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-white/70">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">${chargingData.totalRevenue}</p>
                    <p className="text-xs text-white/60">All time</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-white/70">Per Session Avg</p>
                    <p className="text-2xl font-bold text-blue-400">${Math.round(chargingData.monthlyRevenue / chargingData.totalSessions)}</p>
                    <p className="text-xs text-white/60">Average revenue</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-white/70">Energy Delivered</p>
                    <p className="text-2xl font-bold text-purple-400">{chargingData.monthlyUsage}</p>
                    <p className="text-xs text-white/60">kWh this month</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm text-white/70">ROI Progress</p>
                    <p className="text-2xl font-bold text-orange-400">28%</p>
                    <p className="text-xs text-white/60">5.2 years payback</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {/* Monthly Trends */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-tiptop-purple" />
                  6-Month Usage Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
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
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" />
                    <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} name="Sessions" />
                    <Line type="monotone" dataKey="energy" stroke="#06b6d4" strokeWidth={2} name="Energy (kWh)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Peak Hours Analysis */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Peak Hours Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="usage" fill="#8b5cf6" name="Usage %" />
                    <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Types */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Customer Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={customerTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {customerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Insights */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Customer Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Regular Customers</span>
                      <span className="text-white font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Avg Session Duration</span>
                      <span className="text-white font-semibold">{chargingData.avgSessionTime} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Peak Usage Time</span>
                      <span className="text-white font-semibold">6-9 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Customer Satisfaction</span>
                      <span className="text-white font-semibold">4.8/5.0</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-green-400 border-green-400/30">
                      High Repeat Usage
                    </Badge>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                      Growing Customer Base
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                      Excellent Reviews
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
                      <Settings className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">Next Inspection</span>
                    </div>
                    <p className="text-sm text-white/70">Quarterly safety check</p>
                    <p className="text-sm text-blue-400 font-medium">Jan 15, 2025</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium">Cable Inspection</span>
                    </div>
                    <p className="text-sm text-white/70">Check for wear and tear</p>
                    <p className="text-sm text-yellow-400 font-medium">Due in 3 weeks</p>
                  </div>
                </div>
                
                <Separator className="bg-white/20" />
                
                <div>
                  <h4 className="text-white font-medium mb-3">Maintenance History</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Station cleaning</span>
                      <span className="text-white">Nov 28, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Software update</span>
                      <span className="text-white">Nov 15, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Safety inspection</span>
                      <span className="text-white">Oct 12, 2024</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  System Health & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">System Operating Normally</span>
                  </div>
                  <p className="text-xs text-white/70">All charging ports are functional and operating within normal parameters.</p>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 text-sm font-medium">High Usage Period</span>
                  </div>
                  <p className="text-xs text-white/70">Evening peak hours approaching - expect increased demand between 6-9 PM.</p>
                </div>
                
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-medium">Maintenance Due Soon</span>
                  </div>
                  <p className="text-xs text-white/70">Cable inspection scheduled for next month. No immediate action required.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default EVChargingDashboard;
