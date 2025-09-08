
// Local coordinate type for edge functions
export type LatLng = { lat: number; lng: number };

export interface PropertyInfo {
  address: string;
  coordinates?: LatLng;
  details?: any;
  solarData?: any;
  propertyType?: string;
  classification?: any;
  enhancedData?: any;
  streetViewAnalysis?: any;
}

export interface AnalysisRequest {
  address: string;
  coordinates?: LatLng;
  satelliteImage?: string;
  forceLocalAnalysis?: boolean;
}

export interface ImageAnalysis {
  roofSize?: number;
  parkingSpaces?: number;
  gardenArea?: number;
  hasPool?: boolean;
  poolSize?: number;
  solarPotential?: string;
  summary?: string;
}

export interface PropertyAnalysis {
  propertyType: string;
  subType?: string;
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
  sportsCourts: {
    present: boolean;
    types: string[];
    count: number;
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
  totalMonthlyRevenue?: number; // Add totalMonthlyRevenue field
  propertyValuation?: {
    totalMonthlyRevenue: number;
    totalAnnualRevenue: number;
    totalSetupCosts: number;
    averageROI: number;
    bestOpportunity: string;
  };
}

// Create alias for backward compatibility
export type AnalysisResults = PropertyAnalysis;
