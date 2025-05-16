
import React from 'react';
import { CircleCheck, Loader2 } from 'lucide-react';
import { ModelGenerationStatus } from '@/contexts/ModelGeneration/types';

interface StatusIndicatorProps {
  status: ModelGenerationStatus;
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'initializing' || status === 'capturing' || status === 'generating') {
    return (
      <div className="animate-spin text-tiptop-purple">
        <Loader2 size={24} />
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="text-green-500">
        <CircleCheck size={24} />
      </div>
    );
  }

  return null;
};
