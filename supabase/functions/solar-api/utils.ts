
import { SolarPotentialResponse, FormattedSolarData } from './types.ts';

// Helper function to generate estimated solar data when the API is not available
export function generateEstimatedSolarData(
  coordinates: { lat: number, lng: number }, 
  roofSize: number, 
  countryCode: string
): FormattedSolarData {
  // Base values adjusted by latitude for solar potential
  const latitude = Math.abs(coordinates.lat);
  let solarEfficiencyFactor = 1.0;
  
  // Adjust for latitude - closer to equator = better solar
  if (latitude < 20) {
    solarEfficiencyFactor = 1.3; // Near equator, very good
  } else if (latitude < 30) {
    solarEfficiencyFactor = 1.2; // Good solar region
  } else if (latitude < 40) {
    solarEfficiencyFactor = 1.0; // Average
  } else if (latitude < 50) {
    solarEfficiencyFactor = 0.8; // Below average
  } else {
    solarEfficiencyFactor = 0.6; // Poor solar region
  }
  
  // Country-specific adjustments
  const countryFactors: {[key: string]: number} = {
    'US': 1.0, // Baseline
    'AU': 1.2, // Australia - good sun
    'DE': 0.7, // Germany - less sun
    'UK': 0.6, // United Kingdom - cloudy
    'CA': 0.8, // Canada - northern
    'MX': 1.1, // Mexico - good sun
    'ES': 1.1, // Spain - good sun
    'IT': 1.0, // Italy
    'FR': 0.9, // France
    'IL': 1.1, // Israel - good sun
    'BR': 1.2, // Brazil - good sun
    'IN': 1.1, // India - good sun
    'CN': 0.9  // China - varies
  };
  
  // Apply country factor if available
  if (countryCode in countryFactors) {
    solarEfficiencyFactor *= countryFactors[countryCode];
  }
  
  // Calculate usable roof area (typically 70% of roof can be used)
  const usableRoofArea = roofSize * 0.7;
  
  // Average panel size is about 20 sq ft
  const panelsCount = Math.floor(usableRoofArea / 20);
  
  // Average panel capacity is 300-350 watts
  const panelCapacityWatts = 325;
  
  // Calculate max solar capacity in kW
  const maxSolarCapacityKW = (panelsCount * panelCapacityWatts) / 1000;
  
  // Estimate yearly energy production based on capacity and efficiency factor
  const yearlyEnergyKWh = Math.round(maxSolarCapacityKW * 1400 * solarEfficiencyFactor);
  
  // Calculate monthly revenue (average electricity rate)
  const electricityRate = 0.15; // $0.15 per kWh is a global average
  const yearlyRevenue = yearlyEnergyKWh * electricityRate;
  const monthlyRevenue = Math.round(yearlyRevenue / 12);
  
  // Estimate setup cost ($2.5 per watt is common)
  const setupCost = Math.round(panelCapacityWatts * panelsCount * 2.5);
  
  return {
    roofTotalAreaSqFt: roofSize,
    solarPotential: true,
    maxSolarCapacityKW: parseFloat(maxSolarCapacityKW.toFixed(2)),
    yearlyEnergyKWh: yearlyEnergyKWh,
    panelsCount: panelsCount,
    monthlyRevenue: monthlyRevenue,
    setupCost: setupCost,
    estimatedData: true,
    solarEfficiency: parseFloat((solarEfficiencyFactor * 100).toFixed(0))
  };
}

// Helper function to format the Solar API response into our app's data model
export function formatSolarData(apiResponse: SolarPotentialResponse): FormattedSolarData {
  // Default values in case the API response is incomplete
  const defaultData: FormattedSolarData = {
    roofTotalAreaSqFt: 0,
    solarPotential: true,
    maxSolarCapacityKW: 0,
    yearlyEnergyKWh: 0,
    panelsCount: 0,
    averageHoursOfSunPerYear: 0,
    carbonOffsetKg: 0,
    monthlyRevenue: 0,
    setupCost: 0,
    roofSegments: [],
    financialAnalysis: {
      initialYearlyProduction: 0,
      federalIncentiveValue: 0,
      panelLifetimeYears: 25
    }
  };

  if (!apiResponse.solarPotential) {
    return defaultData;
  }

  try {
    // Convert square meters to square feet for roof area
    const totalRoofAreaSqFt = apiResponse.roofs.reduce(
      (total, roof) => total + convertSquareMetersToSquareFeet(roof.areaMeters2),
      0
    );

    // Get the best configuration (usually the one with the most panels)
    const bestConfig = apiResponse.solarPotential.solarPanelConfigs.reduce(
      (best, current) => (current.panelsCount > best.panelsCount ? current : best),
      apiResponse.solarPotential.solarPanelConfigs[0] || { panelsCount: 0, yearlyEnergyDcKwh: 0 }
    );

    // Calculate max solar capacity in kW
    const maxSolarCapacityKW = 
      (apiResponse.solarPotential.panelCapacityWatts * bestConfig.panelsCount) / 1000;

    // Calculate monthly revenue (simplified estimate)
    // Average electricity rate of $0.15 per kWh
    const electricityRate = 0.15;
    const yearlyRevenue = bestConfig.yearlyEnergyDcKwh * electricityRate;
    const monthlyRevenue = Math.round(yearlyRevenue / 12);

    // Estimate setup cost ($2.5 per watt is a common industry estimate)
    const setupCostPerWatt = 2.5;
    const setupCost = Math.round(
      apiResponse.solarPotential.panelCapacityWatts * 
      bestConfig.panelsCount * 
      setupCostPerWatt
    );

    // Format financial analysis
    const financialAnalysis = {
      initialYearlyProduction: apiResponse.solarPotential.financialAnalysis?.initialAcKwhPerYear || 0,
      federalIncentiveValue: 
        apiResponse.solarPotential.financialAnalysis?.federalIncentiveValue?.units || 0,
      panelLifetimeYears: 
        apiResponse.solarPotential.financialAnalysis?.panelLifetimeYears || 25
    };

    // Build the response
    return {
      roofTotalAreaSqFt: Math.round(totalRoofAreaSqFt),
      solarPotential: true,
      maxSolarCapacityKW: parseFloat(maxSolarCapacityKW.toFixed(2)),
      yearlyEnergyKWh: Math.round(bestConfig.yearlyEnergyDcKwh),
      panelsCount: bestConfig.panelsCount,
      averageHoursOfSunPerYear: 
        apiResponse.solarPotential.maxSunshineHoursPerYear || 0,
      carbonOffsetKg: 
        (apiResponse.solarPotential.carbonOffsetFactorKgPerMwh * bestConfig.yearlyEnergyDcKwh) / 1000,
      monthlyRevenue: monthlyRevenue,
      setupCost: setupCost,
      roofSegments: apiResponse.roofs.map(roof => ({
        areaSqFt: Math.round(convertSquareMetersToSquareFeet(roof.areaMeters2)),
        pitchDegrees: roof.pitchDegrees,
        azimuthDegrees: roof.azimuthDegrees,
        sunshineQuantiles: roof.sunshineQuantiles
      })),
      financialAnalysis: financialAnalysis
    };
  } catch (error) {
    console.error('Error formatting solar data:', error);
    return defaultData;
  }
}

// Helper function to convert square meters to square feet
export function convertSquareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters * 10.764;
}
