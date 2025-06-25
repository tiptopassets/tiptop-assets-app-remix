
import { AnalysisResults } from '@/types/analysis';

export interface GoogleMapContextProps {
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
  generateAnalysis: (
    address: string,
    coords?: google.maps.LatLngLiteral,
    satelliteImageBase64?: string
  ) => Promise<void>;
  syncAnalysisToDatabase: (
    address: string,
    analysis: any,
    coordinates?: any,
    satelliteImageUrl?: string
  ) => Promise<string | null>;
  dataSyncEnabled: boolean;
  setDataSyncEnabled: (enabled: boolean) => void;
  propertyType: string;
  setPropertyType: (type: string) => void;
  satelliteImageBase64: string | null;
  setSatelliteImageBase64: (image: string | null) => void;
  resetMapContext: () => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  analysisComplete: boolean;
  setAnalysisComplete: (complete: boolean) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  generatePropertyAnalysis: (propertyAddress: string) => Promise<AnalysisResults | null>;
  analysisError: string | null;
  setAnalysisError: (error: string | null) => void;
  useLocalAnalysis: boolean;
  setUseLocalAnalysis: (useLocal: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
}

export { AnalysisResults };
