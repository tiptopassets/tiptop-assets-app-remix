
import React, { useState } from 'react';
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
  const [isTriggered, setIsTriggered] = useState(false);
  
  // Get selected assets from property data and deduplicate by asset_type
  const allSelectedAssets = propertyData?.selectedAssets || [];
  
  // Deduplicate by asset_type, keeping the first occurrence of each type
  const uniqueAssets = allSelectedAssets.filter((asset, index, array) => 
    array.findIndex(a => a.asset_type === asset.asset_type) === index
  );

  if (!uniqueAssets.length) {
    return null;
  }

  console.log('🎯 [SELECTED_ASSETS] Rendering bubbles for:', {
    originalCount: allSelectedAssets.length,
    uniqueCount: uniqueAssets.length,
    assets: uniqueAssets.map(a => ({ type: a.asset_type, revenue: a.monthly_revenue })),
    isTriggered
  });

  const handleAssetClick = (asset: any) => {
    const assetName = asset.asset_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    console.log('🎯 [SELECTED_ASSETS] Asset clicked:', { type: asset.asset_type, name: assetName });
    
    // Trigger carousel mode after click
    setIsTriggered(true);
    
    if (onAssetClick) {
      onAssetClick(asset.asset_type, assetName);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`fixed ${
        isTriggered 
          ? 'bottom-24 left-0 right-0' 
          : 'bottom-24 left-0 right-0'
      } z-[99] px-3 md:px-6 pointer-events-none`}
    >
      <div className={`flex ${isTriggered ? 'justify-center' : 'justify-center'}`}>
        <div className={`${isTriggered ? 'w-full max-w-4xl' : 'w-full max-w-4xl'}`}>
          <div className={`flex ${
            isTriggered 
              ? 'overflow-x-auto gap-3 justify-start pb-2 scrollbar-hide' 
              : 'flex-wrap gap-2 justify-center'
          } pointer-events-auto`}>
            {uniqueAssets.map((asset, index) => (
              <motion.div
                key={asset.asset_type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={isTriggered ? 'flex-shrink-0' : ''}
              >
                <Badge
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm border-primary/20 hover:border-[hsl(267,83%,60%)] text-sm px-4 py-2 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl hover:bg-background/95 whitespace-nowrap"
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
