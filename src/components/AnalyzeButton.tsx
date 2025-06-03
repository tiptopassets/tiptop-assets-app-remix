
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AnalyzeButton = () => {
  const { 
    address, 
    generatePropertyAnalysis, 
    isAnalyzing,
    setAnalysisResults,
    setAnalysisComplete 
  } = useGoogleMap();
  const { analyzeProperty, isLoading: isEnhancedLoading } = useEnhancedAnalysis();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const handleUnifiedAnalysis = async () => {
    if (!address) return;

    setAnalysisStarted(true);
    
    try {
      // Always run the basic analysis first
      await generatePropertyAnalysis(address);
      
      // Try to run enhanced analysis regardless of authentication status
      // This provides full analysis for all users
      try {
        const enhancedResult = await analyzeProperty(address);
        
        if (enhancedResult?.success) {
          // Merge the enhanced results with the basic analysis
          setAnalysisResults(enhancedResult.results);
          setAnalysisComplete(true);
          
          toast({
            title: "Enhanced Analysis Complete",
            description: `Property analysis completed with ${Math.round(enhancedResult.dataQuality.accuracyScore * 100)}% accuracy using multi-source data`
          });
        } else {
          // Fallback to basic analysis if enhanced fails
          toast({
            title: "Property Analysis Complete",
            description: "Property analysis completed successfully."
          });
        }
      } catch (enhancedError) {
        console.log('Enhanced analysis not available, using basic analysis:', enhancedError);
        toast({
          title: "Property Analysis Complete",
          description: "Property analysis completed successfully."
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "There was an issue analyzing your property. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Always show the button if there's an address
  if (!address) return null;

  const isLoading = isAnalyzing || isEnhancedLoading;

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        onClick={handleUnifiedAnalysis}
        disabled={isLoading || analysisStarted}
        className="w-full bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing Property...
          </div>
        ) : analysisStarted ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Analysis Complete
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Analyze Property
          </div>
        )}
      </Button>
      
      {!analysisStarted && (
        <p className="text-center text-sm text-gray-400 mt-2">
          🚀 AI-powered analysis with Google Solar data
        </p>
      )}
    </div>
  );
};

export default AnalyzeButton;
