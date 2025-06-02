
import { useNavigate } from 'react-router-dom';
import { SelectedAsset, Opportunity } from '@/types/analysis';
import AssetFormSection from './AssetFormSection';

interface FormSectionManagerProps {
  showFormSection: boolean;
  selectedAssets: string[];
  analysisResults: any;
  additionalOpportunities: any[];
}

const FormSectionManager = ({ 
  showFormSection, 
  selectedAssets, 
  analysisResults, 
  additionalOpportunities 
}: FormSectionManagerProps) => {
  const navigate = useNavigate();

  const handleAuthenticateClick = () => {
    navigate('/options');
  };

  if (!showFormSection) return null;

  // Prepare the selected assets for the form
  const selectedAssetObjects: SelectedAsset[] = [
    ...analysisResults.topOpportunities.filter((opp: any) => selectedAssets.includes(opp.title)),
    ...additionalOpportunities.filter((opp: any) => selectedAssets.includes(opp.title))
  ];
  
  // Combine all opportunities for form field lookup
  const allOpportunities: Opportunity[] = [...analysisResults.topOpportunities, ...additionalOpportunities];

  return (
    <div id="asset-form-section">
      <AssetFormSection 
        selectedAssets={selectedAssetObjects}
        opportunities={allOpportunities}
        onComplete={handleAuthenticateClick}
      />
    </div>
  );
};

export default FormSectionManager;
