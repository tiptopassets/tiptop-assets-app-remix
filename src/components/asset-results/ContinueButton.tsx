
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { SelectedAsset } from '@/types/analysis';

interface ContinueButtonProps {
  selectedCount: number;
  onContinue: () => void;
  selectedAssetsData?: SelectedAsset[];
}

const ContinueButton = ({ selectedCount, onContinue, selectedAssetsData }: ContinueButtonProps) => {
  const navigate = useNavigate();
  const { analysisResults, address, currentAnalysisId } = useGoogleMap();

  const handleContinue = () => {
    if (selectedCount < 2) {
      return; // Don't proceed if less than 2 assets selected
    }
    
    onContinue();
    
    // Pass analysis data AND selected assets through navigation state and sessionStorage
    const navigationData = {
      analysisResults,
      address,
      analysisId: currentAnalysisId, // Include the analysis ID
      selectedAssetsData: selectedAssetsData || [],
      timestamp: Date.now()
    };
    
    // Store in sessionStorage as backup
    sessionStorage.setItem('model-viewer-data', JSON.stringify(navigationData));
    
    // Navigate with state
    navigate('/model-viewer', { 
      state: navigationData
    });
  };

  const getButtonText = () => {
    if (selectedCount === 0) {
      return 'Select at least 2 assets to continue';
    } else if (selectedCount === 1) {
      return 'Select at least one more asset to continue';
    } else {
      return `Continue with ${selectedCount} asset${selectedCount !== 1 ? 's' : ''}`;
    }
  };

  const isDisabled = selectedCount < 2;

  return (
    <Button 
      onClick={handleContinue}
      disabled={isDisabled}
      className={`w-full border-none shadow-lg hover:shadow-xl transition-all duration-300 ${
        isDisabled 
          ? 'bg-gray-600 hover:bg-gray-600 text-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
      }`}
    >
      {getButtonText()}
    </Button>
  );
};

export default ContinueButton;
