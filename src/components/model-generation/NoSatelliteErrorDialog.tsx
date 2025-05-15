
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NoSatelliteErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onRetry: () => void;
}

const NoSatelliteErrorDialog = ({ 
  open, 
  onOpenChange, 
  onClose, 
  onRetry 
}: NoSatelliteErrorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>No satellite image available</DialogTitle>
          <DialogDescription>
            We couldn't capture a satellite image for your property. This might be due to:
            <ul className="list-disc pl-5 mt-2">
              <li>Google Maps API restrictions</li>
              <li>The address being outside of covered regions</li>
              <li>Temporary service disruption</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-100 rounded-lg p-4 relative">
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Satellite View
              </div>
              <div className="flex justify-center items-center h-32">
                <img 
                  src="/lovable-uploads/8fb0c257-98c2-4556-8f54-3de3473c2227.png" 
                  alt="No Satellite View"
                  className="h-24 w-auto" 
                />
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 relative">
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Street View
              </div>
              <div className="flex justify-center items-center h-32">
                <img 
                  src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
                  alt="Placeholder P"
                  className="h-24 w-auto" 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full py-6"
            >
              Cancel
            </Button>
            
            <Button 
              onClick={onRetry}
              className="w-full py-6 bg-red-500 hover:bg-red-600 text-white text-lg font-medium"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoSatelliteErrorDialog;
