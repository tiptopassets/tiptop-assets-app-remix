
import { FormattedSolarData, RoofSegmentData, PanelConfiguration } from './types.ts';

// Helper function to generate estimated solar data when the API is not available
export function generateEstimatedSolarData(
  coordinates: { lat: number, lng: number }, 
  roofSizeSqFt: number, 
  countryCode: string = ''
): FormattedSolarData {
  // Enhanced estimation based on geographic location
  const latitude = Math.abs(coordinates.lat);
  
  // Solar irradiance estimation based on latitude
  let solarIrradiance = 1600; // kWh/m²/year baseline
  
  if (latitude < 25) {
    solarIrradiance = 1800; // Tropical regions
  } else if (latitude < 35) {
    solarIrradiance = 1650; // Subtropical
  } else if (latitude < 45) {
    solarIrradiance = 1500; // Temperate
  } else if (latitude < 55) {
    solarIrradiance = 1200; // Northern temperate
  } else {
    solarIrradiance = 1000; // Northern regions
  }
  
  // Country-specific adjustments
  const countryMultipliers: Record<string, number> = {
    'US': 1.0,
    'AU': 1.2,  // Australia - high solar
    'ES': 1.1,  // Spain - high solar
    'DE': 0.9,  // Germany - moderate solar
    'UK': 0.8,  // UK - lower solar
    'NO': 0.7,  // Norway - low solar
    'CA': 0.9   // Canada - moderate solar
  };
  
  const countryMultiplier = countryMultipliers[countryCode] || 1.0;
  solarIrradiance *= countryMultiplier;
  
  // Calculate estimates
  const usableRoofPercent = 0.65; // 65% of roof typically usable
  const usableRoofSqFt = roofSizeSqFt * usableRoofPercent;
  const usableRoofSqM = usableRoofSqFt / 10.764;
  
  // Solar panel efficiency (15W per sq ft average)
  const solarCapacityKW = (usableRoofSqFt * 15) / 1000;
  const yearlyEnergyKWh = Math.round(solarCapacityKW * solarIrradiance);
  const panelsCount = Math.round(solarCapacityKW / 0.4); // 400W panels
  
  // Revenue calculation (varies by region)
  const electricityRates: Record<string, number> = {
    'US': 0.13,
    'DE': 0.30,
    'AU': 0.25,
    'UK': 0.20,
    'CA': 0.12,
    'ES': 0.22
  };
  
  const electricityRate = electricityRates[countryCode] || 0.15;
  const monthlyRevenue = Math.round((yearlyEnergyKWh * electricityRate) / 12);
  
  // Setup cost estimation
  const costPerKW = countryCode === 'US' ? 2500 : 3000; // Higher costs outside US
  const setupCost = Math.round(solarCapacityKW * costPerKW);

  // Estimated sun exposure hours (varies by latitude and season)
  const maxSunshineHoursPerYear = Math.round(solarIrradiance / 5.5); // Rough approximation

  return {
    roofAreaSqFt: Math.round(roofSizeSqFt),
    maxArrayAreaSqFt: Math.round(usableRoofSqFt),
    maxSolarCapacityKW: Math.round(solarCapacityKW * 100) / 100,
    yearlyEnergyKWh,
    panelsCount,
    monthlyRevenue,
    setupCost,
    dataSource: 'estimated',
    usingRealSolarData: false,
    estimationMethod: `Geographic estimation for ${countryCode || 'unknown region'} at ${latitude.toFixed(1)}° latitude`,
    maxSunshineHoursPerYear,
    panelCapacityWatts: 400, // Standard panel size
    panelHeightMeters: 2.0,
    panelWidthMeters: 1.0,
    panelLifetimeYears: 25
  };
}

// Enhanced function to format the Solar API response into our app's data model with detailed extraction
export function formatSolarData(rawData: any): FormattedSolarData {
  console.log('🔍 Raw Solar API Response:', JSON.stringify(rawData, null, 2));

  if (!rawData) {
    return generateFallbackSolarData();
  }

  const solarPotential = rawData.solarPotential;
  const buildingInsights = rawData.buildingInsights;
  
  if (!solarPotential && !buildingInsights) {
    return generateFallbackSolarData();
  }

  // Extract roof area with enhanced precision
  let roofAreaSqM = 0;
  if (buildingInsights?.statsInsights?.areaStats?.roofAreaMeters2) {
    roofAreaSqM = buildingInsights.statsInsights.areaStats.roofAreaMeters2;
  } else if (solarPotential?.wholeRoofStats?.areaMeters2) {
    roofAreaSqM = solarPotential.wholeRoofStats.areaMeters2;
  }

  const roofAreaSqFt = convertSquareMetersToSquareFeet(roofAreaSqM);

  // Extract maximum sunshine hours per year
  let maxSunshineHoursPerYear = 0;
  if (buildingInsights?.solarPotential?.maxSunshineHoursPerYear) {
    maxSunshineHoursPerYear = buildingInsights.solarPotential.maxSunshineHoursPerYear;
  } else if (solarPotential?.maxSunshineHoursPerYear) {
    maxSunshineHoursPerYear = solarPotential.maxSunshineHoursPerYear;
  }

  // Extract detailed roof segment data
  const roofSegments: RoofSegmentData[] = [];
  if (solarPotential?.roofSegmentStats) {
    solarPotential.roofSegmentStats.forEach((segment: any) => {
      if (segment.pitchDegrees !== undefined && segment.azimuthDegrees !== undefined) {
        const sunshineHours = segment.stats?.sunshineQuantiles?.[5] || 0; // Use median sunshine quantile
        roofSegments.push({
          pitchDegrees: segment.pitchDegrees,
          azimuthDegrees: segment.azimuthDegrees,
          areaMeters2: segment.stats?.areaMeters2 || 0,
          sunshineHours: sunshineHours,
          centerLatitude: segment.center?.latitude || 0,
          centerLongitude: segment.center?.longitude || 0,
          planeHeightMeters: segment.planeHeightAtCenterMeters || 0
        });
      }
    });
  }

  // Extract panel configurations with detailed breakdown
  const panelConfigurations: PanelConfiguration[] = [];
  let maxSolarCapacityKW = 0;
  let yearlyEnergyKWh = 0;
  let maxArrayAreaSqM = 0;

  if (solarPotential?.solarPanelConfigs?.length > 0) {
    solarPotential.solarPanelConfigs.forEach((config: any, index: number) => {
      if (config.panelsCount && config.yearlyEnergyDcKwh) {
        const panelConfig: PanelConfiguration = {
          panelsCount: config.panelsCount,
          yearlyEnergyDcKwh: config.yearlyEnergyDcKwh,
          roofSegmentSummaries: config.roofSegmentSummaries || []
        };
        panelConfigurations.push(panelConfig);

        // Use the best (first) configuration for main metrics
        if (index === 0) {
          yearlyEnergyKWh = config.yearlyEnergyDcKwh;
          // Estimate capacity based on energy production (rough approximation)
          maxSolarCapacityKW = Math.round((config.yearlyEnergyDcKwh / 1200) * 100) / 100;
          
          // Calculate array area from roof segment summaries
          if (config.roofSegmentSummaries) {
            config.roofSegmentSummaries.forEach((summary: any) => {
              if (summary.azimuthStats?.areaMeters2) {
                maxArrayAreaSqM += summary.azimuthStats.areaMeters2;
              }
            });
          }
        }
      }
    });
  }

  const maxArrayAreaSqFt = convertSquareMetersToSquareFeet(maxArrayAreaSqM);

  // Extract panel specifications
  const panelCapacityWatts = buildingInsights?.solarPotential?.panelCapacityWatts || 400;
  const panelHeightMeters = buildingInsights?.solarPotential?.panelHeightMeters || 2.0;
  const panelWidthMeters = buildingInsights?.solarPotential?.panelWidthMeters || 1.0;
  const panelLifetimeYears = buildingInsights?.solarPotential?.panelLifetimeYears || 25;

  // Calculate panels count
  const panelsCount = panelConfigurations.length > 0 ? 
    panelConfigurations[0].panelsCount : 
    Math.round(maxSolarCapacityKW / (panelCapacityWatts / 1000));
  
  // Calculate monthly revenue (enhanced calculation)
  const averageElectricityRate = 0.13; // $0.13 per kWh average in US
  const monthlyRevenue = Math.round((yearlyEnergyKWh * averageElectricityRate) / 12);
  
  // Estimate setup costs based on system size
  const setupCost = Math.round(maxSolarCapacityKW * 2500); // $2500 per kW average

  // Extract imagery date
  const imageryDate = buildingInsights?.imageryDate;

  // Extract carbon offset factor
  const carbonOffsetFactorKgPerMwh = solarPotential?.carbonOffsetFactorKgPerMwh || 
    buildingInsights?.solarPotential?.carbonOffsetFactorKgPerMwh || 400;

  console.log('✅ Enhanced Solar Data Extracted:', {
    roofAreaSqFt: Math.round(roofAreaSqFt),
    maxSunshineHoursPerYear,
    roofSegmentsCount: roofSegments.length,
    panelConfigurationsCount: panelConfigurations.length,
    yearlyEnergyKWh,
    panelsCount
  });

  return {
    roofAreaSqFt: Math.round(roofAreaSqFt),
    maxArrayAreaSqFt: Math.round(maxArrayAreaSqFt),
    maxSolarCapacityKW: Math.round(maxSolarCapacityKW * 100) / 100,
    yearlyEnergyKWh: Math.round(yearlyEnergyKWh),
    panelsCount,
    monthlyRevenue,
    setupCost: Math.round(setupCost),
    dataSource: 'google_solar_api',
    usingRealSolarData: true,
    maxSunshineHoursPerYear,
    roofSegments,
    panelConfigurations,
    panelCapacityWatts,
    panelHeightMeters,
    panelWidthMeters,
    panelLifetimeYears,
    carbonOffsetFactorKgPerMwh,
    imageryDate
  };
}

// Helper function to convert square meters to square feet
export function convertSquareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters * 10.764;
}

function generateFallbackSolarData(): FormattedSolarData {
  return {
    roofAreaSqFt: 0,
    maxArrayAreaSqFt: 0,
    maxSolarCapacityKW: 0,
    yearlyEnergyKWh: 0,
    panelsCount: 0,
    monthlyRevenue: 0,
    setupCost: 0,
    dataSource: 'unavailable',
    usingRealSolarData: false
  };
}
