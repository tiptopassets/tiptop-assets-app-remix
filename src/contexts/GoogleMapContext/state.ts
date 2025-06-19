
import { AnalysisResults } from './types';

export interface GoogleMapState {
  address: string;
  addressCoordinates: google.maps.LatLngLiteral | null;
  isLocating: boolean;
  isAddressValid: boolean;
  mapInstance: google.maps.Map | null;
  analysisResults: AnalysisResults | null;
  isGeneratingAnalysis: boolean;
  dataSyncEnabled: boolean;
  propertyType: string | null;
  satelliteImageBase64: string | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  mapLoaded: boolean;
  analysisError: string | null;
  useLocalAnalysis: boolean;
  zoomLevel: number;
}

export const createInitialState = (): GoogleMapState => ({
  address: '',
  addressCoordinates: null,
  isLocating: false,
  isAddressValid: false,
  mapInstance: null,
  analysisResults: null,
  isGeneratingAnalysis: false,
  dataSyncEnabled: true,
  propertyType: null,
  satelliteImageBase64: null,
  isAnalyzing: false,
  analysisComplete: false,
  mapLoaded: false,
  analysisError: null,
  useLocalAnalysis: false,
  zoomLevel: 12,
});
