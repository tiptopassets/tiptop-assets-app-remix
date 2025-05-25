export interface AnalysisRequest {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  satelliteImage?: string | null;
}

export interface PropertyInfo {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  details: any;
  solarData?: SolarApiData | null;
}

export interface ImageAnalysis {
  roofSize?: number | null;
  roofType?: string | null;
  solarPotential?: string | null;
  parkingSpaces?: number | null;
  gardenArea?: number | null;
  gardenPotential?: string | null;
  poolPresent?: boolean;
  poolSize?: number | null;
  poolType?: string | null;
  fullAnalysis?: string;
}

export interface SolarApiData {
  roofTotalAreaSqFt: number;
  solarPotential: boolean;
  maxSolarCapacityKW: number;
  yearlyEnergyKWh: number;
  panelsCount: number;
  averageHoursOfSunPerYear: number;
  carbonOffsetKg: number;
  monthlyRevenue: number;
  setupCost: number;
  roofSegments: any[];
  financialAnalysis?: {
    initialYearlyProduction: number;
    federalIncentiveValue: number;
    panelLifetimeYears: number;
  };
}

export interface ProviderInfo {
  name: string;
  setupCost?: number;
  roi?: number;
  fee?: string | number;
  url?: string;
}

export interface PropertyAnalysis {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number | null;
    type?: string | null;
    solarCapacity: number | null;
    solarPotential?: boolean;
    revenue: number;
    providers?: ProviderInfo[];
  };
  garden: {
    area: number | null;
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
    area: number | null;
    type: string | null;
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
  topOpportunities: {
    icon: string;
    title: string;
    monthlyRevenue: number;
    description: string;
    provider?: string;
    setupCost?: number;
    roi?: number;
    formFields?: {
      type: "text" | "number" | "select";
      name: string;
      label: string;
      value: string | number;
      options?: string[];
    }[];
  }[];
  imageAnalysisSummary?: string;
}
