
import { useState, useEffect } from 'react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';
import { useToast } from "@/hooks/use-toast";

export const useGoogleMapsInitialization = () => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsLoadError, setGoogleMapsLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const initializeGoogleMaps = async () => {
      try {
        console.log('🗺️ Loading Google Maps API...');
        await loadGoogleMaps();
        
        if (mounted) {
          console.log('✅ Google Maps API loaded successfully');
          setIsGoogleMapsLoaded(true);
          setGoogleMapsLoadError(null);
        }
      } catch (error) {
        console.error('❌ Failed to load Google Maps API:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          setGoogleMapsLoadError(errorMessage);
          
          toast({
            title: "Google Maps Unavailable",
            description: "Switching to demo mode. Some features may be limited.",
            variant: "destructive"
          });
        }
      }
    };

    initializeGoogleMaps();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return {
    isGoogleMapsLoaded,
    googleMapsLoadError,
    setUseLocalAnalysis: (value: boolean) => {
      // This will be passed from the main provider
    }
  };
};
