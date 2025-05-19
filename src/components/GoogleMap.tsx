
import React, { useEffect, useState } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import MapMarker from './map/MapMarker';
import MapControls from './map/MapControls';
import MapErrorOverlay from './map/MapErrorOverlay';
import MapVisualEffects from './map/MapVisualEffects';
import { useGoogleMapInstance } from '@/hooks/useGoogleMapInstance';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    setAnalysisError,
    zoomLevel,
    setZoomLevel,
    setUseLocalAnalysis,
    useLocalAnalysis
  } = useGoogleMap();
  
  const { mapRef, mapInstance, mapLoadError, handleZoomIn, handleZoomOut } = useGoogleMapInstance(zoomLevel, setZoomLevel);
  const [isMapInitializing, setIsMapInitializing] = useState(true);
  const { toast } = useToast();

  // Effect for updating the map instance in the context
  useEffect(() => {
    if (mapInstance) {
      setMapInstance(mapInstance);
      setMapLoaded(true);
      setIsMapInitializing(false);
    }
  }, [mapInstance, setMapInstance, setMapLoaded]);

  // Effect for adding marker when analysis is complete
  useEffect(() => {
    if (!mapInstance || !address || !analysisComplete || isAnalyzing || !addressCoordinates) return;

    // Create the geocoder to convert address to coordinates if not already available
    if (!addressCoordinates) {
      try {
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
            
            // If geocoding fails, show toast and switch to demo mode
            toast({
              title: "Address Not Found",
              description: "Couldn't locate the address on the map. Using alternative analysis method.",
              variant: "destructive"
            });
            
            setTimeout(() => {
              setUseLocalAnalysis(true);
            }, 500);
          }
        });
      } catch (error) {
        console.error("Error during geocoding:", error);
        // If geocoding throws an error, switch to demo mode
        setTimeout(() => {
          setUseLocalAnalysis(true);
        }, 500);
      }
    }
  }, [address, mapInstance, analysisComplete, isAnalyzing, addressCoordinates, setAddressCoordinates, toast, setUseLocalAnalysis]);

  // When we have coordinates, center and zoom the map
  useEffect(() => {
    if (mapInstance && addressCoordinates) {
      mapInstance.setCenter(addressCoordinates);
    }
  }, [mapInstance, addressCoordinates]);

  // Effect to automatically switch to demo mode when there's a map error
  useEffect(() => {
    if (mapLoadError && !useLocalAnalysis) {
      const timer = setTimeout(() => {
        setUseLocalAnalysis(true);
        toast({
          title: "Switched to Demo Mode",
          description: "Using local analysis due to map loading issues.",
        });
      }, 4000); // Give user time to read the error before auto-switching
      
      return () => clearTimeout(timer);
    }
  }, [mapLoadError, useLocalAnalysis, setUseLocalAnalysis, toast]);

  // Handle map loading error
  if (mapLoadError) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg max-w-md text-center border border-white/10">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Google Maps Error</h2>
          <p className="text-white/80 mb-4">
            {mapLoadError}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setUseLocalAnalysis(true)} 
              className="bg-tiptop-purple hover:bg-tiptop-purple/90 w-full"
            >
              Switch to Demo Mode
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-white/20 text-white/90 hover:bg-white/10"
            >
              Refresh Page
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

  // Initial loading state
  if (isMapInitializing) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-tiptop-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading Map...</p>
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
      <MapErrorOverlay 
        errorMessage={analysisError && !isAnalyzing && address ? analysisError : null} 
      />
      
      {/* Visual effects */}
      <MapVisualEffects />
      
      {/* Demo mode indicator */}
      {useLocalAnalysis && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium z-20">
          Demo Mode
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
