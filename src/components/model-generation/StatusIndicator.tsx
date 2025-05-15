
import React from 'react';
import { ModelGenerationStatus } from '@/contexts/ModelGeneration';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusIndicatorProps {
  status: ModelGenerationStatus;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
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

export default StatusIndicator;
