
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
    usingRealSolarData?: boolean;
    yearlyEnergyKWh?: number;
    panelsCount?: number;
    setupCost?: number;
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
  restrictions: string | null;
  topOpportunities: Opportunity[];
  imageAnalysisSummary?: string;
}

export interface ProviderInfo {
  name: string;
  setupCost?: number;
  fee?: string | number;
  roi?: number;
  url?: string;
}

export interface Opportunity {
  icon: string;
  title: string;
  monthlyRevenue: number;
  description: string;
  provider?: string;
  setupCost?: number;
  roi?: number;
  formFields?: FormField[];
  usingRealSolarData?: boolean;
}

export interface FormField {
  type: "text" | "number" | "select";
  name: string;
  label: string;
  value: string | number;
  options?: string[];
}

export interface GoogleMapContextType {
  mapInstance: google.maps.Map | null;
  setMapInstance: React.Dispatch<React.SetStateAction<google.maps.Map | null>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  analysisComplete: boolean;
  setAnalysisComplete: React.Dispatch<React.SetStateAction<boolean>>;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResults | null>>;
  mapLoaded: boolean;
  setMapLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral | null>>;
  generatePropertyAnalysis: (propertyAddress: string) => Promise<void>;
  isGeneratingAnalysis: boolean;
  analysisError: string | null;
  setAnalysisError: React.Dispatch<React.SetStateAction<string | null>>;
  useLocalAnalysis: boolean;
  setUseLocalAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

// Update the interface used by the provider
export interface GoogleMapContextProps extends GoogleMapContextType {
  // Additional properties that were in the original provider
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: (coords: google.maps.LatLngLiteral | null) => void;
  isLocating: boolean;
  setIsLocating: (isLocating: boolean) => void;
  isAddressValid: boolean;
  setAddressValid: (isValid: boolean) => void;
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
