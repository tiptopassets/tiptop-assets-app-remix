
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface ExtendedPropertyData extends PropertyAnalysisData {
  selectedAssets?: Array<{
    id: string;
    asset_type: string;
    monthly_revenue: number;
    asset_data: any;
  }>;
}

interface SelectedAssetBubblesProps {
  propertyData: ExtendedPropertyData | null;
  onAssetClick?: (assetType: string, assetName: string) => void;
}

const SelectedAssetBubbles = ({ propertyData, onAssetClick }: SelectedAssetBubblesProps) => {
  // Get selected assets from property data
  const selectedAssets = propertyData?.selectedAssets || [];

  if (!selectedAssets.length) {
    return null;
  }

  console.log('🎯 [SELECTED_ASSETS] Rendering bubbles for:', {
    assetsCount: selectedAssets.length,
    assets: selectedAssets.map(a => ({ type: a.asset_type, revenue: a.monthly_revenue }))
  });

  const handleAssetClick = (asset: any) => {
    const assetName = asset.asset_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    console.log('🎯 [SELECTED_ASSETS] Asset clicked:', { type: asset.asset_type, name: assetName });
    
    if (onAssetClick) {
      onAssetClick(asset.asset_type, assetName);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-0 right-0 z-[99] px-3 md:px-6 pointer-events-none"
    >
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
            {selectedAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm border-primary/20 hover:border-[hsl(267,83%,60%)] text-sm px-4 py-2 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl hover:bg-background/95"
                  onClick={() => handleAssetClick(asset)}
                >
                  <span className="font-medium">
                    {asset.asset_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {asset.monthly_revenue > 0 && (
                    <span className="ml-2 text-green-600 font-semibold">
                      ${asset.monthly_revenue}/mo
                    </span>
                  )}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedAssetBubbles;
