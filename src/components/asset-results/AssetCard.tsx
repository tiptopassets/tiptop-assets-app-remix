
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";

export const glowColorMap: Record<string, string> = {
  "solar-panel": "rgba(155, 240, 155, 0.5)",
  "parking": "rgba(200, 200, 255, 0.5)",
  "storage": "rgba(255, 200, 155, 0.5)",
  "wifi": "rgba(155, 200, 255, 0.5)",
  "car": "rgba(200, 175, 255, 0.5)",
  "garden": "rgba(155, 255, 155, 0.5)",
  "swimming-pool": "rgba(100, 200, 255, 0.5)",
  "ev-charger": "rgba(100, 230, 200, 0.5)",
  "house": "rgba(255, 155, 155, 0.5)",
};

// Define background gradients for each asset type
const backgroundGradientMap: Record<string, string> = {
  "solar-panel": "from-yellow-400 via-orange-400 to-yellow-500",
  "parking": "from-purple-500 via-purple-600 to-purple-700",
  "storage": "from-orange-400 via-amber-500 to-orange-600",
  "wifi": "from-purple-400 via-indigo-500 to-purple-600",
  "car": "from-blue-500 via-indigo-600 to-purple-700",
  "garden": "from-green-400 via-emerald-500 to-green-600",
  "swimming-pool": "from-blue-400 via-cyan-500 to-blue-600",
  "ev-charger": "from-teal-400 via-cyan-500 to-teal-600",
  "house": "from-red-400 via-rose-500 to-red-600",
};

interface AssetCardProps {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  provider?: string;
  setupCost?: number;
  roi?: number;
  iconComponent: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  glowColor: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  title,
  icon,
  monthlyRevenue,
  description,
  provider,
  setupCost = 0,
  roi,
  iconComponent,
  isSelected,
  onClick,
  glowColor
}) => {
  const iconType = icon as keyof typeof backgroundGradientMap;
  const gradientClasses = backgroundGradientMap[iconType] || "from-gray-500 via-gray-600 to-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative w-full cursor-pointer"
      onClick={onClick}
    >
      <Card
        className={`h-full min-h-[280px] sm:min-h-[320px] md:min-h-[300px] lg:min-h-[320px] transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br ${gradientClasses} rounded-2xl shadow-lg hover:shadow-xl relative`}
      >
        {/* Glow effect when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 blur-xl opacity-30 z-0"
            style={{ background: glowColor }}
          />
        )}
        
        <CardContent className="p-4 sm:p-5 md:p-6 relative z-10 h-full flex flex-col">
          {/* Header with icon and select button */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                {iconComponent}
              </div>
            </div>
            
            {/* Select/Selected button - responsive */}
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              isSelected 
                ? 'bg-white/30 text-white border border-white/40' 
                : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white border border-white/20'
            }`}>
              {isSelected ? (
                <>
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Selected</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Click to select</span>
                  <span className="sm:hidden">Select</span>
                </>
              )}
            </div>
          </div>
          
          {/* Title and Revenue - responsive text sizing */}
          <div className="mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
            <p className="text-xl sm:text-2xl font-bold text-white">${monthlyRevenue}/month</p>
          </div>
          
          {/* Description - responsive with line clamping */}
          <p className="text-white/90 text-sm leading-relaxed flex-grow line-clamp-3 sm:line-clamp-4">{description}</p>
          
          {/* Provider info if available */}
          {provider && (
            <div className="mt-3">
              <div className="inline-block bg-white/20 text-white text-xs rounded-full px-2 sm:px-3 py-1 font-medium">
                {provider}
              </div>
            </div>
          )}
          
          {/* Setup cost and ROI info if available - responsive layout */}
          {setupCost > 0 && (
            <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs text-white/80">
              <span>Setup: <span className="text-white font-medium">${setupCost}</span></span>
              {roi && <span>ROI: <span className="text-white font-medium">{roi} mo</span></span>}
            </div>
          )}
        </CardContent>
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default AssetCard;
