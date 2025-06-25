
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { GoogleMapContextProps } from './types';
import { useToast } from "@/hooks/use-toast";
import { generatePropertyAnalysis } from './propertyAnalysis';
import { createInitialState } from './state';
import { syncAnalysisToDatabase, generateAnalysis } from './utils';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

export const GoogleMapContext = createContext<GoogleMapContextProps | undefined>(
  undefined
);

const GoogleMapProvider = ({ children }: { children: React.ReactNode }) => {
  // Use try-catch to handle cases where AuthProvider might not be ready
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn('⚠️ AuthProvider not available yet, proceeding without auth context');
    authContext = { user: null };
  }

  const { user } = authContext;
  
  // Only use useUserData hook if we have a valid auth context
  let userDataContext;
  try {
    userDataContext = useUserData();
  } catch (error) {
    console.warn('⚠️ UserData hook not available, proceeding without user data');
    userDataContext = { 
      refreshUserData: async () => {},
      saveAddress: async () => null,
      savePropertyAnalysis: async () => null
    };
  }
  
  const { refreshUserData, saveAddress, savePropertyAnalysis } = userDataContext;
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
        console.log('🗺️ Loading Google Maps API...');
        await loadGoogleMaps();
        
        if (mounted) {
          console.log('✅ Google Maps API loaded successfully');
          setIsGoogleMapsLoaded(true);
          setGoogleMapsLoadError(null);
        }
      } catch (error) {
        console.error('❌ Failed to load Google Maps API:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          setGoogleMapsLoadError(errorMessage);
          setUseLocalAnalysis(true);
          
          toast({
            title: "Google Maps Unavailable",
            description: "Switching to demo mode. Some features may be limited.",
            variant: "destructive"
          });
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
    const result = await syncAnalysisToDatabase(
      user?.id,
      address,
      analysis,
      coordinates,
      satelliteImageUrl,
      refreshUserData
    );
    return result; // This now returns string | null instead of void
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

  // Enhanced wrapper function with integrated database saving
  const generatePropertyAnalysisWrapper = async (propertyAddress: string) => {
    console.log('🏠 Starting property analysis with database integration:', { propertyAddress, userId: user?.id });
    
    try {
      const analysis = await generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates,
        useLocalAnalysis,
        setIsGeneratingAnalysis,
        setIsAnalyzing,
        setAnalysisResults,
        setAnalysisComplete,
        setUseLocalAnalysis,
        setAnalysisError,
        toast,
        // Pass database save functions
        saveAddress: user ? saveAddress : null,
        savePropertyAnalysis: user ? savePropertyAnalysis : null,
        refreshUserData: user ? refreshUserData : null,
        userId: user?.id
      });

      return analysis;
    } catch (error) {
      console.error('❌ Property analysis failed:', error);
      throw error;
    }
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

  // Only render children when Google Maps is loaded or when using local analysis
  if (!isGoogleMapsLoaded && !useLocalAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading Google Maps...</p>
          {googleMapsLoadError && (
            <div className="mt-4 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-red-300 text-sm mb-2">Error: {googleMapsLoadError}</p>
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
