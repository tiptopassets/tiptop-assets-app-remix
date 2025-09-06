
// Define types for the asset analysis
export interface ProviderInfo {
  name: string;
  setupCost?: number;
  fee?: string | number; // Updated to match GoogleMapContext/types.ts
  roi?: number;
  url?: string;
}

export interface RoofSegmentData {
  pitchDegrees: number;
  azimuthDegrees: number;
  areaMeters2: number;
  sunshineHours: number;
  centerLatitude: number;
  centerLongitude: number;
  planeHeightMeters: number;
}

export interface PanelConfiguration {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: Array<{
    pitchDegrees: number;
    azimuthDegrees: number;
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    segmentIndex: number;
  }>;
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
    // New detailed solar fields
    maxSunshineHoursPerYear?: number;
    roofSegments?: RoofSegmentData[];
    panelConfigurations?: PanelConfiguration[];
    panelCapacityWatts?: number;
    panelHeightMeters?: number;
    panelWidthMeters?: number;
    panelLifetimeYears?: number;
    carbonOffsetFactorKgPerMwh?: number;
    imageryDate?: {
      year: number;
      month: number;
      day: number;
    };
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
    types: string[]; // e.g., ['tennis', 'pickleball', 'basketball']
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
  referralLink?: string;
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
