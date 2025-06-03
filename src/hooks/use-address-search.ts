
import { useState, useEffect, useRef } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { useModelGeneration } from '@/contexts/ModelGeneration';

export const useAddressSearch = () => {
  const { 
    mapInstance, 
    address, 
    setAddress,
    mapLoaded,
    setAddressCoordinates,
    generatePropertyAnalysis,
    analysisError,
    setAnalysisError
  } = useGoogleMap();
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const { capturePropertyImages } = useModelGeneration();
  const lastProcessedAddressRef = useRef<string>('');

  // Start analysis when an address is selected
  const startAnalysis = () => {
    if (!address) {
      return;
    }

    // Clear previous errors
    if (analysisError) {
      setAnalysisError(null);
    }

    // Use the GPT-powered analysis 
    generatePropertyAnalysis(address);
  };

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || !window.google) return;

    try {
      // Initialize the Places Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry']
      });

      // Add listener for place changed
      autocompleteRef.current.addListener('place_changed', () => {
        if (!autocompleteRef.current) return;
        
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location && mapInstance) {
          const formattedAddress = place.formatted_address || '';
          
          // Prevent duplicate processing of the same address
          if (lastProcessedAddressRef.current === formattedAddress) {
            console.log('Duplicate address selection prevented:', formattedAddress);
            return;
          }
          
          lastProcessedAddressRef.current = formattedAddress;
          
          // Set the address
          setAddress(formattedAddress);
          setHasSelectedAddress(true);
          
          // Save coordinates
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const coordinates = { lat, lng };
          setAddressCoordinates(coordinates);
          
          // Center map to selected address and zoom in to level 18
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(18);
          
          // Capture property images for 3D model generation
          capturePropertyImages(formattedAddress, coordinates);
          
          console.log('Address selected and processed:', formattedAddress);
        }
      });
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
      toast({
        title: "Error",
        description: "Failed to load address search. Please try again later.",
        variant: "destructive"
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [mapLoaded, mapInstance, setAddress, toast, setAddressCoordinates, capturePropertyImages]);

  // Effect to center map on address when typed (even before selection)
  useEffect(() => {
    if (address && mapLoaded && mapInstance && !hasSelectedAddress) {
      // Use geocoder to get coordinates from address string
      const geocoder = new google.maps.Geocoder();
      const debounceTimeout = setTimeout(() => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            mapInstance.setCenter(location);
            // Use a zoom level of 16 for partial matches (not as zoomed as full selection)
            mapInstance.setZoom(16);
          }
        });
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimeout);
    }
  }, [address, mapInstance, mapLoaded, hasSelectedAddress]);

  // Reset last processed address when address is cleared
  useEffect(() => {
    if (!address) {
      lastProcessedAddressRef.current = '';
    }
  }, [address]);

  return {
    searchInputRef,
    address,
    setAddress,
    hasSelectedAddress,
    setHasSelectedAddress,
    analysisError,
    setAnalysisError,
    startAnalysis
  };
};
