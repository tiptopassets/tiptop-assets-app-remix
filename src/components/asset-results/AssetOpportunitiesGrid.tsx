
import { motion } from "framer-motion";
import AssetCard from './AssetCard';
import iconMap from './IconMap';
import { glowColorMap } from './AssetCard';
import { AssetOpportunity } from '@/contexts/GoogleMapContext';

interface AssetOpportunitiesGridProps {
  opportunities: AssetOpportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
}

const AssetOpportunitiesGrid = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle 
}: AssetOpportunitiesGridProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 asset-opportunities-grid">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8 drop-shadow-lg text-center"
      >
        Available Asset Opportunities
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-6">
        {opportunities.map((opportunity, index) => {
          const iconType = opportunity.icon as keyof typeof iconMap;
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          const isSelected = selectedAssets.includes(opportunity.title);
          
          return (
            <motion.div
              key={opportunity.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="w-full"
            >
              <AssetCard
                title={opportunity.title}
                icon={opportunity.icon}
                monthlyRevenue={opportunity.monthlyRevenue}
                description={opportunity.description}
                iconComponent={iconMap[iconType]}
                isSelected={isSelected}
                onClick={() => onAssetToggle(opportunity.title)}
                glowColor={glowColor}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetOpportunitiesGrid;
