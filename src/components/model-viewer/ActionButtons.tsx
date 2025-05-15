
import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onViewAssets: () => void;
}

const ActionButtons = ({ onViewAssets }: ActionButtonsProps) => {
  return (
    <div className="mt-8 flex justify-center">
      <Button 
        variant="outline" 
        className="w-full max-w-md"
        onClick={onViewAssets}
      >
        View Property Assets
      </Button>
    </div>
  );
};

export default ActionButtons;
