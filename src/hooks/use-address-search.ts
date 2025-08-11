import { useState, useEffect, useCallback } from 'react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useUserData } from '@/hooks/useUserData';

export const useAddressSearch = () => {
  const { 
    mapInstance, 
    address, 
    setAddress,
    setAddressCoordinates,
    addressCoordinates,
    generatePropertyAnalysis,
    analysisError,
    setAnalysisError
  } = useGoogleMap();
  
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { capturePropertyImages } = useModelGeneration();
  const userData = useUserData();

  // Auto-update hasSelectedAddress when address and coordinates are available
  useEffect(() => {
    const hasValidData = !!(address && addressCoordinates);
    console.log('useAddressSearch: Checking address validity:', {
      address,
      coordinates: addressCoordinates,
      hasValidData,
      currentHasSelected: hasSelectedAddress
    });
    
    if (hasValidData && !hasSelectedAddress) {
      console.log('useAddressSearch: Auto-setting hasSelectedAddress to true');
      setHasSelectedAddress(true);
    } else if (!hasValidData && hasSelectedAddress) {
      console.log('useAddressSearch: Auto-setting hasSelectedAddress to false');
      setHasSelectedAddress(false);
    }
  }, [address, addressCoordinates, hasSelectedAddress]);

  // Start analysis function
  const startAnalysis = useCallback((addressToAnalyze: string) => {
    console.log('startAnalysis: Starting analysis for address:', addressToAnalyze);

    if (analysisError) {
      setAnalysisError(null);
    }

    generatePropertyAnalysis(addressToAnalyze);
  }, [generatePropertyAnalysis, analysisError, setAnalysisError]);

  // Apply selected address from Places Element
  const applySelectedAddress = useCallback((formattedAddress: string, coordinates: google.maps.LatLngLiteral) => {
    if (!mapInstance) return;

    console.log('applySelectedAddress: Processing address selection');
    console.log('- Address:', formattedAddress);
    console.log('- Coordinates:', coordinates);

    // Update state
    setAddress(formattedAddress);
    setHasSelectedAddress(true);
    setAddressCoordinates(coordinates);
    setIsRetrying(false);

    // Clear any previous analysis errors
    if (analysisError) {
      setAnalysisError(null);
    }

    // Center map and set zoom
    mapInstance.setCenter(coordinates);
    mapInstance.setZoom(12);

    // Show success toast
    toast({
      title: "Address Selected",
      description: `Selected: ${formattedAddress}. Click "Analyze Now" to start analysis.`,
    });
  }, [mapInstance, setAddress, setHasSelectedAddress, setAddressCoordinates, setIsRetrying, analysisError, setAnalysisError, toast]);

  return {
    address,
    setAddress,
    hasSelectedAddress,
    setHasSelectedAddress,
    analysisError,
    setAnalysisError,
    startAnalysis,
    isRetrying,
    applySelectedAddress,
  };
};