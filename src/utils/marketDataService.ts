
interface MarketData {
  averageRent: number;
  solarSavings: number;
  parkingRates: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
}

export const getMarketData = (coordinates: google.maps.LatLngLiteral): MarketData => {
  console.log("📊 Calculating market data for coordinates:", coordinates);
  
  // Use the same parking rate calculation as the edge function for consistency
  const parkingRates = getAuthoritativeParkingRates(coordinates);
  
  // Estimate market data based on location
  const marketData: MarketData = {
    averageRent: getEstimatedRent(coordinates),
    solarSavings: getEstimatedSolarSavings(coordinates),
    parkingRates: parkingRates,
    marketTrend: Math.random() > 0.5 ? 'up' : 'stable',
    confidence: 0.85
  };
  
  console.log("📊 Market data calculated:", marketData);
  return marketData;
};

// Authoritative parking rate calculation (matches edge function logic)
const getAuthoritativeParkingRates = (coords: google.maps.LatLngLiteral): number => {
  // Use the same algorithm as the edge function's marketDataValidator.ts
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

  // Adjust rate based on distance from major city (same logic as edge function)
  const distanceFactor = Math.max(0.3, 1 - minDistance * 10);
  const baseRate = 15; // Base rate from edge function
  const cityRate = closestCity.rate;
  
  // Blend city rate with base rate based on distance
  const blendedRate = (cityRate * distanceFactor) + (baseRate * (1 - distanceFactor));
  const finalRate = Math.max(8, Math.min(50, Math.round(blendedRate))); // Cap between $8-50
  
  console.log("🅿️ Authoritative parking rate calculation:", {
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

const getEstimatedRent = (coords: google.maps.LatLngLiteral): number => {
  // Simple market estimation based on location
  // Major cities: higher rent
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
  const estimatedRent = Math.round(closestCity.rent * distanceFactor);
  console.log("🏠 Estimated rent:", estimatedRent, "for distance factor:", distanceFactor);
  return estimatedRent;
};

const getEstimatedSolarSavings = (coords: google.maps.LatLngLiteral): number => {
  // Solar savings based on latitude (sun exposure)
  const latitudeFactor = Math.max(0.5, 1 - Math.abs(coords.lat - 35) / 20);
  const solarSavings = Math.round(150 * latitudeFactor);
  console.log("☀️ Estimated solar savings:", solarSavings, "for latitude factor:", latitudeFactor);
  return solarSavings;
};
