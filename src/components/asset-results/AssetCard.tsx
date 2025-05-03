
import { motion } from "framer-motion";
import { Check, Plus } from 'lucide-react';

// Define types for props
export interface AssetCardProps {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  iconComponent: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  glowColor: string;
}

// Map for background colors based on icon type
export const cardColorMap = {
  "parking": "from-indigo-500/80 to-purple-600/70",
  "solar": "from-yellow-500/80 to-amber-600/70",
  "garden": "from-green-500/80 to-emerald-600/70",
  "storage": "from-amber-500/80 to-orange-600/70",
  "wifi": "from-purple-500/80 to-violet-600/70",
  "pool": "from-blue-500/80 to-sky-600/70",
  "car": "from-indigo-500/80 to-blue-600/70",
  "evcharger": "from-violet-500/80 to-purple-600/70"
};

// Map for glow colors
export const glowColorMap = {
  "parking": "rgba(147, 51, 234, 0.5)",
  "solar": "rgba(250, 204, 21, 0.5)",
  "garden": "rgba(74, 222, 128, 0.5)",
  "storage": "rgba(245, 158, 11, 0.5)",
  "wifi": "rgba(155, 135, 245, 0.5)",
  "pool": "rgba(14, 165, 233, 0.5)",
  "car": "rgba(99, 102, 241, 0.5)",
  "evcharger": "rgba(167, 139, 250, 0.5)"
};

const AssetCard = ({ 
  title, 
  icon, 
  monthlyRevenue, 
  description, 
  iconComponent,
  isSelected, 
  onClick, 
  glowColor 
}: AssetCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`asset-card glow-effect cursor-pointer relative ${isSelected ? 'ring-2 ring-white/70' : ''}`}
      style={{
        background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.8')}, ${glowColor.replace('0.5', '0.6')})`,
        boxShadow: isSelected ? `0 5px 25px ${glowColor.replace('0.5', '0.7')}` : `0 5px 20px ${glowColor}`
      }}
      onClick={onClick}
    >
      {/* Selection indicator with text below */}
      <div className="absolute top-3 right-3 flex flex-col items-center">
        <div className={`transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-white/30 border border-white/50'} rounded-full p-1.5 shadow-lg z-20`}>
          {isSelected ? (
            <Check className="h-4 w-4 text-tiptop-purple" />
          ) : (
            <Plus className="h-4 w-4 text-white" />
          )}
        </div>
        
        {/* Banner that says "Click to select" when not selected - now below the + sign */}
        {!isSelected && (
          <div className="text-xs text-white font-medium mt-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            Click to select
          </div>
        )}
      </div>
      
      {iconComponent}
      <div>
        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>
        <p className="text-2xl font-bold text-white">
          ${monthlyRevenue}/month
        </p>
        <p className="text-gray-100">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none rounded-lg"></div>
      
      {/* Enhanced glossy effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
    </motion.div>
  );
};

export default AssetCard;
