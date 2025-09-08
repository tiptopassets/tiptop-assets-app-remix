
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
  sportsCourts: {
    present: boolean;
    types: string[];
    count: number;
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
  address: string;
  setAddress: (address: string) => void;
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: (coords: google.maps.LatLngLiteral | null) => void;
  isLocating: boolean;
  setIsLocating: (locating: boolean) => void;
  isAddressValid: boolean;
  setAddressValid: (valid: boolean) => void;
  mapInstance: google.maps.Map | null;
  setMapInstance: (map: google.maps.Map | null) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  isGeneratingAnalysis: boolean;
  setIsGeneratingAnalysis: (generating: boolean) => void;
  generateAnalysis: (address: string, coords?: google.maps.LatLngLiteral, satelliteImageBase64?: string) => Promise<void>;
  syncAnalysisToDatabase: (address: string, analysis: any, coordinates?: any, satelliteImageUrl?: string) => Promise<void>;
  dataSyncEnabled: boolean;
  setDataSyncEnabled: (enabled: boolean) => void;
  propertyType: string;
  setPropertyType: (type: string) => void;
  satelliteImageBase64: string | null;
  setSatelliteImageBase64: (image: string | null) => void;
  resetMapContext: () => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisComplete: boolean;
  setAnalysisComplete: (complete: boolean) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  generatePropertyAnalysis: (address: string) => Promise<any>;
  analysisError: string | null;
  setAnalysisError: (error: string | null) => void;
  useLocalAnalysis: boolean;
  setUseLocalAnalysis: (useLocal: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  currentAnalysisId: string | null;
  setCurrentAnalysisId: (id: string | null) => void;
  currentAddressId: string | null;
  setCurrentAddressId: (id: string | null) => void;
}
