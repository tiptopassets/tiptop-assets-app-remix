
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
  const selectedPlaceRef = useRef<google.maps.places.PlaceResult | null>(null);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { capturePropertyImages } = useModelGeneration();
  const userData = useUserData();

  // Start analysis function
  const startAnalysis = useCallback((addressToAnalyze: string) => {
    console.log('startAnalysis: Starting analysis for address:', addressToAnalyze);

    if (analysisError) {
      setAnalysisError(null);
    }

    generatePropertyAnalysis(addressToAnalyze);
  }, [generatePropertyAnalysis, analysisError, setAnalysisError]);

  // Force selection helper function
  const forceSelection = useCallback(async (): Promise<google.maps.places.PlaceResult | null> => {
    if (!autocompleteRef.current || !searchInputRef.current) return null;
    
    console.log('forceSelection: Attempting to force place selection...');
    
    // Simulate Enter keypress to force selection
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true
    });
    
    searchInputRef.current.dispatchEvent(enterEvent);
    
    // Wait for Google to process the selection
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const place = autocompleteRef.current.getPlace();
    console.log('forceSelection: Place after force selection:', place);
    
    return place;
  }, []);

  // Process selected place - ONLY handle address selection, no analysis
  const processSelectedPlace = useCallback(async (place: google.maps.places.PlaceResult) => {
    if (!mapInstance || !place.formatted_address || !place.geometry?.location) return;
    
    const formattedAddress = place.formatted_address;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const coordinates = { lat, lng };
    
    console.log('processSelectedPlace: Processing place data');
    console.log('- Address:', formattedAddress);
    console.log('- Coordinates:', coordinates);
    
    // Store the selected place
    selectedPlaceRef.current = place;
    
    // Update state synchronously
    setAddress(formattedAddress);
    setHasSelectedAddress(true);
    setAddressCoordinates(coordinates);
    setIsRetrying(false);
    
    // Center map and zoom to 12 (as requested)
    mapInstance.setCenter(place.geometry.location);
    mapInstance.setZoom(12);
    
    // Clear any previous analysis errors
    if (analysisError) {
      setAnalysisError(null);
    }
    
    // Show success toast
    toast({
      title: "Address Selected",
      description: `Selected: ${formattedAddress}. Click "Analyze Now" to start analysis.`,
    });
  }, [mapInstance, setAddress, setAddressCoordinates, toast, setHasSelectedAddress, setAnalysisError]);

  // Handle autocomplete dropdown clicks with multiple fallback methods
  const handleAutocompleteClick = useCallback(async () => {
    if (!autocompleteRef.current || !searchInputRef.current) return;
    
    console.log('handleAutocompleteClick: Detected click on autocomplete item');
    setIsRetrying(true);
    
    // Method 1: Wait briefly for Google to populate the input
    await new Promise(resolve => setTimeout(resolve, 50));
    
    let place = autocompleteRef.current.getPlace();
    console.log('handleAutocompleteClick: Initial place data:', place);
    
    // Method 2: If no valid place, try multiple selection methods
    if (!place?.geometry?.location || !place.formatted_address) {
      console.log('handleAutocompleteClick: Invalid place data, trying multiple selection methods...');
      
      // Try method A: Enter keypress
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      searchInputRef.current.dispatchEvent(enterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      place = autocompleteRef.current.getPlace();
      
      // Try method B: Input event if still no place
      if (!place?.geometry?.location && searchInputRef.current.value) {
        const inputEvent = new Event('input', { bubbles: true });
        searchInputRef.current.dispatchEvent(inputEvent);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        place = autocompleteRef.current.getPlace();
      }
      
      // Try method C: Focus and blur to trigger validation
      if (!place?.geometry?.location) {
        searchInputRef.current.focus();
        searchInputRef.current.blur();
        
        await new Promise(resolve => setTimeout(resolve, 50));
        place = autocompleteRef.current.getPlace();
      }
    }
    
    // Final validation and processing
    if (place?.geometry?.location && place.formatted_address) {
      console.log('handleAutocompleteClick: Valid place data obtained, processing...');
      await processSelectedPlace(place);
    } else {
      console.error('handleAutocompleteClick: Could not obtain valid place data after all methods');
      setIsRetrying(false);
      toast({
        title: "Address Selection Failed",
        description: "Please try selecting the address again from the dropdown.",
        variant: "destructive"
      });
    }
  }, [processSelectedPlace, toast]);

  // Standard place change handler (backup for when clicks work normally)
  const handlePlaceChanged = useCallback(async () => {
    if (!autocompleteRef.current || !mapInstance) return;
    
    try {
      const place = autocompleteRef.current.getPlace();
      console.log('handlePlaceChanged: Place data received:', place);
      
      // Only process if we have complete data
      if (place.place_id && place.geometry?.location && place.formatted_address) {
        await processSelectedPlace(place);
      }
    } catch (error) {
      console.error('handlePlaceChanged: Error processing place:', error);
      setIsRetrying(false);
      toast({
        title: "Address Selection Error",
        description: "There was an issue selecting the address. Please try again.",
        variant: "destructive"
      });
    }
  }, [mapInstance, processSelectedPlace, toast]);

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

      // Add event listener for normal place_changed events
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

      // Use MutationObserver to dynamically detect .pac-container creation
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element && node.classList?.contains('pac-container')) {
              console.log('useAddressSearch: pac-container detected, adding click listener');
              node.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                if (target.closest('.pac-item')) {
                  console.log('useAddressSearch: Detected click on .pac-item');
                  setTimeout(() => {
                    handleAutocompleteClick();
                  }, 10); // Even faster response
                }
              });
            }
          });
        });
      });

      // Start observing for pac-container additions
      observer.observe(document.body, { childList: true, subtree: true });

      // Also try immediate detection in case container already exists
      const addClickListener = () => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          console.log('useAddressSearch: Found existing pac-container, adding click listener');
          pacContainer.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('.pac-item')) {
              console.log('useAddressSearch: Detected click on .pac-item');
              setTimeout(() => {
                handleAutocompleteClick();
              }, 10);
            }
          });
        }
      };

      // Check immediately and after short delays
      addClickListener();
      setTimeout(addClickListener, 100);
      setTimeout(addClickListener, 500);

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
  }, [mapLoaded, mapInstance, handlePlaceChanged, handleAutocompleteClick, toast]);

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
