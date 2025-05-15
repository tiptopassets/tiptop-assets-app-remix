
import { useState, useEffect } from 'react';
import { Loader, X } from 'lucide-react';
import { useModelGeneration } from '@/contexts/ModelGenerationContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const HomeModelViewer = () => {
  const { status, progress, currentTaskId } = useModelGeneration();
  const [isVisible, setIsVisible] = useState(false);
  
  const isGenerating = status === 'generating';
  const isComplete = status === 'completed';
  
  // Determine if we should show the component
  useEffect(() => {
    if (isGenerating || isComplete) {
      setIsVisible(true);
    }
  }, [isGenerating, isComplete]);
  
  // Format task ID for display
  const formattedTaskId = currentTaskId ? 
    `${currentTaskId.substring(0, 8)}...${currentTaskId.substring(currentTaskId.length - 8)}` : 
    null;
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto mt-8 mb-12 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 relative"
    >
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {isGenerating ? "Analyzing Your Property..." : "Property Analysis Complete"}
          </h2>
          <p className="text-sm text-gray-400">
            {isGenerating 
              ? "Please wait while we analyze your property" 
              : "View your property analysis results below"}
          </p>
          {currentTaskId && (
            <p className="text-xs text-gray-500 mt-1">
              Task ID: {formattedTaskId}
            </p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(false)} 
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Progress bar for analysis */}
      {isGenerating && (
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader className="h-5 w-5 animate-spin text-tiptop-purple" />
            <p className="text-sm text-gray-300">Analyzing your property data</p>
          </div>
          <Progress value={progress} className="h-1.5 bg-gray-800" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Processing information</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
      
      {/* Completed state */}
      {isComplete && (
        <div className="p-4 md:p-6">
          <p className="text-gray-300">Analysis complete. View your property monetization opportunities below.</p>
        </div>
      )}
    </motion.div>
  );
};

export default HomeModelViewer;
