
import { useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SelectedAsset } from '@/types/analysis';

// Refactored Components
import PropertySummaryCard from './PropertySummaryCard';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import ContinueButton from './ContinueButton';
import AssetFormSection from './AssetFormSection';
import SpacerBlock from './SpacerBlock';
import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing } = useGoogleMap();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showFormSection, setShowFormSection] = useState(false);
  const navigate = useNavigate();
  const { additionalOpportunities } = useAdditionalOpportunities();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

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
    
    setShowFormSection(true);
    
    // Scroll to the form section
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

  return (
    <div className="w-full px-4 md:px-0 md:max-w-3xl">
      <SpacerBlock />
      
      <PropertySummaryCard 
        analysisResults={analysisResults}
        totalMonthlyIncome={totalMonthlyIncome}
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
