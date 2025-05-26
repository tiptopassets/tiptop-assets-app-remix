
import React, { useEffect } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import MapMarker from './map/MapMarker';
import MapControls from './map/MapControls';
import MapErrorOverlay from './map/MapErrorOverlay';
import MapVisualEffects from './map/MapVisualEffects';
import { useGoogleMapInstance } from '@/hooks/useGoogleMapInstance';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, RefreshCw } from 'lucide-react';

const GoogleMap = () => {
  const { 
    setMapInstance, 
    address, 
    isAnalyzing, 
    analysisComplete,
    setMapLoaded,
    addressCoordinates,
    setAddressCoordinates,
    analysisError,
    zoomLevel,
    setZoomLevel,
    setUseLocalAnalysis
  } = useGoogleMap();
  
  const { mapRef, mapInstance, mapLoadError, handleZoomIn, handleZoomOut } = useGoogleMapInstance(zoomLevel, setZoomLevel);

  // Effect for updating the map instance in the context
  useEffect(() => {
    if (mapInstance) {
      setMapInstance(mapInstance);
      setMapLoaded(true);
    }
  }, [mapInstance, setMapInstance, setMapLoaded]);

  // Effect for adding marker when analysis is complete
  useEffect(() => {
    if (!mapInstance || !address || !analysisComplete || isAnalyzing) return;

    // Create the geocoder to convert address to coordinates if not already available
    if (!addressCoordinates && address) {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          // Store coordinates in context and center map
          setAddressCoordinates(coordinates);
          mapInstance.setCenter(coordinates);
          mapInstance.setZoom(18);
        } else {
          console.error('Geocode was not successful:', status);
        }
      });
    }
  }, [address, mapInstance, analysisComplete, isAnalyzing, addressCoordinates, setAddressCoordinates]);

  // When we have coordinates, center and zoom the map
  useEffect(() => {
    if (mapInstance && addressCoordinates) {
      mapInstance.setCenter(addressCoordinates);
      mapInstance.setZoom(18); // Zoom in when we have an address
    }
  }, [mapInstance, addressCoordinates]);

  // Handle map loading error with improved messaging
  if (mapLoadError) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg max-w-md text-center border border-white/10">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Google Maps Unavailable</h2>
          <p className="text-white/80 mb-6">
            Unable to load Google Maps. This could be due to:
          </p>
          <ul className="text-left text-white/70 mb-6 text-sm">
            <li>• API key configuration issues</li>
            <li>• Domain restrictions</li>
            <li>• Network connectivity</li>
          </ul>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button 
              onClick={() => setUseLocalAnalysis(true)} 
              className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90"
            >
              Switch to Demo Mode
            </Button>
          </div>
        </div>
        
        {/* Fallback visuals */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/40"></div>
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-40 w-40 text-purple-400/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
      
      {/* Custom zoom controls */}
      {addressCoordinates && (
        <MapControls
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />
      )}
      
      {/* Render marker if we have coordinates and analysis is complete */}
      {mapInstance && addressCoordinates && analysisComplete && !isAnalyzing && (
        <MapMarker 
          mapInstance={mapInstance}
          coordinates={addressCoordinates}
        />
      )}
      
      {/* Error overlay when analysis fails */}
      <MapErrorOverlay errorMessage={analysisError && !isAnalyzing && address ? analysisError : null} />
      
      {/* Visual effects */}
      <MapVisualEffects />
    </div>
  );
};

export default GoogleMap;
