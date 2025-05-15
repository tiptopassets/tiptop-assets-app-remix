
import { useState, useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import StatusIndicator from './model-generation/StatusIndicator';
import PropertyImages from './model-generation/PropertyImages';
import ErrorUI from './model-generation/ErrorUI';
import NoSatelliteErrorDialog from './model-generation/NoSatelliteErrorDialog';
import { statusMessages, statusDescriptions } from './model-generation/StatusMessages';

const ModelGenerationSheet = () => {
  const {
    status,
    progress,
    errorMessage,
    propertyImages,
    resetGeneration,
    generateModel
  } = useModelGeneration();
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

  // Handle view model button click
  const handleViewModel = () => {
    setIsOpen(false);
    navigate('/model-viewer');
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <StatusIndicator status={status} />
              <span>{errorMessage && status === 'error' ? errorMessage : statusMessages[status]}</span>
            </SheetTitle>
            <SheetDescription>
              {statusDescriptions[status]}
            </SheetDescription>
          </SheetHeader>

          {/* Error UI */}
          {status === 'error' && !errorMessage?.toLowerCase().includes('no satellite image') && (
            <ErrorUI 
              errorMessage={errorMessage}
              propertyImages={propertyImages}
              onClose={handleClose}
              onRetry={handleRetry}
              onViewImages={handleViewModel}
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
                  onClick={handleViewModel} 
                  className="bg-tiptop-purple hover:bg-tiptop-purple/80 text-white"
                  size="lg"
                >
                  View Property Images
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
