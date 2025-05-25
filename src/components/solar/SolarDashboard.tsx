
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sun, DollarSign, Zap, Leaf, Calculator, TrendingUp, Home, Calendar } from 'lucide-react';
import { AnalysisResults } from '@/types/analysis';

interface SolarDashboardProps {
  analysisResults: AnalysisResults;
  address?: string;
}

const SolarDashboard: React.FC<SolarDashboardProps> = ({ analysisResults, address }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  
  const solarData = analysisResults.rooftop;
  const isRealData = solarData.usingRealSolarData;
  
  // Calculate different timeframes
  const monthlyProduction = Math.round((solarData.yearlyEnergyKWh || 0) / 12);
  const yearlyProduction = solarData.yearlyEnergyKWh || 0;
  const lifetimeProduction = Math.round(yearlyProduction * 25); // 25-year system life
  
  const monthlyRevenue = solarData.revenue || 0;
  const yearlyRevenue = monthlyRevenue * 12;
  const lifetimeRevenue = yearlyRevenue * 25;
  
  const co2SavedYearly = Math.round(yearlyProduction * 0.4); // kg CO2 per kWh
  const co2SavedLifetime = co2SavedYearly * 25;

  // Default sun hours if not available
  const defaultSunHours = 2500;

  const getProductionValue = () => {
    switch (selectedTimeframe) {
      case 'monthly': return monthlyProduction;
      case 'yearly': return yearlyProduction;
      case 'lifetime': return lifetimeProduction;
    }
  };

  const getRevenueValue = () => {
    switch (selectedTimeframe) {
      case 'monthly': return monthlyRevenue;
      case 'yearly': return yearlyRevenue;
      case 'lifetime': return lifetimeRevenue;
    }
  };

  const getCO2Value = () => {
    switch (selectedTimeframe) {
      case 'monthly': return Math.round(co2SavedYearly / 12);
      case 'yearly': return co2SavedYearly;
      case 'lifetime': return co2SavedLifetime;
    }
  };

  if (!solarData.solarPotential) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sun className="h-5 w-5 text-yellow-500" />
            Solar Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">No solar potential detected for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <Sun className="h-6 w-6 text-yellow-500" />
                Solar Potential Analysis
              </CardTitle>
              <CardDescription className="text-white/70">
                {address && `for ${address}`}
              </CardDescription>
            </div>
            <Badge variant={isRealData ? "default" : "secondary"} className="bg-tiptop-purple/80">
              {isRealData ? "Real Data" : "Estimated"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex gap-2 justify-center">
        {(['monthly', 'yearly', 'lifetime'] as const).map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
            className={selectedTimeframe === timeframe ? "bg-tiptop-purple" : ""}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-white/70">Roof Area</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {solarData.area.toLocaleString()} sq ft
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-white/70">System Size</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {solarData.solarCapacity} kW
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-white/70">Panels</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {solarData.panelsCount || Math.round(solarData.solarCapacity / 0.4)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <span className="text-sm text-white/70">Sun Hours/Year</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {defaultSunHours}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production & Savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-medium text-white">Energy Production</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {getProductionValue().toLocaleString()} kWh
            </div>
            <div className="text-sm text-white/60">
              {selectedTimeframe === 'monthly' ? 'per month' : 
               selectedTimeframe === 'yearly' ? 'per year' : 'over 25 years'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="text-lg font-medium text-white">Savings</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${getRevenueValue().toLocaleString()}
            </div>
            <div className="text-sm text-white/60">
              {selectedTimeframe === 'monthly' ? 'per month' : 
               selectedTimeframe === 'yearly' ? 'per year' : 'over 25 years'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-6 w-6 text-green-400" />
              <span className="text-lg font-medium text-white">CO₂ Saved</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {getCO2Value().toLocaleString()} kg
            </div>
            <div className="text-sm text-white/60">
              {selectedTimeframe === 'monthly' ? 'per month' : 
               selectedTimeframe === 'yearly' ? 'per year' : 'over 25 years'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Analysis */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="h-5 w-5 text-tiptop-purple" />
            Return on Investment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-white/70">Setup Cost</span>
              <div className="text-xl font-bold text-white">
                ${(solarData.setupCost || 15000).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-sm text-white/70">Payback Period</span>
              <div className="text-xl font-bold text-white">
                {Math.round((solarData.setupCost || 15000) / yearlyRevenue)} years
              </div>
            </div>
            <div>
              <span className="text-sm text-white/70">25-Year ROI</span>
              <div className="text-xl font-bold text-green-400">
                {Math.round(((lifetimeRevenue - (solarData.setupCost || 15000)) / (solarData.setupCost || 15000)) * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <TrendingUp className="h-4 w-4" />
            <span>
              {isRealData 
                ? "Calculations based on Google Solar API data and satellite imagery analysis."
                : "Estimates based on location, roof size, and regional solar irradiance data. For precise calculations, consider a professional solar assessment."
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SolarDashboard;
