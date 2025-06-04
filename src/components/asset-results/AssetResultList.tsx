
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';
import { SelectedAsset } from '@/types/analysis';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import AssetFormSection from './AssetFormSection';
import ContinueButton from './ContinueButton';
import PropertySummaryCard from './PropertySummaryCard';
import RestrictionsCard from './RestrictionsCard';

interface AssetResultListProps {
  analysisResults: any;
}

const AssetResultList: React.FC<AssetResultListProps> = ({ analysisResults }) => {
  const { additionalOpportunities, opportunitiesByTier, opportunitiesByCategory } = useAdditionalOpportunities();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);

  const handleAssetToggle = (assetTitle: string) => {
    setSelectedAssets(prev => {
      const isSelected = prev.includes(assetTitle);
      if (isSelected) {
        // Remove asset
        setSelectedAssetsData(prevData => 
          prevData.filter(asset => asset.title !== assetTitle)
        );
        return prev.filter(title => title !== assetTitle);
      } else {
        // Add asset
        const assetData = additionalOpportunities.find(opp => opp.title === assetTitle);
        if (assetData) {
          setSelectedAssetsData(prevData => [...prevData, {
            title: assetData.title,
            icon: assetData.icon,
            monthlyRevenue: assetData.monthlyRevenue,
            provider: assetData.provider,
            setupCost: assetData.setupCost,
            roi: assetData.roi,
            formData: {}
          }]);
        }
        return [...prev, assetTitle];
      }
    });
  };

  const handleContinue = () => {
    if (selectedAssets.length > 0) {
      setShowAssetForm(true);
    }
  };

  const totalSelectedRevenue = selectedAssetsData.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
  const totalSetupCost = selectedAssetsData.reduce((sum, asset) => sum + (asset.setupCost || 0), 0);

  if (showAssetForm) {
    return (
      <AssetFormSection 
        selectedAssets={selectedAssetsData}
        onBack={() => setShowAssetForm(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Property Summary */}
      <PropertySummaryCard analysisResults={analysisResults} />
      
      {/* Main Asset Opportunities */}
      <AssetOpportunitiesGrid analysisResults={analysisResults} />
      
      {/* Additional Assets Carousel with Enhanced Features */}
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
        opportunitiesByTier={opportunitiesByTier}
        opportunitiesByCategory={opportunitiesByCategory}
      />
      
      {/* Restrictions and Permits */}
      {(analysisResults.restrictions || analysisResults.permits?.length > 0) && (
        <RestrictionsCard analysisResults={analysisResults} />
      )}
      
      {/* Continue Button with Summary */}
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-lg text-center"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Selected Assets Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white/60 text-sm">Assets Selected</p>
                <p className="text-white font-bold text-xl">{selectedAssets.length}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Monthly Revenue</p>
                <p className="text-tiptop-purple font-bold text-xl">${totalSelectedRevenue}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-white/60 text-sm">Setup Investment</p>
                <p className="text-orange-400 font-bold text-xl">${totalSetupCost}</p>
              </div>
            </div>
          </div>
          <ContinueButton 
            selectedAssetsCount={selectedAssets.length}
            onClick={handleContinue}
          />
        </motion.div>
      )}
    </div>
  );
};

export default AssetResultList;
