
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

interface ContinueButtonProps {
  selectedCount: number;
  onContinue: () => void;
}

const ContinueButton = ({ selectedCount, onContinue }: ContinueButtonProps) => {
  const navigate = useNavigate();
  const { analysisResults, address } = useGoogleMap();

  const handleContinue = () => {
    onContinue();
    
    // Pass analysis data through navigation state and also store in sessionStorage as backup
    const navigationData = {
      analysisResults,
      address,
      timestamp: Date.now()
    };
    
    // Store in sessionStorage as backup
    sessionStorage.setItem('model-viewer-data', JSON.stringify(navigationData));
    
    // Navigate with state
    navigate('/model-viewer', { 
      state: navigationData
    });
  };

  return (
    <Button 
      onClick={handleContinue}
      className="w-full bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
    >
      Continue with {selectedCount} asset{selectedCount !== 1 ? 's' : ''}
    </Button>
  );
};

export default ContinueButton;
