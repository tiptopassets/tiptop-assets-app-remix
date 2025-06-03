import { AnalysisResults } from './types';
import { getMarketData } from '@/utils/marketDataService';

// Helper function to generate mock analysis data for local testing
export const generateLocalMockAnalysis = (address: string, coordinates?: google.maps.LatLngLiteral): AnalysisResults => {
  // Determine property type based on address keywords
  const isApartment = /apartment|apt|flat|condo|unit/i.test(address);
  const isRural = /farm|ranch|rural|country|acres/i.test(address);
  
  // Default to single family home if no specific keywords detected
  let propertyType = "Single Family Home";
  let roofSize = 1800; // Average roof size in sq ft
  let parkingSpaces = 2; // Default parking spaces
  let gardenArea = 800; // Default garden area in sq ft
  let hasPool = Math.random() > 0.7; // 30% chance of having a pool
  let poolSize = 450; // Default pool size if present
  
  // Adjust values based on property type
  if (isApartment) {
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
  
  // Get market data for pricing if coordinates are available
  let marketData = null;
  let parkingDayRate = 10; // Default fallback rate
  
  if (coordinates) {
    marketData = getMarketData(coordinates);
    parkingDayRate = marketData.parkingRates;
  }
  
  // Calculate financials based on property features and market data
  const solarRevenue = Math.round((roofSize * 0.7) / 15 * 0.15 * 30); // Simplified solar revenue
  const parkingRevenue = parkingSpaces * parkingDayRate * 20; // Use market-based rate, 20 days/month average
  const gardenRevenue = Math.round(gardenArea * 0.02); // Simple garden revenue estimate
  const poolRevenue = hasPool ? Math.round(poolSize * 0.4) : 0; // Pool rental revenue if present
  const storageRevenue = Math.round(roofSize * 0.1); // Storage revenue
  const bandwidthRevenue = 35; // Fixed internet sharing revenue
  
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
  
  // Add parking if available
  if (parkingSpaces > 0) {
    opportunities.push({
      icon: "parking",
      title: "Parking Space Rental",
      monthlyRevenue: parkingRevenue,
      description: `Rent out your ${parkingSpaces} parking spaces when not in use.`,
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
          value: "Driveway"
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
  
  return {
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
      rate: parkingDayRate, // Use market-based rate
      revenue: parkingRevenue,
      evChargerPotential: Math.random() > 0.5
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
    restrictions: null,
    topOpportunities: opportunities.slice(0, 5)
  };
};
