
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyImages from './PropertyImages';
import { PropertyImages as PropertyImagesType } from '@/contexts/ModelGeneration';

interface ErrorUIProps {
  errorMessage: string | null;
  propertyImages: PropertyImagesType;
  onClose: () => void;
  onRetry: () => void;
  onViewImages: () => void;
}

const ErrorUI = ({ 
  errorMessage, 
  propertyImages, 
  onClose, 
  onRetry, 
  onViewImages 
}: ErrorUIProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg p-6 my-6 border border-red-200 relative"
    >
      <div className="absolute top-4 right-4">
        <X className="h-5 w-5 text-gray-400 cursor-pointer" onClick={onClose} />
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
      
      <PropertyImages satellite={propertyImages.satellite} streetView={propertyImages.streetView} />
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Button 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={onRetry}
        >
          Try Again
        </Button>
        
        <Button 
          className="bg-tiptop-purple hover:bg-tiptop-purple/90 text-white"
          onClick={onViewImages}
        >
          View Property Images
        </Button>
      </div>
    </motion.div>
  );
};

export default ErrorUI;
