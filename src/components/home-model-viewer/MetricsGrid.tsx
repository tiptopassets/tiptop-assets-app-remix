
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface MetricsGridProps {
  analysisResults: PropertyAnalysis;
}

const MetricsGrid = ({ analysisResults }: MetricsGridProps) => {
  const renderConfidenceBadge = (score: number | null | undefined) => {
    if (!score) return null;
    
    let badgeClass = '';
    let label = '';
    
    if (score >= 80) {
      badgeClass = 'bg-green-500/20 text-green-300 border-green-500/30';
      label = 'High Confidence';
    } else if (score >= 60) {
      badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      label = 'Medium Confidence';
    } else {
      badgeClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      label = 'Low Confidence';
    }
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs ${badgeClass}`}>
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white">
          <p>Confidence score: {score}%</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {analysisResults.rooftop && (
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-400">Roof Area</p>
            {renderConfidenceBadge(analysisResults.rooftop.confidenceScore)}
          </div>
          <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area} sq ft</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.rooftop.revenue}/mo</p>
            {analysisResults.rooftop.solarPotential && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    Solar Ready
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white">
                  <p>Estimated solar capacity: {analysisResults.rooftop.solarCapacity} kW</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {analysisResults.rooftop.methodology && (
            <div className="mt-1 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <InfoCircledIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">Measurement Method</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white max-w-xs">
                    <p className="text-xs">{analysisResults.rooftop.methodology}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      
      {analysisResults.garden && (
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-400">Garden Area</p>
            {renderConfidenceBadge(analysisResults.garden.confidenceScore)}
          </div>
          <p className="text-lg font-semibold text-white">{analysisResults.garden.area} sq ft</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.garden.revenue}/mo</p>
            <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              {analysisResults.garden.opportunity}
            </Badge>
          </div>
          
          {analysisResults.garden.methodology && (
            <div className="mt-1 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <InfoCircledIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">Measurement Method</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white max-w-xs">
                    <p className="text-xs">{analysisResults.garden.methodology}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      
      {analysisResults.parking && (
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-400">Parking</p>
            {renderConfidenceBadge(analysisResults.parking.confidenceScore)}
          </div>
          <p className="text-lg font-semibold text-white">{analysisResults.parking.spaces} spaces</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.parking.revenue}/mo</p>
            {analysisResults.parking.evChargerPotential && (
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                EV Ready
              </Badge>
            )}
          </div>
          
          {analysisResults.parking.dimensions && (analysisResults.parking.dimensions.length || analysisResults.parking.dimensions.width) && (
            <div className="mt-1 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <InfoCircledIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">Dimensions</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white">
                    <p className="text-xs">
                      {analysisResults.parking.dimensions.length || '?'} × {analysisResults.parking.dimensions.width || '?'} ft
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      
      {analysisResults.pool && analysisResults.pool.present && (
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-400">Pool</p>
            {renderConfidenceBadge(analysisResults.pool.confidenceScore)}
          </div>
          <p className="text-lg font-semibold text-white">{analysisResults.pool.area} sq ft</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.pool.revenue}/mo</p>
            <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {analysisResults.pool.type}
            </Badge>
          </div>
          
          {analysisResults.pool.dimensions && (analysisResults.pool.dimensions.length || analysisResults.pool.dimensions.width) && (
            <div className="mt-1 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <InfoCircledIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">Dimensions</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white">
                    <p className="text-xs">
                      {analysisResults.pool.dimensions.length || '?'} × {analysisResults.pool.dimensions.width || '?'} ft
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
      
      {analysisResults.overallReliability && (
        <div className="col-span-2 md:col-span-4 mt-2">
          <div className="flex items-center justify-center">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                analysisResults.overallReliability >= 80 ? 'bg-green-500/10 text-green-300' : 
                analysisResults.overallReliability >= 60 ? 'bg-blue-500/10 text-blue-300' : 
                'bg-yellow-500/10 text-yellow-300'
              }`}
            >
              Overall measurement reliability: {analysisResults.overallReliability}%
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsGrid;
