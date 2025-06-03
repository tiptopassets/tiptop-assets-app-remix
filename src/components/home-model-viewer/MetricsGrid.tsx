
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MetricsGridProps {
  analysisResults: PropertyAnalysis;
}

const MetricsGrid = ({ analysisResults }: MetricsGridProps) => {
  const usesRealSolarData = analysisResults.rooftop.usingRealSolarData;
  
  // Estimated solar revenue based on roof size if we don't have real data
  const getSolarRevenueEstimate = () => {
    if (usesRealSolarData) {
      return analysisResults.rooftop.revenue;
    }
    
    // Simple estimation based on roof area: 
    // Average solar production is around 15W per sq ft, at $0.15/kWh
    const roofArea = analysisResults.rooftop.area || 0;
    const usableRoofPercent = 0.7; // Assume 70% of roof can be used for solar
    const wattsPerSqFt = 15;
    const kwhPerMonth = (roofArea * usableRoofPercent * wattsPerSqFt * 4 * 0.8) / 1000;
    const ratePerKwh = 0.15;
    
    return Math.round(kwhPerMonth * ratePerKwh);
  };

  const solarRevenue = getSolarRevenueEstimate();
  
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {analysisResults.rooftop && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Roof Area</p>
            <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area} sq ft</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${solarRevenue}/mo</p>
              {analysisResults.rooftop.solarPotential && (
                <Badge variant="outline" className={`text-xs ${usesRealSolarData ? 'bg-green-500/30 text-green-300 border-green-500/50' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                  Solar Ready
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center">
              {usesRealSolarData && analysisResults.rooftop.panelsCount && (
                <p className="text-xs text-gray-400">
                  {analysisResults.rooftop.panelsCount} panels | {analysisResults.rooftop.solarCapacity} kW
                </p>
              )}
              {!usesRealSolarData && analysisResults.rooftop.area > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-400 flex items-center cursor-help">
                      <Info size={12} className="mr-1" /> Estimated values
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      These are estimated values since we couldn't access the Google Solar API.
                      For more accurate solar estimates, try adding your property later.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}
        
        {analysisResults.garden && analysisResults.garden.area > 0 && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Garden Area</p>
            <p className="text-lg font-semibold text-white">{analysisResults.garden.area} sq ft</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${analysisResults.garden.revenue}/mo</p>
              <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {analysisResults.garden.opportunity}
              </Badge>
            </div>
          </div>
        )}
        
        {analysisResults.parking && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Parking</p>
            <div className="flex items-center">
              <p className="text-lg font-semibold text-white">{analysisResults.parking.spaces} spaces</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="ml-2 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Rate: ${analysisResults.parking.rate || 10}/day (market-based) × 20 days/month
                    <br />
                    Property type: {analysisResults.propertyType}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${analysisResults.parking.revenue}/mo</p>
              {analysisResults.parking.evChargerPotential && (
                <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                  EV Ready
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ${analysisResults.parking.rate || 10}/day rate
            </div>
          </div>
        )}
        
        {analysisResults.pool && analysisResults.pool.present && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Pool</p>
            <p className="text-lg font-semibold text-white">{analysisResults.pool.area} sq ft</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${analysisResults.pool.revenue}/mo</p>
              <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {analysisResults.pool.type}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Bandwidth/Internet Sharing */}
        {analysisResults.bandwidth && analysisResults.bandwidth.revenue > 0 && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Internet Sharing</p>
            <p className="text-lg font-semibold text-white">{analysisResults.bandwidth.available} GB</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${analysisResults.bandwidth.revenue}/mo</p>
              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                Passive Income
              </Badge>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MetricsGrid;
