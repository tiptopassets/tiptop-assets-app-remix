
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import PropertyTypeDetector from '@/components/property-analysis/PropertyTypeDetector';
import { Badge } from '@/components/ui/badge';

interface PropertySummaryCardProps {
  analysisResults: AnalysisResults;
  totalMonthlyIncome: number;
  totalSetupCost?: number;
  selectedAssetsCount: number;
  isCollapsed: boolean;
}

const PropertySummaryCard: React.FC<PropertySummaryCardProps> = ({
  analysisResults,
  totalMonthlyIncome,
  totalSetupCost = 0,
  selectedAssetsCount,
  isCollapsed: initialCollapsed
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const { address } = useGoogleMap();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8"
    >
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center mb-2">
              <CheckCircle className="text-green-500 h-6 w-6 mr-2" />
              Property Analysis Complete
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Analysis for {address}
            </p>
            
            {/* Property Type Section */}
            <div className="mb-4">
              <PropertyTypeDetector 
                propertyType={analysisResults.propertyType} 
                confidence={0.85}
              />
            </div>

            {/* Analysis Summary Section - Always visible */}
            {analysisResults.imageAnalysisSummary && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-sm font-medium text-tiptop-purple mb-2">Analysis Summary:</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {analysisResults.imageAnalysisSummary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Selected Assets</p>
                <p className="text-xl font-semibold text-white">{selectedAssetsCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-xl font-semibold text-tiptop-purple">${totalMonthlyIncome}</p>
              </div>
              {totalSetupCost > 0 && (
                <div>
                  <p className="text-sm text-gray-400">Setup Cost</p>
                  <p className="text-xl font-semibold text-yellow-400">${totalSetupCost}</p>
                </div>
              )}
              {totalMonthlyIncome > 0 && totalSetupCost > 0 && (
                <div>
                  <p className="text-sm text-gray-400">ROI</p>
                  <p className="text-xl font-semibold text-green-400">
                    {totalMonthlyIncome > 0 ? Math.ceil(totalSetupCost / totalMonthlyIncome) : 0} months
                  </p>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-white hover:bg-white/10"
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </Button>
        </div>

        {/* Detailed Analysis - Only shown when expanded */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-4 border-t border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysisResults.rooftop && (
                <div className="bg-white/5 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs text-gray-400">Roof Area</h4>
                    {analysisResults.rooftop.solarPotential && (
                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                        Solar Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-white font-semibold">{analysisResults.rooftop.area} sq ft</p>
                  <p className="text-xs text-tiptop-purple">${analysisResults.rooftop.revenue}/mo</p>
                </div>
              )}
              {analysisResults.parking && (
                <div className="bg-white/5 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs text-gray-400">Parking</h4>
                    {analysisResults.parking.evChargerPotential && (
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                        EV Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-white font-semibold">{analysisResults.parking.spaces} spaces</p>
                  <p className="text-xs text-tiptop-purple">${analysisResults.parking.revenue}/mo</p>
                  {analysisResults.parking.rate && (
                    <p className="text-xs text-gray-400">${analysisResults.parking.rate}/day rate</p>
                  )}
                </div>
              )}
              {analysisResults.garden && (
                <div className="bg-white/5 p-3 rounded">
                  <h4 className="text-xs text-gray-400">Garden</h4>
                  <p className="text-white font-semibold">{analysisResults.garden.area} sq ft</p>
                  <p className="text-xs text-tiptop-purple">${analysisResults.garden.revenue}/mo</p>
                </div>
              )}
              {analysisResults.pool && analysisResults.pool.present && (
                <div className="bg-white/5 p-3 rounded">
                  <h4 className="text-xs text-gray-400">Pool</h4>
                  <p className="text-white font-semibold">{analysisResults.pool.area} sq ft</p>
                  <p className="text-xs text-tiptop-purple">${analysisResults.pool.revenue}/mo</p>
                </div>
              )}
              {/* Internet Sharing Card */}
              {analysisResults.bandwidth && analysisResults.bandwidth.revenue > 0 && (
                <div className="bg-white/5 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs text-gray-400">Internet Sharing</h4>
                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Passive Income
                    </Badge>
                  </div>
                  <p className="text-white font-semibold">{analysisResults.bandwidth.available} GB</p>
                  <p className="text-xs text-tiptop-purple">${analysisResults.bandwidth.revenue}/mo</p>
                </div>
              )}
            </div>

            {analysisResults.restrictions && (
              <div className="mt-4 bg-yellow-900/20 p-3 rounded text-sm">
                <h4 className="text-yellow-200 text-xs font-medium">Important Considerations:</h4>
                <p className="text-gray-300 text-xs">{analysisResults.restrictions}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertySummaryCard;
