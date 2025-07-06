
import { useState, useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import { StatusIndicator } from './model-generation/StatusIndicator';
import PropertyImages from './model-generation/PropertyImages';
import ErrorUI from './model-generation/ErrorUI';
import NoSatelliteErrorDialog from './model-generation/NoSatelliteErrorDialog';

const ModelGenerationSheet = () => {
  const {
    status,
    progress,
    errorMessage,
    propertyImages,
    resetGeneration,
    generateModel
  } = useModelGeneration();
  
  const { analysisResults } = useGoogleMap();
  
  const [isVisible, setIsVisible] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show the banner when status changes from idle to any active state
    if (status !== 'idle') {
      setIsVisible(true);
    }

    // Show the error dialog when status is error and the error is about missing satellite image
    if (status === 'error' && errorMessage?.toLowerCase().includes('no satellite image')) {
      setShowErrorDialog(true);
    }
  }, [status, errorMessage]);

  // Handle view insights button click
  const handleViewInsights = () => {
    setIsVisible(false);
  };

  // Handle retry button click for error state
  const handleRetry = () => {
    setShowErrorDialog(false);
    generateModel();
  };

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    setShowErrorDialog(false);
    resetGeneration();
  };

  // Get the appropriate title and description for the current state
  const getStatusContent = () => {
    if (status === 'error') {
      return {
        title: errorMessage || "Analysis Error",
        description: "There was a problem analyzing your property."
      };
    }
    
    if (status === 'capturing') {
      return {
        title: "Capturing Property Images",
        description: "Getting high-resolution images..."
      };
    }
    
    if (status === 'generating') {
      return {
        title: "Analyzing Property",
        description: "Our AI is analyzing your property..."
      };
    }
    
    if (status === 'completed') {
      return {
        title: "Property Analysis Complete",
        description: "We've found monetization opportunities for your property."
      };
    }
    
    return {
      title: "Property Analysis",
      description: "Analyzing your property data."
    };
  };
  
  const { title, description } = getStatusContent();

  return (
    <>
      {/* Horizontal Banner positioned above the analysis card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl mx-auto px-4"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <StatusIndicator status={status} />
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              {/* Progress indicator */}
              {(status === 'capturing' || status === 'generating') && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-tiptop-purple h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">{progress}%</p>
                </div>
              )}

              {/* Content - Horizontal Layout */}
              <div className="flex items-center gap-4">
                {/* Property images - smaller in horizontal layout */}
                {status !== 'error' && (propertyImages.satellite || propertyImages.streetView) && (
                  <div className="flex gap-2 flex-shrink-0">
                    {propertyImages.satellite && (
                      <img 
                        src={propertyImages.satellite} 
                        alt="Satellite view" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    {propertyImages.streetView && (
                      <img 
                        src={propertyImages.streetView} 
                        alt="Street view" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                  </div>
                )}

                {/* Analysis Results Summary (when complete) */}
                {status === 'completed' && analysisResults && (
                  <div className="flex-grow">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Monthly Revenue</p>
                        <p className="text-lg font-bold text-green-600">
                          ${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Opportunities</p>
                        <p className="text-lg font-bold">{analysisResults.topOpportunities.length}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {status === 'completed' && (
                  <Button 
                    onClick={handleViewInsights} 
                    className="bg-tiptop-purple hover:bg-tiptop-purple/80 text-white flex-shrink-0"
                  >
                    View Analysis
                  </Button>
                )}

                {/* Error state content */}
                {status === 'error' && !errorMessage?.toLowerCase().includes('no satellite image') && (
                  <div className="flex-grow flex items-center justify-between">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleRetry}>
                        Retry
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleClose}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* No Satellite Image Error Dialog */}
      <NoSatelliteErrorDialog 
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        onClose={handleClose}
        onRetry={handleRetry}
      />
    </>
  );
};

export default ModelGenerationSheet;
