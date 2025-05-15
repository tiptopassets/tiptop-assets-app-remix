
import { useEffect, useRef } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { MapPinIcon, AlertCircle } from 'lucide-react';
import { initializeGoogleMaps } from '@/utils/googleMapsLoader';
import { mapStyles } from '@/utils/mapStyles';
import MapMarker from './map/MapMarker';

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
    setMapLoaded,
    mapInstance,
    addressCoordinates,
    setAddressCoordinates,
    analysisError
  } = useGoogleMap();
  const { toast } = useToast();

  // Effect for adding marker when analysis is complete
  useEffect(() => {
    if (!mapInstance || !address || !analysisComplete || isAnalyzing || !addressCoordinates) return;

    // Create the geocoder to convert address to coordinates if not already available
    if (!addressCoordinates) {
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
        }
      });
    }
  }, [address, mapInstance, analysisComplete, isAnalyzing, addressCoordinates, setAddressCoordinates]);

  useEffect(() => {
    const loadMap = async () => {
      try {
        await initializeGoogleMaps();
        if (mapRef.current && window.google) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 20, // Increased zoom level for better property detail
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles
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
      
      {/* Render marker if we have coordinates and analysis is complete */}
      {mapInstance && addressCoordinates && analysisComplete && !isAnalyzing && (
        <MapMarker 
          mapInstance={mapInstance}
          coordinates={addressCoordinates}
        />
      )}
      
      {/* Error overlay when analysis fails */}
      {analysisError && !isAnalyzing && address && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-red-500/90 max-w-md p-6 rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
            </div>
            <p className="text-white/90">{analysisError}</p>
          </div>
        </div>
      )}
      
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
