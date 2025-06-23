import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { GoogleMapContextProps } from './types';
import { useToast } from "@/hooks/use-toast";
import { generatePropertyAnalysis } from './propertyAnalysis';
import { createInitialState } from './state';
import { syncAnalysisToDatabase, generateAnalysis } from './utils';
import { loadGoogleMaps, verifyApiKeyConfiguration } from '@/utils/googleMapsLoader';

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

  // Load Google Maps API on component mount
  useEffect(() => {
    let mounted = true;
    
    const initializeGoogleMaps = async () => {
      try {
        console.log('🗺️ Starting Google Maps initialization...');
        
        // First verify the API key configuration
        const verification = await verifyApiKeyConfiguration();
        if (!verification.valid) {
          throw new Error(verification.message);
        }
        
        console.log('✅ API key verification passed, loading Google Maps...');
        await loadGoogleMaps();
        
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
          
          // Show user-friendly error message
          if (errorMessage.includes('API key not configured')) {
            toast({
              title: "Google Maps Configuration Required",
              description: "The Google Maps API key needs to be configured in Supabase Edge Function Secrets. Switching to demo mode.",
              variant: "destructive"
            });
          } else if (errorMessage.includes('RefererNotAllowedMapError')) {
            toast({
              title: "Google Maps Domain Restriction",
              description: "The API key domain restrictions need to be updated. Switching to demo mode.",
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

  // Enhanced loading screen with better error handling
  if (!isGoogleMapsLoaded && !useLocalAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-white text-center max-w-md">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading Google Maps...</p>
          <p className="text-sm text-gray-400 mb-4">Verifying API configuration...</p>
          
          {googleMapsLoadError && (
            <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-red-300 text-sm mb-3">
                <strong>Error:</strong> {googleMapsLoadError}
              </p>
              
              {googleMapsLoadError.includes('API key not configured') && (
                <div className="text-left text-xs text-gray-300 mb-3">
                  <p className="mb-1">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to Supabase Dashboard → Edge Functions → Secrets</li>
                    <li>Add GOOGLE_MAPS_API_KEY with your Google Maps API key</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
              
              {googleMapsLoadError.includes('RefererNotAllowedMapError') && (
                <div className="text-left text-xs text-gray-300 mb-3">
                  <p className="mb-1">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                    <li>Edit your API key restrictions</li>
                    <li>Add: https://*.lovable.app/* and https://*.lovableproject.com/*</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
              
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
