
import { useEffect, useState, useRef } from 'react';
import { initializeGoogleMaps } from '@/utils/googleMapsLoader';
import { mapStyles } from '@/utils/mapStyles';
import { useToast } from '@/hooks/use-toast';

export const useGoogleMapInstance = (zoomLevel: number | undefined, setZoomLevel: ((zoom: number) => void) | undefined) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadMap = async () => {
      try {
        await initializeGoogleMaps();
        if (mapRef.current && window.google) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: zoomLevel || 20, // Use stored zoom level or default to 20
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles,
            tilt: 45 // Add a 45-degree tilt for better building visualization
          });

          // Update zoom level when map changes zoom
          if (setZoomLevel) {
            newMap.addListener('zoom_changed', () => {
              setZoomLevel(newMap.getZoom());
            });
          }
          
          setMapInstance(newMap);
          return newMap;
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please try again later.",
          variant: "destructive"
        });
      }
      return null;
    };

    loadMap();

    return () => {
      if (mapInstance) {
        // Clean up the map instance
        const listeners = google.maps.event.clearInstanceListeners(mapInstance);
        setMapInstance(null);
      }
    };
  }, [zoomLevel, setZoomLevel, toast]);

  const handleZoomIn = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() + 1;
      mapInstance.setZoom(newZoom);
      if (setZoomLevel) {
        setZoomLevel(newZoom);
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() - 1;
      mapInstance.setZoom(newZoom);
      if (setZoomLevel) {
        setZoomLevel(newZoom);
      }
    }
  };

  return { mapRef, mapInstance, handleZoomIn, handleZoomOut };
};
