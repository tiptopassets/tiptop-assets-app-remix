
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
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const { capturePropertyImages } = useModelGeneration();

  // Start analysis function - simplified without dependencies
  const startAnalysis = useCallback((addressToAnalyze: string) => {
    console.log('startAnalysis: Starting analysis for address:', addressToAnalyze);

    if (analysisError) {
      setAnalysisError(null);
    }

    generatePropertyAnalysis(addressToAnalyze);
  }, [generatePropertyAnalysis, analysisError, setAnalysisError]);

  // Place change handler - simplified and more robust
  const handlePlaceChanged = useCallback(() => {
    if (!autocompleteRef.current || !mapInstance) return;
    
    try {
      const place = autocompleteRef.current.getPlace();
      console.log('handlePlaceChanged: Place data received:', place);
      
      if (!place.place_id || !place.geometry?.location || !place.formatted_address) {
        console.warn('handlePlaceChanged: Incomplete place data, showing error');
        toast({
          title: "Invalid Address",
          description: "Please select a valid address from the dropdown.",
          variant: "destructive"
        });
        return;
      }

      const formattedAddress = place.formatted_address;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const coordinates = { lat, lng };
      
      console.log('handlePlaceChanged: Processing complete place data');
      console.log('- Address:', formattedAddress);
      console.log('- Coordinates:', coordinates);
      
      // Update state synchronously
      setAddress(formattedAddress);
      setHasSelectedAddress(true);
      setAddressCoordinates(coordinates);
      
      // Center map and zoom
      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(18);
      
      // Capture property images
      capturePropertyImages(formattedAddress, coordinates);
      
      // Start analysis
      startAnalysis(formattedAddress);
      
      // Show success toast
      toast({
        title: "Address Selected",
        description: `Selected: ${formattedAddress}`,
      });
      
    } catch (error) {
      console.error('handlePlaceChanged: Error processing place:', error);
      toast({
        title: "Address Selection Error",
        description: "There was an issue selecting the address. Please try again.",
        variant: "destructive"
      });
    }
  }, [mapInstance, setAddress, setAddressCoordinates, capturePropertyImages, startAnalysis, toast, setHasSelectedAddress]);

  // Initialize Google Places Autocomplete with improved error handling
  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current) return;

    const initializeAutocomplete = async () => {
      // Clean up existing autocomplete
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }

      try {
        // Wait for Google Maps to be available
        let attempts = 0;
        while (!window.google?.maps?.places && attempts < 10) {
          console.log('Waiting for Google Places API...');
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        if (!window.google?.maps?.places) {
          throw new Error('Google Places API not available after waiting');
        }

        // Initialize the Places Autocomplete with better configuration
        autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
          componentRestrictions: { country: ['us', 'ca'] } // Restrict to US and Canada for better results
        });

        // Add event listener
        autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

        console.log('useAddressSearch: Autocomplete initialized successfully');

      } catch (error) {
        console.error("useAddressSearch: Error initializing autocomplete:", error);
        toast({
          title: "Address Search Unavailable",
          description: "Address autocomplete is temporarily unavailable. You can still enter addresses manually.",
          variant: "destructive"
        });
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [mapLoaded, mapInstance, handlePlaceChanged, toast]);

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
