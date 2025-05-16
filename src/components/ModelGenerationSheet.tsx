
import { useState, useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
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
  
  const [isOpen, setIsOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Open the sheet when status changes from idle to any active state
    if (status !== 'idle') {
      setIsOpen(true);
    }

    // Show the error dialog when status is error and the error is about missing satellite image
    if (status === 'error' && errorMessage?.toLowerCase().includes('no satellite image')) {
      setShowErrorDialog(true);
    }
  }, [status, errorMessage]);

  // Handle view insights button click
  const handleViewInsights = () => {
    setIsOpen(false);
  };

  // Handle retry button click for error state
  const handleRetry = () => {
    setShowErrorDialog(false);
    generateModel();
  };

  // Handle close button click
  const handleClose = () => {
    setIsOpen(false);
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
        description: "Getting high-resolution satellite and street view images."
      };
    }
    
    if (status === 'generating') {
      return {
        title: "Analyzing Property",
        description: "Our AI is analyzing your property images and data."
      };
    }
    
    if (status === 'completed') {
      return {
        title: "Property Analysis Complete",
        description: "We've analyzed your property and found monetization opportunities."
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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <StatusIndicator status={status} />
              <span>{title}</span>
            </SheetTitle>
            <SheetDescription>
              {description}
            </SheetDescription>
          </SheetHeader>

          {/* Error UI */}
          {status === 'error' && !errorMessage?.toLowerCase().includes('no satellite image') && (
            <ErrorUI 
              errorMessage={errorMessage}
              propertyImages={propertyImages}
              onClose={handleClose}
              onRetry={handleRetry}
              onViewImages={handleViewInsights}
            />
          )}

          {/* Progress indicator */}
          {(status === 'capturing' || status === 'generating') && (
            <div className="my-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-right mt-1 text-gray-500">{progress}%</p>
            </div>
          )}

          {/* Property images */}
          {status !== 'error' && (
            <PropertyImages satellite={propertyImages.satellite} streetView={propertyImages.streetView} />
          )}

          {/* Analysis Results (when complete) */}
          {status === 'completed' && analysisResults && (
            <div className="mt-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Property Analysis Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Based on our analysis, your property has the following monetization potential:
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-lg font-bold text-green-600">
                      ${analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Opportunities</p>
                    <p className="text-lg font-bold">{analysisResults.topOpportunities.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to action */}
          <div className="mt-8">
            {status === 'completed' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <Button 
                  onClick={handleViewInsights} 
                  className="bg-tiptop-purple hover:bg-tiptop-purple/80 text-white"
                  size="lg"
                >
                  View Full Analysis
                </Button>
              </motion.div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
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
