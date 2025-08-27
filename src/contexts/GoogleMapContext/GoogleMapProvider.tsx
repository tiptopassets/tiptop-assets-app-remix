import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { GoogleMapContextType } from './types';
import { useToast } from "@/hooks/use-toast";
import { generatePropertyAnalysis } from './propertyAnalysis';
import { createInitialState } from './state';
import { syncAnalysisToDatabase, generateAnalysis } from './utils';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

export const GoogleMapContext = createContext<GoogleMapContextType | undefined>(
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
  const [currentAnalysisId, setCurrentAnalysisId] = useState(initialState.currentAnalysisId);
  const [currentAddressId, setCurrentAddressId] = useState(initialState.currentAddressId);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [googleMapsLoadError, setGoogleMapsLoadError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Load Google Maps API on component mount with timeout protection
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initializeGoogleMaps = async () => {
      try {
        console.log('🗺️ Loading Google Maps API...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⏱️ Google Maps loading timed out after 30 seconds');
            setLoadingTimeout(true);
            setGoogleMapsLoadError('Google Maps loading timed out');
            setUseLocalAnalysis(true);
            
            toast({
              title: "Google Maps Loading Timeout",
              description: "Switching to demo mode due to loading timeout.",
              variant: "destructive"
            });
          }
        }, 30000); // 30 second timeout

        await loadGoogleMaps();
        
        // Clear timeout if loading succeeds
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (mounted) {
          console.log('✅ Google Maps API loaded successfully');
          setIsGoogleMapsLoaded(true);
          setGoogleMapsLoadError(null);
          setLoadingTimeout(false);
        }
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        console.error('❌ Failed to load Google Maps API:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
          setGoogleMapsLoadError(errorMessage);
          setUseLocalAnalysis(true);
          setLoadingTimeout(false);
          
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [toast]);

  // Force demo mode if loading takes too long
  useEffect(() => {
    if (loadingTimeout) {
      console.log('🔄 Forcing demo mode due to loading timeout');
      setUseLocalAnalysis(true);
      setIsGoogleMapsLoaded(true); // Allow app to continue
    }
  }, [loadingTimeout]);

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
        saveAddress: user ? saveAddress : null,
        savePropertyAnalysis: user ? savePropertyAnalysis : null,
        refreshUserData: user ? refreshUserData : null,
        userId: user?.id,
        setCurrentAnalysisId: (id: string) => {
          console.log('💾 Storing analysis ID in context and localStorage:', id);
          setCurrentAnalysisId(id);
          localStorage.setItem('currentAnalysisId', id);
          
          // Update any pending asset selections with the analysis ID
          const sessionId = localStorage.getItem('anonymous_session_id');
          if (sessionId) {
            import('@/services/sessionStorageService').then(({ updateAssetSelectionsWithAnalysisId }) => {
              updateAssetSelectionsWithAnalysisId(sessionId, id).catch(error => {
                console.warn('Could not update asset selections with analysis ID:', error);
              });
            });
          }
        },
        setCurrentAddressId: (id: string) => {
          console.log('💾 Storing address ID in context and localStorage:', id);
          setCurrentAddressId(id);
          localStorage.setItem('currentAddressId', id);
        }
      });

      console.log('🔍 Context IDs after analysis:', {
        currentAnalysisId,
        currentAddressId,
        userId: user?.id,
        localStorage: {
          analysisId: localStorage.getItem('currentAnalysisId'),
          addressId: localStorage.getItem('currentAddressId')
        }
      });

      return analysis;
    } catch (error) {
      console.error('❌ Property analysis failed:', error);
      throw error;
    }
  };

  const value: GoogleMapContextType = {
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
    currentAnalysisId,
    setCurrentAnalysisId,
    currentAddressId,
    setCurrentAddressId,
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {/* Enhanced loading screen with timeout handling */}
      {!isGoogleMapsLoaded && !useLocalAnalysis && !loadingTimeout ? (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg mb-2">Loading Google Maps...</p>
            <p className="text-sm text-gray-400">This might take a moment...</p>
            
            {googleMapsLoadError && (
              <div className="mt-4 p-4 bg-red-500/20 rounded-lg border border-red-500/30 max-w-md mx-auto">
                <p className="text-red-300 text-sm mb-2">Error: {googleMapsLoadError}</p>
                <button 
                  onClick={() => {
                    console.log('🔄 User manually switched to demo mode');
                    setUseLocalAnalysis(true);
                    setIsGoogleMapsLoaded(true);
                  }}
                  className="px-4 py-2 bg-tiptop-purple hover:bg-tiptop-purple/90 rounded-md text-sm transition-colors"
                >
                  Switch to Demo Mode
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
