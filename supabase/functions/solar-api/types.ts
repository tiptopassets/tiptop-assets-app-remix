
export interface SolarApiRequest {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SolarData {
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
}

export interface SolarApiResult {
  solarData?: SolarData;
  rawResponse?: any;
  error?: string;
  details?: string;
  apiError?: any;
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

export interface SolarPotentialResponse {
  solarPotential: {
    maxArrayPanels: number;
    panelCapacityWatts: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    roofSegmentStats: Array<{
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
      center: {
        latitude: number;
        longitude: number;
      };
      boundingBox: {
        sw: { latitude: number; longitude: number };
        ne: { latitude: number; longitude: number };
      };
    }>;
    solarPanelConfigs: Array<{
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      roofSegmentSummaries: Array<{
        panelsCount: number;
        yearlyEnergyDcKwh: number;
        segmentIndex: number;
      }>;
    }>;
    financialAnalyses: Array<{
      monthlyBill: {
        currencyCode: string;
        units: number;
        nanos: number;
      };
      defaultBill: boolean;
      averageKwhPerMonth: number;
      panelConfigIndex: number;
    }>;
  };
  buildingInsights: {
    name: string;
    center: {
      latitude: number;
      longitude: number;
    };
    boundingBox: {
      sw: { latitude: number; longitude: number };
      ne: { latitude: number; longitude: number };
    };
    imageryDate: {
      year: number;
      month: number;
      day: number;
    };
    postalCode: string;
    administrativeArea: string;
    statisticalArea: {
      areaMeters2: number;
      groundAreaMeters2: number;
    };
    regionCode: string;
  };
}
