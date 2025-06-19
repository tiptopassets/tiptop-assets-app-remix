
import React, { createContext, useState, useCallback } from 'react';
import { GoogleMapContextType, GoogleMapState, AnalysisResults } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveAddress } from '@/services/userAddressService';
import { savePropertyAnalysis } from '@/services/userAnalysisService';

// Create the context
export const GoogleMapContext = createContext<GoogleMapContextType | undefined>(undefined);

const initialState: GoogleMapState = {
  map: null,
  address: '',
  coordinates: null,
  selectedPlace: null,
  isAnalyzing: false,
  analysisComplete: false,
  analysisResults: null,
  error: null
};

export const GoogleMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GoogleMapState>(initialState);
  
  // Additional state for extended functionality
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addressCoordinates, setAddressCoordinates] = useState<google.maps.LatLngLiteral | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [useLocalAnalysis, setUseLocalAnalysis] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const setAddress = useCallback((address: string) => {
    setState(prev => ({ ...prev, address }));
  }, []);

  const setCoordinates = useCallback((coordinates: google.maps.LatLngLiteral) => {
    setState(prev => ({ ...prev, coordinates }));
  }, []);

  const setSelectedPlace = useCallback((place: google.maps.places.PlaceResult) => {
    setState(prev => ({ ...prev, selectedPlace: place }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
    setAnalysisError(error);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    setAnalysisError(null);
  }, []);

  const setIsAnalyzing = useCallback((analyzing: boolean) => {
    setState(prev => ({ ...prev, isAnalyzing: analyzing }));
  }, []);

  const setAnalysisComplete = useCallback((complete: boolean) => {
    setState(prev => ({ ...prev, analysisComplete: complete }));
  }, []);

  const setAnalysisResults = useCallback((results: AnalysisResults | null) => {
    setState(prev => ({ ...prev, analysisResults: results }));
  }, []);

  const resetAnalysis = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      analysisResults: null, 
      error: null, 
      isAnalyzing: false, 
      analysisComplete: false 
    }));
    setAnalysisError(null);
  }, []);

  const generatePropertyAnalysis = useCallback(async (address: string) => {
    return analyzeProperty();
  }, []);

  const analyzeProperty = useCallback(async (forceLocalAnalysis: boolean = false) => {
    if (!state.address || state.isAnalyzing) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    setAnalysisError(null);
    console.log('🔍 Starting property analysis for:', state.address);

    try {
      // Capture satellite image URL during analysis
      let satelliteImageUrl: string | undefined;
      let streetViewImageUrl: string | undefined;

      // Get satellite image if coordinates are available
      if (state.coordinates || addressCoordinates) {
        const coords = state.coordinates || addressCoordinates;
        if (coords) {
          try {
            const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=19&size=640x640&maptype=satellite&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key'}`;
            satelliteImageUrl = satelliteUrl;
            
            // Get street view image
            const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${coords.lat},${coords.lng}&heading=0&pitch=0&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key'}`;
            streetViewImageUrl = streetViewUrl;
          } catch (imageError) {
            console.warn('Failed to generate image URLs:', imageError);
          }
        }
      }

      const { data, error } = await supabase.functions.invoke('analyze-property', {
        body: {
          address: state.address,
          coordinates: state.coordinates || addressCoordinates,
          satelliteImage: satelliteImageUrl,
          forceLocalAnalysis
        }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        const analysisResults: AnalysisResults = data.analysis;
        
        setState(prev => ({ 
          ...prev,
          analysisResults: {
            ...analysisResults,
            satelliteImageUrl,
            streetViewImageUrl
          },
          isAnalyzing: false,
          analysisComplete: true
        }));

        // Save to database if user is logged in
        if (user && state.address && (state.coordinates || addressCoordinates)) {
          try {
            console.log('💾 Saving analysis to database...');
            
            const coords = state.coordinates || addressCoordinates;
            const addressId = await saveAddress(
              user.id,
              state.address,
              coords!,
              state.address,
              false
            );
            
            if (addressId) {
              await savePropertyAnalysis(
                user.id,
                addressId,
                analysisResults,
                coords!,
                satelliteImageUrl,
                streetViewImageUrl
              );
              
              toast({
                title: "Analysis Saved",
                description: "Your property analysis has been saved to your dashboard",
              });
            }
          } catch (saveError) {
            console.error('❌ Failed to save analysis:', saveError);
            toast({
              title: "Save Warning",
              description: "Analysis completed but couldn't save to dashboard",
              variant: "destructive"
            });
          }
        }

        console.log('✅ Property analysis completed successfully');
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('❌ Property analysis failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Analysis failed', 
        isAnalyzing: false 
      }));
      setAnalysisError(error.message || 'Analysis failed');
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property",
        variant: "destructive"
      });
    }
  }, [state.address, state.coordinates, addressCoordinates, state.isAnalyzing, user, toast]);

  const value: GoogleMapContextType = {
    // Core state
    ...state,
    
    // Core methods
    setAddress,
    setCoordinates,
    setSelectedPlace,
    analyzeProperty,
    resetAnalysis,
    setError,
    clearError,
    
    // Extended state and methods
    mapInstance,
    setMapInstance,
    mapLoaded,
    setMapLoaded,
    addressCoordinates,
    setAddressCoordinates,
    analysisError,
    setAnalysisError,
    zoomLevel,
    setZoomLevel,
    useLocalAnalysis,
    setUseLocalAnalysis,
    isGeneratingAnalysis: state.isAnalyzing,
    setIsAnalyzing,
    setAnalysisComplete,
    setAnalysisResults,
    generatePropertyAnalysis,
    isLocating,
    setIsLocating
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {children}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
