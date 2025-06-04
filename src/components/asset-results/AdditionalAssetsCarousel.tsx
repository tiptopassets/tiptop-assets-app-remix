
import EnhancedAdditionalAssetsCarousel from "./EnhancedAdditionalAssetsCarousel";
import { AdditionalOpportunity } from "@/types/analysis";

interface AdditionalAssetsCarouselProps {
  opportunities: AdditionalOpportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
  opportunitiesByTier?: {
    high: AdditionalOpportunity[];
    medium: AdditionalOpportunity[];
    low: AdditionalOpportunity[];
  };
  opportunitiesByCategory?: {
    spaceRentals: AdditionalOpportunity[];
    petServices: AdditionalOpportunity[];
    logistics: AdditionalOpportunity[];
    community: AdditionalOpportunity[];
    tech: AdditionalOpportunity[];
  };
}

const AdditionalAssetsCarousel = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle,
  opportunitiesByTier,
  opportunitiesByCategory
}: AdditionalAssetsCarouselProps) => {
  // Always use enhanced component when we have the required data
  if (opportunitiesByTier && opportunitiesByCategory) {
    return (
      <EnhancedAdditionalAssetsCarousel
        opportunities={opportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={onAssetToggle}
        opportunitiesByTier={opportunitiesByTier}
        opportunitiesByCategory={opportunitiesByCategory}
      />
    );
  }

  // Fallback for backwards compatibility
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Additional Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => {
            const isSelected = selectedAssets.includes(opportunity.title);
            const IconComponent = opportunity.icon;
            
            return (
              <div
                key={opportunity.title}
                className={`asset-card cursor-pointer transition-all duration-300 ${
                  isSelected ? 'border-tiptop-purple bg-tiptop-purple/10' : ''
                }`}
                onClick={() => onAssetToggle(opportunity.title)}
              >
                <div className="glass-icon">
                  <IconComponent size={24} className="text-tiptop-purple" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{opportunity.title}</h3>
                  <p className="text-gray-300 text-sm">${opportunity.monthlyRevenue}/month</p>
                  <p className="text-gray-400 text-xs">{opportunity.provider}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdditionalAssetsCarousel;
