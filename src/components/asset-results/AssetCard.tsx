import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { getAssetIcon } from "@/utils/assetIconMapper";

export const glowColorMap: Record<string, string> = {
  parking: "rgba(155, 135, 245, 0.5)",
  solar: "rgba(255, 215, 0, 0.5)",
  garden: "rgba(74, 222, 128, 0.5)",
  storage: "rgba(245, 158, 11, 0.5)",
  wifi: "rgba(155, 135, 245, 0.5)",
  pool: "rgba(14, 165, 233, 0.5)",
  car: "rgba(99, 102, 241, 0.5)",
  evcharger: "rgba(167, 139, 250, 0.5)",
  airbnb: "rgba(255, 91, 91, 0.5)",
  house: "rgba(255, 91, 91, 0.5)",
  rental: "rgba(255, 91, 91, 0.5)"
};

interface AssetCardProps {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  iconComponent?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  glowColor?: string;
  showFormFields?: boolean;
  formFields?: Array<{
    type: "text" | "number" | "select";
    name: string;
    label: string;
    value: string | number;
    options?: string[];
  }>;
}

const AssetCard = ({ 
  title, 
  monthlyRevenue, 
  description, 
  iconComponent,
  isSelected = false, 
  onClick,
  glowColor = "rgba(155, 135, 245, 0.5)",
  showFormFields = false,
  formFields = []
}: AssetCardProps) => {
  // Use the iconComponent if provided, otherwise get it from the asset title
  const displayIcon = iconComponent || getAssetIcon(title);
  
  return (
    <motion.div
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu
        ${isSelected 
          ? 'bg-gradient-to-br from-tiptop-purple/30 to-tiptop-purple/10 border-2 border-tiptop-purple scale-105 shadow-2xl' 
          : 'glass-effect hover:scale-105 hover:shadow-xl'
        }
        backdrop-blur-sm border border-white/10
      `}
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: isSelected 
          ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}30`
          : undefined
      }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center mb-4 h-16">
        {displayIcon}
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-2xl font-bold text-green-400">
            ${monthlyRevenue}
          </span>
          <span className="text-gray-400">/month</span>
        </div>

        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {/* Form Fields Preview */}
        {showFormFields && formFields.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">Configuration:</p>
            {formFields.slice(0, 2).map((field, index) => (
              <div key={index} className="text-xs text-gray-300">
                <span className="text-gray-400">{field.label}:</span> {field.value}
              </div>
            ))}
            {formFields.length > 2 && (
              <p className="text-xs text-gray-500">+{formFields.length - 2} more</p>
            )}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 bg-tiptop-purple rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className="w-3 h-3 bg-white rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default AssetCard;
