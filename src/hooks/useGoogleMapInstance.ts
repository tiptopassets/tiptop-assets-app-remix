
import { useEffect, useState, useRef } from 'react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';
import { mapStyles } from '@/utils/mapStyles';
import { useToast } from '@/hooks/use-toast';

export const useGoogleMapInstance = (zoomLevel: number | undefined, setZoomLevel: ((zoom: number) => void) | undefined) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const loadMap = async () => {
      try {
        // Use the centralized Google Maps loader
        await loadGoogleMaps();
        
        if (!mounted || !mapRef.current || !window.google) {
          return null;
        }
        
        // Initial San Francisco coordinates
        const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
        
        const newMap = new google.maps.Map(mapRef.current, {
          center: sanFrancisco,
          zoom: 12, // Initial zoom level of 12 for city overview
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: false, // Explicitly disable zoom controls
          styles: mapStyles,
          tilt: 45 // Add a 45-degree tilt for better building visualization
        });

        // Update zoom level when map changes zoom
        if (setZoomLevel) {
          newMap.addListener('zoom_changed', () => {
            setZoomLevel(newMap.getZoom());
          });
        }
        
        // Successfully loaded the map
        if (mounted) {
          setMapLoadError(null);
          setMapInstance(newMap);
        }
        return newMap;
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        if (mounted) {
          setMapLoadError("Failed to load Google Maps. Please try switching to Demo Mode.");
          toast({
            title: "Error Loading Maps",
            description: "Couldn't initialize Google Maps. Try switching to Demo Mode.",
            variant: "destructive"
          });
        }
      }
      return null;
    };

    loadMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        // Clean up the map instance
        google.maps.event.clearInstanceListeners(mapInstance);
        setMapInstance(null);
      }
    };
  }, [zoomLevel, setZoomLevel, toast]);

  return { mapRef, mapInstance, mapLoadError };
};
