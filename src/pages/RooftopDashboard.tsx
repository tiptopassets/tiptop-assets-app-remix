
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Sun, Zap, DollarSign, TrendingUp, Calendar, Settings, Activity, Leaf, MapPin, Clock, Database, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useDashboardJourneyData } from "@/hooks/useDashboardJourneyData";
import { useMemo } from "react";

const RooftopDashboard = () => {
  const { journeyData, loading, error } = useDashboardJourneyData();
  
  // Extract solar data from journey data
  const solarData = useMemo(() => {
    if (!journeyData?.analysisResults?.rooftop) {
      return null;
    }
    
    const rooftop = journeyData.analysisResults.rooftop;
    
    // Check if property has solar potential
    if (!rooftop.solarPotential) {
      return null;
    }
    
    return {
      totalCapacity: rooftop.solarCapacity || 0,
      panelCount: rooftop.panelsCount || Math.round((rooftop.solarCapacity || 0) / ((rooftop.panelCapacityWatts || 400) / 1000)),
      roofArea: rooftop.area || 0,
      efficiency: 92, // Standard efficiency
      monthlyProduction: Math.round((rooftop.yearlyEnergyKWh || 0) / 12),
      yearlyProduction: rooftop.yearlyEnergyKWh || 0,
      monthlyRevenue: rooftop.revenue || 0,
      yearlyRevenue: (rooftop.revenue || 0) * 12,
      totalSavings: (rooftop.revenue || 0) * 12 * 2, // 2 years of savings
      co2SavedYearly: Math.round((rooftop.yearlyEnergyKWh || 0) * ((rooftop.carbonOffsetFactorKgPerMwh || 400) / 1000)),
      setupCost: rooftop.setupCost || 15000,
      maxSunshineHours: rooftop.maxSunshineHoursPerYear || 0,
      panelLifetimeYears: rooftop.panelLifetimeYears || 25,
      panelCapacityWatts: rooftop.panelCapacityWatts || 400,
      panelHeightMeters: rooftop.panelHeightMeters || 2.0,
      panelWidthMeters: rooftop.panelWidthMeters || 1.0,
      usingRealData: rooftop.usingRealSolarData || false,
      imageryDate: rooftop.imageryDate,
      roofSegments: rooftop.roofSegments || [],
      panelConfigurations: rooftop.panelConfigurations || []
    };
  }, [journeyData]);

  // Generate performance data based on real solar data
  const performanceData = useMemo(() => {
    if (!solarData) return [];
    
    const baseMonthly = solarData.monthlyProduction;
    const baseRevenue = solarData.monthlyRevenue;
    
    return [
      { month: 'Jan', production: Math.round(baseMonthly * 0.78), revenue: Math.round(baseRevenue * 0.78), savings: Math.round(baseRevenue * 0.82) },
      { month: 'Feb', production: Math.round(baseMonthly * 0.89), revenue: Math.round(baseRevenue * 0.89), savings: Math.round(baseRevenue * 0.94) },
      { month: 'Mar', production: Math.round(baseMonthly * 1.07), revenue: Math.round(baseRevenue * 1.07), savings: Math.round(baseRevenue * 1.13) },
      { month: 'Apr', production: Math.round(baseMonthly * 1.16), revenue: Math.round(baseRevenue * 1.16), savings: Math.round(baseRevenue * 1.22) },
      { month: 'May', production: Math.round(baseMonthly * 1.26), revenue: Math.round(baseRevenue * 1.26), savings: Math.round(baseRevenue * 1.33) },
      { month: 'Jun', production: Math.round(baseMonthly * 1.29), revenue: Math.round(baseRevenue * 1.29), savings: Math.round(baseRevenue * 1.36) },
    ];
  }, [solarData]);

  const dailyProductionData = useMemo(() => {
    if (!solarData) return [];
    
    const peakProduction = solarData.totalCapacity * 0.85; // 85% of capacity at peak
    
    return [
      { time: '6:00', production: peakProduction * 0.03 },
      { time: '8:00', production: peakProduction * 0.25 },
      { time: '10:00', production: peakProduction * 0.58 },
      { time: '12:00', production: peakProduction * 0.95 },
      { time: '14:00', production: peakProduction * 1.0 },
      { time: '16:00', production: peakProduction * 0.82 },
      { time: '18:00', production: peakProduction * 0.29 },
      { time: '20:00', production: peakProduction * 0.01 },
    ];
  }, [solarData]);

  const weatherImpactData = [
    { day: 'Mon', actual: 42, predicted: 45, weather: 'Sunny' },
    { day: 'Tue', actual: 38, predicted: 44, weather: 'Partly Cloudy' },
    { day: 'Wed', actual: 28, predicted: 43, weather: 'Cloudy' },
    { day: 'Thu', actual: 45, predicted: 46, weather: 'Sunny' },
    { day: 'Fri', actual: 41, predicted: 44, weather: 'Sunny' },
    { day: 'Sat', actual: 33, predicted: 42, weather: 'Rainy' },
    { day: 'Sun', actual: 39, predicted: 43, weather: 'Partly Cloudy' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading solar data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="bg-white border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Solar Data</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!journeyData) {
    return (
      <DashboardLayout>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <Sun className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Property Analysis Found</h3>
            <p className="text-gray-600">Please complete a property analysis first to view solar data.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!solarData) {
    return (
      <DashboardLayout>
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 text-center">
            <Sun className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Solar Potential</h3>
            <p className="text-gray-600">This property does not have solar potential or solar data is not available.</p>
            {journeyData.propertyAddress && (
              <p className="text-sm text-gray-500 mt-2">Property: {journeyData.propertyAddress}</p>
            )}
          </CardContent>
        </Card>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg">
              <Sun className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Solar Rooftop System</h1>
              <p className="text-gray-600">Real solar analysis for {journeyData.propertyAddress}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={solarData.usingRealData ? "default" : "secondary"} className="bg-tiptop-purple/80">
              <Database className="h-3 w-3 mr-1" />
              {solarData.usingRealData ? "Real API Data" : "Estimated Data"}
            </Badge>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{solarData.totalCapacity.toFixed(1)} kW</p>
                  <p className="text-xs text-green-600">Efficiency: {solarData.efficiency}%</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Production</p>
                  <p className="text-2xl font-bold text-gray-900">{solarData.monthlyProduction.toLocaleString()} kWh</p>
                  <p className="text-xs text-green-600">Annual: {solarData.yearlyProduction.toLocaleString()} kWh</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-gray-900">${solarData.monthlyRevenue}</p>
                  <p className="text-xs text-green-600">Annual: ${solarData.yearlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CO₂ Saved Yearly</p>
                  <p className="text-2xl font-bold text-gray-900">{solarData.co2SavedYearly.toLocaleString()} kg</p>
                  <p className="text-xs text-green-600">Lifetime: {(solarData.co2SavedYearly * solarData.panelLifetimeYears).toLocaleString()} kg</p>
                </div>
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border-gray-200">
            <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Performance</TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-gray-700 data-[state=active]:bg-tiptop-purple data-[state=active]:text-white">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-300">Panel Count</p>
                      <p className="text-xl font-bold text-white">{solarData.panelCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Roof Coverage</p>
                      <p className="text-xl font-bold text-white">{solarData.roofArea.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Max Sun Hours/Year</p>
                      <p className="text-sm text-white">{solarData.maxSunshineHours.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">System Life</p>
                      <p className="text-sm text-white">{solarData.panelLifetimeYears} years</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Current Efficiency</span>
                      <span className="text-white">{solarData.efficiency}%</span>
                    </div>
                    <Progress value={solarData.efficiency} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Today's Production */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Daily Production Pattern
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
                          backgroundColor: 'rgb(31, 41, 55)', 
                          border: '1px solid rgb(75, 85, 99)',
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
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Financial Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-gray-300">Setup Cost</p>
                    <p className="text-2xl font-bold text-green-400">${solarData.setupCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Initial investment</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-gray-300">Payback Period</p>
                    <p className="text-2xl font-bold text-blue-400">{Math.round(solarData.setupCost / solarData.yearlyRevenue)} years</p>
                    <p className="text-xs text-gray-400">Break-even time</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-gray-300">25-Year Savings</p>
                    <p className="text-2xl font-bold text-purple-400">${(solarData.yearlyRevenue * 25 - solarData.setupCost).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Net lifetime savings</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <p className="text-sm text-gray-300">ROI</p>
                    <p className="text-2xl font-bold text-orange-400">{Math.round(((solarData.yearlyRevenue * 25 - solarData.setupCost) / solarData.setupCost) * 100)}%</p>
                    <p className="text-xs text-gray-400">25-year return</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Monthly Performance Chart */}
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-tiptop-purple" />
                  6-Month Performance Projection
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
                        backgroundColor: 'rgb(31, 41, 55)', 
                        border: '1px solid rgb(75, 85, 99)',
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
            <Card className="bg-gray-800 border-gray-600">
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
                        backgroundColor: 'rgb(31, 41, 55)', 
                        border: '1px solid rgb(75, 85, 99)',
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
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">CO₂ Avoided Yearly</span>
                      <span className="text-white font-semibold">{solarData.co2SavedYearly.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Trees Equivalent Yearly</span>
                      <span className="text-white font-semibold">{Math.round(solarData.co2SavedYearly / 22)} trees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Cars Off Road (yearly)</span>
                      <span className="text-white font-semibold">{Math.round(solarData.co2SavedYearly / 4600)} cars</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-gray-300">Environmental Score</p>
                    <p className="text-3xl font-bold text-green-400">A+</p>
                    <p className="text-xs text-gray-400">Excellent impact</p>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Panel Power</span>
                      <span className="text-white font-semibold">{solarData.panelCapacityWatts}W each</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Panel Size</span>
                      <span className="text-white font-semibold">{solarData.panelHeightMeters}m × {solarData.panelWidthMeters}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Panels</span>
                      <span className="text-white font-semibold">{solarData.panelCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">System Warranty</span>
                      <span className="text-white font-semibold">{solarData.panelLifetimeYears} years</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  {solarData.imageryDate && (
                    <div className="text-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <p className="text-sm text-gray-300">Satellite Imagery Date</p>
                      <p className="text-white font-semibold">{solarData.imageryDate.month}/{solarData.imageryDate.year}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            {/* Roof Segments Analysis */}
            {solarData.roofSegments && solarData.roofSegments.length > 0 && (
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-tiptop-purple" />
                    Roof Segment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solarData.roofSegments.slice(0, 4).map((segment, index) => (
                      <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Segment {index + 1}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Area:</span>
                            <span className="text-white">{Math.round(segment.areaMeters2 * 10.764)} sq ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Pitch:</span>
                            <span className="text-white">{Math.round(segment.pitchDegrees)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Azimuth:</span>
                            <span className="text-white">{Math.round(segment.azimuthDegrees)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Sun Hours:</span>
                            <span className="text-white">{Math.round(segment.sunshineHours)}/year</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Panel Configurations */}
            {solarData.panelConfigurations && solarData.panelConfigurations.length > 0 && (
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    Optimal Panel Configurations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {solarData.panelConfigurations.map((config, index) => (
                    <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-medium">Configuration {index + 1}</h4>
                        <Badge variant="outline" className="text-gray-300 border-gray-500">
                          {config.panelsCount} panels
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Annual Production</p>
                          <p className="text-white font-semibold">{config.yearlyEnergyDcKwh.toLocaleString()} kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Roof Segments Used</p>
                          <p className="text-white font-semibold">{config.roofSegmentSummaries.length}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Data Source Info */}
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {solarData.usingRealData 
                      ? "All calculations based on Google Solar API data with satellite imagery analysis and detailed roof segment modeling."
                      : "Estimates based on location, roof size, and regional solar irradiance data. For precise calculations, consider a professional solar assessment."
                    }
                  </span>
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
