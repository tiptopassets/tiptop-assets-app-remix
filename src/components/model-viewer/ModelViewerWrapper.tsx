
import React from 'react';
import ModelViewer from '@/pages/ModelViewer';
import ModelViewerErrorBoundary from '@/components/ModelViewerErrorBoundary';

const ModelViewerWrapper = () => {
  return (
    <ModelViewerErrorBoundary>
      <ModelViewer />
    </ModelViewerErrorBoundary>
  );
};

export default ModelViewerWrapper;
