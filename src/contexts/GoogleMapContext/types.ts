
import { AssetOpportunity } from './assetTypes';

export interface GoogleMapContextType {
  mapInstance: google.maps.Map | null;
  setMapInstance: (map: google.maps.Map | null) => void;
  address: string;
  setAddress: (address: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisComplete: boolean;
  setAnalysisComplete: (complete: boolean) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: (coords: google.maps.LatLngLiteral | null) => void;
  generatePropertyAnalysis: (address: string) => Promise<void>;
  isGeneratingAnalysis: boolean;
  analysisError: string | null;
  setAnalysisError: (error: string | null) => void;
  useLocalAnalysis: boolean;
  setUseLocalAnalysis: (useLocal: boolean) => void;
}

export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    solarCapacity: number;
    revenue: number;
  };
  garden: {
    area: number;
    opportunity: string;
    revenue: number;
  };
  parking: {
    spaces: number;
    rate: number;
    revenue: number;
  };
  pool: {
    present: boolean;
    area: number;
    type: string;
    revenue: number;
  };
  storage: {
    volume: number;
    revenue: number;
  };
  bandwidth: {
    available: number;
    revenue: number;
  };
  shortTermRental: {
    nightlyRate: number;
    monthlyProjection: number;
  };
  permits: string[];
  restrictions: string;
  topOpportunities: AssetOpportunity[];
  imageAnalysisSummary?: string;
}
