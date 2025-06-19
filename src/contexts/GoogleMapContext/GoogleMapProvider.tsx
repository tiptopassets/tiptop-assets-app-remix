import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { GoogleMapContextType, GoogleMapState, AnalysisResults } from './types';
import { googleMapReducer, initialState } from './state';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveAddress } from '@/services/userAddressService';
import { savePropertyAnalysis } from '@/services/userAnalysisService';

const GoogleMapContext = createContext<GoogleMapContextType | undefined>(undefined);

export const GoogleMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(googleMapReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  const setAddress = useCallback((address: string) => {
    dispatch({ type: 'SET_ADDRESS', payload: address });
  }, []);

  const setCoordinates = useCallback((coordinates: google.maps.LatLngLiteral) => {
    dispatch({ type: 'SET_COORDINATES', payload: coordinates });
  }, []);

  const setSelectedPlace = useCallback((place: google.maps.places.PlaceResult) => {
    dispatch({ type: 'SET_SELECTED_PLACE', payload: place });
  }, []);

  const resetAnalysis = useCallback(() => {
    dispatch({ type: 'RESET_ANALYSIS' });
  }, []);

  const analyzeProperty = useCallback(async (forceLocalAnalysis: boolean = false) => {
    if (!state.address || state.isAnalyzing) return;

    dispatch({ type: 'START_ANALYSIS' });
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
        
        dispatch({ 
          type: 'SET_ANALYSIS_RESULTS', 
          payload: {
            ...analysisResults,
            satelliteImageUrl,
            streetViewImageUrl
          }
        });

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
    } catch (error) {
      console.error('❌ Property analysis failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Analysis failed' });
      
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
    setError: (error: string) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {children}
    </GoogleMapContext.Provider>
  );
};

export const useGoogleMap = () => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};
