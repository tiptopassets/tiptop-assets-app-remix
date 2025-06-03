
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

    // Clean up existing autocomplete
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      // Initialize the Places Autocomplete with more specific options
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id'],
        componentRestrictions: { country: ['us', 'ca'] } // Restrict to US and Canada for better results
      });

      // Add listener for place changed with improved error handling
      const placeChangedListener = () => {
        if (!autocompleteRef.current) return;
        
        try {
          const place = autocompleteRef.current.getPlace();
          
          console.log('Place selected:', place); // Debug log
          
          if (place.geometry && place.geometry.location && place.formatted_address && mapInstance) {
            // Set the address
            const formattedAddress = place.formatted_address;
            setAddress(formattedAddress);
            setHasSelectedAddress(true);
            
            // Save coordinates
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const coordinates = { lat, lng };
            setAddressCoordinates(coordinates);
            
            console.log('Setting coordinates:', coordinates); // Debug log
            
            // Center map to selected address and zoom in to level 18
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(18);
            
            // Capture property images for 3D model generation
            capturePropertyImages(formattedAddress, coordinates);
            
            // Auto trigger analysis when address is selected
            setTimeout(() => {
              startAnalysis();
            }, 100); // Small delay to ensure state is updated
            
            toast({
              title: "Address Selected",
              description: `Selected: ${formattedAddress}`,
            });
          } else {
            console.warn('Invalid place selected:', place); // Debug log
            toast({
              title: "Invalid Address",
              description: "Please select a valid address from the dropdown.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error handling place selection:', error);
          toast({
            title: "Address Selection Error",
            description: "There was an issue selecting the address. Please try again.",
            variant: "destructive"
          });
        }
      };

      autocompleteRef.current.addListener('place_changed', placeChangedListener);

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
        autocompleteRef.current = null;
      }
    };
  }, [mapLoaded, mapInstance, setAddress, toast, setAddressCoordinates, capturePropertyImages]);

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
