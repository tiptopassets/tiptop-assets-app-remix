
import { SolarData } from './types.ts';

export function formatSolarData(rawData: any): SolarData {
  try {
    const solarPotential = rawData.solarPotential;
    const buildingInsights = rawData.buildingInsights;
    
    if (!solarPotential) {
      throw new Error('Solar potential data missing');
    }

    // Enhanced roof area calculation
    let totalRoofArea = 0;
    let usableRoofArea = 0;
    
    if (solarPotential.roofSegmentStats && solarPotential.roofSegmentStats.length > 0) {
      // Sum all roof segments for total area
      totalRoofArea = solarPotential.roofSegmentStats.reduce((sum: number, segment: any) => {
        return sum + (segment.stats?.areaMeters2 || 0);
      }, 0);
      
      // Calculate usable area (segments with good solar potential)
      usableRoofArea = solarPotential.roofSegmentStats.reduce((sum: number, segment: any) => {
        const sunshineQuantiles = segment.stats?.sunshineQuantiles || [];
        // Consider segments with decent sunshine (above 50th percentile)
        const avgSunshine = sunshineQuantiles.length > 5 ? sunshineQuantiles[5] : 0;
        return avgSunshine > 500 ? sum + (segment.stats?.areaMeters2 || 0) : sum;
      }, 0);
    } else if (buildingInsights?.statisticalArea?.areaMeters2) {
      // Fallback to building area if roof segments not available
      totalRoofArea = buildingInsights.statisticalArea.areaMeters2;
      usableRoofArea = totalRoofArea * 0.7; // Estimate 70% usable
    }

    // Convert to square feet
    const totalRoofAreaSqFt = Math.round(totalRoofArea * 10.764);
    const usableRoofAreaSqFt = Math.round(usableRoofArea * 10.764);

    // Enhanced solar capacity calculation
    const maxArrayPanels = solarPotential.maxArrayPanels || 0;
    const panelCapacityWatts = solarPotential.panelCapacityWatts || 400; // Default 400W panels
    const maxSolarCapacityKW = Math.round((maxArrayPanels * panelCapacityWatts) / 1000);

    // Calculate yearly energy production
    const maxArrayAreaMeters2 = solarPotential.maxArrayAreaMeters2 || usableRoofArea;
    const solarPanelConfigs = solarPotential.solarPanelConfigs || [];
    
    let yearlyEnergyKWh = 0;
    if (solarPanelConfigs.length > 0) {
      // Use the highest efficiency configuration
      const bestConfig = solarPanelConfigs.reduce((best: any, current: any) => {
        return (current.yearlyEnergyDcKwh || 0) > (best.yearlyEnergyDcKwh || 0) ? current : best;
      });
      yearlyEnergyKWh = Math.round(bestConfig.yearlyEnergyDcKwh || 0);
    } else {
      // Estimate based on capacity and location (assuming 4-5 peak sun hours)
      yearlyEnergyKWh = Math.round(maxSolarCapacityKW * 4.5 * 365);
    }

    // Enhanced revenue calculation
    const avgElectricityRate = 0.15; // $0.15 per kWh average
    const netMeteringRate = 0.10; // $0.10 per kWh for excess energy
    const monthlyEnergyKWh = yearlyEnergyKWh / 12;
    
    // Assume 70% self-consumption, 30% grid export
    const selfConsumptionSavings = monthlyEnergyKWh * 0.7 * avgElectricityRate;
    const exportRevenue = monthlyEnergyKWh * 0.3 * netMeteringRate;
    const monthlyRevenue = Math.round(selfConsumptionSavings + exportRevenue);

    // Enhanced setup cost calculation
    const costPerWatt = 3.50; // $3.50/W average installed cost
    const setupCost = Math.round(maxSolarCapacityKW * 1000 * costPerWatt);

    // Calculate payback period
    const paybackYears = monthlyRevenue > 0 ? Math.round(setupCost / (monthlyRevenue * 12)) : 0;

    return {
      roofTotalAreaSqFt: totalRoofAreaSqFt,
      roofUsableAreaSqFt: usableRoofAreaSqFt,
      maxSolarCapacityKW: maxSolarCapacityKW,
      panelsCount: maxArrayPanels,
      yearlyEnergyKWh: yearlyEnergyKWh,
      monthlyRevenue: monthlyRevenue,
      setupCost: setupCost,
      paybackYears: paybackYears,
      solarPotential: yearlyEnergyKWh > 0,
      panelCapacityWatts: panelCapacityWatts,
      carbonOffsetKgCO2: Math.round(yearlyEnergyKWh * 0.7) // kg CO2 offset per year
    };
  } catch (error) {
    console.error('Error formatting solar data:', error);
    throw new Error(`Failed to format solar data: ${error.message}`);
  }
}

export function generateEstimatedSolarData(
  coordinates: { lat: number; lng: number },
  estimatedRoofSize: number,
  countryCode: string
): SolarData {
  // Enhanced estimation based on geographical location
  const lat = Math.abs(coordinates.lat);
  
  // Solar irradiance factors by latitude and country
  let solarIrradianceMultiplier = 1.0;
  if (countryCode === 'US') {
    if (lat < 25) solarIrradianceMultiplier = 1.4; // Southern states
    else if (lat < 35) solarIrradianceMultiplier = 1.2; // Sunbelt
    else if (lat < 45) solarIrradianceMultiplier = 1.0; // Northern states
    else solarIrradianceMultiplier = 0.8; // Far north
  } else {
    // International estimation
    if (lat < 30) solarIrradianceMultiplier = 1.3;
    else if (lat < 40) solarIrradianceMultiplier = 1.1;
    else if (lat < 50) solarIrradianceMultiplier = 0.9;
    else solarIrradianceMultiplier = 0.7;
  }

  // Enhanced roof analysis
  const usableRoofPercent = 0.65; // More conservative estimate
  const usableRoofArea = Math.round(estimatedRoofSize * usableRoofPercent);
  
  // Solar panel specifications
  const panelEfficiency = 0.20; // 20% efficient panels
  const panelSizeWatts = 400; // 400W panels
  const panelAreaSqFt = 21.5; // Typical panel size
  
  const maxPanels = Math.floor(usableRoofArea / panelAreaSqFt);
  const maxCapacityKW = Math.round((maxPanels * panelSizeWatts) / 1000);
  
  // Energy production calculation
  const peakSunHours = 4.5 * solarIrradianceMultiplier;
  const systemEfficiency = 0.85; // Account for inverter losses, shading, etc.
  const yearlyEnergyKWh = Math.round(maxCapacityKW * peakSunHours * 365 * systemEfficiency);
  
  // Economic calculations
  const electricityRate = countryCode === 'US' ? 0.15 : 0.12; // Local rates
  const netMeteringRate = electricityRate * 0.8;
  const monthlyEnergyKWh = yearlyEnergyKWh / 12;
  
  const monthlyRevenue = Math.round(monthlyEnergyKWh * electricityRate * 0.8);
  const setupCost = Math.round(maxCapacityKW * 1000 * 3.50);
  const paybackYears = monthlyRevenue > 0 ? Math.round(setupCost / (monthlyRevenue * 12)) : 0;

  return {
    roofTotalAreaSqFt: estimatedRoofSize,
    roofUsableAreaSqFt: usableRoofArea,
    maxSolarCapacityKW: maxCapacityKW,
    panelsCount: maxPanels,
    yearlyEnergyKWh: yearlyEnergyKWh,
    monthlyRevenue: monthlyRevenue,
    setupCost: setupCost,
    paybackYears: paybackYears,
    solarPotential: yearlyEnergyKWh > 3000, // Minimum viable threshold
    panelCapacityWatts: panelSizeWatts,
    carbonOffsetKgCO2: Math.round(yearlyEnergyKWh * 0.7)
  };
}

export function convertSquareMetersToSquareFeet(squareMeters: number): number {
  return Math.round(squareMeters * 10.764);
}
