
import React, { createContext, useState } from 'react';
import { GoogleMapContextProps } from './types';
import { createInitialState } from './state';
import { useGoogleMapsInitialization } from './providerInitialization';
import { useAuthContextIntegration } from './authContextIntegration';
import { useAnalysisHandlers } from './analysisHandlers';
import { LoadingComponent } from './loadingComponent';
import { useToast } from "@/hooks/use-toast";

export const GoogleMapContext = createContext<GoogleMapContextProps | undefined>(
  undefined
);

const GoogleMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  
  // Initialize Google Maps
  const { isGoogleMapsLoaded, googleMapsLoadError } = useGoogleMapsInitialization();
  
  // Initialize auth context with safe error handling
  const {
    user,
    authReady,
    userDataReady,
    refreshUserData,
    saveAddress,
    savePropertyAnalysis
  } = useAuthContextIntegration();

  // Initialize state
  const initialState = createInitialState();
  const [address, setAddress] = useState(initialState.address);
  const [addressCoordinates, setAddressCoordinates] = useState(initialState.addressCoordinates);
  const [isLocating, setIsLocating] = useState(initialState.isLocating);
  const [isAddressValid, setAddressValid] = useState(initialState.isAddressValid);
  const [mapInstance, setMapInstance] = useState(initialState.mapInstance);
  const [analysisResults, setAnalysisResults] = useState(initialState.analysisResults);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(initialState.isGeneratingAnalysis);
  const [dataSyncEnabled, setDataSyncEnabled] = useState(initialState.dataSyncEnabled);
  const [propertyType, setPropertyType] = useState(initialState.propertyType);
  const [satelliteImageBase64, setSatelliteImageBase64] = useState(initialState.satelliteImageBase64);
  const [isAnalyzing, setIsAnalyzing] = useState(initialState.isAnalyzing);
  const [analysisComplete, setAnalysisComplete] = useState(initialState.analysisComplete);
  const [mapLoaded, setMapLoaded] = useState(initialState.mapLoaded);
  const [analysisError, setAnalysisError] = useState(initialState.analysisError);
  const [useLocalAnalysis, setUseLocalAnalysis] = useState(initialState.useLocalAnalysis);
  const [zoomLevel, setZoomLevel] = useState(initialState.zoomLevel);

  // Initialize analysis handlers
  const {
    handleSyncAnalysisToDatabase,
    handleGenerateAnalysis,
    generatePropertyAnalysisWrapper
  } = useAnalysisHandlers(
    user,
    refreshUserData,
    saveAddress,
    savePropertyAnalysis,
    setIsGeneratingAnalysis,
    setIsAnalyzing,
    setAnalysisResults,
    setAnalysisComplete,
    setAnalysisError,
    addressCoordinates,
    useLocalAnalysis,
    toast
  );

  const resetMapContext = () => {
    const resetState = createInitialState();
    setAddress(resetState.address);
    setAddressCoordinates(resetState.addressCoordinates);
    setIsLocating(resetState.isLocating);
    setAddressValid(resetState.isAddressValid);
    setMapInstance(resetState.mapInstance);
    setAnalysisResults(resetState.analysisResults);
    setIsGeneratingAnalysis(resetState.isGeneratingAnalysis);
    setPropertyType(resetState.propertyType);
    setSatelliteImageBase64(resetState.satelliteImageBase64);
    setIsAnalyzing(resetState.isAnalyzing);
    setAnalysisComplete(resetState.analysisComplete);
    setAnalysisError(resetState.analysisError);
  };

  const value: GoogleMapContextProps = {
    address,
    setAddress,
    addressCoordinates,
    setAddressCoordinates,
    isLocating,
    setIsLocating,
    isAddressValid,
    setAddressValid,
    mapInstance,
    setMapInstance,
    analysisResults,
    setAnalysisResults,
    isGeneratingAnalysis,
    setIsGeneratingAnalysis,
    generateAnalysis: handleGenerateAnalysis,
    syncAnalysisToDatabase: handleSyncAnalysisToDatabase,
    dataSyncEnabled,
    setDataSyncEnabled,
    propertyType,
    setPropertyType,
    satelliteImageBase64,
    setSatelliteImageBase64,
    resetMapContext,
    isAnalyzing,
    setIsAnalyzing,
    analysisComplete,
    setAnalysisComplete,
    mapLoaded,
    setMapLoaded,
    generatePropertyAnalysis: generatePropertyAnalysisWrapper,
    analysisError,
    setAnalysisError,
    useLocalAnalysis,
    setUseLocalAnalysis,
    zoomLevel,
    setZoomLevel,
  };

  // Render children even if Google Maps is not loaded - the app should work without it
  return (
    <GoogleMapContext.Provider value={value}>
      {!isGoogleMapsLoaded && !useLocalAnalysis ? (
        <LoadingComponent 
          googleMapsLoadError={googleMapsLoadError}
          setUseLocalAnalysis={setUseLocalAnalysis}
        />
      ) : (
        children
      )}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
