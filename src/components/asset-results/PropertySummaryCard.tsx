
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

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
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false); // Start open by default

  if (isCollapsed) {
    return null;
  }

  // Calculate confidence level based on available data
  const confidenceLevel = analysisResults?.confidence || 85;
  
  // Determine property type
  const propertyType = analysisResults?.propertyType || "commercial";

  const toggleDetails = () => {
    setIsDetailsCollapsed(!isDetailsCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8"
    >
      <Card className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header with collapse button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Property Analysis Complete
                </h1>
                <p className="text-gray-300 text-sm">
                  {analysisResults?.address || "Property Address"}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleDetails}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label={isDetailsCollapsed ? "Expand details" : "Collapse details"}
            >
              {isDetailsCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Property Type Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {propertyType}
            </div>
            <span className="text-gray-400 text-sm">{confidenceLevel}% confidence</span>
          </div>

          {/* Analysis Summary */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-tiptop-purple text-lg font-semibold mb-2">Analysis Summary:</h3>
            <p className="text-gray-300 leading-relaxed">
              {analysisResults?.summary || 
                "The property has a large flat roof suitable for solar panels, parking spaces available, and additional monetizable assets."}
            </p>
          </div>

          {/* Selected Assets and Monthly Revenue */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-gray-400 text-sm font-medium mb-2">Selected Assets</h4>
              <div className="text-4xl font-bold text-white">{selectedAssetsCount}</div>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm font-medium mb-2">Monthly Potential Revenue</h4>
              <div className="text-4xl font-bold text-tiptop-purple">${totalMonthlyIncome}</div>
            </div>
          </div>

          {/* Collapsible Detailed Analysis */}
          <AnimatePresence>
            {!isDetailsCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {/* Detailed Analysis */}
                <div className="mb-6">
                  <h3 className="text-white text-xl font-bold mb-4">Detailed Analysis</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Roof Area */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Roof Area</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Solar Ready
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysisResults?.rooftop?.area || 12000} sq ft
                      </div>
                      <div className="text-tiptop-purple text-sm">
                        ${analysisResults?.rooftop?.revenue || 500}/mo
                      </div>
                    </div>

                    {/* Parking */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Parking</span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          EV Ready
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysisResults?.parking?.spaces || 15} spaces
                      </div>
                      <div className="text-tiptop-purple text-sm">
                        ${analysisResults?.parking?.revenue || 1000}/mo
                      </div>
                      <div className="text-gray-400 text-xs">
                        ${analysisResults?.parking?.dailyRate || 50}/day rate
                      </div>
                    </div>

                    {/* Garden */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Garden</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysisResults?.garden?.area || 1500} sq ft
                      </div>
                      <div className="text-tiptop-purple text-sm">
                        ${analysisResults?.garden?.revenue || 200}/mo
                      </div>
                    </div>

                    {/* Internet Sharing */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Internet Sharing</span>
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Passive Income
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysisResults?.bandwidth?.capacity || 100} GB
                      </div>
                      <div className="text-tiptop-purple text-sm">
                        ${analysisResults?.bandwidth?.revenue || 50}/mo
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Considerations */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Important Considerations:</h4>
                  <p className="text-gray-300 text-sm">
                    {analysisResults?.considerations || 
                      "Zoning laws may limit certain types of usage; check local regulations."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertySummaryCard;
