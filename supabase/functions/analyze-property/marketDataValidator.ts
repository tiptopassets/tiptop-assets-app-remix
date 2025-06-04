
interface MarketData {
  averageRent: number;
  solarSavings: number;
  parkingRates: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
}

export const getMarketDataForValidation = (coordinates: { lat: number; lng: number }): MarketData => {
  console.log("📊 Edge function calculating market data for:", coordinates);
  
  // Use the same authoritative parking rate calculation
  const parkingRates = getAuthoritativeParkingRates(coordinates);
  
  // Estimate market data based on location
  const marketData: MarketData = {
    averageRent: getEstimatedRent(coordinates),
    solarSavings: getEstimatedSolarSavings(coordinates),
    parkingRates: parkingRates,
    marketTrend: Math.random() > 0.5 ? 'up' : 'stable',
    confidence: 0.85
  };
  
  console.log("📊 Edge function market data calculated:", marketData);
  return marketData;
};

// Authoritative parking rate calculation (centralized logic)
const getAuthoritativeParkingRates = (coords: { lat: number; lng: number }): number => {
  // Major cities with realistic parking rate estimates
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, rate: 25 }, // NYC - higher rate
    { lat: 34.0522, lng: -118.2437, rate: 20 }, // LA
    { lat: 37.7749, lng: -122.4194, rate: 30 }, // SF - highest rate
    { lat: 41.8781, lng: -87.6298, rate: 18 }, // Chicago
    { lat: 29.7604, lng: -95.3698, rate: 12 }, // Houston
    { lat: 33.4484, lng: -112.0740, rate: 10 }, // Phoenix
    { lat: 39.9526, lng: -75.1652, rate: 15 }, // Philadelphia
    { lat: 25.7617, lng: -80.1918, rate: 22 }, // Miami
    { lat: 33.7490, lng: -84.3880, rate: 14 }, // Atlanta
    { lat: 42.3601, lng: -71.0589, rate: 20 }, // Boston
    { lat: 47.6062, lng: -122.3321, rate: 16 }, // Seattle
    { lat: 39.7392, lng: -104.9903, rate: 12 }  // Denver
  ];

  let closestCity = majorCities[0];
  let minDistance = Infinity;

  majorCities.forEach(city => {
    const distance = Math.sqrt(
      Math.pow(coords.lat - city.lat, 2) + Math.pow(coords.lng - city.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  });

  // Adjust rate based on distance from major city
  const distanceFactor = Math.max(0.3, 1 - minDistance * 10);
  const baseRate = 15; // Base rate
  const cityRate = closestCity.rate;
  
  // Blend city rate with base rate based on distance
  const blendedRate = (cityRate * distanceFactor) + (baseRate * (1 - distanceFactor));
  const finalRate = Math.max(8, Math.min(50, Math.round(blendedRate))); // Cap between $8-50
  
  console.log("🅿️ Edge function parking rate calculation:", {
    coordinates: coords,
    closestCity: { lat: closestCity.lat, lng: closestCity.lng, rate: closestCity.rate },
    distance: minDistance,
    distanceFactor: distanceFactor,
    baseRate: baseRate,
    cityRate: cityRate,
    blendedRate: blendedRate,
    finalRate: finalRate
  });
  
  return finalRate;
};

const getEstimatedRent = (coords: { lat: number; lng: number }): number => {
  // Major cities with realistic rent estimates
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, rent: 3500 }, // NYC
    { lat: 34.0522, lng: -118.2437, rent: 2800 }, // LA
    { lat: 37.7749, lng: -122.4194, rent: 4200 }, // SF
    { lat: 41.8781, lng: -87.6298, rent: 2200 }, // Chicago
  ];

  let closestCity = majorCities[0];
  let minDistance = Infinity;

  majorCities.forEach(city => {
    const distance = Math.sqrt(
      Math.pow(coords.lat - city.lat, 2) + Math.pow(coords.lng - city.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  });

  // Adjust rent based on distance from major city
  const distanceFactor = Math.max(0.3, 1 - minDistance * 10);
  return Math.round(closestCity.rent * distanceFactor);
};

const getEstimatedSolarSavings = (coords: { lat: number; lng: number }): number => {
  // Solar savings based on latitude (sun exposure)
  const latitudeFactor = Math.max(0.5, 1 - Math.abs(coords.lat - 35) / 20);
  return Math.round(150 * latitudeFactor);
};

export const validateAndCorrectRevenue = (analysis: any, coordinates?: { lat: number; lng: number }, propertyType?: string): any => {
  if (!coordinates) return analysis;
  
  console.log("🔧 Edge function validating revenue with coordinates:", coordinates);
  
  const marketData = getMarketDataForValidation(coordinates);
  const isCommercial = propertyType?.toLowerCase().includes('commercial') || false;
  const isResidential = propertyType?.toLowerCase().includes('single') || propertyType?.toLowerCase().includes('house') || false;
  
  // Validate and correct solar revenue
  if (analysis.rooftop && analysis.rooftop.revenue) {
    const maxSolarRevenue = isCommercial ? 500 : 200; // Monthly caps
    if (analysis.rooftop.revenue > maxSolarRevenue) {
      console.log(`Solar revenue ${analysis.rooftop.revenue} exceeded cap, adjusting to ${maxSolarRevenue}`);
      analysis.rooftop.revenue = maxSolarRevenue;
      
      // Update related opportunities
      const solarOpportunityIndex = analysis.topOpportunities?.findIndex(
        (opp: any) => opp.title.toLowerCase().includes('solar')
      );
      if (solarOpportunityIndex >= 0) {
        analysis.topOpportunities[solarOpportunityIndex].monthlyRevenue = maxSolarRevenue;
      }
    }
  }
  
  // Validate and correct parking revenue using authoritative rate
  if (analysis.parking) {
    const authoritativeRate = marketData.parkingRates; // Use authoritative calculation
    const maxSpaces = isCommercial ? 20 : 5; // Realistic space limits
    
    // Correct parking spaces
    if (analysis.parking.spaces > maxSpaces) {
      console.log(`Parking spaces ${analysis.parking.spaces} exceeded limit, adjusting to ${maxSpaces}`);
      analysis.parking.spaces = maxSpaces;
    }
    
    // Always use authoritative parking rate
    if (analysis.parking.rate !== authoritativeRate) {
      console.log(`Parking rate ${analysis.parking.rate} replaced with authoritative rate ${authoritativeRate}`);
      analysis.parking.rate = authoritativeRate;
    }
    
    // Recalculate parking revenue with realistic assumptions using authoritative rate
    const correctedRevenue = Math.min(
      analysis.parking.spaces * authoritativeRate * 20, // 20 days/month, authoritative rate
      isCommercial ? 1500 : 1000 // Revenue caps by property type
    );
    
    if (analysis.parking.revenue !== correctedRevenue) {
      console.log(`Parking revenue adjusted from ${analysis.parking.revenue} to ${correctedRevenue} using authoritative rate ${authoritativeRate}`);
      analysis.parking.revenue = correctedRevenue;
      
      // Update related opportunities
      const parkingOpportunityIndex = analysis.topOpportunities?.findIndex(
        (opp: any) => opp.title.toLowerCase().includes('parking')
      );
      if (parkingOpportunityIndex >= 0) {
        analysis.topOpportunities[parkingOpportunityIndex].monthlyRevenue = correctedRevenue;
        analysis.topOpportunities[parkingOpportunityIndex].description = `Rent out ${analysis.parking.spaces} parking spaces at $${authoritativeRate}/day when not in use.`;
      }
    }
  }
  
  // Validate pool revenue
  if (analysis.pool && analysis.pool.revenue > 800) {
    console.log(`Pool revenue ${analysis.pool.revenue} exceeded realistic limit, adjusting to 800`);
    analysis.pool.revenue = 800;
    
    const poolOpportunityIndex = analysis.topOpportunities?.findIndex(
      (opp: any) => opp.title.toLowerCase().includes('pool')
    );
    if (poolOpportunityIndex >= 0) {
      analysis.topOpportunities[poolOpportunityIndex].monthlyRevenue = 800;
    }
  }
  
  // Recalculate total revenue if property valuation exists
  if (analysis.propertyValuation) {
    const totalMonthly = (analysis.rooftop?.revenue || 0) + 
                        (analysis.parking?.revenue || 0) + 
                        (analysis.pool?.revenue || 0) + 
                        (analysis.garden?.revenue || 0) + 
                        (analysis.bandwidth?.revenue || 0);
    
    analysis.propertyValuation.totalMonthlyRevenue = totalMonthly;
    analysis.propertyValuation.totalAnnualRevenue = totalMonthly * 12;
  }
  
  console.log("✅ Edge function revenue validation complete with authoritative parking rate:", authoritativeRate);
  return analysis;
};
