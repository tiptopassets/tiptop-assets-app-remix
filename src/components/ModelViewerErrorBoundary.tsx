
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';

interface ModelViewerErrorBoundaryProps {
  children: React.ReactNode;
}

const ModelViewerErrorBoundary = ({ children }: ModelViewerErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Unable to Load Property Summary</h2>
            <p className="text-gray-300 mb-6">
              There was an error loading the property summary. This usually happens when navigating directly to this page without completing a property analysis first.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  // Clear any stale data
                  sessionStorage.removeItem('model-viewer-data');
                  window.location.href = '/';
                }}
                className="bg-tiptop-purple hover:bg-purple-700"
              >
                Start New Analysis
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ModelViewerErrorBoundary;
