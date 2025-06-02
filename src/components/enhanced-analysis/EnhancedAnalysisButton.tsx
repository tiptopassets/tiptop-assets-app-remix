
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Zap, CheckCircle } from 'lucide-react';

const EnhancedAnalysisButton = () => {
  const { analyzeProperty, isLoading } = useEnhancedAnalysis();
  const { address, setAnalysisResults, setAnalysisComplete } = useGoogleMap();
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const handleEnhancedAnalysis = async () => {
    if (!address) return;

    setAnalysisStarted(true);
    const result = await analyzeProperty(address);
    
    if (result?.success) {
      // Update the existing GoogleMapContext with enhanced results
      setAnalysisResults(result.results);
      setAnalysisComplete(true);
    }
  };

  if (!address) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Button
        onClick={handleEnhancedAnalysis}
        disabled={isLoading || analysisStarted}
        className="w-full bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing with AI...
          </div>
        ) : analysisStarted ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Analysis Complete
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Enhanced AI Analysis
          </div>
        )}
      </Button>
      
      {!analysisStarted && (
        <p className="text-center text-sm text-gray-400 mt-2">
          🚀 Multi-source analysis with Google Solar + GPT-4o
        </p>
      )}
    </div>
  );
};

export default EnhancedAnalysisButton;
