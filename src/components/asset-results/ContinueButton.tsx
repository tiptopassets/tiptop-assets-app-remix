
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { SelectedAsset } from '@/types/analysis';
import { Gamepad2 } from 'lucide-react';

interface ContinueButtonProps {
  selectedCount: number;
  onContinue: () => void;
  selectedAssetsData?: SelectedAsset[];
}

const ContinueButton = ({ selectedCount, onContinue, selectedAssetsData }: ContinueButtonProps) => {
  const navigate = useNavigate();
  const { analysisResults, address } = useGoogleMap();

  const handleContinue = () => {
    if (selectedCount < 2) {
      return; // Don't proceed if less than 2 assets selected
    }
    
    onContinue();
    
    // Pass analysis data AND selected assets through navigation state and sessionStorage
    const navigationData = {
      analysisResults,
      address,
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

  const handleGameView = () => {
    // Navigate to gamified property view
    navigate('/gamified-property');
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
    <div className="flex flex-col gap-2 w-full">
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
      
      {/* Add 3D View button if analysis is complete */}
      {analysisResults && (
        <Button
          onClick={handleGameView}
          variant="outline"
          className="w-full bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-700 hover:text-purple-800 font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          View in 3D
        </Button>
      )}
    </div>
  );
};

export default ContinueButton;
