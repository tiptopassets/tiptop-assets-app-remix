
interface MarketData {
  averageRent: number;
  solarSavings: number;
  parkingRates: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
}

export const getMarketDataForValidation = (coordinates: { lat: number; lng: number }): MarketData => {
  // Estimate market data based on location
  const marketData: MarketData = {
    averageRent: getEstimatedRent(coordinates),
    solarSavings: getEstimatedSolarSavings(coordinates),
    parkingRates: getEstimatedParkingRates(coordinates),
    marketTrend: Math.random() > 0.5 ? 'up' : 'stable',
    confidence: 0.85
  };
  
  return marketData;
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

const getEstimatedParkingRates = (coords: { lat: number; lng: number }): number => {
  // Parking rates based on urban density estimation
  const urbanDensity = Math.max(0.3, 1 - Math.min(Math.abs(coords.lat - 40), Math.abs(coords.lng + 74)) / 10);
  return Math.round(15 * urbanDensity);
};

export const validateAndCorrectRevenue = (analysis: any, coordinates?: { lat: number; lng: number }, propertyType?: string): any => {
  if (!coordinates) return analysis;
  
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
  
  // Validate and correct parking revenue
  if (analysis.parking) {
    const maxParkingRate = 50; // $50/day max
    const maxSpaces = isCommercial ? 20 : 3; // Space limits
    
    // Correct parking spaces
    if (analysis.parking.spaces > maxSpaces) {
      console.log(`Parking spaces ${analysis.parking.spaces} exceeded limit, adjusting to ${maxSpaces}`);
      analysis.parking.spaces = maxSpaces;
    }
    
    // Correct parking rate
    if (analysis.parking.rate > maxParkingRate) {
      console.log(`Parking rate ${analysis.parking.rate} exceeded limit, adjusting to ${maxParkingRate}`);
      analysis.parking.rate = maxParkingRate;
    }
    
    // Recalculate parking revenue with realistic assumptions
    const correctedRevenue = Math.min(
      analysis.parking.spaces * analysis.parking.rate * 20, // 20 days/month
      1000 // $1000/month cap
    );
    
    if (analysis.parking.revenue !== correctedRevenue) {
      console.log(`Parking revenue adjusted from ${analysis.parking.revenue} to ${correctedRevenue}`);
      analysis.parking.revenue = correctedRevenue;
      
      // Update related opportunities
      const parkingOpportunityIndex = analysis.topOpportunities?.findIndex(
        (opp: any) => opp.title.toLowerCase().includes('parking')
      );
      if (parkingOpportunityIndex >= 0) {
        analysis.topOpportunities[parkingOpportunityIndex].monthlyRevenue = correctedRevenue;
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
  
  return analysis;
};
