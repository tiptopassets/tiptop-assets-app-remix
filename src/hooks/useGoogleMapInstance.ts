
import { useEffect, useState, useRef } from 'react';
import { loadGoogleMapsWithRetry } from '@/utils/googleMapsLoader';
import { mapStyles } from '@/utils/mapStyles';
import { useToast } from '@/hooks/use-toast';

export const useGoogleMapInstance = (zoomLevel: number | undefined, setZoomLevel: ((zoom: number) => void) | undefined) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let loadingTimeout: NodeJS.Timeout;
    
    const loadMap = async () => {
      if (!mounted || !mapRef.current) return;
      
      try {
        console.log('🗺️ Starting Google Maps loading process...');
        setIsLoading(true);
        setMapLoadError(null);
        
        // Set a timeout to catch if loading takes too long
        loadingTimeout = setTimeout(() => {
          if (mounted && isLoading) {
            console.error('⏰ Google Maps loading timed out after 15 seconds');
            setMapLoadError('Google Maps loading timed out. This could be due to API key issues or network problems.');
            setIsLoading(false);
          }
        }, 15000);
        
        // Load Google Maps API with enhanced error handling
        console.log('🔄 Loading Google Maps API...');
        await loadGoogleMapsWithRetry();
        
        // Clear timeout since we successfully loaded
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        
        if (!mounted || !mapRef.current || !window.google) {
          console.log('🚫 Component unmounted or Google Maps not available');
          return;
        }
        
        console.log('✅ Google Maps API loaded, creating map instance...');
        
        // Initial San Francisco coordinates
        const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
        
        const newMap = new google.maps.Map(mapRef.current, {
          center: sanFrancisco,
          zoom: 12,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: false,
          styles: mapStyles,
          tilt: 45
        });

        // Update zoom level when map changes zoom
        if (setZoomLevel) {
          newMap.addListener('zoom_changed', () => {
            const currentZoom = newMap.getZoom();
            if (currentZoom !== undefined) {
              setZoomLevel(currentZoom);
            }
          });
        }
        
        if (mounted) {
          console.log('🎉 Map instance created successfully!');
          setMapInstance(newMap);
          setMapLoadError(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error in loadMap:", error);
        
        // Clear loading timeout
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          console.error('🔍 Detailed error analysis:', {
            errorMessage,
            errorType: typeof error,
            errorStack: error instanceof Error ? error.stack : 'No stack trace',
            windowGoogle: !!window.google,
            mapRefCurrent: !!mapRef.current
          });
          
          setMapLoadError(errorMessage);
          setIsLoading(false);
          
          // Enhanced error handling and user feedback
          if (errorMessage.includes('RefererNotAllowedMapError') || 
              errorMessage.includes('Domain restriction error')) {
            const currentDomain = window.location.hostname;
            const currentOrigin = window.location.origin;
            
            toast({
              title: "Google Maps Domain Restriction",
              description: `Please add ${currentOrigin}/* to your Google Cloud Console API key restrictions.`,
              variant: "destructive"
            });
            
            console.error(`🔒 Domain restriction details:
• Current domain: ${currentDomain}
• Current origin: ${currentOrigin}
• Add to Google Cloud Console: ${currentOrigin}/*`);
          } else if (errorMessage.includes('InvalidKeyMapError')) {
            toast({
              title: "Invalid API Key",
              description: "The Google Maps API key is invalid. Please check your configuration.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('ApiNotActivatedMapError')) {
            toast({
              title: "API Not Activated",
              description: "Please enable the Maps JavaScript API in Google Cloud Console.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('timed out')) {
            toast({
              title: "Loading Timeout",
              description: "Google Maps took too long to load. Please check your connection and API key.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error Loading Maps",
              description: "Couldn't initialize Google Maps. You can switch to Demo Mode to continue.",
              variant: "destructive"
            });
          }
          
          // Only retry for transient errors, not configuration errors
          if (!errorMessage.includes('RefererNotAllowedMapError') && 
              !errorMessage.includes('InvalidKeyMapError') &&
              !errorMessage.includes('ApiNotActivatedMapError')) {
            console.log('🔄 Scheduling retry for transient error...');
            retryTimeout = setTimeout(() => {
              if (mounted) {
                console.log('🔄 Retrying map loading...');
                loadMap();
              }
            }, 3000);
          } else {
            console.log('🚫 Not retrying due to configuration error');
          }
        }
      }
    };

    // Start loading immediately
    loadMap();

    return () => {
      console.log('🧹 Cleaning up Google Maps instance...');
      mounted = false;
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        setMapInstance(null);
      }
    };
  }, []); // Empty dependencies to prevent re-loading

  return { mapRef, mapInstance, mapLoadError, isLoading };
};
