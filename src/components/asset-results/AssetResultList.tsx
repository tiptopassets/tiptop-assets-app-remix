
import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';
import { useAssetSelection } from '@/hooks/useAssetSelection';

import PropertySummaryCard from './PropertySummaryCard';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import ContinueButton from './ContinueButton';
import SpacerBlock from './SpacerBlock';
import PartnerFlowManager from './PartnerFlowManager';
import BundleFlowManager from './BundleFlowManager';
import FormSectionManager from './FormSectionManager';

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing, address } = useGoogleMap();
  const [showFormSection, setShowFormSection] = useState(false);
  const [showBundles, setShowBundles] = useState(false);
  const [showPartnerRegistration, setShowPartnerRegistration] = useState(false);
  const { additionalOpportunities } = useAdditionalOpportunities();
  const { selectedAssets, handleAssetToggle, validateSelection } = useAssetSelection();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  // Extract detected assets from analysis results
  const detectedAssets = [
    ...(analysisResults.rooftop?.solarPotential ? ['solar'] : []),
    ...(analysisResults.parking?.spaces > 0 ? ['parking'] : []),
    ...(analysisResults.pool?.present ? ['pool'] : []),
    ...(analysisResults.bandwidth?.available > 0 ? ['internet'] : []),
    ...(analysisResults.storage?.volume > 0 ? ['storage'] : []),
  ];

  // Calculate total potential monthly income from selected assets
  const calculateTotalMonthlyIncome = () => {
    let total = 0;
    
    // Add from main opportunities
    analysisResults.topOpportunities
      .filter((opportunity: any) => selectedAssets.includes(opportunity.title))
      .forEach((opportunity: any) => total += opportunity.monthlyRevenue);
    
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
      .filter((opportunity: any) => selectedAssets.includes(opportunity.title) && opportunity.setupCost)
      .forEach((opportunity: any) => total += opportunity.setupCost || 0);
    
    // Add from additional opportunities
    additionalOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title) && opportunity.setupCost)
      .forEach(opportunity => total += opportunity.setupCost || 0);
      
    return total;
  };

  const totalSetupCost = calculateTotalSetupCost();
  
  const handleContinue = () => {
    if (!validateSelection()) return;
    setShowPartnerRegistration(true);
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

  const handlePartnerRegistrationComplete = () => {
    setShowPartnerRegistration(false);
  };

  // Show partner registration flow
  if (showPartnerRegistration) {
    return (
      <PartnerFlowManager
        selectedAssets={selectedAssets}
        showPartnerRegistration={showPartnerRegistration}
        onComplete={handlePartnerRegistrationComplete}
      />
    );
  }

  // Show bundle flow if enabled
  const bundleFlowResult = (
    <BundleFlowManager
      showBundles={showBundles}
      detectedAssets={detectedAssets}
      address={address || ''}
      onSkipBundles={handleSkipBundles}
    />
  );

  if (bundleFlowResult) return bundleFlowResult;

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
      
      <FormSectionManager
        showFormSection={showFormSection}
        selectedAssets={selectedAssets}
        analysisResults={analysisResults}
        additionalOpportunities={additionalOpportunities}
      />
    </div>
  );
};

export default AssetResultList;
