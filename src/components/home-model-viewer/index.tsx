
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import ModelHeader from './ModelHeader';
import LoadingState from './LoadingState';
import PropertyAnalysisContent from './PropertyAnalysisContent';

const HomeModelViewer = () => {
  const { status } = useModelGeneration();
  const { 
    analysisResults, 
    isGeneratingAnalysis, 
    address,
    addressCoordinates 
  } = useGoogleMap();
  const [isVisible, setIsVisible] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  const isGenerating = isGeneratingAnalysis || status === 'generating';
  const isComplete = !isGenerating && analysisResults;
  
  // Determine if we should show the component
  useEffect(() => {
    if (isGenerating || isComplete) {
      setIsVisible(true);
    }
  }, [isGenerating, isComplete]);
  
  if (!isVisible) return null;
  
  const toggleFullAnalysis = () => {
    setShowFullAnalysis(!showFullAnalysis);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto mt-8 mb-12 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 relative"
    >
      <ModelHeader 
        isGenerating={isGenerating}
        isVisible={isVisible}
        showFullAnalysis={showFullAnalysis}
        toggleFullAnalysis={toggleFullAnalysis}
        onClose={() => setIsVisible(false)}
        address={address || ''}
      />
      
      {/* Show loading state or analysis results */}
      {isGenerating ? (
        <LoadingState />
      ) : analysisResults && showFullAnalysis ? (
        <PropertyAnalysisContent 
          analysisResults={analysisResults}
          showFullAnalysis={showFullAnalysis}
          coordinates={addressCoordinates || undefined}
          address={address || undefined}
        />
      ) : null}
    </motion.div>
  );
};

export default HomeModelViewer;
