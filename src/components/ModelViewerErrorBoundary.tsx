
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ModelViewerErrorBoundaryProps {
  children: React.ReactNode;
}

const ModelViewerErrorBoundary = ({ children }: ModelViewerErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Unable to Load Property Summary</h2>
            <p className="text-gray-300 mb-6">
              There was an error loading the property summary. Please try again.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Go Back Home
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ModelViewerErrorBoundary;
