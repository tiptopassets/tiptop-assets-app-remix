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
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { useToast } from "@/hooks/use-toast"

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapContextProps {
  address: string;
  setAddress: (address: string) => void;
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: (coords: google.maps.LatLngLiteral | null) => void;
  isLocating: boolean;
  setIsLocating: (isLocating: boolean) => void;
  isAddressValid: boolean;
  setAddressValid: (isValid: boolean) => void;
  mapInstance: google.maps.Map | null;
  setMapInstance: (map: google.maps.Map | null) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  isGeneratingAnalysis: boolean;
  setIsGeneratingAnalysis: (isGenerating: boolean) => void;
  generateAnalysis: (address: string, coords?: google.maps.LatLngLiteral, satelliteImageBase64?: string) => Promise<void>;
  syncAnalysisToDatabase: (address: string, analysis: any, coordinates?: any, satelliteImageUrl?: string) => Promise<void>;
  dataSyncEnabled: boolean;
  setDataSyncEnabled: (enabled: boolean) => void;
  propertyType: string | null;
  setPropertyType: (type: string | null) => void;
  satelliteImageBase64: string | null;
  setSatelliteImageBase64: (base64: string | null) => void;
  resetMapContext: () => void;
}

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
  | 'localContext'
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
  const { toast } = useToast()

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
    setAnalysisResults(null);
    
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
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property",
        variant: "destructive"
      })
      throw error;
    } finally {
      setIsGeneratingAnalysis(false);
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
    generateAnalysis,
    syncAnalysisToDatabase,
    dataSyncEnabled,
    setDataSyncEnabled,
    propertyType,
    setPropertyType,
    satelliteImageBase64,
    setSatelliteImageBase64,
    resetMapContext,
  };

  return (
    <GoogleMapContext.Provider value={value}>
      {isLoaded && children}
    </GoogleMapContext.Provider>
  );
};

export default GoogleMapProvider;
