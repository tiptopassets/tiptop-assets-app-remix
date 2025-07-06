
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GoogleMapContextType, GoogleMapState, GoogleMapAction } from './types';
import { useAuth } from '@/contexts/AuthContext';

const GoogleMapContext = createContext<GoogleMapContextType | undefined>(undefined);

const initialState: GoogleMapState = {
  address: '',
  addressCoordinates: null,
  formattedAddress: '',
  isAnalyzing: false,
  analysisComplete: false,
  analysisResults: null,
  error: null,
  currentAnalysisId: null,
  currentAddressId: null
};

function googleMapReducer(state: GoogleMapState, action: GoogleMapAction): GoogleMapState {
  switch (action.type) {
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.payload.address,
        addressCoordinates: action.payload.coordinates || null,
        formattedAddress: action.payload.formattedAddress || action.payload.address,
        analysisComplete: false,
        analysisResults: null,
        error: null
      };
    case 'START_ANALYSIS':
      return {
        ...state,
        isAnalyzing: true,
        analysisComplete: false,
        error: null
      };
    case 'COMPLETE_ANALYSIS':
      // Store analysis ID in localStorage with user prefix for proper association
      if (action.payload.analysisId) {
        localStorage.setItem('currentAnalysisId', action.payload.analysisId);
      }
      if (action.payload.addressId) {
        localStorage.setItem('currentAddressId', action.payload.addressId);
      }
      
      return {
        ...state,
        isAnalyzing: false,
        analysisComplete: true,
        analysisResults: action.payload.results,
        currentAnalysisId: action.payload.analysisId || null,
        currentAddressId: action.payload.addressId || null,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        isAnalyzing: false,
        analysisComplete: false,
        error: action.payload
      };
    case 'RESET':
      // Clear user-specific localStorage items
      localStorage.removeItem('currentAnalysisId');
      localStorage.removeItem('currentAddressId');
      return initialState;
    case 'SET_ANALYSIS_ID':
      // Properly associate analysis ID with current user
      if (action.payload) {
        localStorage.setItem('currentAnalysisId', action.payload);
      }
      return {
        ...state,
        currentAnalysisId: action.payload
      };
    case 'SET_ADDRESS_ID':
      if (action.payload) {
        localStorage.setItem('currentAddressId', action.payload);
      }
      return {
        ...state,
        currentAddressId: action.payload
      };
    default:
      return state;
  }
}

export const GoogleMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(googleMapReducer, initialState);
  const { user } = useAuth();

  // Clear context when user changes to prevent cross-user data issues
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
    } else {
      // Restore user-specific analysis context from localStorage
      const storedAnalysisId = localStorage.getItem('currentAnalysisId');
      const storedAddressId = localStorage.getItem('currentAddressId');
      
      if (storedAnalysisId && !state.currentAnalysisId) {
        dispatch({ type: 'SET_ANALYSIS_ID', payload: storedAnalysisId });
      }
      if (storedAddressId && !state.currentAddressId) {
        dispatch({ type: 'SET_ADDRESS_ID', payload: storedAddressId });
      }
    }
  }, [user, state.currentAnalysisId, state.currentAddressId]);

  const setAddress = (address: string, coordinates?: any, formattedAddress?: string) => {
    dispatch({
      type: 'SET_ADDRESS',
      payload: { address, coordinates, formattedAddress }
    });
  };

  const startAnalysis = () => {
    dispatch({ type: 'START_ANALYSIS' });
  };

  const completeAnalysis = (results: any, analysisId?: string, addressId?: string) => {
    console.log('🎯 Context: Completing analysis with IDs:', { analysisId, addressId, userId: user?.id });
    dispatch({
      type: 'COMPLETE_ANALYSIS',
      payload: { results, analysisId, addressId }
    });
  };

  const setError = (error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetAnalysis = () => {
    dispatch({ type: 'RESET' });
  };

  const setAnalysisId = (analysisId: string | null) => {
    dispatch({ type: 'SET_ANALYSIS_ID', payload: analysisId });
  };

  const setAddressId = (addressId: string | null) => {
    dispatch({ type: 'SET_ADDRESS_ID', payload: addressId });
  };

  const value: GoogleMapContextType = {
    ...state,
    setAddress,
    startAnalysis,
    completeAnalysis,
    setError,
    resetAnalysis,
    setAnalysisId,
    setAddressId
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {children}
    </GoogleMapContext.Provider>
  );
};

export const useGoogleMap = () => {
  const context = useContext(GoogleMapContext);
  if (context === undefined) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};
