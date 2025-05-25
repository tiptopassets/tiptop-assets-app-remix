
// Define types for the asset analysis
export interface ProviderInfo {
  name: string;
  setupCost?: number;
  fee?: string | number; // Updated to match GoogleMapContext/types.ts
  roi?: number;
  url?: string;
}

export interface ServiceAvailability {
  verified: boolean;
  location: string;
  coverage: string;
}

export interface LocationInfo {
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

export interface PropertyValuation {
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  totalSetupCosts: number;
  averageROI: number;
  bestOpportunity: string;
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
  serviceAvailability?: ServiceAvailability;
  locationInfo?: LocationInfo;
  propertyValuation?: PropertyValuation;
}

export interface FormField {
  type: "text" | "number" | "select";
  name: string;
  label: string;
  value: string | number;
  options?: string[];
}

export interface Opportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  provider?: string;
  setupCost?: number;
  roi?: number;
  formFields?: FormField[];
  usingRealSolarData?: boolean;
}

export interface AdditionalOpportunity {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  provider?: string;
  setupCost?: number;
  roi?: number;
  formFields?: FormField[];
}

export interface SelectedAsset {
  title: string;
  icon: string;
  monthlyRevenue: number;
  provider?: string;
  setupCost?: number;
  roi?: number;
  formData?: Record<string, string | number>;
}
