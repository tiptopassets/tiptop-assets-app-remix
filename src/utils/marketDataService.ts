
interface MarketData {
  averageRent: number;
  solarSavings: number;
  parkingRates: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
}

export const getMarketData = (coordinates: google.maps.LatLngLiteral): MarketData => {
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
  return Math.round(closestCity.rent * distanceFactor);
};

const getEstimatedSolarSavings = (coords: google.maps.LatLngLiteral): number => {
  // Solar savings based on latitude (sun exposure)
  const latitudeFactor = Math.max(0.5, 1 - Math.abs(coords.lat - 35) / 20);
  return Math.round(150 * latitudeFactor);
};

const getEstimatedParkingRates = (coords: google.maps.LatLngLiteral): number => {
  // Parking rates based on urban density estimation
  const urbanDensity = Math.max(0.3, 1 - Math.min(Math.abs(coords.lat - 40), Math.abs(coords.lng + 74)) / 10);
  return Math.round(15 * urbanDensity);
};
