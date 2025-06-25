
import React from 'react';

interface LoadingComponentProps {
  googleMapsLoadError: string | null;
  setUseLocalAnalysis: (value: boolean) => void;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  googleMapsLoadError,
  setUseLocalAnalysis
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg mb-2">Loading Google Maps...</p>
        {googleMapsLoadError && (
          <div className="mt-4 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-red-300 text-sm mb-2">Error: {googleMapsLoadError}</p>
            <button 
              onClick={() => setUseLocalAnalysis(true)}
              className="px-4 py-2 bg-tiptop-purple hover:bg-tiptop-purple/90 rounded-md text-sm transition-colors"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
