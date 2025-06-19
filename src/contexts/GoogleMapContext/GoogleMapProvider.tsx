
import React, { createContext, useContext, useState, useCallback } from 'react';
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
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetAnalysis = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      analysisResults: null, 
      error: null, 
      isAnalyzing: false, 
      analysisComplete: false 
    }));
  }, []);

  const analyzeProperty = useCallback(async (forceLocalAnalysis: boolean = false) => {
    if (!state.address || state.isAnalyzing) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    console.log('🔍 Starting property analysis for:', state.address);

    try {
      // Capture satellite image URL during analysis
      let satelliteImageUrl: string | undefined;
      let streetViewImageUrl: string | undefined;

      // Get satellite image if coordinates are available
      if (state.coordinates) {
        try {
          const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${state.coordinates.lat},${state.coordinates.lng}&zoom=19&size=640x640&maptype=satellite&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key'}`;
          satelliteImageUrl = satelliteUrl;
          
          // Get street view image
          const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${state.coordinates.lat},${state.coordinates.lng}&heading=0&pitch=0&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key'}`;
          streetViewImageUrl = streetViewUrl;
        } catch (imageError) {
          console.warn('Failed to generate image URLs:', imageError);
        }
      }

      const { data, error } = await supabase.functions.invoke('analyze-property', {
        body: {
          address: state.address,
          coordinates: state.coordinates,
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
        if (user && state.address && state.coordinates) {
          try {
            console.log('💾 Saving analysis to database...');
            
            const addressId = await saveAddress(
              user.id,
              state.address,
              state.coordinates,
              state.address,
              false
            );
            
            if (addressId) {
              await savePropertyAnalysis(
                user.id,
                addressId,
                analysisResults,
                state.coordinates,
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
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property",
        variant: "destructive"
      });
    }
  }, [state.address, state.coordinates, state.isAnalyzing, user, toast]);

  const value: GoogleMapContextType = {
    ...state,
    setAddress,
    setCoordinates,
    setSelectedPlace,
    analyzeProperty,
    resetAnalysis,
    setError,
    clearError
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {children}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
