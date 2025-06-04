
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, DollarSign, Zap, TrendingUp } from "lucide-react";

interface PropertySummaryCardProps {
  analysisResults: any;
  totalMonthlyIncome: number;
  totalSetupCost: number;
  selectedAssetsCount: number;
  isCollapsed: boolean;
}

const PropertySummaryCard: React.FC<PropertySummaryCardProps> = ({
  analysisResults,
  totalMonthlyIncome,
  totalSetupCost,
  selectedAssetsCount,
  isCollapsed
}) => {
  if (isCollapsed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8"
    >
      <Card className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Property Analysis Complete
              </h1>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-tiptop-purple" />
                <span className="text-sm sm:text-base break-all sm:break-normal">
                  {analysisResults?.address || "Property Address"}
                </span>
              </div>
            </div>
            
            {/* Main revenue display */}
            <div className="text-center sm:text-right">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-tiptop-purple">
                ${totalMonthlyIncome}
              </div>
              <div className="text-sm sm:text-base text-gray-300">monthly potential</div>
            </div>
          </div>

          {/* Metrics Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Asset Opportunities */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {analysisResults?.topOpportunities?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Asset Types</div>
            </div>

            {/* Selected Assets */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {selectedAssetsCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Selected</div>
            </div>

            {/* Setup Investment */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                ${totalSetupCost}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Setup Cost</div>
            </div>

            {/* ROI Timeline */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {totalSetupCost > 0 && totalMonthlyIncome > 0 
                  ? Math.ceil(totalSetupCost / totalMonthlyIncome)
                  : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Months ROI</div>
            </div>
          </div>

          {/* Description - Responsive text */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
              We've analyzed your property and identified {analysisResults?.topOpportunities?.length || 0} potential 
              revenue streams. Select the opportunities that interest you to get started with monetizing your assets.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertySummaryCard;
