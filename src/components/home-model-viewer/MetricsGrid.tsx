
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MetricsGridProps {
  analysisResults: PropertyAnalysis;
}

const MetricsGrid = ({ analysisResults }: MetricsGridProps) => {
  const usesRealSolarData = analysisResults.rooftop.usingRealSolarData;
  
  // Get solar revenue from analysis (now more accurate)
  const solarRevenue = analysisResults.rooftop.revenue || 0;
  
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {analysisResults.rooftop && (
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400">Roof Area</p>
              {usesRealSolarData ? (
                <CheckCircle size={12} className="text-green-400" />
              ) : (
                <AlertCircle size={12} className="text-yellow-400" />
              )}
            </div>
            <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area.toLocaleString()} sq ft</p>
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
              {!usesRealSolarData && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-400 flex items-center cursor-help">
                      <Info size={12} className="mr-1" /> Estimated values
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      {usesRealSolarData 
                        ? 'These values are from Google Solar API with real satellite data analysis.'
                        : 'These are estimated values. For more accurate solar estimates, we recommend a professional assessment.'
                      }
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
            <p className="text-lg font-semibold text-white">{analysisResults.garden.area.toLocaleString()} sq ft</p>
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
                    Estimated based on property type: {analysisResults.propertyType}. 
                    Rate: ${analysisResults.parking.rate}/day based on local market data.
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
          </div>
        )}
        
        {analysisResults.pool && analysisResults.pool.present && (
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Pool</p>
            <p className="text-lg font-semibold text-white">{analysisResults.pool.area.toLocaleString()} sq ft</p>
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
            <p className="text-lg font-semibold text-white">{analysisResults.bandwidth.available} Mbps</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-tiptop-purple">${analysisResults.bandwidth.revenue}/mo</p>
              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                Passive Income
              </Badge>
            </div>
          </div>
        )}
      </div>
      
      {/* Data Accuracy Indicator */}
      <div className="mb-4 p-3 bg-black/20 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          {usesRealSolarData ? (
            <CheckCircle size={16} className="text-green-400" />
          ) : (
            <AlertCircle size={16} className="text-yellow-400" />
          )}
          <span className="text-sm font-medium text-white">
            Analysis Accuracy: {usesRealSolarData ? 'High' : 'Estimated'}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {usesRealSolarData 
            ? 'This analysis uses real satellite data from Google Solar API for accurate roof measurements and solar calculations.'
            : 'This analysis uses estimated values. For more accurate results, we recommend manual verification of property features.'
          }
        </p>
      </div>
    </TooltipProvider>
  );
};

export default MetricsGrid;
