
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
    <div className="w-full">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
          Available Asset Opportunities
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-white/90 mb-6 drop-shadow-lg">
            Select the assets you want to monetize. Each card shows potential monthly revenue and setup requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>High Revenue</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Low Setup Cost</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Passive Income</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {opportunities.map((opportunity, index) => {
          const iconType = opportunity.icon as keyof typeof iconMap;
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          const isSelected = selectedAssets.includes(opportunity.title);
          
          return (
            <motion.div
              key={opportunity.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <AssetCard
                title={opportunity.title}
                icon={opportunity.icon}
                monthlyRevenue={opportunity.monthlyRevenue}
                description={opportunity.description}
                provider={opportunity.provider}
                setupCost={opportunity.setupCost}
                roi={opportunity.roi}
                iconComponent={iconMap[iconType]}
                isSelected={isSelected}
                onClick={() => onAssetToggle(opportunity.title)}
                glowColor={glowColor}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Selection Summary */}
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-6 bg-tiptop-purple/20 backdrop-blur-sm rounded-2xl border border-tiptop-purple/30"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''} Selected
            </h3>
            <p className="text-tiptop-purple/90">
              Ready to analyze your selected opportunities and connect with service providers
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetOpportunitiesGrid;
