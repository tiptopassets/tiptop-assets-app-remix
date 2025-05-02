
import { useEffect, useRef } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '@/hooks/use-toast';

// Replace with your API key
const API_KEY = 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';

declare global {
  interface Window {
    google: typeof google;
  }
}

const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { 
    setMapInstance, 
    address, 
    isAnalyzing, 
    analysisComplete,
    setMapLoaded
  } = useGoogleMap();
  const { toast } = useToast();

  useEffect(() => {
    const loadMap = async () => {
      const loader = new Loader({
        apiKey: API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        if (mapRef.current && window.google) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 },  // Default to San Francisco
            zoom: 12,
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [
                  { color: "#336699" },
                  { lightness: 30 }
                ]
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [
                  { saturation: -30 },
                  { lightness: 10 }
                ]
              }
            ]
          });
          setMapInstance(newMap);
          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please try again later.",
          variant: "destructive"
        });
      }
    };

    loadMap();

    return () => {
      setMapInstance(null);
    };
  }, [setMapInstance, setMapLoaded, toast]);

  return (
    <div 
      className="absolute inset-0 z-0" 
      style={{ 
        height: "100vh",
        width: "100%"
      }}
    >
      <div 
        ref={mapRef} 
        id="map" 
        className="h-full w-full"
      />
      {/* Enhanced gradient overlay with glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 pointer-events-none" 
           style={{mixBlendMode: 'overlay'}} />
      {/* Add a subtle light glow at the top */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.2) 0%, transparent 70%)',
           }} 
      />
    </div>
  );
};

export default GoogleMap;
