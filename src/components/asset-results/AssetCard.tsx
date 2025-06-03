
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative w-full"
      style={{ cursor: "pointer" }}
    >
      <Card
        className={`h-full transition-all duration-300 overflow-hidden border-2 ${
          isSelected ? "border-tiptop-purple bg-black/50" : "border-white/10 bg-black/20"
        }`}
        onClick={onClick}
      >
        {/* Add glow effect when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 blur-xl opacity-20 z-0"
            style={{ background: glowColor }}
          />
        )}
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-tiptop-purple rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
        
        <CardContent className="p-4 relative z-10">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="mt-1 p-2 rounded-full bg-white/5 border border-white/10 flex-shrink-0">
              {iconComponent}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white">{title}</h3>
              
              {/* Provider info if available */}
              {provider && (
                <div className="inline-block bg-tiptop-purple/30 text-tiptop-purple text-xs rounded px-2 py-0.5 mb-1">
                  {provider}
                </div>
              )}
              
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{description}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-tiptop-purple">${monthlyRevenue}/mo</p>
                  
                  {/* Setup cost info if available */}
                  {setupCost > 0 && (
                    <p className="text-xs text-gray-400">
                      Setup: <span className="text-yellow-400">${setupCost}</span>
                      {roi && <span> • ROI: {roi} mo</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssetCard;
