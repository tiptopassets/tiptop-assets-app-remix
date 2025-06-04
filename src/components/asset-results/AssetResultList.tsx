
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from "framer-motion";
import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';
import { SelectedAsset } from '@/types/analysis';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import AssetFormSection from './AssetFormSection';
import ContinueButton from './ContinueButton';
import PropertySummaryCard from './PropertySummaryCard';
import RestrictionsCard from './RestrictionsCard';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

interface AssetResultListProps {
  analysisResults: any;
}

const AssetResultList: React.FC<AssetResultListProps> = ({ analysisResults }) => {
  const { additionalOpportunities, opportunitiesByTier, opportunitiesByCategory } = useAdditionalOpportunities();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const { analysisComplete } = useGoogleMap();

  console.log('🏠 AssetResultList render:', {
    analysisComplete,
    hasResults: !!analysisResults,
    selectedAssetsCount: selectedAssets.length,
    showAssetForm,
    additionalOpportunitiesCount: additionalOpportunities.length
  });

  // Memoize the asset toggle handler to prevent unnecessary re-renders
  const handleAssetToggle = useCallback((assetTitle: string) => {
    console.log('🔄 Asset toggle called for:', assetTitle);
    console.log('📊 Current selectedAssets:', selectedAssets);
    
    setSelectedAssets(prev => {
      const isSelected = prev.includes(assetTitle);
      console.log('❓ Is asset selected?', isSelected);
      
      if (isSelected) {
        // Remove asset
        console.log('➖ Removing asset:', assetTitle);
        setSelectedAssetsData(prevData => {
          const newData = prevData.filter(asset => asset.title !== assetTitle);
          console.log('📋 New selectedAssetsData after removal:', newData);
          return newData;
        });
        const newSelectedAssets = prev.filter(title => title !== assetTitle);
        console.log('📊 New selectedAssets after removal:', newSelectedAssets);
        return newSelectedAssets;
      } else {
        // Add asset
        console.log('➕ Adding asset:', assetTitle);
        const assetData = additionalOpportunities.find(opp => opp.title === assetTitle);
        console.log('🔍 Found asset data:', assetData);
        
        if (assetData) {
          setSelectedAssetsData(prevData => {
            const newAsset = {
              title: assetData.title,
              icon: assetData.icon,
              monthlyRevenue: assetData.monthlyRevenue,
              provider: assetData.provider,
              setupCost: assetData.setupCost,
              roi: assetData.roi,
              formData: {}
            };
            const newData = [...prevData, newAsset];
            console.log('📋 New selectedAssetsData after addition:', newData);
            return newData;
          });
        } else {
          console.error('❌ Asset data not found for:', assetTitle);
        }
        
        const newSelectedAssets = [...prev, assetTitle];
        console.log('📊 New selectedAssets after addition:', newSelectedAssets);
        return newSelectedAssets;
      }
    });
  }, [additionalOpportunities, selectedAssets]);

  const handleContinue = useCallback(() => {
    console.log('🚀 Continue clicked');
    console.log('📊 Selected assets count:', selectedAssets.length);
    console.log('📋 Selected assets data:', selectedAssetsData);
    
    if (selectedAssets.length > 0) {
      setShowAssetForm(true);
    } else {
      console.warn('⚠️ No assets selected when continue was clicked');
    }
  }, [selectedAssets.length, selectedAssetsData]);

  const handleFormComplete = useCallback(() => {
    console.log('✅ Form completed');
    setShowAssetForm(false);
    // Here you could navigate to dashboard or next step
  }, []);

  // Memoize calculations to prevent unnecessary re-computation
  const { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome } = useMemo(() => {
    const totalSelectedRevenue = selectedAssetsData.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
    const totalSetupCost = selectedAssetsData.reduce((sum, asset) => sum + (asset.setupCost || 0), 0);

    // Calculate total monthly income from analysis results
    const analysisRevenue = analysisResults ? (
      (analysisResults.rooftop?.revenue || 0) +
      (analysisResults.parking?.revenue || 0) +
      (analysisResults.garden?.revenue || 0) +
      (analysisResults.pool?.revenue || 0) +
      (analysisResults.storage?.revenue || 0) +
      (analysisResults.bandwidth?.revenue || 0)
    ) : 0;

    const totalMonthlyIncome = analysisRevenue + totalSelectedRevenue;

    return { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome };
  }, [selectedAssetsData, analysisResults]);

  if (showAssetForm) {
    console.log('📝 Rendering AssetFormSection with:', {
      selectedAssetsCount: selectedAssetsData.length,
      selectedAssets: selectedAssetsData,
      opportunities: analysisResults?.topOpportunities || []
    });
    
    return (
      <AssetFormSection 
        selectedAssets={selectedAssetsData}
        opportunities={analysisResults?.topOpportunities || []}
        onComplete={handleFormComplete}
      />
    );
  }

  // Don't render anything if analysis is not complete
  if (!analysisComplete || !analysisResults) {
    console.log('⏳ Analysis not complete or no results');
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Property Summary */}
      <PropertySummaryCard 
        analysisResults={analysisResults}
        totalMonthlyIncome={totalMonthlyIncome}
        totalSetupCost={totalSetupCost}
        selectedAssetsCount={selectedAssets.length}
        isCollapsed={false}
      />
      
      {/* Floating Selected Assets Widget */}
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] md:w-96"
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Selected Assets</h3>
              <div className="bg-tiptop-purple/20 text-tiptop-purple text-xs px-2 py-1 rounded-full border border-tiptop-purple/30">
                {selectedAssets.length}
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <p className="text-white/60 text-xs">Assets</p>
                <p className="text-white font-bold text-sm">{selectedAssets.length}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Revenue</p>
                <p className="text-tiptop-purple font-bold text-sm">${totalSelectedRevenue}/mo</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Setup</p>
                <p className="text-orange-400 font-bold text-sm">${totalSetupCost}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Options</p>
                <p className="text-green-400 font-bold text-sm">{additionalOpportunities.length}</p>
              </div>
            </div>
            
            {/* Continue Button */}
            <ContinueButton 
              selectedAssetsCount={selectedAssets.length}
              onClick={handleContinue}
              className="w-full"
            />
          </div>
        </motion.div>
      )}
      
      {/* Main Asset Opportunities */}
      <AssetOpportunitiesGrid 
        opportunities={analysisResults.topOpportunities || []}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {/* Additional Assets Carousel with Enhanced Features */}
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
        opportunitiesByTier={opportunitiesByTier}
        opportunitiesByCategory={opportunitiesByCategory}
      />
      
      {/* Restrictions and Permits */}
      {analysisResults.restrictions && (
        <RestrictionsCard restrictions={analysisResults.restrictions} />
      )}
    </div>
  );
};

export default AssetResultList;
