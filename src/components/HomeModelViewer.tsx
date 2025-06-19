import React from 'react';
import { motion } from "framer-motion";
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import LoadingState from './home-model-viewer/LoadingState';
import PropertyAnalysisContent from './home-model-viewer/PropertyAnalysisContent';
import PropertyImagesDisplay from './home-model-viewer/PropertyImagesDisplay';

const HomeModelViewer = () => {
  const { 
    isAnalyzing, 
    analysisComplete, 
    analysisResults, 
    address, 
    error 
  } = useGoogleMap();

  if (isAnalyzing) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"
      >
        <h3 className="text-red-400 font-semibold mb-2">Analysis Error</h3>
        <p className="text-white/80">{error}</p>
      </motion.div>
    );
  }

  if (!analysisComplete || !analysisResults) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-7xl mx-auto space-y-6"
    >
      <PropertyAnalysisContent 
        analysisResults={analysisResults}
        address={address}
      />
      
      <PropertyImagesDisplay
        satelliteImageUrl={analysisResults.satelliteImageUrl}
        streetViewImageUrl={analysisResults.streetViewImageUrl}
        address={address}
      />
    </motion.div>
  );
};

export default HomeModelViewer;
