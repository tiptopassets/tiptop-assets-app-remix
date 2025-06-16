import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { saveAddress } from '@/services/userAddressService';
import { savePropertyAnalysis } from '@/services/userAnalysisService';
import { Address } from '@/types/address';
import { AnalysisResults, GoogleMapContextProps } from '@/contexts/GoogleMapContext/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { generatePropertyAnalysis } from './propertyAnalysis';

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const GoogleMapContext = createContext<GoogleMapContextProps | undefined>(
  undefined
);

export const useGoogleMap = (): GoogleMapContextProps => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};

const libraries: (
  | 'drawing'
  | 'geometry'
  | 'places'
  | 'visualization'
)[] = ['places'];

const GoogleMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries: libraries,
  });
  const { user } = useAuth();
  const { refreshUserData } = useUserData();
  const [address, setAddress] = useState<string>('');
  const [addressCoordinates, setAddressCoordinates] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isAddressValid, setAddressValid] = useState<boolean>(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] =
    useState<boolean>(false);
  const [dataSyncEnabled, setDataSyncEnabled] = useState<boolean>(true);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [satelliteImageBase64, setSatelliteImageBase64] = useState<string | null>(null);
  
  // Additional state properties that components expect
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [useLocalAnalysis, setUseLocalAnalysis] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  
  const { toast } = useToast();

  useEffect(() => {
    if (loadError) {
      console.error('Google Maps API load error:', loadError);
    }
  }, [loadError]);

  const resetMapContext = useCallback(() => {
    setAddress('');
    setAddressCoordinates(null);
    setIsLocating(false);
    setAddressValid(false);
    setMapInstance(null);
    setAnalysisResults(null);
    setIsGeneratingAnalysis(false);
    setPropertyType(null);
    setSatelliteImageBase64(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAnalysisError(null);
  }, []);

  const syncAnalysisToDatabase = async (address: string, analysis: any, coordinates?: any, satelliteImageUrl?: string) => {
    if (!user?.id) {
      console.warn('⚠️ No user authenticated, skipping database sync');
      return;
    }

    try {
      console.log('🔄 Syncing analysis to database...', { address, userId: user.id });
      
      // First, save or get the address
      const addressId = await saveAddress(user.id, address, coordinates);
      if (!addressId) {
        console.error('❌ Failed to save address, cannot sync analysis');
        return;
      }

      // Then save the analysis with the satellite image URL
      const analysisId = await savePropertyAnalysis(
        user.id, 
        addressId, 
        analysis, 
        coordinates,
        satelliteImageUrl
      );
      
      if (analysisId) {
        console.log('✅ Analysis synced successfully:', analysisId);
        // Refresh user data to reflect the new analysis
        await refreshUserData();
      }
    } catch (error) {
      console.error('❌ Error syncing analysis to database:', error);
    }
  };

  const generateAnalysis = async (address: string, coords?: google.maps.LatLngLiteral, satelliteImageBase64?: string) => {
    if (!address.trim()) {
      console.warn('⚠️ Cannot generate analysis: address is empty');
      return;
    }

    setIsGeneratingAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setAnalysisError(null);
    
    try {
      console.log('🔍 Generating analysis for:', address);
      
      const { data, error } = await supabase.functions.invoke('analyze-property', {
        body: {
          address: address.trim(),
          coordinates: coords,
          satelliteImage: satelliteImageBase64
        }
      });

      if (error) {
        console.error('❌ Analysis API error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ Analysis failed:', data?.error);
        throw new Error(data?.error || 'Analysis failed');
      }

      console.log('✅ Analysis completed successfully');
      setAnalysisResults(data.analysis);
      setAnalysisComplete(true);
      
      // Sync to database with satellite image URL if user is authenticated
      if (user?.id) {
        await syncAnalysisToDatabase(
          address, 
          data.analysis, 
          coords || data.propertyInfo?.coordinates,
          data.satelliteImageUrl // Pass the satellite image URL from the response
        );
      }
      
    } catch (error) {
      console.error('❌ Error generating analysis:', error);
      setAnalysisError(error.message || "Failed to analyze property");
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  };

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
    generateAnalysis,
    syncAnalysisToDatabase,
    dataSyncEnabled,
    setDataSyncEnabled,
    propertyType,
    setPropertyType,
    satelliteImageBase64,
    setSatelliteImageBase64,
    resetMapContext,
    // Additional properties
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

  return (
    <GoogleMapContext.Provider value={value}>
      {isLoaded && children}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
