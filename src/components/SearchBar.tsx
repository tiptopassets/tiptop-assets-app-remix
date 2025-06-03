
import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useAddressSearch } from '@/hooks/use-address-search';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Button } from '@/components/ui/button';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import ClearSearchButton from './search/ClearSearchButton';
import GeoLocationButton from './search/GeoLocationButton';

type SearchBarProps = {
  isCollapsed: boolean;
};

const SearchBar = ({ isCollapsed }: SearchBarProps) => {
  const { 
    address,
    setAddress,
    setIsAnalyzing,
    setAnalysisComplete,
    setAnalysisResults,
    mapInstance,
    setAddressCoordinates,
    isGeneratingAnalysis,
    mapLoaded
  } = useGoogleMap();
  
  const {
    searchInputRef,
    hasSelectedAddress,
    setHasSelectedAddress,
    analysisError,
    setAnalysisError,
    startAnalysis
  } = useAddressSearch();
  
  const { resetGeneration, capturePropertyImages } = useModelGeneration();

  // Effect to geocode address when it changes
  useEffect(() => {
    if (address && mapInstance && !hasSelectedAddress) {
      // Use a delay to avoid too many geocode requests while typing
      const debounceTimeout = setTimeout(() => {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const coordinates = {
              lat: location.lat(),
              lng: location.lng()
            };
            
            // Don't set as selected address since user is still typing
            // but update coordinates for map centering
            setAddressCoordinates(coordinates);
            mapInstance.setCenter(coordinates);
            mapInstance.setZoom(16); // Less zoom than when fully selected
          }
        });
      }, 800); // 800ms debounce
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [address, mapInstance, hasSelectedAddress, setAddressCoordinates]);

  // Clear search and reset analysis state
  const clearSearch = () => {
    setAddress('');
    setHasSelectedAddress(false);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setAnalysisError(null);
    resetGeneration();
    
    if (mapInstance) {
      mapInstance.setCenter({ lat: 37.7749, lng: -122.4194 });
      mapInstance.setZoom(12);
    }
  };

  // Handle geolocation success
  const handleLocationFound = (formattedAddress: string, coordinates: google.maps.LatLngLiteral) => {
    setAddress(formattedAddress);
    setHasSelectedAddress(true);
    setAddressCoordinates(coordinates);
    
    // Capture property images for 3D model 
    capturePropertyImages(formattedAddress, coordinates);
    
    // Start analysis
    startAnalysis();
  };

  return (
    <div className={`relative w-full ${isCollapsed ? 'max-w-md' : 'max-w-xl'} transition-all duration-500 ease-in-out`}>
      <div className="glass-effect flex items-center h-14 pl-4 pr-2 rounded-full relative overflow-hidden glow-effect">
        <Search className="text-tiptop-purple h-5 w-5 mr-2" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search your address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setHasSelectedAddress(false);
            
            // Clear error state when user starts typing again
            if (analysisError) {
              setAnalysisError(null);
            }
          }}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-300"
        />
        
        {/* Clear button - only show when has address */}
        {address && <ClearSearchButton onClear={clearSearch} />}
        
        {/* Geolocation button */}
        <GeoLocationButton 
          onLocationFound={handleLocationFound}
          disabled={isGeneratingAnalysis || !mapLoaded}
        />
        
        {/* Add light reflection effect */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
            borderRadius: 'inherit'
          }}
        ></div>
      </div>
    </div>
  );
};

export default SearchBar;
