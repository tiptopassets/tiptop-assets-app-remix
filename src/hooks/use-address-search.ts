
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const { capturePropertyImages } = useModelGeneration();

  // Start analysis with optional address parameter to avoid state timing issues
  const startAnalysis = (addressToAnalyze?: string) => {
    const targetAddress = addressToAnalyze || address;
    
    if (!targetAddress) {
      console.warn('startAnalysis: No address provided for analysis');
      return;
    }

    console.log('startAnalysis: Starting analysis for address:', targetAddress);

    // Clear previous errors
    if (analysisError) {
      setAnalysisError(null);
    }

    // Use the GPT-powered analysis with the provided address
    generatePropertyAnalysis(targetAddress);
  };

  // Debounced place change handler
  const debouncedPlaceChangeHandler = useCallback((place: google.maps.places.PlaceResult) => {
    console.log('useAddressSearch: Processing debounced place:', place);
    
    // Validate that we have complete place data
    const hasCompleteData = place.place_id && 
                           place.geometry && 
                           place.geometry.location && 
                           place.formatted_address;
    
    if (hasCompleteData && mapInstance) {
      const formattedAddress = place.formatted_address;
      console.log('useAddressSearch: Processing valid place:', formattedAddress);
      
      setAddress(formattedAddress);
      setHasSelectedAddress(true);
      
      // Save coordinates
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const coordinates = { lat, lng };
      setAddressCoordinates(coordinates);
      
      console.log('useAddressSearch: Setting coordinates:', coordinates);
      
      // Center map to selected address and zoom in to level 18
      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(18);
      
      // Capture property images for 3D model generation
      capturePropertyImages(formattedAddress, coordinates);
      
      // Start analysis immediately with the formatted address
      console.log('useAddressSearch: Starting analysis for:', formattedAddress);
      startAnalysis(formattedAddress);
      
      toast({
        title: "Address Selected",
        description: `Selected: ${formattedAddress}`,
      });
    } else {
      console.warn('useAddressSearch: Incomplete place data received:', {
        hasPlaceId: !!place.place_id,
        hasGeometry: !!place.geometry,
        hasLocation: !!(place.geometry && place.geometry.location),
        hasFormattedAddress: !!place.formatted_address
      });
      
      // Only show error for places that have some data but are incomplete
      if (place.formatted_address && !hasCompleteData) {
        toast({
          title: "Invalid Address",
          description: "Please select a valid address from the dropdown.",
          variant: "destructive"
        });
      }
    }
  }, [mapInstance, setAddress, setAddressCoordinates, capturePropertyImages, startAnalysis, toast]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || !window.google) return;

    // Clean up existing autocomplete and timeout
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    try {
      // Initialize the Places Autocomplete with worldwide support
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id']
      });

      // Add debounced listener for place changed
      const placeChangedListener = () => {
        if (!autocompleteRef.current) return;
        
        try {
          const place = autocompleteRef.current.getPlace();
          
          console.log('useAddressSearch: Place change event triggered:', place);
          
          // Clear any existing timeout
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          
          // Set a new timeout to handle the place selection after a short delay
          // This ensures we only process the final, complete place data
          debounceTimeoutRef.current = setTimeout(() => {
            debouncedPlaceChangeHandler(place);
          }, 100); // 100ms delay to ensure we get the complete data
          
        } catch (error) {
          console.error('useAddressSearch: Error handling place selection:', error);
          toast({
            title: "Address Selection Error",
            description: "There was an issue selecting the address. Please try again.",
            variant: "destructive"
          });
        }
      };

      autocompleteRef.current.addListener('place_changed', placeChangedListener);

    } catch (error) {
      console.error("useAddressSearch: Error initializing Google Places Autocomplete:", error);
      toast({
        title: "Error",
        description: "Failed to load address search. Please try again later.",
        variant: "destructive"
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [mapLoaded, mapInstance, setAddress, toast, setAddressCoordinates, capturePropertyImages, generatePropertyAnalysis, debouncedPlaceChangeHandler]);

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
