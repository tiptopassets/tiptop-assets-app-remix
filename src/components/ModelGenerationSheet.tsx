
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
  
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show the error dialog when status is error and the error is about missing satellite image
    if (status === 'error' && errorMessage?.toLowerCase().includes('no satellite image')) {
      setShowErrorDialog(true);
    }
  }, [status, errorMessage]);

  // Handle view insights button click
  const handleViewInsights = () => {
    // Close the banner by resetting the generation status
    resetGeneration();
  };

  // Handle retry button click for error state
  const handleRetry = () => {
    setShowErrorDialog(false);
    generateModel();
  };

  // Handle close button click
  const handleClose = () => {
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
      {/* Main banner content */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <StatusIndicator status={status} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg md:text-xl truncate">{title}</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0 flex-shrink-0 ml-2"
            >
              ✕
            </Button>
          </div>

          {/* Progress indicator with integrated images */}
          {(status === 'capturing' || status === 'generating') && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                {/* Property images on the left - show placeholder or actual images */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* Always show placeholders during progress, replace with actual images when available */}
                  <div className="relative">
                    <img 
                      src={propertyImages.satellite || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&h=100&fit=crop&crop=center"} 
                      alt="Satellite view" 
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] md:text-[10px] px-1 py-0.5 rounded">
                      Satellite
                    </span>
                  </div>
                  <div className="relative">
                    <img 
                      src={propertyImages.streetView || "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=100&h=100&fit=crop&crop=center"} 
                      alt="Street view" 
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[8px] md:text-[10px] px-1 py-0.5 rounded">
                      Street
                    </span>
                  </div>
                </div>
                
                {/* Centered progress bar */}
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3">
                    <div 
                      className="bg-tiptop-purple h-2 md:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">{progress}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Content - Responsive Layout */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">

            {/* Analysis Results Summary (when complete) */}
            {status === 'completed' && analysisResults && (
              <div className="flex-grow order-2 md:order-none">
                <div className="flex items-center justify-center gap-6 md:gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Monthly Revenue</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      ${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Opportunities</p>
                    <p className="text-xl md:text-2xl font-bold text-tiptop-purple">{analysisResults.topOpportunities.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {status === 'completed' && (
              <Button 
                onClick={handleViewInsights} 
                className="bg-tiptop-purple hover:bg-tiptop-purple/80 text-white px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium flex-shrink-0 order-3 md:order-none w-full md:w-auto"
              >
                View Analysis
              </Button>
            )}

            {/* Error state content */}
            {status === 'error' && !errorMessage?.toLowerCase().includes('no satellite image') && (
              <div className="flex-grow flex flex-col items-center justify-center gap-3 order-2 md:order-none">
                <p className="text-red-600 text-sm text-center">{errorMessage}</p>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="w-full md:w-auto">
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClose} className="w-full md:w-auto">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
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
