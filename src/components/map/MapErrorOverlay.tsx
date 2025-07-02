
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';

interface MapErrorOverlayProps {
  errorMessage: string | null;
}

const MapErrorOverlay = ({ errorMessage }: MapErrorOverlayProps) => {
  const { setUseLocalAnalysis, setAnalysisError, generatePropertyAnalysis, address } = useGoogleMap();
  
  if (!errorMessage) return null;

  const isMapError = errorMessage.includes('Google Maps') || 
                    errorMessage.includes('map') || 
                    errorMessage.includes('Maps') ||
                    errorMessage.includes('API key');
  
  const handleSwitchToDemo = () => {
    setAnalysisError(null);
    setUseLocalAnalysis(true);
  };

  const handleRetry = () => {
    setAnalysisError(null);
    if (address) {
      generatePropertyAnalysis(address);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-red-500/90 max-w-md p-6 rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto border border-red-400/20">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="h-6 w-6 text-white" />
          <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
        </div>
        <p className="text-white/90 mb-4">{errorMessage}</p>
        
        <div className="space-y-2">
          <Button 
            onClick={handleRetry} 
            variant="secondary"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={handleSwitchToDemo} 
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Try Demo Mode
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapErrorOverlay;
