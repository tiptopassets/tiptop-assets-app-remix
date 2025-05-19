
import React, { useEffect } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import MapMarker from './map/MapMarker';
import MapControls from './map/MapControls';
import MapErrorOverlay from './map/MapErrorOverlay';
import MapVisualEffects from './map/MapVisualEffects';
import { useGoogleMapInstance } from '@/hooks/useGoogleMapInstance';

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
    setZoomLevel
  } = useGoogleMap();
  
  const { mapRef, mapInstance, handleZoomIn, handleZoomOut } = useGoogleMapInstance(zoomLevel, setZoomLevel);

  // Effect for updating the map instance in the context
  useEffect(() => {
    if (mapInstance) {
      setMapInstance(mapInstance);
      setMapLoaded(true);
    }
  }, [mapInstance, setMapInstance, setMapLoaded]);

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
    }
  }, [mapInstance, addressCoordinates]);

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
