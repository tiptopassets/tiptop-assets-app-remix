
export interface SolarApiRequest {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GeocodeResult {
  coordinates?: {
    lat: number;
    lng: number;
  };
  countryCode?: string;
  limitedSupport?: boolean;
  unsupported?: boolean;
  error?: string;
  details?: string;
}

export interface SolarApiResult {
  solarData?: any;
  rawResponse?: any;
  error?: string;
  details?: string;
  apiError?: any;
}

export interface SolarPotentialResponse {
  solarPotential?: {
    maxArrayPanelsCount?: number;
    maxArrayAreaMeters2?: number;
    maxSunshineHoursPerYear?: number;
    carbonOffsetFactorKgPerMwh?: number;
    wholeRoofStats?: {
      areaMeters2?: number;
      sunshineQuantiles?: number[];
      groundAreaMeters2?: number;
    };
    roofSegmentStats?: Array<{
      pitchDegrees?: number;
      azimuthDegrees?: number;
      stats?: {
        areaMeters2?: number;
        sunshineQuantiles?: number[];
        groundAreaMeters2?: number;
      };
      center?: {
        latitude?: number;
        longitude?: number;
      };
      boundingBox?: {
        sw?: { latitude?: number; longitude?: number };
        ne?: { latitude?: number; longitude?: number };
      };
      planeHeightAtCenterMeters?: number;
    }>;
    solarPanelConfigs?: Array<{
      panelsCount?: number;
      yearlyEnergyDcKwh?: number;
      roofSegmentSummaries?: Array<{
        pitchDegrees?: number;
        azimuthDegrees?: number;
        panelsCount?: number;
        yearlyEnergyDcKwh?: number;
        segmentIndex?: number;
        azimuthStats?: {
          areaMeters2?: number;
          sunshineQuantiles?: number[];
          groundAreaMeters2?: number;
        };
      }>;
    }>;
    financialAnalyses?: Array<{
      monthlyBill?: {
        currencyCode?: string;
        units?: string;
      };
      defaultBill?: boolean;
      averageKwhPerMonth?: number;
      buybackRate?: {
        currencyCode?: string;
        units?: string;
      };
      solarIncentives?: {
        currencyCode?: string;
        units?: string;
      };
      federalIncentive?: {
        currencyCode?: string;
        units?: string;
      };
      stateIncentive?: {
        currencyCode?: string;
        units?: string;
      };
      utilityIncentive?: {
        currencyCode?: string;
        units?: string;
      };
      lifetimeSrecTotal?: {
        currencyCode?: string;
        units?: string;
      };
      costOfElectricityWithoutSolar?: {
        currencyCode?: string;
        units?: string;
      };
      netMeteringAllowed?: boolean;
      solarPercentage?: number;
      percentageExportedToGrid?: number;
    }>;
  };
  buildingInsights?: {
    name?: string;
    center?: {
      latitude?: number;
      longitude?: number;
    };
    imageryDate?: {
      year?: number;
      month?: number;
      day?: number;
    };
    postalCode?: string;
    administrativeArea?: string;
    statisticalArea?: string;
    regionCode?: string;
    solarPotential?: {
      maxArrayPanelsCount?: number;
      panelCapacityWatts?: number;
      panelHeightMeters?: number;
      panelWidthMeters?: number;
      panelLifetimeYears?: number;
      maxArrayAreaMeters2?: number;
      maxSunshineHoursPerYear?: number;
      carbonOffsetFactorKgPerMwh?: number;
    };
    statsInsights?: {
      areaStats?: {
        roofAreaMeters2?: number;
        groundAreaMeters2?: number;
      };
      sunshineStats?: {
        totalSunshineHours?: number;
      };
    };
  };
}
