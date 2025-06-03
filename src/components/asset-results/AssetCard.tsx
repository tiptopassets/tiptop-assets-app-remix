
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
        className={`h-full transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br ${gradientClasses} rounded-2xl shadow-lg hover:shadow-xl relative`}
      >
        {/* Glow effect when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 blur-xl opacity-30 z-0"
            style={{ background: glowColor }}
          />
        )}
        
        <CardContent className="p-6 relative z-10 h-full flex flex-col">
          {/* Header with icon and select button */}
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              {iconComponent}
            </div>
            
            {/* Select/Selected button */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected 
                ? 'bg-white/30 text-white border border-white/40' 
                : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white border border-white/20'
            }`}>
              {isSelected ? (
                <>
                  <Check className="h-4 w-4" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Click to select
                </>
              )}
            </div>
          </div>
          
          {/* Title and Revenue */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white">${monthlyRevenue}/month</p>
          </div>
          
          {/* Description */}
          <p className="text-white/90 text-sm leading-relaxed flex-grow">{description}</p>
          
          {/* Provider info if available */}
          {provider && (
            <div className="mt-3">
              <div className="inline-block bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">
                {provider}
              </div>
            </div>
          )}
          
          {/* Setup cost and ROI info if available */}
          {setupCost > 0 && (
            <div className="mt-3 flex justify-between items-center text-xs text-white/80">
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
