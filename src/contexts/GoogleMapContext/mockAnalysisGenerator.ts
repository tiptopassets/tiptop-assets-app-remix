
import { AnalysisResults } from './types';
import { getMarketData } from '@/utils/marketDataService';

// Helper function to generate mock analysis data for local testing
export const generateLocalMockAnalysis = (address: string, coordinates?: google.maps.LatLngLiteral): AnalysisResults => {
  console.log("🏠 Generating mock analysis for:", address, coordinates);
  
  // IMPROVED: Enhanced property type detection with commercial keywords
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
  
  // FIXED: Property-specific adjustments with realistic constraints
  if (isCommercial) {
    propertyType = "Commercial Property";
    roofSize = 5000 + Math.floor(Math.random() * 10000); // Large commercial roof
    parkingSpaces = Math.floor(Math.random() * 8) + 5; // 5-12 spaces (realistic for small commercial)
    gardenArea = Math.floor(Math.random() * 200); // Minimal landscaping
    hasPool = false; // Commercial properties rarely have pools for rental
    console.log("🏢 Detected commercial property, adjusted values for realism");
  } else if (isHotel) {
    propertyType = "Hotel / Lodging";
    roofSize = 3000 + Math.floor(Math.random() * 7000); // Medium to large roof
    parkingSpaces = Math.floor(Math.random() * 15) + 10; // 10-24 spaces
    gardenArea = Math.floor(Math.random() * 500); // Some landscaping
    hasPool = Math.random() > 0.4; // 60% chance of pool
  } else if (isApartment) {
    propertyType = "Apartment / Condo";
    roofSize = 0; // Individual apartments don't own the roof
    parkingSpaces = Math.floor(Math.random() * 2) + 1; // 1-2 spaces for apartments
    gardenArea = Math.floor(Math.random() * 100); // Small or no garden
    hasPool = false; // Individuals don't own pools in apartments
  } else if (isRural) {
    propertyType = "Rural Property";
    roofSize = 2200; // Larger roof for rural properties
    parkingSpaces = Math.floor(Math.random() * 4) + 3; // 3-6 spaces
    gardenArea = 5000 + Math.floor(Math.random() * 10000); // Large garden/yard
    hasPool = Math.random() > 0.5; // 50% chance of pool
  }
  
  // Get market data for consistent pricing if coordinates are available
  let marketData = null;
  let parkingDayRate = 10; // Default fallback rate
  let solarSavings = 150; // Default solar savings
  
  if (coordinates) {
    marketData = getMarketData(coordinates);
    parkingDayRate = marketData.parkingRates;
    solarSavings = marketData.solarSavings;
    
    // FIXED: Apply property-type specific rate adjustments
    if (isCommercial) {
      // Commercial properties typically have higher rates but we need to be realistic
      parkingDayRate = Math.min(parkingDayRate * 1.5, 25); // Cap at $25/day for realism
    } else if (isHotel) {
      // Hotels might have premium rates
      parkingDayRate = Math.min(parkingDayRate * 1.3, 20); // Cap at $20/day
    }
    
    console.log("📊 Market data retrieved with property adjustments:", { 
      originalRate: marketData.parkingRates,
      adjustedRate: parkingDayRate, 
      propertyType,
      solarSavings 
    });
  } else {
    console.log("⚠️ No coordinates available, using default rates");
  }
  
  // FIXED: Consistent parking revenue calculation with validation
  const parkingRevenue = Math.round(parkingSpaces * parkingDayRate * 20);
  
  // ADDED: Validation to prevent unrealistic revenue
  const maxReasonableRevenue = 1000; // Cap monthly parking revenue at $1000
  const validatedParkingRevenue = Math.min(parkingRevenue, maxReasonableRevenue);
  
  if (parkingRevenue > maxReasonableRevenue) {
    console.warn("⚠️ Parking revenue exceeded realistic bounds, capping at $1000/month:", {
      calculated: parkingRevenue,
      capped: validatedParkingRevenue,
      spaces: parkingSpaces,
      rate: parkingDayRate
    });
  }
  
  console.log("💰 Parking revenue calculation:", {
    spaces: parkingSpaces,
    dayRate: parkingDayRate,
    daysPerMonth: 20,
    calculated: parkingRevenue,
    final: validatedParkingRevenue,
    formula: `${parkingSpaces} spaces × $${parkingDayRate}/day × 20 days = $${validatedParkingRevenue}/month`
  });
  
  // Calculate other financials based on property features and market data
  const solarRevenue = Math.round((roofSize * 0.7) / 15 * 0.15 * solarSavings);
  const gardenRevenue = Math.round(gardenArea * 0.02);
  const poolRevenue = hasPool ? Math.round(poolSize * 0.4) : 0;
  const storageRevenue = Math.round(roofSize * 0.1);
  const bandwidthRevenue = 35; // Fixed internet sharing revenue
  
  console.log("💰 All revenue calculations:", {
    solar: solarRevenue,
    parking: validatedParkingRevenue,
    garden: gardenRevenue,
    pool: poolRevenue,
    storage: storageRevenue,
    bandwidth: bandwidthRevenue
  });
  
  // Generate top opportunities sorted by revenue
  const opportunities = [];
  
  // Add solar if roof available
  if (roofSize > 0) {
    opportunities.push({
      icon: "solar",
      title: "Solar Panel Installation",
      monthlyRevenue: solarRevenue,
      description: `Install solar panels on your ${roofSize} sq ft roof for passive income.`,
      provider: "SolarCity",
      setupCost: roofSize * 8,
      roi: Math.ceil((roofSize * 8) / solarRevenue),
      formFields: [
        {
          type: "number" as "number",
          name: "roofSize",
          label: "Roof Size (sq ft)",
          value: roofSize
        },
        {
          type: "select" as "select",
          name: "roofType",
          label: "Roof Type",
          value: "composite",
          options: ["composite", "metal", "tile"]
        }
      ]
    });
  }
  
  // FIXED: Add parking with validated revenue and consistent description
  if (parkingSpaces > 0) {
    opportunities.push({
      icon: "parking",
      title: "Parking Space Rental",
      monthlyRevenue: validatedParkingRevenue, // Use validated revenue
      description: `Rent out ${parkingSpaces} parking spaces at $${parkingDayRate}/day when not in use.`,
      provider: "SpotHero",
      setupCost: 0,
      roi: 1,
      formFields: [
        {
          type: "number" as "number",
          name: "spaces",
          label: "Available Spaces",
          value: parkingSpaces
        },
        {
          type: "text" as "text",
          name: "location",
          label: "Parking Location",
          value: isCommercial ? "Commercial Lot" : "Driveway"
        }
      ]
    });
  }
  
  // Add garden if sufficient size
  if (gardenArea > 100) {
    opportunities.push({
      icon: "garden",
      title: "Garden Space Sharing",
      monthlyRevenue: gardenRevenue,
      description: `Rent out your ${gardenArea} sq ft garden for urban farming.`,
      provider: "SharedEarth",
      setupCost: 200,
      roi: Math.ceil(200 / gardenRevenue),
      formFields: [
        {
          type: "number" as "number",
          name: "gardenArea",
          label: "Garden Area (sq ft)",
          value: gardenArea
        }
      ]
    });
  }
  
  // Add pool if present
  if (hasPool) {
    opportunities.push({
      icon: "pool",
      title: "Pool Rental",
      monthlyRevenue: poolRevenue,
      description: `Rent out your ${poolSize} sq ft pool by the hour.`,
      provider: "Swimply",
      setupCost: 500,
      roi: Math.ceil(500 / poolRevenue),
      formFields: [
        {
          type: "number" as "number",
          name: "poolSize",
          label: "Pool Size (sq ft)",
          value: poolSize
        },
        {
          type: "select" as "select",
          name: "poolType",
          label: "Pool Type",
          value: "inground",
          options: ["inground", "above-ground"]
        }
      ]
    });
  }
  
  // Add internet bandwidth sharing
  opportunities.push({
    icon: "wifi",
    title: "Internet Bandwidth Sharing",
    monthlyRevenue: bandwidthRevenue,
    description: "Share your unused internet bandwidth for passive income.",
    provider: "Honeygain",
    setupCost: 0,
    roi: 1,
    formFields: [
      {
        type: "number" as "number",
        name: "bandwidth",
        label: "Available Bandwidth (GB)",
        value: 500
      }
    ]
  });
  
  // Sort opportunities by revenue (highest first)
  opportunities.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  
  const result = {
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
      rate: parkingDayRate, // Consistent market-based rate
      revenue: validatedParkingRevenue // Use validated revenue
    },
    pool: {
      present: hasPool,
      area: hasPool ? poolSize : 0,
      type: hasPool ? "In-ground" : "none",
      revenue: poolRevenue
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
    topOpportunities: opportunities.slice(0, 5)
  };
  
  console.log("✅ Generated analysis result with validated calculations:", {
    propertyType: result.propertyType,
    parkingSpaces: result.parking.spaces,
    parkingRate: result.parking.rate,
    parkingRevenue: result.parking.revenue,
    parkingOpportunityRevenue: opportunities.find(o => o.title.includes("Parking"))?.monthlyRevenue,
    totalOpportunities: opportunities.length
  });
  
  return result;
};
