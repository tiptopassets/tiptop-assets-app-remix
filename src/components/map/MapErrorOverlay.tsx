
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { toast } from '@/hooks/use-toast';

interface MapErrorOverlayProps {
  errorMessage: string | null;
}

const MapErrorOverlay = ({ errorMessage }: MapErrorOverlayProps) => {
  const { setUseLocalAnalysis, generatePropertyAnalysis, address } = useGoogleMap();
  
  if (!errorMessage) return null;

  const isMapError = errorMessage.includes('Google Maps') || 
                    errorMessage.includes('map') || 
                    errorMessage.includes('Maps');
  
  const isAPIError = errorMessage.includes('API') || 
                     errorMessage.includes('quota') || 
                     errorMessage.includes('key');
  
  const handleSwitchToDemo = () => {
    setUseLocalAnalysis(true);
    toast({
      title: "Switched to Demo Mode",
      description: "Using simulated data for property analysis."
    });
  };
  
  const handleRetry = () => {
    if (address) {
      toast({
        title: "Retrying Analysis",
        description: "Attempting to analyze property again."
      });
      generatePropertyAnalysis(address);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-red-500/90 max-w-md p-6 rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-6 w-6 text-white" />
          <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
        </div>
        <p className="text-white/90 mb-4">{errorMessage}</p>
        
        <div className="flex flex-col gap-2">
          {(isMapError || isAPIError) && (
            <Button 
              onClick={handleSwitchToDemo} 
              variant="secondary"
              className="w-full"
            >
              Switch to Demo Mode
            </Button>
          )}
          
          <Button 
            onClick={handleRetry} 
            variant={isMapError || isAPIError ? "outline" : "secondary"}
            className={isMapError || isAPIError ? "border-white/20 text-white hover:bg-white/10 w-full" : "w-full"}
          >
            Retry Analysis
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 w-full"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapErrorOverlay;
