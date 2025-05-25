
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

import ModelHeader from './ModelHeader';
import PropertyTypeDisplay from './PropertyTypeDisplay';
import PropertyAnalysisContent from './PropertyAnalysisContent';
import LoadingState from './LoadingState';

const HomeModelViewer = () => {
  const { 
    analysisResults, 
    isAnalyzing, 
    setHomeModelVisible, 
    address 
  } = useGoogleMap();
  
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  if (isAnalyzing) {
    return <LoadingState />;
  }

  if (!analysisResults) {
    return null;
  }

  const handleClose = () => {
    setHomeModelVisible(false);
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF report generation
    console.log('Download report functionality to be implemented');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-lg rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <ModelHeader address={address || 'Unknown Address'} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Property Type Display */}
            <PropertyTypeDisplay 
              type={analysisResults.propertyType || 'Unknown'}
              amenities={analysisResults.amenities}
            />

            {/* Analysis Content */}
            <PropertyAnalysisContent 
              analysisResults={analysisResults}
              showFullAnalysis={showFullAnalysis}
            />

            {/* Toggle Full Analysis */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                className="text-white hover:bg-white/10"
              >
                {showFullAnalysis ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Full Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeModelViewer;
