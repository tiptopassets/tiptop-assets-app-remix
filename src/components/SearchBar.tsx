
import { useState, useEffect, useRef } from 'react';

import { useAddressSearch } from '@/hooks/use-address-search';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Button } from '@/components/ui/button';
import { useModelGeneration } from '@/contexts/ModelGeneration';

import GeoLocationButton from './search/GeoLocationButton';
import PlaceAutocompleteElement from './search/PlaceAutocompleteElement';

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
    hasSelectedAddress,
    setHasSelectedAddress,
    analysisError,
    setAnalysisError,
    startAnalysis,
    applySelectedAddress,
  } = useAddressSearch();
  
  const { resetGeneration, capturePropertyImages } = useModelGeneration();


  // Handle geolocation success - simplified
  const handleLocationFound = (formattedAddress: string, coordinates: google.maps.LatLngLiteral) => {
    console.log('SearchBar: Location found:', formattedAddress, coordinates);
    setAddress(formattedAddress);
    setHasSelectedAddress(true);
    setAddressCoordinates(coordinates);
    
    // Capture property images
    capturePropertyImages(formattedAddress, coordinates);
    
    // Start analysis
    startAnalysis(formattedAddress);
  };

  return (
    <div className={`relative w-full ${isCollapsed ? 'max-w-md' : 'max-w-xl'} transition-all duration-500 ease-in-out`}>
      <div className="glass-effect flex items-center h-14 px-4 rounded-full relative overflow-hidden glow-effect">
        <PlaceAutocompleteElement
          className="flex-1 min-w-0"
          placeholder="Search your address"
          onSelect={({ address: selectedAddress, coordinates }) => {
            applySelectedAddress(selectedAddress, coordinates);
          }}
        />
        
        
        
        <GeoLocationButton 
          onLocationFound={handleLocationFound}
          disabled={isGeneratingAnalysis || !mapLoaded}
        />
        
        {/* Light reflection effect */}
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
