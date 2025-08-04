
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { useAddressSearch } from '@/hooks/use-address-search';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useUserData } from '@/hooks/useUserData';
import { Zap, CheckCircle, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AnalyzeButton = () => {
  const { 
    address, 
    addressCoordinates,
    generatePropertyAnalysis, 
    isAnalyzing,
    analysisError,
    setAnalysisResults,
    setAnalysisComplete 
  } = useGoogleMap();
  const { analyzeProperty, isLoading: isEnhancedLoading } = useEnhancedAnalysis();
  const { hasSelectedAddress, isRetrying } = useAddressSearch();
  const { capturePropertyImages } = useModelGeneration();
  const userData = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleUnifiedAnalysis = async () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter a property address first.",
        variant: "destructive"
      });
      return;
    }

    // Check if address was properly selected from autocomplete
    if (!hasSelectedAddress) {
      toast({
        title: "Please Select Address",
        description: "Choose your address from the dropdown suggestions to ensure accurate analysis.",
        variant: "destructive"
      });
      return;
    }

    setAnalysisStarted(true);
    setProgress(0);
    setCurrentStep('Starting analysis...');
    
    // Simulate progress updates with descriptive steps
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const newProgress = prev + Math.random() * 15;
        
        // Update step based on progress
        if (newProgress < 30) {
          setCurrentStep('Analyzing property features...');
        } else if (newProgress < 60) {
          setCurrentStep('Calculating revenue potential...');
        } else if (newProgress < 90) {
          setCurrentStep(user ? 'Saving to dashboard...' : 'Finalizing results...');
        }
        
        return newProgress;
      });
    }, 500);
    
    try {
      // Step 1: Save address to database if authenticated
      setProgress(10);
      setCurrentStep('Saving address...');
      if (user && addressCoordinates) {
        try {
          await userData.saveAddress(address, addressCoordinates, address);
          console.log('Address saved to database');
        } catch (error) {
          console.error('Failed to save address to database:', error);
        }
      }
      
      // Step 2: Capture property images
      setProgress(20);
      setCurrentStep('Capturing property images...');
      if (addressCoordinates) {
        capturePropertyImages(address, addressCoordinates);
      }
      
      // Step 3: Run the basic analysis
      setProgress(40);
      setCurrentStep('Processing property data...');
      await generatePropertyAnalysis(address);
      setProgress(60);
      
      // Step 4: If user is authenticated, also run enhanced analysis
      if (user) {
        setCurrentStep('Running enhanced analysis...');
        const enhancedResult = await analyzeProperty(address);
        setProgress(90);
        
        if (enhancedResult?.success) {
          // Merge the enhanced results with the basic analysis
          setAnalysisResults(enhancedResult.results);
          setAnalysisComplete(true);
          setProgress(100);
          setCurrentStep('Analysis complete!');
          
          toast({
            title: "Enhanced Analysis Complete",
            description: `Property analysis completed and saved to your dashboard with ${Math.round(enhancedResult.dataQuality.accuracyScore * 100)}% accuracy`,
            action: (
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard">
                  <Database className="w-4 h-4 mr-2" />
                  View Dashboard
                </a>
              </Button>
            )
          });
        }
      } else {
        setProgress(100);
        setCurrentStep('Analysis complete!');
        toast({
          title: "Basic Analysis Complete",
          description: "Property analysis completed. Sign in for enhanced AI analysis and dashboard saving.",
          action: (
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">
                <Database className="w-4 h-4 mr-2" />
                View Results
              </a>
            </Button>
          )
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "There was an issue analyzing your property. Please try again.",
        variant: "destructive"
      });
      setProgress(0);
      setCurrentStep('');
      setAnalysisStarted(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const isLoading = isAnalyzing || isEnhancedLoading;
  const hasAddress = !!address;
  const hasError = !!analysisError;

  // Debug logging
  console.log('AnalyzeButton state:', {
    address,
    hasSelectedAddress,
    isRetrying,
    hasAddress,
    isLoading,
    hasError,
    addressCoordinates
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        onClick={handleUnifiedAnalysis}
        disabled={isLoading || analysisStarted || !hasAddress || !hasSelectedAddress || isRetrying}
        className={`w-full ${hasAddress 
          ? hasSelectedAddress
            ? hasError 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-tiptop-purple to-purple-600 hover:from-purple-600 hover:to-purple-700'
            : 'bg-amber-600 hover:bg-amber-700'
          : 'bg-gray-600 hover:bg-gray-700'
        } text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105`}
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {user ? 'Enhanced AI Analysis...' : 'Analyzing Property...'}
          </div>
        ) : hasError ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Try Again
          </div>
        ) : analysisStarted ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Analysis Complete
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {user ? 'Enhanced AI Analysis' : 'Analyze Property'}
          </div>
        )}
      </Button>
      
      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-4 space-y-2">
          <Progress 
            value={progress} 
            className="h-2 bg-black/40 border border-white/10"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {analysisError}
        </div>
      )}
      
      {!analysisStarted && !hasError && (
        <p className="text-center text-sm text-gray-400 mt-2">
          {!hasAddress ? (
            <>📍 Enter an address above to start analysis</>
          ) : !hasSelectedAddress ? (
            isRetrying ? (
              <>🔄 Selecting address automatically...</>
            ) : (
              <>⚠️ Please select your address from the dropdown suggestions<br/>
              <span className="text-xs text-amber-400">Please click on your address again</span></>
            )
          ) : user ? (
            <>🚀 Multi-source analysis with Google Solar + GPT-4o<br/>
            <span className="text-xs">✅ Results will be saved to your dashboard</span></>
          ) : (
            <>🏠 Basic property analysis - sign in for enhanced features<br/>
            <span className="text-xs">ℹ️ Sign in to save results to dashboard</span></>
          )}
        </p>
      )}
    </div>
  );
};

export default AnalyzeButton;
