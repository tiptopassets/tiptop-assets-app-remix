
import { motion } from 'framer-motion';
import { Sparkles, CloudOff } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';

const AnalyzeButton = () => {
  const { 
    address, 
    generatePropertyAnalysis, 
    isGeneratingAnalysis, 
    analysisError, 
    setAnalysisError,
    useLocalAnalysis,
    setUseLocalAnalysis,
    addressCoordinates
  } = useGoogleMap();
  const { toast } = useToast();
  
  const handleAnalyze = () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous error state
    if (analysisError) {
      setAnalysisError(null);
    }
    
    console.log("Starting analysis for address:", address);
    console.log("Coordinates available:", addressCoordinates);
    console.log("Using local analysis mode:", useLocalAnalysis);
    
    // Use our property analysis function
    generatePropertyAnalysis(address);
  };
  
  const toggleAnalysisMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUseLocalAnalysis(!useLocalAnalysis);
    toast({
      title: useLocalAnalysis ? "Using AI Analysis" : "Using Demo Mode",
      description: useLocalAnalysis 
        ? "Switched to AI-powered analysis for accurate results" 
        : "Switched to demo mode - results are simulated"
    });
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={handleAnalyze}
        disabled={isGeneratingAnalysis || !address}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`glass-effect px-6 py-3 rounded-full flex items-center gap-2 text-white glow-effect ${!address ? 'opacity-70 cursor-not-allowed' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {useLocalAnalysis ? (
          <CloudOff className="h-5 w-5 text-amber-400" />
        ) : (
          <Sparkles className="h-5 w-5 text-tiptop-purple" />
        )}
        <span className="font-medium">
          {isGeneratingAnalysis 
            ? 'Analyzing with AI...' 
            : analysisError 
              ? 'Try Again' 
              : useLocalAnalysis 
                ? 'Analyze Property (Demo Mode)' 
                : 'Analyze Property'}
        </span>
        
        {isGeneratingAnalysis && (
          <div className="ml-2 h-5 w-5 rounded-full border-t-2 border-r-2 border-tiptop-purple animate-spin" />
        )}
      </motion.button>
      
      <motion.button 
        onClick={toggleAnalysisMode}
        className="text-xs text-white/80 hover:text-white underline flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 5 }}
        transition={{ delay: 0.3 }}
      >
        {useLocalAnalysis ? (
          <>Try AI Analysis (Requires API Key)</>
        ) : (
          <>Switch to Demo Mode (No API Key Needed)</>
        )}
      </motion.button>
    </div>
  );
};

export default AnalyzeButton;
