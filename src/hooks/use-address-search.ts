
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useUserData } from '@/hooks/useUserData';

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
  const retryCountRef = useRef(0);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { capturePropertyImages } = useModelGeneration();
  const userData = useUserData();
  const maxRetries = 3;

  // Start analysis function
  const startAnalysis = useCallback((addressToAnalyze: string) => {
    console.log('startAnalysis: Starting analysis for address:', addressToAnalyze);

    if (analysisError) {
      setAnalysisError(null);
    }

    generatePropertyAnalysis(addressToAnalyze);
  }, [generatePropertyAnalysis, analysisError, setAnalysisError]);

  // Place change handler with automatic retry logic
  const handlePlaceChanged = useCallback(async () => {
    if (!autocompleteRef.current || !mapInstance) return;
    
    try {
      const place = autocompleteRef.current.getPlace();
      console.log('handlePlaceChanged: Place data received:', place);
      
      // Check if place data is incomplete
      if (!place.place_id || !place.geometry?.location || !place.formatted_address) {
        console.warn('handlePlaceChanged: Incomplete place data, attempting automatic retry...');
        
        // If we haven't exceeded max retries, automatically retry
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setIsRetrying(true);
          
          console.log(`Auto-retry attempt ${retryCountRef.current}/${maxRetries} in 150ms...`);
          
          // Retry after a short delay to let Google's autocomplete settle
          setTimeout(() => {
            handlePlaceChanged();
          }, 150);
          return;
        }
        
        // Exceeded max retries, show error and reset
        console.error('handlePlaceChanged: Max retries exceeded, showing error');
        setIsRetrying(false);
        retryCountRef.current = 0;
        toast({
          title: "Invalid Address",
          description: "Please select a valid address from the dropdown.",
          variant: "destructive"
        });
        return;
      }

      // Success! Reset retry counter and state
      console.log('handlePlaceChanged: Place data complete, proceeding...');
      retryCountRef.current = 0;
      setIsRetrying(false);

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
      
      // Save address to database in background
      try {
        await userData.saveAddress(formattedAddress, coordinates, formattedAddress);
        console.log('Address saved to database');
      } catch (error) {
        console.error('Failed to save address to database:', error);
        // Don't show error as this is a background operation
      }
      
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
      setIsRetrying(false);
      retryCountRef.current = 0;
      toast({
        title: "Address Selection Error",
        description: "There was an issue selecting the address. Please try again.",
        variant: "destructive"
      });
    }
  }, [mapInstance, setAddress, setAddressCoordinates, capturePropertyImages, startAnalysis, toast, setHasSelectedAddress, userData, isRetrying]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || !window.google) return;

    // Clean up existing autocomplete
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      // Initialize the Places Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id']
      });

      // Add event listener
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

      console.log('useAddressSearch: Autocomplete initialized successfully');

    } catch (error) {
      console.error("useAddressSearch: Error initializing autocomplete:", error);
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
    startAnalysis,
    isRetrying
  };
};
