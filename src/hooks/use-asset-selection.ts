
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { AdditionalOpportunity, Opportunity, SelectedAsset } from '@/types/analysis';

export const useAssetSelection = (
  topOpportunities: Opportunity[],
  additionalOpportunities: AdditionalOpportunity[]
) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showFormSection, setShowFormSection] = useState(false);

  // Calculate total potential monthly income from selected assets
  const calculateTotalMonthlyIncome = () => {
    let total = 0;
    
    // Add from main opportunities
    topOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
    
    // Add from additional opportunities
    additionalOpportunities
      .filter(opportunity => selectedAssets.includes(opportunity.title))
      .forEach(opportunity => total += opportunity.monthlyRevenue);
      
    return total;
  };

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

  // Prepare the selected assets for the form
  const selectedAssetObjects: SelectedAsset[] = [
    ...topOpportunities.filter(opp => selectedAssets.includes(opp.title)),
    ...additionalOpportunities.filter(opp => selectedAssets.includes(opp.title))
  ];

  const totalMonthlyIncome = calculateTotalMonthlyIncome();

  return {
    selectedAssets,
    selectedAssetObjects,
    showFormSection,
    totalMonthlyIncome,
    handleAssetToggle,
    handleContinue,
  };
};
