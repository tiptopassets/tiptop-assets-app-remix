
import { AnalysisResults } from './types';
import { ensureCoordinates, getValidatedMarketData } from './coordinateService';
import { validateParkingRevenue } from '@/utils/revenueValidator';
import { processPropertyAnalysis } from './dataFlowManager';

// Helper function to generate mock analysis data with centralized validation
export const generateLocalMockAnalysis = async (
  address: string, 
  coordinates?: google.maps.LatLngLiteral
): Promise<AnalysisResults> => {
  console.log("🏠 Generating mock analysis for:", address, coordinates);
  
  // Step 1: Ensure coordinates are always available
  const coordinateResult = await ensureCoordinates(address, coordinates);
  console.log("📍 Coordinate result:", coordinateResult);
  
  // Step 2: Get validated market data
  const marketData = getValidatedMarketData(coordinateResult);
  console.log("📊 Market data:", marketData);
  
  // Step 3: Enhanced property type detection
  const isApartment = /apartment|apt|flat|condo|unit/i.test(address);
  const isRural = /farm|ranch|rural|country|acres/i.test(address);
  const isCommercial = /office|commercial|business|corp|inc|llc|plaza|center|mall|store|shop|warehouse|industrial/i.test(address);
  const isHotel = /hotel|motel|inn|resort|lodge/i.test(address);
  
  // Enhanced property type classification
  let propertyType = "Single Family Home";
  let roofSize = 1800; // Average roof size in sq ft
  let parkingSpaces = 2; // Default parking spaces
  let gardenArea = 800; // Default garden area in sq ft
  let hasPool = Math.random() > 0.7; // 30% chance of having a pool
  let poolSize = 450; // Default pool size if present
  
  // Property-specific adjustments with realistic constraints
  if (isCommercial) {
    propertyType = "Commercial Property";
    roofSize = 5000 + Math.floor(Math.random() * 10000);
    parkingSpaces = Math.floor(Math.random() * 8) + 5; // 5-12 spaces (realistic for small commercial)
    gardenArea = Math.floor(Math.random() * 200);
    hasPool = false;
    console.log("🏢 Detected commercial property");
  } else if (isHotel) {
    propertyType = "Hotel / Lodging";
    roofSize = 3000 + Math.floor(Math.random() * 7000);
    parkingSpaces = Math.floor(Math.random() * 15) + 10; // 10-24 spaces
    gardenArea = Math.floor(Math.random() * 500);
    hasPool = Math.random() > 0.4; // 60% chance of pool
  } else if (isApartment) {
    propertyType = "Apartment / Condo";
    roofSize = 0; // Individual apartments don't own the roof
    parkingSpaces = Math.floor(Math.random() * 2) + 1; // 1-2 spaces for apartments
    gardenArea = Math.floor(Math.random() * 100);
    hasPool = false;
  } else if (isRural) {
    propertyType = "Rural Property";
    roofSize = 2200;
    parkingSpaces = Math.floor(Math.random() * 4) + 3; // 3-6 spaces
    gardenArea = 5000 + Math.floor(Math.random() * 10000);
    hasPool = Math.random() > 0.5; // 50% chance of pool
  }
  
  // Step 4: Calculate revenues using validated market data and central validation
  const parkingValidation = validateParkingRevenue(
    parkingSpaces,
    marketData.parkingRates,
    propertyType,
    20 // 20 days per month
  );
  
  console.log("💰 Parking validation result:", parkingValidation);
  
  // Calculate other financials with validation
  const solarRevenue = roofSize > 0 ? Math.round((roofSize * 0.7) / 15 * 0.15 * marketData.solarSavings) : 0;
  const gardenRevenue = Math.round(gardenArea * 0.02);
  const poolRevenue = hasPool ? Math.round(poolSize * 0.4) : 0;
  const storageRevenue = Math.round(roofSize * 0.1);
  const bandwidthRevenue = 35; // Fixed internet sharing revenue
  
  // Step 5: Create raw analysis
  const rawAnalysis: AnalysisResults = {
    propertyType: propertyType,
    amenities: [],
    rooftop: {
      area: roofSize,
      solarCapacity: Math.round((roofSize * 0.7) / 15),
      revenue: solarRevenue,
      type: "composite",
      solarPotential: roofSize > 0
    },
    garden: {
      area: gardenArea,
      opportunity: gardenArea > 500 ? "High" : gardenArea > 200 ? "Medium" : "Low",
      revenue: gardenRevenue
    },
    parking: {
      spaces: parkingSpaces,
      rate: marketData.parkingRates,
      revenue: parkingValidation.validatedRevenue
    },
    pool: {
      present: hasPool,
      area: hasPool ? poolSize : 0,
      type: hasPool ? "In-ground" : "none",
      revenue: poolRevenue
    },
    sportsCourts: {
      present: propertyType === "Commercial" || address.toLowerCase().includes("court") || address.toLowerCase().includes("tennis") || address.toLowerCase().includes("sport"),
      types: propertyType === "Commercial" || address.toLowerCase().includes("court") ? ["tennis", "pickleball"] : [],
      count: propertyType === "Commercial" || address.toLowerCase().includes("court") ? 2 : 0,
      revenue: propertyType === "Commercial" || address.toLowerCase().includes("court") ? Math.round(200 * 1.5) : 0
    },
    storage: {
      volume: Math.round(roofSize * 0.3),
      revenue: storageRevenue
    },
    bandwidth: {
      available: 500,
      revenue: bandwidthRevenue
    },
    shortTermRental: {
      nightlyRate: 0,
      monthlyProjection: 0
    },
    permits: [],
    restrictions: isCommercial ? "Commercial properties may require additional permits for monetization activities. Check local zoning laws." : null,
    topOpportunities: [] // Will be populated by processPropertyAnalysis
  };
  
  // Step 6: Process through centralized data flow manager for consistency
  const processedResult = await processPropertyAnalysis(rawAnalysis, {
    address,
    coordinates: coordinateResult.coordinates,
    propertyType
  });
  
  console.log("✅ Generated analysis with validation log:", {
    propertyType: processedResult.analysisResults.propertyType,
    parkingRevenue: processedResult.analysisResults.parking.revenue,
    validationLog: processedResult.validationLog,
    coordinateSource: processedResult.coordinateResult.source
  });
  
  return processedResult.analysisResults;
};
