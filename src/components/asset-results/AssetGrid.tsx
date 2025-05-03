
import { motion } from "framer-motion";
import AssetCard, { glowColorMap } from './AssetCard';
import iconMap from './IconMap';
import { Opportunity } from '@/types/analysis';

interface AssetGridProps {
  opportunities: Opportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
}

const AssetGrid = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle 
}: AssetGridProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center md:text-left"
      >
        Available Asset Opportunities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opportunity) => {
          const iconType = opportunity.icon as keyof typeof iconMap;
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          const isSelected = selectedAssets.includes(opportunity.title);
          
          return (
            <AssetCard
              key={opportunity.title}
              title={opportunity.title}
              icon={opportunity.icon}
              monthlyRevenue={opportunity.monthlyRevenue}
              description={opportunity.description}
              iconComponent={iconMap[iconType]}
              isSelected={isSelected}
              onClick={() => onAssetToggle(opportunity.title)}
              glowColor={glowColor}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default AssetGrid;
