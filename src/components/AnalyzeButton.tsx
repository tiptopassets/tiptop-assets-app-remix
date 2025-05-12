
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';

const AnalyzeButton = () => {
  const { address, generatePropertyAnalysis, isGeneratingAnalysis } = useGoogleMap();
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
    
    // Use our new GPT-powered property analysis function
    generatePropertyAnalysis(address);
  };
  
  return (
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
      <Sparkles className="h-5 w-5 text-tiptop-purple" />
      <span className="font-medium">
        {isGeneratingAnalysis ? 'Analyzing with AI...' : 'Analyze Property'}
      </span>
      
      {isGeneratingAnalysis && (
        <div className="ml-2 h-5 w-5 rounded-full border-t-2 border-r-2 border-tiptop-purple animate-spin" />
      )}
    </motion.button>
  );
};

export default AnalyzeButton;
