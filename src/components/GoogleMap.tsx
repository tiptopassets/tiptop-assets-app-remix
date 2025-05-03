
import { useEffect, useRef } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '@/hooks/use-toast';
import { MapPinIcon } from 'lucide-react';

// Replace with your API key
const API_KEY = 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';

declare global {
  interface Window {
    google: typeof google;
  }
}

const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { 
    setMapInstance, 
    address, 
    isAnalyzing, 
    analysisComplete,
    setMapLoaded,
    mapInstance
  } = useGoogleMap();
  const { toast } = useToast();

  // Effect for adding marker when address changes
  useEffect(() => {
    if (!mapInstance || !address) return;

    // If there's already a marker, remove it
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create the geocoder to convert address to coordinates
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        
        // Create custom marker element with glowing effect
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-pin';
        markerElement.innerHTML = `
          <div class="pin-glow"></div>
          <div class="pin-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `;
        
        // Create custom marker
        markerRef.current = new google.maps.Marker({
          position: location,
          map: mapInstance,
          animation: google.maps.Animation.DROP,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#9333EA" stroke="#ffffff" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#9333EA" stroke-width="0.5"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 40)
          }
        });

        // Add a glowing effect to the marker
        const pulseDiv = document.createElement('div');
        pulseDiv.className = 'map-marker-pulse';
        pulseDiv.style.position = 'absolute';
        pulseDiv.style.transform = 'translate(-50%, -50%)';
        pulseDiv.style.width = '40px';
        pulseDiv.style.height = '40px';
        pulseDiv.style.borderRadius = '50%';
        pulseDiv.style.backgroundColor = 'rgba(147, 51, 234, 0.4)';
        pulseDiv.style.animation = 'pulse 2s infinite';

        // Add a style element for the pulse animation
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.5);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(styleElement);
        
        // Center map on the address with some animation
        mapInstance.panTo(location);
        mapInstance.setZoom(18);
      }
    });
  }, [address, mapInstance]);

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
