import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SelectedAsset } from '@/types/analysis';
import { BundleRecommendation } from '@/contexts/ServiceProviders/types';

// Existing components
import PropertySummaryCard from './PropertySummaryCard';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import ContinueButton from './ContinueButton';
import AssetFormSection from './AssetFormSection';
import SpacerBlock from './SpacerBlock';

// New bundle components
import BundleRecommendations from '../bundles/BundleRecommendations';
import BundleRegistrationFlow from '../bundles/BundleRegistrationFlow';

import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing, address } = useGoogleMap();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showFormSection, setShowFormSection] = useState(false);
  const [showBundles, setShowBundles] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleRecommendation | null>(null);
  const navigate = useNavigate();
  const { additionalOpportunities } = useAdditionalOpportunities();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  // Extract detected assets from analysis results
  const detectedAssets = [
    ...(analysisResults.rooftop?.solarPotential ? ['solar'] : []),
    ...(analysisResults.parking?.spaces > 0 ? ['parking'] : []),
    ...(analysisResults.pool?.present ? ['pool'] : []),
    ...(analysisResults.bandwidth?.available > 0 ? ['internet'] : []),
    ...(analysisResults.storage?.volume > 0 ? ['storage'] : []),
    // Add more asset detection logic based on your analysis results
  ];

  // Calculate total potential monthly income from selected assets
  const calculateTotalMonthlyIncome = () => {
    let total = 0;
    
    // Add from main opportunities
    analysisResults.topOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
    
    // Add from additional opportunities
    additionalOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
      
    return total;
  };

  const totalMonthlyIncome = calculateTotalMonthlyIncome();

  // Calculate setup costs for selected assets
  const calculateTotalSetupCost = () => {
    let total = 0;
    
    // Add from main opportunities
    analysisResults.topOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title) && opportunity.setupCost)
      .forEach(opportunity => total += opportunity.setupCost || 0);
    
    // Add from additional opportunities
    additionalOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title) && opportunity.setupCost)
      .forEach(opportunity => total += opportunity.setupCost || 0);
      
    return total;
  };

  const totalSetupCost = calculateTotalSetupCost();

  const handleAssetToggle = (assetTitle: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetTitle)) {
        return prev.filter(title => title !== assetTitle);
      } else {
        return [...prev, assetTitle];
      }
    });
  };
  
  const handleContinue = () => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one asset to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Show bundle recommendations if multiple assets are detected
    if (detectedAssets.length >= 2) {
      setShowBundles(true);
    } else {
      setShowFormSection(true);
      
      // Scroll to the form section
      setTimeout(() => {
        const formSection = document.getElementById('asset-form-section');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSelectBundle = (recommendation: BundleRecommendation) => {
    setSelectedBundle(recommendation);
  };

  const handleBundleRegistrationComplete = () => {
    toast({
      title: "Bundle Registration Complete",
      description: "You've successfully registered with multiple providers!",
    });
    navigate('/dashboard');
  };

  const handleSkipBundles = () => {
    setShowBundles(false);
    setShowFormSection(true);
    
    setTimeout(() => {
      const formSection = document.getElementById('asset-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleAuthenticateClick = () => {
    // Navigate to the options page
    navigate('/options');
  };
  
  // Prepare the selected assets for the form
  const selectedAssetObjects: SelectedAsset[] = [
    ...analysisResults.topOpportunities.filter(opp => selectedAssets.includes(opp.title)),
    ...additionalOpportunities.filter(opp => selectedAssets.includes(opp.title))
  ];
  
  // Combine all opportunities for form field lookup
  const allOpportunities = [...analysisResults.topOpportunities, ...additionalOpportunities];

  // Show bundle registration flow if a bundle is selected
  if (selectedBundle) {
    return (
      <div className="w-full px-4 md:px-0 md:max-w-4xl">
        <SpacerBlock />
        <BundleRegistrationFlow
          selectedBundle={selectedBundle}
          propertyAddress={address || ''}
          onComplete={handleBundleRegistrationComplete}
          onBack={() => setSelectedBundle(null)}
        />
      </div>
    );
  }

  // Show bundle recommendations if enabled
  if (showBundles && detectedAssets.length >= 2) {
    return (
      <div className="w-full px-4 md:px-0 md:max-w-4xl">
        <SpacerBlock />
        <BundleRecommendations
          detectedAssets={detectedAssets}
          onSelectBundle={handleSelectBundle}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={handleSkipBundles}
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Skip bundles and register individually
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-0 md:max-w-3xl">
      <SpacerBlock />
      
      <PropertySummaryCard 
        analysisResults={analysisResults}
        totalMonthlyIncome={totalMonthlyIncome}
        totalSetupCost={totalSetupCost}
        selectedAssetsCount={selectedAssets.length}
        isCollapsed={false}
      />

      <AssetOpportunitiesGrid
        opportunities={analysisResults.topOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities} 
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {!showFormSection && (
        <ContinueButton
          selectedAssetsCount={selectedAssets.length}
          onClick={handleContinue}
        />
      )}
      
      {showFormSection && (
        <div id="asset-form-section">
          <AssetFormSection 
            selectedAssets={selectedAssetObjects}
            opportunities={allOpportunities}
            onComplete={handleAuthenticateClick}
          />
        </div>
      )}
    </div>
  );
};

export default AssetResultList;
