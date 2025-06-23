
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
    
    const loadMap = async () => {
      if (!mounted || !mapRef.current) return;
      
      try {
        console.log('🗺️ Loading Google Maps API...');
        setIsLoading(true);
        setMapLoadError(null);
        
        // Load Google Maps API
        await loadGoogleMapsWithRetry();
        
        if (!mounted || !mapRef.current || !window.google) {
          return;
        }
        
        console.log('🗺️ Creating map instance...');
        
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
          console.log('✅ Map instance created successfully');
          setMapInstance(newMap);
          setMapLoadError(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error loading Google Maps:", error);
        
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          setMapLoadError(errorMessage);
          setIsLoading(false);
          
          // Enhanced error handling for domain restrictions
          if (errorMessage.includes('RefererNotAllowedMapError') || 
              errorMessage.includes('Domain restriction error')) {
            const currentDomain = window.location.hostname;
            const currentOrigin = window.location.origin;
            
            toast({
              title: "Google Maps Domain Restriction",
              description: `Please add ${currentOrigin}/* to your Google Cloud Console API key restrictions.`,
              variant: "destructive"
            });
            
            console.error(`🔒 Domain restriction error. Add these domains to Google Cloud Console:
• ${currentOrigin}/*
• https://*.lovable.app/*
• https://*.lovableproject.com/*

Current failing domain: ${currentDomain}`);
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
          } else {
            toast({
              title: "Error Loading Maps",
              description: "Couldn't initialize Google Maps. Try switching to Demo Mode.",
              variant: "destructive"
            });
          }
          
          // Retry after a delay for transient errors
          if (!errorMessage.includes('RefererNotAllowedMapError') && 
              !errorMessage.includes('InvalidKeyMapError')) {
            retryTimeout = setTimeout(() => {
              if (mounted) {
                console.log('🔄 Retrying map loading...');
                loadMap();
              }
            }, 3000);
          }
        }
      }
    };

    loadMap();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        setMapInstance(null);
      }
    };
  }, []); // Remove dependencies to prevent re-loading

  return { mapRef, mapInstance, mapLoadError, isLoading };
};
