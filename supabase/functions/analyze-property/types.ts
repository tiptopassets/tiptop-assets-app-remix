
export interface AnalysisRequest {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  satelliteImage?: string | null;
}

export interface PropertyInfo {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  details: any;
}

export interface ImageAnalysis {
  roofSize?: number | null;
  roofType?: string | null;
  roofOrientation?: string | null;
  solarArea?: number | null;
  solarPotential?: string | null;
  solarPotentialScore?: number | null;
  roofSizeConfidence?: number | null;
  parkingSpaces?: number | null;
  parkingLength?: number | null;
  parkingWidth?: number | null;
  parkingConfidence?: number | null;
  gardenArea?: number | null;
  gardenPotential?: string | null;
  gardenPotentialScore?: number | null;
  gardenConfidence?: number | null;
  poolPresent?: boolean;
  poolSize?: number | null;
  poolLength?: number | null;
  poolWidth?: number | null;
  poolType?: string | null;
  poolConfidence?: number | null;
  overallReliability?: number | null;
  measurementMethodology?: string | null;
  fullAnalysis?: string;
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
    orientation?: string | null;
    solarCapacity: number | null;
    solarPotential?: boolean;
    revenue: number;
    confidenceScore?: number | null;
    providers?: ProviderInfo[];
    methodology?: string | null;
  };
  garden: {
    area: number | null;
    opportunity: string;
    revenue: number;
    confidenceScore?: number | null;
    providers?: ProviderInfo[];
    methodology?: string | null;
  };
  parking: {
    spaces: number;
    dimensions?: {length: number | null, width: number | null};
    rate: number;
    revenue: number;
    evChargerPotential?: boolean;
    parkingType?: string;
    confidenceScore?: number | null;
    providers?: ProviderInfo[];
    methodology?: string | null;
  };
  pool: {
    present: boolean;
    area: number | null;
    dimensions?: {length: number | null, width: number | null};
    type: string | null;
    revenue: number;
    confidenceScore?: number | null;
    providers?: ProviderInfo[];
    methodology?: string | null;
  };
  storage: {
    volume: number;
    revenue: number;
    confidenceScore?: number | null;
    providers?: ProviderInfo[];
    methodology?: string | null;
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
    confidenceScore?: number;
    formFields?: {
      type: "text" | "number" | "select";
      name: string;
      label: string;
      value: string | number;
      options?: string[];
    }[];
  }[];
  imageAnalysisSummary?: string;
  overallReliability?: number | null;
}
