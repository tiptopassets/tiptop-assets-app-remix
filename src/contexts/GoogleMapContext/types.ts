
export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    type?: string;
    solarCapacity: number;
    solarPotential?: boolean;
    revenue: number;
    providers?: any[];
    usingRealSolarData?: boolean;
    yearlyEnergyKWh?: number;
    panelsCount?: number;
    setupCost?: number;
  };
  garden: {
    area: number;
    opportunity: string;
    revenue: number;
    providers?: any[];
  };
  parking: {
    spaces: number;
    rate: number;
    revenue: number;
    evChargerPotential?: boolean;
    providers?: any[];
  };
  pool: {
    present: boolean;
    area: number;
    type: string;
    revenue: number;
    providers?: any[];
  };
  storage: {
    volume: number;
    revenue: number;
    providers?: any[];
  };
  bandwidth: {
    available: number;
    revenue: number;
    providers?: any[];
  };
  shortTermRental: {
    nightlyRate: number;
    monthlyProjection: number;
    providers?: any[];
  };
  permits: string[];
  restrictions: string | null;
  topOpportunities: any[];
  imageAnalysisSummary?: string;
  totalMonthlyRevenue?: number;
  satelliteImageUrl?: string;
  streetViewImageUrl?: string;
  propertyValuation?: {
    totalMonthlyRevenue: number;
    totalAnnualRevenue: number;
    totalSetupCosts: number;
    averageROI: number;
    bestOpportunity: string;
  };
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
  map: google.maps.Map | null;
  address: string;
  coordinates: google.maps.LatLngLiteral | null;
  selectedPlace: google.maps.places.PlaceResult | null;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  analysisResults: AnalysisResults | null;
  error: string | null;
}

export interface GoogleMapContextType extends GoogleMapState {
  setAddress: (address: string) => void;
  setCoordinates: (coordinates: google.maps.LatLngLiteral) => void;
  setSelectedPlace: (place: google.maps.places.PlaceResult) => void;
  analyzeProperty: (forceLocalAnalysis?: boolean) => Promise<void>;
  resetAnalysis: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}
