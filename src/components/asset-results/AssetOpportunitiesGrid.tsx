
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
    <>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg text-center md:text-left"
      >
        Available Asset Opportunities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </>
  );
};

export default AssetOpportunitiesGrid;
