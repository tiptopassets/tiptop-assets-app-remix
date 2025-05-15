
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PropertyAnalysis } from '@/types/analysis';

interface MetricsGridProps {
  analysisResults: PropertyAnalysis;
}

const MetricsGrid = ({ analysisResults }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {analysisResults.rooftop && (
        <div className="bg-white/5 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Roof Area</p>
          <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area} sq ft</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.rooftop.revenue}/mo</p>
            {analysisResults.rooftop.solarPotential && (
              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                Solar Ready
              </Badge>
            )}
          </div>
        </div>
      )}
      {analysisResults.garden && (
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
          <p className="text-lg font-semibold text-white">{analysisResults.parking.spaces} spaces</p>
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
          <p className="text-lg font-semibold text-white">{analysisResults.pool.area} sq ft</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-tiptop-purple">${analysisResults.pool.revenue}/mo</p>
            <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {analysisResults.pool.type}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsGrid;
