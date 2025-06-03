
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

// Color schemes for different asset types
const colorSchemes: Record<string, { bg: string; accent: string; text: string; buttonBg: string; iconBg: string }> = {
  "solar-panel": {
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    accent: "text-amber-100",
    text: "text-white",
    buttonBg: "bg-amber-600/80",
    iconBg: "bg-amber-600/30"
  },
  "parking": {
    bg: "bg-gradient-to-br from-purple-500 to-violet-600",
    accent: "text-purple-100",
    text: "text-white",
    buttonBg: "bg-purple-700/80",
    iconBg: "bg-purple-600/30"
  },
  "storage": {
    bg: "bg-gradient-to-br from-orange-400 to-amber-500",
    accent: "text-orange-100",
    text: "text-white",
    buttonBg: "bg-orange-600/80",
    iconBg: "bg-orange-600/30"
  },
  "wifi": {
    bg: "bg-gradient-to-br from-blue-500 to-purple-600",
    accent: "text-blue-100",
    text: "text-white",
    buttonBg: "bg-blue-700/80",
    iconBg: "bg-blue-600/30"
  },
  "garden": {
    bg: "bg-gradient-to-br from-green-400 to-emerald-500",
    accent: "text-green-100",
    text: "text-white",
    buttonBg: "bg-green-600/80",
    iconBg: "bg-green-600/30"
  },
  "swimming-pool": {
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
    accent: "text-cyan-100",
    text: "text-white",
    buttonBg: "bg-cyan-600/80",
    iconBg: "bg-cyan-600/30"
  },
  "car": {
    bg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    accent: "text-indigo-100",
    text: "text-white",
    buttonBg: "bg-indigo-700/80",
    iconBg: "bg-indigo-600/30"
  },
  "ev-charger": {
    bg: "bg-gradient-to-br from-teal-400 to-green-500",
    accent: "text-teal-100",
    text: "text-white",
    buttonBg: "bg-teal-600/80",
    iconBg: "bg-teal-600/30"
  }
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
  const colorScheme = colorSchemes[icon] || colorSchemes["storage"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative w-full cursor-pointer"
      onClick={onClick}
    >
      <Card
        className={`h-full border-0 overflow-hidden ${colorScheme.bg} shadow-xl relative transition-all duration-300 ${
          isSelected ? 'ring-4 ring-white/50' : ''
        }`}
        style={{
          boxShadow: isSelected 
            ? `0 20px 40px ${glowColor}, 0 0 20px ${glowColor}`
            : `0 10px 25px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)`
        }}
      >
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/10 to-transparent opacity-60"></div>
        
        <CardContent className="p-6 relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            {/* Icon */}
            <div className={`p-3 rounded-xl ${colorScheme.iconBg} backdrop-blur-sm border border-white/20`}>
              <div className="w-8 h-8 text-white">
                {iconComponent}
              </div>
            </div>
            
            {/* Action Button */}
            <div className={`p-2 rounded-full ${colorScheme.buttonBg} backdrop-blur-sm border border-white/20`}>
              {isSelected ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Plus className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className={`font-bold text-xl mb-2 ${colorScheme.text}`}>
              {title}
            </h3>
            
            <div className="mb-3">
              <p className={`text-3xl font-bold ${colorScheme.text}`}>
                ${monthlyRevenue}/month
              </p>
              {setupCost > 0 && (
                <p className={`text-sm ${colorScheme.accent} opacity-90`}>
                  Setup: ${setupCost} • ROI: {roi || Math.ceil(setupCost / monthlyRevenue)} months
                </p>
              )}
            </div>
            
            <p className={`text-sm ${colorScheme.accent} leading-relaxed mb-4`}>
              {description}
            </p>
            
            {provider && (
              <div className={`inline-block px-3 py-1 rounded-full ${colorScheme.buttonBg} backdrop-blur-sm border border-white/20`}>
                <span className={`text-xs font-medium ${colorScheme.text}`}>
                  via {provider}
                </span>
              </div>
            )}
          </div>
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className={`mt-4 p-3 rounded-xl ${colorScheme.buttonBg} backdrop-blur-sm border border-white/20`}>
              <p className={`text-sm font-medium ${colorScheme.text} text-center`}>
                ✓ Selected for Analysis
              </p>
            </div>
          )}
          
          {!isSelected && (
            <div className={`mt-4 p-3 rounded-xl ${colorScheme.buttonBg} backdrop-blur-sm border border-white/20 opacity-80 hover:opacity-100 transition-opacity`}>
              <p className={`text-sm font-medium ${colorScheme.text} text-center`}>
                Click to select
              </p>
            </div>
          )}
        </CardContent>
        
        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent rounded-b-xl pointer-events-none"></div>
      </Card>
    </motion.div>
  );
};

export default AssetCard;
