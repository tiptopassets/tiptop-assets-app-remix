
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

export interface GoogleMapState {
  address: string;
  addressCoordinates: google.maps.LatLngLiteral | null;
  formattedAddress: string;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  analysisResults: AnalysisResults | null;
  error: string | null;
  currentAnalysisId: string | null;
  currentAddressId: string | null;
}

export type GoogleMapAction = 
  | { type: 'SET_ADDRESS'; payload: { address: string; coordinates?: google.maps.LatLngLiteral; formattedAddress?: string } }
  | { type: 'START_ANALYSIS' }
  | { type: 'COMPLETE_ANALYSIS'; payload: { results: AnalysisResults; analysisId?: string; addressId?: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'SET_ANALYSIS_ID'; payload: string | null }
  | { type: 'SET_ADDRESS_ID'; payload: string | null };

export interface GoogleMapContextType {
  address: string;
  addressCoordinates: google.maps.LatLngLiteral | null;
  formattedAddress: string;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  analysisResults: AnalysisResults | null;
  error: string | null;
  currentAnalysisId: string | null;
  currentAddressId: string | null;
  setAddress: (address: string, coordinates?: google.maps.LatLngLiteral, formattedAddress?: string) => void;
  startAnalysis: () => void;
  completeAnalysis: (results: AnalysisResults, analysisId?: string, addressId?: string) => void;
  setError: (error: string) => void;
  resetAnalysis: () => void;
  setAnalysisId: (analysisId: string | null) => void;
  setAddressId: (addressId: string | null) => void;
}
