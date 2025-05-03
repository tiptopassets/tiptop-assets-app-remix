
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
    mapInstance,
    addressCoordinates,
    setAddressCoordinates
  } = useGoogleMap();
  const { toast } = useToast();

  // Effect for adding marker when analysis is complete
  useEffect(() => {
    if (!mapInstance || !address || !analysisComplete || isAnalyzing) return;

    // If there's already a marker, remove it
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create the geocoder to convert address to coordinates
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        // Store coordinates in context
        setAddressCoordinates(coordinates);
        
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

        // Add a pulsing glow effect around the pin
        const pinGlowOverlay = new google.maps.OverlayView();
        pinGlowOverlay.onAdd = function() {
          const div = document.createElement('div');
          div.className = 'map-pin-glow';
          div.style.position = 'absolute';
          div.style.width = '60px';
          div.style.height = '60px';
          div.style.borderRadius = '50%';
          div.style.background = 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, rgba(147, 51, 234, 0) 70%)';
          div.style.animation = 'pulse-glow 2s infinite';
          
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            @keyframes pulse-glow {
              0% {
                transform: scale(0.8);
                opacity: 1;
              }
              70% {
                transform: scale(1.2);
                opacity: 0.7;
              }
              100% {
                transform: scale(0.8);
                opacity: 1;
              }
            }
          `;
          document.head.appendChild(styleElement);
          
          this.getPanes().overlayMouseTarget.appendChild(div);
          this.div_ = div;
        };
        
        pinGlowOverlay.draw = function() {
          if (!this.div_) return;
          const position = this.getProjection().fromLatLngToDivPixel(location);
          if (position) {
            this.div_.style.left = (position.x - 30) + 'px';
            this.div_.style.top = (position.y - 30) + 'px';
          }
        };
        
        pinGlowOverlay.setMap(mapInstance);
        
        // Center map on the address with smooth animation
        mapInstance.panTo(location);
        mapInstance.setZoom(18);
      }
    });
  }, [address, mapInstance, analysisComplete, isAnalyzing, setAddressCoordinates]);

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
