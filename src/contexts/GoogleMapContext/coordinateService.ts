
// New service to ensure coordinates are always available for property analysis
import { getMarketData } from '@/utils/marketDataService';

export interface CoordinateResult {
  coordinates: google.maps.LatLngLiteral;
  source: 'provided' | 'geocoded' | 'estimated';
  confidence: number;
}

// Major city coordinates for fallback geocoding
const MAJOR_CITIES: Record<string, google.maps.LatLngLiteral> = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'denver': { lat: 39.7392, lng: -104.9903 }
};

export const ensureCoordinates = async (
  address: string, 
  providedCoordinates?: google.maps.LatLngLiteral | null
): Promise<CoordinateResult> => {
  console.log('🎯 ensureCoordinates called with:', { address, providedCoordinates });
  
  // If coordinates are already provided, use them
  if (providedCoordinates && providedCoordinates.lat && providedCoordinates.lng) {
    console.log('✅ Using provided coordinates');
    return {
      coordinates: providedCoordinates,
      source: 'provided',
      confidence: 1.0
    };
  }
  
  // Try to extract city/state from address for fallback geocoding
  const estimatedCoordinates = estimateCoordinatesFromAddress(address);
  if (estimatedCoordinates) {
    console.log('📍 Using estimated coordinates based on city detection');
    return {
      coordinates: estimatedCoordinates,
      source: 'estimated',
      confidence: 0.7
    };
  }
  
  // Last resort: use default US coordinates (geographic center)
  console.log('🇺🇸 Using fallback coordinates (US geographic center)');
  return {
    coordinates: { lat: 39.8283, lng: -98.5795 }, // Geographic center of US
    source: 'estimated',
    confidence: 0.3
  };
};

const estimateCoordinatesFromAddress = (address: string): google.maps.LatLngLiteral | null => {
  const normalizedAddress = address.toLowerCase();
  
  // Check for major cities in the address
  for (const [cityName, coordinates] of Object.entries(MAJOR_CITIES)) {
    if (normalizedAddress.includes(cityName)) {
      console.log(`🏙️ Detected city: ${cityName}`);
      return coordinates;
    }
  }
  
  // Check for state abbreviations and major cities within states
  const stateMapping: Record<string, google.maps.LatLngLiteral> = {
    'ca': { lat: 36.7783, lng: -119.4179 }, // California
    'ny': { lat: 42.1657, lng: -74.9481 },  // New York
    'fl': { lat: 27.7663, lng: -82.6404 },  // Florida
    'tx': { lat: 31.0545, lng: -97.5635 },  // Texas
    'il': { lat: 40.3363, lng: -89.0022 },  // Illinois
    'pa': { lat: 40.5908, lng: -77.2098 },  // Pennsylvania
    'oh': { lat: 40.3888, lng: -82.7649 },  // Ohio
    'ga': { lat: 33.0406, lng: -83.6431 },  // Georgia
    'nc': { lat: 35.5397, lng: -79.8431 },  // North Carolina
    'mi': { lat: 43.3266, lng: -84.5361 },  // Michigan
  };
  
  for (const [stateCode, coordinates] of Object.entries(stateMapping)) {
    if (normalizedAddress.includes(` ${stateCode} `) || normalizedAddress.endsWith(` ${stateCode}`)) {
      console.log(`🗺️ Detected state: ${stateCode}`);
      return coordinates;
    }
  }
  
  return null;
};

// Enhanced market data integration with coordinate validation
export const getValidatedMarketData = (coordinateResult: CoordinateResult) => {
  const marketData = getMarketData(coordinateResult.coordinates);
  
  // Adjust confidence based on coordinate source
  const adjustedConfidence = marketData.confidence * coordinateResult.confidence;
  
  console.log('📊 Market data with coordinate validation:', {
    coordinates: coordinateResult.coordinates,
    coordinateSource: coordinateResult.source,
    marketData: marketData,
    adjustedConfidence: adjustedConfidence
  });
  
  return {
    ...marketData,
    confidence: adjustedConfidence,
    coordinateSource: coordinateResult.source
  };
};
