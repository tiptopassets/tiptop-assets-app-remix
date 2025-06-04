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
  // If tier and category data is provided, use enhanced component
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

  // Fallback to original carousel for backwards compatibility
  return null; // This will be replaced by the enhanced version in practice
};

export default AdditionalAssetsCarousel;
