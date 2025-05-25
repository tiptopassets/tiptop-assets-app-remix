
export interface AnalysisRequest {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  satelliteImage?: string;
  forceLocalAnalysis?: boolean;
}

export interface PropertyInfo {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  details?: any;
  solarData?: {
    roofTotalAreaSqFt: number;
    roofUsableAreaSqFt: number;
    maxSolarCapacityKW: number;
    panelsCount: number;
    yearlyEnergyKWh: number;
    monthlyRevenue: number;
    setupCost: number;
    paybackYears: number;
    solarPotential: boolean;
    panelCapacityWatts: number;
    carbonOffsetKgCO2: number;
  };
}

export interface ImageAnalysis {
  roofSize?: number;
  roofType?: string;
  solarPotential?: string;
  parkingSpaces?: number;
  gardenArea?: number;
  gardenPotential?: string;
  poolPresent?: boolean;
  poolSize?: number;
  poolType?: string;
  fullAnalysis?: string;
}

export interface ServiceProvider {
  name: string;
  setupCost: number;
  roi: number;
  url: string;
  fee?: string;
}

export interface FormField {
  type: 'text' | 'number' | 'select' | 'checkbox';
  name: string;
  label: string;
  value: string | number;
  options?: string[];
}

export interface TopOpportunity {
  icon: string;
  title: string;
  monthlyRevenue: number;
  description: string;
  provider: string;
  setupCost: number;
  roi: number;
  formFields: FormField[];
}

export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    type: string;
    solarCapacity: number;
    solarPotential: boolean;
    revenue: number;
    usingRealSolarData: boolean;
    providers: ServiceProvider[];
    panelsCount?: number;
    yearlyEnergyKWh?: number;
    setupCost?: number;
  };
  garden: {
    area: number;
    opportunity: string;
    revenue: number;
    providers: ServiceProvider[];
  };
  parking: {
    spaces: number;
    rate: number;
    revenue: number;
    evChargerPotential: boolean;
    providers: ServiceProvider[];
  };
  pool: {
    present: boolean;
    area: number;
    type: string;
    revenue: number;
    providers: ServiceProvider[];
  };
  storage: {
    volume: number;
    revenue: number;
    providers: ServiceProvider[];
  };
  bandwidth: {
    available: number;
    revenue: number;
    providers: ServiceProvider[];
  };
  shortTermRental: {
    nightlyRate: number;
    monthlyProjection: number;
    providers: ServiceProvider[];
  };
  permits: string[];
  restrictions: string | null;
  topOpportunities: TopOpportunity[];
  imageAnalysisSummary: string;
  propertyValuation: {
    totalMonthlyRevenue: number;
    totalAnnualRevenue: number;
    totalSetupCosts: number;
    averageROI: number;
    bestOpportunity: string;
  };
}
