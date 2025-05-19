
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface MapErrorOverlayProps {
  errorMessage: string | null;
}

const MapErrorOverlay = ({ errorMessage }: MapErrorOverlayProps) => {
  if (!errorMessage) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-red-500/90 max-w-md p-6 rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-6 w-6 text-white" />
          <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
        </div>
        <p className="text-white/90">{errorMessage}</p>
      </div>
    </div>
  );
};

export default MapErrorOverlay;
