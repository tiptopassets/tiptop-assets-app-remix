import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AssetResultListProps {
  analysisResults: any;
  onFormSectionToggle?: (isShowing: boolean) => void;
}

const AssetResultList: React.FC<AssetResultListProps> = ({ 
  analysisResults, 
  onFormSectionToggle 
}) => {
  const { additionalOpportunities, opportunitiesByTier, opportunitiesByCategory } = useAdditionalOpportunities();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const { analysisComplete, address, addressCoordinates } = useGoogleMap();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('🏠 AssetResultList render:', {
    analysisComplete,
    hasResults: !!analysisResults,
    selectedAssetsCount: selectedAssets.length,
    showAssetForm,
    additionalOpportunitiesCount: additionalOpportunities.length,
    propertyType: analysisResults?.propertyType,
    topOpportunities: analysisResults?.topOpportunities?.length || 0,
    totalMonthlyRevenue: analysisResults?.totalMonthlyRevenue
  });

  // Notify parent component when form section visibility changes
  useEffect(() => {
    if (onFormSectionToggle) {
      onFormSectionToggle(showAssetForm);
    }
  }, [showAssetForm, onFormSectionToggle]);

  // Filter opportunities based on property type - IMPROVED LOGIC
  const displayOpportunities = useMemo(() => {
    if (!analysisResults?.topOpportunities) return [];
    
    const isApartment = analysisResults.propertyType === 'apartment' || 
                       analysisResults.propertyType?.toLowerCase().includes('apartment');
    
    console.log('🏢 Property type check:', {
      propertyType: analysisResults.propertyType,
      isApartment,
      rawOpportunities: analysisResults.topOpportunities,
      totalMonthlyRevenue: analysisResults.totalMonthlyRevenue,
      bandwidthRevenue: analysisResults.bandwidth?.revenue,
      storageRevenue: analysisResults.storage?.revenue
    });

    // For apartments, ensure we include ALL available opportunities
    if (isApartment) {
      let apartmentOpportunities = [];

      // First, try to use existing opportunities from the analysis
      const existingOpportunities = analysisResults.topOpportunities.filter(opp => {
        const title = opp.title.toLowerCase();
        return title.includes('internet') || 
               title.includes('bandwidth') || 
               title.includes('storage') ||
               title.includes('unit') ||
               title.includes('rental') ||
               opp.monthlyRevenue > 0;
      });

      console.log('🏢 Found existing apartment opportunities:', existingOpportunities);
      apartmentOpportunities = [...existingOpportunities];

      // Always ensure Internet opportunity is included if there's bandwidth revenue
      const hasInternet = apartmentOpportunities.some(opp => 
        opp.title.toLowerCase().includes('internet') || opp.title.toLowerCase().includes('bandwidth')
      );
      
      if (!hasInternet && analysisResults.bandwidth?.revenue > 0) {
        console.log('🏢 Adding missing Internet opportunity:', analysisResults.bandwidth.revenue);
        apartmentOpportunities.push({
          title: 'Internet Bandwidth Sharing',
          icon: 'wifi',
          monthlyRevenue: analysisResults.bandwidth.revenue,
          description: `Share ${analysisResults.bandwidth.available || 100} GB unused bandwidth for passive income`,
          setupCost: 0,
          roi: 0
        });
      }

      // Always ensure Storage opportunity is included if there's storage revenue
      const hasStorage = apartmentOpportunities.some(opp => 
        opp.title.toLowerCase().includes('storage') || opp.title.toLowerCase().includes('unit')
      );
      
      if (!hasStorage && analysisResults.storage?.revenue > 0) {
        console.log('🏢 Adding missing Storage opportunity:', analysisResults.storage.revenue);
        apartmentOpportunities.push({
          title: 'Personal Storage Rental',
          icon: 'storage', 
          monthlyRevenue: analysisResults.storage.revenue,
          description: 'Rent out personal storage space within your unit',
          setupCost: 0,
          roi: 0
        });
      }

      console.log('🏢 Final apartment opportunities:', apartmentOpportunities);
      return apartmentOpportunities;
    }

    // For non-apartments, return all opportunities
    return analysisResults.topOpportunities;
  }, [analysisResults]);

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
        // Add asset - check both main opportunities and additional opportunities
        console.log('➕ Adding asset:', assetTitle);
        
        // First check in display opportunities
        let assetData = displayOpportunities.find(opp => opp.title === assetTitle);
        
        // If not found, check in additional opportunities
        if (!assetData) {
          assetData = additionalOpportunities.find(opp => opp.title === assetTitle);
        }
        
        console.log('🔍 Found asset data:', assetData);
        
        if (assetData) {
          setSelectedAssetsData(prevData => {
            const newAsset = {
              title: assetData.title,
              icon: assetData.icon,
              monthlyRevenue: assetData.monthlyRevenue,
              provider: assetData.provider,
              setupCost: assetData.setupCost || 0,
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
  }, [additionalOpportunities, selectedAssets, displayOpportunities]);

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

  const handleFormComplete = useCallback(async () => {
    console.log('✅ Form completed');
    
    // Save asset selections to database if user is logged in
    if (user && selectedAssetsData.length > 0 && address) {
      try {
        const { saveAddress } = await import('@/services/userAddressService');
        const { loadUserAnalyses } = await import('@/services/userAnalysisService');
        const { saveAssetSelection } = await import('@/services/userAssetService');
        
        console.log('💾 Saving asset selections to database...');
        
        // Get or create address
        const addressId = await saveAddress(
          user.id,
          address,
          addressCoordinates,
          address,
          false
        );
        
        if (addressId) {
          // Get the latest analysis for this address
          const userAnalyses = await loadUserAnalyses(user.id);
          const latestAnalysis = userAnalyses[0]; // Most recent first
          
          if (latestAnalysis) {
            // Save each selected asset
            const savePromises = selectedAssetsData.map(asset => 
              saveAssetSelection(
                user.id,
                latestAnalysis.id,
                asset.title,
                asset.formData,
                asset.monthlyRevenue,
                asset.setupCost,
                asset.roi
              )
            );
            
            await Promise.all(savePromises);
            
            console.log('✅ Successfully saved all asset selections');
            toast({
              title: "Assets Saved",
              description: `${selectedAssetsData.length} asset selections saved to your dashboard`,
            });
            
            // Navigate to options page after successful save
            setTimeout(() => {
              window.location.href = '/options';
            }, 1000);
          }
        }
      } catch (error) {
        console.error('❌ Failed to save asset selections:', error);
        toast({
          title: "Save Error",
          description: "Failed to save asset selections, but your local data is preserved",
          variant: "destructive"
        });
      }
    } else {
      // If no user, still navigate to options for auth flow
      setTimeout(() => {
        window.location.href = '/options';
      }, 500);
    }
    
    setShowAssetForm(false);
  }, [user, selectedAssetsData, address, addressCoordinates, toast]);

  // Memoize calculations to prevent unnecessary re-computation
  const { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome } = useMemo(() => {
    const totalSelectedRevenue = selectedAssetsData.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
    const totalSetupCost = selectedAssetsData.reduce((sum, asset) => sum + (asset.setupCost || 0), 0);

    // Use the totalMonthlyRevenue from analysis results if available, otherwise calculate
    const analysisRevenue = analysisResults?.totalMonthlyRevenue || (analysisResults ? (
      (analysisResults.rooftop?.revenue || 0) +
      (analysisResults.parking?.revenue || 0) +
      (analysisResults.garden?.revenue || 0) +
      (analysisResults.pool?.revenue || 0) +
      (analysisResults.storage?.revenue || 0) +
      (analysisResults.bandwidth?.revenue || 0)
    ) : 0);

    const totalMonthlyIncome = analysisRevenue + totalSelectedRevenue;

    return { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome };
  }, [selectedAssetsData, analysisResults]);

  if (showAssetForm) {
    console.log('📝 Rendering AssetFormSection with:', {
      selectedAssetsCount: selectedAssetsData.length,
      selectedAssets: selectedAssetsData,
      opportunities: [...displayOpportunities, ...additionalOpportunities]
    });
    
    // Combine both main opportunities and additional opportunities for the form
    const allOpportunities = [
      ...displayOpportunities,
      ...additionalOpportunities
    ];
    
    return (
      <AssetFormSection 
        selectedAssets={selectedAssetsData}
        opportunities={allOpportunities}
        onComplete={handleFormComplete}
      />
    );
  }

  // Don't render anything if analysis is not complete
  if (!analysisComplete || !analysisResults) {
    console.log('⏳ Analysis not complete or no results');
    return null;
  }

  const isApartment = analysisResults.propertyType === 'apartment' || 
                     analysisResults.propertyType?.toLowerCase().includes('apartment');

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
      
      {/* Apartment-specific notice */}
      {isApartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <h3 className="text-blue-300 font-semibold mb-2">🏢 Apartment/Condo Property</h3>
          <p className="text-white/80 text-sm">
            As an apartment or condo resident, your monetization options are limited to unit-level opportunities. 
            You typically don't have individual access to rooftops, building parking, or shared amenities for rental purposes.
          </p>
        </motion.div>
      )}
      
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
        opportunities={displayOpportunities}
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
