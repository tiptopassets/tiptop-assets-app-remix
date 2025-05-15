
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

export interface ProviderInfo {
  name: string;
  setupCost?: number;
  fee?: number;
  roi?: number;
  url?: string;
}

export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    type?: string;
    solarCapacity: number;
    solarPotential?: boolean;
    revenue: number;
    providers?: ProviderInfo[];
  };
  garden: {
    area: number;
    opportunity: string;
    revenue: number;
    providers?: ProviderInfo[];
  };
  parking: {
    spaces: number;
    rate: number;
    revenue: number;
    evChargerPotential?: boolean;
    parkingType?: string;
    providers?: ProviderInfo[];
  };
  pool: {
    present: boolean;
    area: number;
    type: string;
    revenue: number;
    providers?: ProviderInfo[];
  };
  storage: {
    volume: number;
    revenue: number;
    providers?: ProviderInfo[];
  };
  bandwidth: {
    available: number;
    revenue: number;
    providers?: ProviderInfo[];
  };
  shortTermRental: {
    nightlyRate: number;
    monthlyProjection: number;
    providers?: ProviderInfo[];
  };
  permits: string[];
  restrictions: string;
  topOpportunities: AssetOpportunity[];
  imageAnalysisSummary?: string;
}
