
import { useState, useEffect } from 'react';
import { useModelGeneration, ModelGenerationStatus } from '@/contexts/ModelGenerationContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Loader, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ModelGenerationSheet = () => {
  const {
    status,
    progress,
    errorMessage,
    propertyImages,
    modelUrl,
    resetGeneration,
    generateModel
  } = useModelGeneration();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Open the sheet when status changes from idle to any active state
    if (status !== 'idle') {
      setIsOpen(true);
    }
  }, [status]);

  // Handle view model button click
  const handleViewModel = () => {
    setIsOpen(false);
    navigate('/model-viewer');
  };

  // Handle retry button click for error state
  const handleRetry = () => {
    generateModel();
  };

  // Handle close button click
  const handleClose = () => {
    setIsOpen(false);
    resetGeneration();
  };

  const statusMessages: Record<ModelGenerationStatus, string> = {
    idle: 'Ready to start',
    initializing: 'Preparing property analysis...',
    capturing: 'Capturing property images...',
    generating: 'Generating 3D model...',
    completed: '3D model generation complete!',
    error: errorMessage || 'Failed to generate 3D model. Please try again.'
  };

  const statusDescriptions: Record<ModelGenerationStatus, string> = {
    idle: '',
    initializing: 'Setting up the analysis environment',
    capturing: 'Taking satellite and street view images of your property',
    generating: 'Creating a detailed 3D model based on property images',
    completed: 'Your property model is ready to view',
    error: 'There was a problem generating your property model'
  };

  const renderImages = () => {
    if (!propertyImages.satellite && !propertyImages.streetView) return null;
    
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {propertyImages.satellite && (
          <div className="relative overflow-hidden rounded-lg">
            <p className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">Satellite View</p>
            <img 
              src={propertyImages.satellite} 
              alt="Satellite view of property"
              className="w-full h-48 object-cover" 
            />
          </div>
        )}
        {propertyImages.streetView && (
          <div className="relative overflow-hidden rounded-lg">
            <p className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">Street View</p>
            <img 
              src={propertyImages.streetView} 
              alt="Street view of property"
              className="w-full h-48 object-cover" 
            />
          </div>
        )}
      </div>
    );
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'initializing':
      case 'capturing':
      case 'generating':
        return <Loader className="h-8 w-8 animate-spin text-tiptop-purple" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  // Error UI for when model generation fails
  const renderErrorUI = () => {
    if (status !== 'error') return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg p-6 my-6 border border-red-200 relative"
      >
        <div className="absolute top-4 right-4">
          <X className="h-5 w-5 text-gray-400 cursor-pointer" onClick={handleClose} />
        </div>
        
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Failed to generate 3D model. Please try again.</h3>
            <p className="text-gray-600 mt-1">{errorMessage || 'There was a problem generating your property model'}</p>
          </div>
        </div>
        
        {renderImages()}
        
        <Button 
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white"
          onClick={handleRetry}
        >
          Try Again
        </Button>
      </motion.div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            {renderStatusIcon()}
            <span>{statusMessages[status]}</span>
          </SheetTitle>
          <SheetDescription>
            {statusDescriptions[status]}
          </SheetDescription>
        </SheetHeader>

        {/* Error UI */}
        {renderErrorUI()}

        {/* Progress indicator */}
        {(status === 'capturing' || status === 'generating') && (
          <div className="my-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-right mt-1 text-gray-500">{progress}%</p>
          </div>
        )}

        {/* Property images */}
        {status !== 'error' && renderImages()}

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
                View 3D Model
              </Button>
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModelGenerationSheet;
