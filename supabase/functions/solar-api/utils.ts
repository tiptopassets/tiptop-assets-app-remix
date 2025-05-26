import { SolarPotentialResponse, FormattedSolarData } from './types.ts';

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
    estimationMethod: `Geographic estimation for ${countryCode || 'unknown region'} at ${latitude.toFixed(1)}° latitude`
  };
}

// Helper function to format the Solar API response into our app's data model
export function formatSolarData(rawData: any): FormattedSolarData {
  // Enhanced solar data formatting with better error handling
  if (!rawData) {
    return generateFallbackSolarData();
  }

  const solarPotential = rawData.solarPotential;
  const buildingInsights = rawData.buildingInsights;
  
  if (!solarPotential && !buildingInsights) {
    return generateFallbackSolarData();
  }

  // Extract roof area
  let roofAreaSqM = 0;
  if (buildingInsights?.statsInsights?.areaStats?.roofAreaMeters2) {
    roofAreaSqM = buildingInsights.statsInsights.areaStats.roofAreaMeters2;
  } else if (solarPotential?.wholeRoofStats?.areaMeters2) {
    roofAreaSqM = solarPotential.wholeRoofStats.areaMeters2;
  }

  const roofAreaSqFt = convertSquareMetersToSquareFeet(roofAreaSqM);

  // Extract solar capacity
  let maxArrayAreaSqM = 0;
  let maxSolarCapacityKW = 0;
  
  if (solarPotential?.solarPanelConfigs?.length > 0) {
    const bestConfig = solarPotential.solarPanelConfigs[0];
    maxArrayAreaSqM = bestConfig.roofSegmentSummaries?.[0]?.azimuthStats?.areaMeters2 || 0;
    maxSolarCapacityKW = bestConfig.yearlyEnergyDcKwh ? bestConfig.yearlyEnergyDcKwh / 1200 : 0;
  }

  const maxArrayAreaSqFt = convertSquareMetersToSquareFeet(maxArrayAreaSqM);

  // Calculate yearly energy production
  let yearlyEnergyKWh = 0;
  if (solarPotential?.solarPanelConfigs?.length > 0) {
    yearlyEnergyKWh = solarPotential.solarPanelConfigs[0].yearlyEnergyDcKwh || 0;
  }

  // Estimate panels count
  const panelsCount = maxSolarCapacityKW > 0 ? Math.round(maxSolarCapacityKW / 0.4) : 0;
  
  // Calculate monthly revenue (simplified)
  const monthlyRevenue = Math.round((yearlyEnergyKWh * 0.12) / 12); // $0.12 per kWh average
  
  // Estimate setup costs
  const setupCost = maxSolarCapacityKW * 2500; // $2500 per kW average

  return {
    roofAreaSqFt: Math.round(roofAreaSqFt),
    maxArrayAreaSqFt: Math.round(maxArrayAreaSqFt),
    maxSolarCapacityKW: Math.round(maxSolarCapacityKW * 100) / 100,
    yearlyEnergyKWh: Math.round(yearlyEnergyKWh),
    panelsCount,
    monthlyRevenue,
    setupCost: Math.round(setupCost),
    dataSource: 'google_solar_api',
    usingRealSolarData: true
  };
}

// Helper function to convert square meters to square feet
export function convertSquareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters * 10.764;
}

function generateFallbackSolarData() {
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
