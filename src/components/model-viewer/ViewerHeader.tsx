
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ViewerHeaderProps {
  onClose: () => void;
}

const ViewerHeader = ({ onClose }: ViewerHeaderProps) => {
  return (
    <header className="p-4 md:p-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-tiptop-purple">Property Images</h1>
        <p className="text-sm text-gray-400">View captured images of your property</p>
      </div>
      <Button 
        variant="ghost" 
        onClick={onClose}
        className="text-gray-300 hover:text-white"
      >
        <X className="mr-2 h-4 w-4" />
        Close
      </Button>
    </header>
  );
};

export default ViewerHeader;
