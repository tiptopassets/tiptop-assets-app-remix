
import React, { useEffect } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import MapMarker from './map/MapMarker';
import MapErrorOverlay from './map/MapErrorOverlay';
import MapVisualEffects from './map/MapVisualEffects';
import { useGoogleMapInstance } from '@/hooks/useGoogleMapInstance';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, RefreshCw, Settings, ExternalLink, Clock } from 'lucide-react';

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
    setUseLocalAnalysis,
    useLocalAnalysis
  } = useGoogleMap();
  
  const { mapRef, mapInstance, mapLoadError, isLoading } = useGoogleMapInstance(zoomLevel, setZoomLevel);

  // Effect for updating the map instance in the context
  useEffect(() => {
    if (mapInstance) {
      console.log('🗺️ GoogleMap: Setting map instance in context');
      setMapInstance(mapInstance);
      setMapLoaded(true);
    }
  }, [mapInstance, setMapInstance, setMapLoaded]);

  // Effect for adding marker when analysis is complete
  useEffect(() => {
    if (!mapInstance || !address || !analysisComplete || isAnalyzing) return;

    console.log('🗺️ GoogleMap: Setting up marker for completed analysis');

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
      console.log('🗺️ GoogleMap: Centering map on address coordinates');
      mapInstance.setCenter(addressCoordinates);
      mapInstance.setZoom(18);
    }
  }, [mapInstance, addressCoordinates]);

  // Show loading state while Google Maps is loading
  if (isLoading && !useLocalAnalysis) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg text-center border border-white/10 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Loading Google Maps
          </h2>
          <p className="text-white/80 mb-4">Initializing map instance...</p>
          <div className="text-sm text-white/60">
            <p>This may take a few moments if it's your first visit.</p>
          </div>
          
          {/* Option to switch to demo mode while waiting */}
          <div className="mt-6">
            <Button 
              onClick={() => setUseLocalAnalysis(true)} 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Switch to Demo Mode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error handling with detailed domain information
  if (mapLoadError && !useLocalAnalysis) {
    const isConfigError = mapLoadError.includes('API key not configured');
    const isDomainError = mapLoadError.includes('RefererNotAllowedMapError') || 
                         mapLoadError.includes('Domain restriction error') ||
                         mapLoadError.includes('domain');
    const isInvalidKeyError = mapLoadError.includes('InvalidKeyMapError');
    const isApiNotActivatedError = mapLoadError.includes('ApiNotActivatedMapError');
    const isTimeoutError = mapLoadError.includes('timed out');
    
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;
    const isPreviewDomain = currentDomain.includes('preview--') || currentDomain.includes('.lovable.app');
    
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg max-w-2xl text-center border border-white/10">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Google Maps Configuration Issue</h2>
          
          {isTimeoutError && (
            <>
              <p className="text-white/80 mb-4">
                Google Maps is taking longer than expected to load. This could be due to network issues or API configuration problems.
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="font-semibold mb-2">Possible causes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Slow network connection</li>
                  <li>Google Maps API key not configured</li>
                  <li>Domain restrictions on the API key</li>
                  <li>API quotas exceeded</li>
                </ul>
              </div>
            </>
          )}
          
          {isDomainError && (
            <>
              <p className="text-white/80 mb-4">
                The API key domain restrictions need to be updated for this domain.
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="font-semibold mb-2">Current Environment:</p>
                <p className="mb-2">Domain: <code className="bg-gray-700 px-1 rounded">{currentDomain}</code></p>
                <p className="mb-4">Origin: <code className="bg-gray-700 px-1 rounded">{currentOrigin}</code></p>
                
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Google Cloud Console</li>
                  <li>Navigate to APIs & Services → Credentials</li>
                  <li>Edit your Google Maps API key</li>
                  <li>Add these domains to restrictions:</li>
                  <li className="ml-4"><code className="bg-gray-700 px-1 rounded">{currentOrigin}/*</code></li>
                  <li className="ml-4"><code className="bg-gray-700 px-1 rounded">https://*.lovable.app/*</code></li>
                  <li className="ml-4"><code className="bg-gray-700 px-1 rounded">https://*.lovableproject.com/*</code></li>
                  {isPreviewDomain && (
                    <li className="text-yellow-300 mt-2">
                      <strong>Note:</strong> Preview domains with double dashes (--) need explicit allowlisting
                    </li>
                  )}
                  <li>Save and refresh this page</li>
                </ol>
              </div>
            </>
          )}
          
          {isConfigError && (
            <>
              <p className="text-white/80 mb-4">
                The Google Maps API key is not configured in Supabase Edge Function Secrets.
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard</li>
                  <li>Navigate to Edge Functions → Secrets</li>
                  <li>Add <code className="bg-gray-700 px-1 rounded">GOOGLE_MAPS_API_KEY</code></li>
                  <li>Set it to your Google Maps API key</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          )}
          
          {isInvalidKeyError && (
            <>
              <p className="text-white/80 mb-4">
                The provided Google Maps API key is invalid.
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your Google Cloud Console for the correct API key</li>
                  <li>Verify the key is properly copied</li>
                  <li>Update the GOOGLE_MAPS_API_KEY in Supabase secrets</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          )}
          
          {isApiNotActivatedError && (
            <>
              <p className="text-white/80 mb-4">
                The Maps JavaScript API is not activated in your Google Cloud project.
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Google Cloud Console</li>
                  <li>Navigate to APIs & Services → Library</li>
                  <li>Search for "Maps JavaScript API"</li>
                  <li>Click "Enable"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          )}
          
          {!isConfigError && !isDomainError && !isInvalidKeyError && !isApiNotActivatedError && (
            <>
              <p className="text-white/80 mb-4">
                Unable to load Google Maps. Error details:
              </p>
              <div className="text-left text-sm text-white/70 mb-6 bg-gray-800/50 p-4 rounded">
                <p className="mb-2 text-red-300">{mapLoadError}</p>
                <p className="font-semibold mb-2">This could be due to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>API key configuration issues</li>
                  <li>Domain restrictions</li>
                  <li>Network connectivity</li>
                  <li>API quotas or billing</li>
                </ul>
              </div>
            </>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button 
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Cloud Console
            </Button>
            <Button 
              onClick={() => setUseLocalAnalysis(true)} 
              className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90"
            >
              <Settings className="h-4 w-4 mr-2" />
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

  // Show fallback when using local analysis mode
  if (useLocalAnalysis) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-40 w-40 text-purple-400/20 animate-pulse" />
          </div>
          <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            Demo Mode
          </div>
        </div>
        <MapVisualEffects />
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
