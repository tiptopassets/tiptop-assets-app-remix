
// Define interfaces for the response types and requests

export interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  pitchDegrees: number;
  azimuthDegrees: number;
}

export interface SolarPotentialResponse {
  solarPotential: {
    maxArrayPanelsCount: number;
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    panels: {
      center: {
        latitude: number;
        longitude: number;
      };
      orientation: string;
      yearlyEnergyDcKwh: number;
    }[];
    solarPanelConfigs: SolarPanelConfig[];
    financialAnalysis: {
      initialAcKwhPerYear: number;
      remainingLifetimeUtilityBill: {
        currencyCode: string;
        units: string;
        nanos: number;
      };
      federalIncentiveValue: {
        currencyCode: string;
        units: string;
        nanos: number;
      };
      panelLifetimeYears: number;
    };
  };
  roofs: {
    areaMeters2: number;
    centerPoint: {
      latitude: number;
      longitude: number;
    };
    pitchDegrees: number;
    azimuthDegrees: number;
    sunshineQuantiles: number[];
    boundingBox: {
      sw: {
        latitude: number;
        longitude: number;
      };
      ne: {
        latitude: number;
        longitude: number;
      };
    };
  }[];
}

export interface SolarApiRequest {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FormattedSolarData {
  roofTotalAreaSqFt: number;
  solarPotential: boolean;
  maxSolarCapacityKW: number;
  yearlyEnergyKWh: number;
  panelsCount: number;
  averageHoursOfSunPerYear?: number;
  carbonOffsetKg?: number;
  monthlyRevenue: number;
  setupCost: number;
  roofSegments?: Array<{
    areaSqFt: number;
    pitchDegrees: number;
    azimuthDegrees: number;
    sunshineQuantiles: number[];
  }>;
  financialAnalysis?: {
    initialYearlyProduction: number;
    federalIncentiveValue: number;
    panelLifetimeYears: number;
  };
  estimatedData?: boolean;
  solarEfficiency?: number;
}

export interface GeocodeResult {
  coordinates?: {
    lat: number;
    lng: number;
  };
  countryCode?: string;
  unsupported?: boolean;
  error?: string;
  details?: string;
}

export interface SolarApiResult {
  solarData?: FormattedSolarData;
  rawResponse?: any;
  error?: string;
  details?: string;
  apiError?: any;
}
