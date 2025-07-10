
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface SelectedAssetsCarouselProps {
  propertyData: PropertyAnalysisData | null;
  onAssetSelect: (assetName: string) => void;
  isLoading?: boolean;
}

const SelectedAssetsCarousel: React.FC<SelectedAssetsCarouselProps> = ({
  propertyData,
  onAssetSelect,
  isLoading = false
}) => {
  if (!propertyData || !propertyData.selectedAssets || propertyData.selectedAssets.length === 0) {
    return null;
  }

  const handleAssetClick = (assetType: string) => {
    if (isLoading) return;
    
    const asset = propertyData.availableAssets.find(a => a.type === assetType);
    if (asset) {
      onAssetSelect(`Set up my ${asset.name.toLowerCase()}`);
    }
  };

  return (
    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-gray-600 whitespace-nowrap font-medium">Selected assets:</span>
        <div className="flex gap-2 min-w-0">
          {propertyData.selectedAssets.map((assetType) => {
            const asset = propertyData.availableAssets.find(a => a.type === assetType);
            if (!asset) return null;

            return (
              <Button
                key={assetType}
                variant="outline"
                size="sm"
                onClick={() => handleAssetClick(assetType)}
                disabled={isLoading}
                className="whitespace-nowrap rounded-full bg-white hover:bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <span className="text-sm">Set up my {asset.name.toLowerCase()}</span>
                <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700 border-green-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${asset.monthlyRevenue}/mo
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectedAssetsCarousel;
