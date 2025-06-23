
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { GoogleMapContextProps } from './types';
import { useToast } from "@/hooks/use-toast";
import { generatePropertyAnalysis } from './propertyAnalysis';
import { createInitialState } from './state';
import { syncAnalysisToDatabase, generateAnalysis } from './utils';
import { loadGoogleMapsWithRetry, verifyApiKeyConfiguration } from '@/utils/googleMapsLoader';

export const GoogleMapContext = createContext<GoogleMapContextProps | undefined>(
  undefined
);

const GoogleMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { refreshUserData } = useUserData();
  const { toast } = useToast();

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
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsLoadError, setGoogleMapsLoadError] = useState<string | null>(null);

  // Load Google Maps API on component mount with enhanced error handling
  useEffect(() => {
    let mounted = true;
    
    const initializeGoogleMaps = async () => {
      try {
        console.log('🗺️ Starting Google Maps initialization with enhanced error handling...');
        
        // First verify the API key configuration with detailed logging
        const verification = await verifyApiKeyConfiguration();
        console.log('🔍 API key verification result:', verification);
        
        if (!verification.valid) {
          const errorDetails = verification.details || {};
          const isPreviewDomain = errorDetails.currentDomain?.includes('preview--') || 
                                 errorDetails.currentDomain?.includes('.lovable.app');
          
          let enhancedMessage = verification.message;
          
          if (verification.message.includes('RefererNotAllowedMapError') || 
              errorDetails.errorType === 'domain_restriction') {
            enhancedMessage = `Domain restriction error on ${errorDetails.currentDomain}.\n\n` +
              `Please add these domains to your Google Cloud Console API key restrictions:\n` +
              `• ${errorDetails.currentOrigin}/*\n` +
              `• https://*.lovable.app/*\n` +
              `• https://*.lovableproject.com/*\n\n` +
              `${isPreviewDomain ? 'Note: Preview domains use double dashes (--) which may need explicit allowlisting.' : ''}`;
          }
          
          throw new Error(enhancedMessage);
        }
        
        console.log('✅ API key verification passed, loading Google Maps with retry mechanism...');
        await loadGoogleMapsWithRetry();
        
        if (mounted) {
          console.log('✅ Google Maps loaded successfully in provider');
          setIsGoogleMapsLoaded(true);
          setGoogleMapsLoadError(null);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Google Maps:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          setGoogleMapsLoadError(errorMessage);
          
          // Enhanced user-friendly error messages
          if (errorMessage.includes('API key not configured')) {
            toast({
              title: "Google Maps Configuration Required",
              description: "The Google Maps API key needs to be configured in Supabase Edge Function Secrets. Switching to demo mode.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('RefererNotAllowedMapError') || 
                    errorMessage.includes('Domain restriction error')) {
            toast({
              title: "Google Maps Domain Restriction",
              description: "The API key domain restrictions need to be updated for this domain. Check console for details.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('InvalidKeyMapError')) {
            toast({
              title: "Invalid Google Maps API Key",
              description: "The provided API key is invalid. Please check your Google Cloud Console.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('ApiNotActivatedMapError')) {
            toast({
              title: "Google Maps API Not Activated",
              description: "Please enable the Maps JavaScript API in Google Cloud Console.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Google Maps Unavailable",
              description: "Unable to load Google Maps. Switching to demo mode.",
              variant: "destructive"
            });
          }
          
          setUseLocalAnalysis(true);
        }
      }
    };

    initializeGoogleMaps();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const resetMapContext = useCallback(() => {
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
  }, []);

  const handleSyncAnalysisToDatabase = useCallback(async (
    address: string,
    analysis: any,
    coordinates?: any,
    satelliteImageUrl?: string
  ) => {
    return syncAnalysisToDatabase(
      user?.id,
      address,
      analysis,
      coordinates,
      satelliteImageUrl,
      refreshUserData
    );
  }, [user?.id, refreshUserData]);

  const handleGenerateAnalysis = useCallback(async (
    address: string,
    coords?: google.maps.LatLngLiteral,
    satelliteImageBase64?: string
  ) => {
    setIsGeneratingAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setAnalysisError(null);
    
    try {
      const analysis = await generateAnalysis(
        address,
        coords,
        satelliteImageBase64,
        user?.id,
        refreshUserData,
        toast
      );
      
      if (analysis) {
        setAnalysisResults(analysis);
        setAnalysisComplete(true);
      }
    } catch (error) {
      setAnalysisError(error.message || "Failed to analyze property");
      throw error;
    } finally {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  }, [user?.id, refreshUserData, toast]);

  // Wrapper function that matches the expected signature
  const generatePropertyAnalysisWrapper = async (propertyAddress: string) => {
    return generatePropertyAnalysis({
      propertyAddress,
      addressCoordinates,
      useLocalAnalysis,
      setIsGeneratingAnalysis,
      setIsAnalyzing,
      setAnalysisResults,
      setAnalysisComplete,
      setUseLocalAnalysis,
      setAnalysisError,
      toast
    });
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

  // Enhanced loading screen with detailed error information
  if (!isGoogleMapsLoaded && !useLocalAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-white text-center max-w-2xl">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading Google Maps...</p>
          <p className="text-sm text-gray-400 mb-4">Verifying API configuration...</p>
          
          {googleMapsLoadError && (
            <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30 text-left">
              <h3 className="text-red-300 font-semibold mb-3">Configuration Error</h3>
              <div className="text-red-200 text-sm mb-4 whitespace-pre-line">
                {googleMapsLoadError}
              </div>
              
              <div className="mb-4 p-3 bg-black/30 rounded text-xs text-gray-300">
                <p className="font-semibold mb-2">Current Environment:</p>
                <p>Domain: {window.location.hostname}</p>
                <p>Origin: {window.location.origin}</p>
                <p>Is Preview: {(window.location.hostname.includes('preview--') || window.location.hostname.includes('.lovable.app')).toString()}</p>
              </div>
              
              <button 
                onClick={() => setUseLocalAnalysis(true)}
                className="px-4 py-2 bg-tiptop-purple hover:bg-tiptop-purple/90 rounded-md text-sm transition-colors"
              >
                Switch to Demo Mode
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <GoogleMapContext.Provider value={value}>
      {children}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
