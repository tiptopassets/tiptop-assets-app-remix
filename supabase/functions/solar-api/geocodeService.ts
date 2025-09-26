
import { GeocodeResult } from './types.ts';

export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodeResult> {
  try {
    // Use a more reliable geocoding endpoint format
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    // Make request without custom headers to avoid referrer restrictions
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      return {
        error: `Geocoding request failed with status ${geocodeResponse.status}`,
        details: geocodeResponse.statusText
      };
    }
    
    const geocodeData = await geocodeResponse.json();
    console.log('Geocode API response status:', geocodeData.status);
    
    // Handle API-level errors
    if (geocodeData.status === 'REQUEST_DENIED') {
      return {
        error: 'Geocoding access denied',
        details: 'API key may have restrictions. Please check domain restrictions in Google Cloud Console.'
      };
    }
    
    if (geocodeData.status === 'OVER_QUERY_LIMIT') {
      return {
        error: 'Geocoding quota exceeded',
        details: 'Daily quota limit reached for geocoding API.'
      };
    }
    
    if (geocodeData.status === 'ZERO_RESULTS') {
      return {
        error: 'Address not found',
        details: 'The provided address could not be located.'
      };
    }
    
    if (geocodeData.results && geocodeData.results.length > 0) {
      const location = geocodeData.results[0].geometry.location;
      const coordinates = { lat: location.lat, lng: location.lng };
      
      // Extract country information
      const addressComponents = geocodeData.results[0].address_components || [];
      const countryComponent = addressComponents.find(
        (component: any) => component.types.includes('country')
      );
      
      if (countryComponent) {
        const countryCode = countryComponent.short_name;
        
        // Enhanced country support detection
        const limitedSupportCountries = ['CA', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'];
        const unsupportedCountries = ['CN', 'RU', 'IR', 'KP', 'CU'];
        
        if (unsupportedCountries.includes(countryCode)) {
          return {
            countryCode,
            unsupported: true,
            error: `Solar API not available in ${countryCode}`,
            details: 'Google Solar API is not supported in this region.'
          };
        }
        
        return { 
          coordinates, 
          countryCode,
          limitedSupport: limitedSupportCountries.includes(countryCode)
        };
      }
      
      return { coordinates };
    } else {
      return { 
        error: 'Could not geocode the provided address',
        details: geocodeData.status || 'No results returned from geocoding API'
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      error: 'Failed to geocode address',
      details: error instanceof Error ? error.message : 'Network error during geocoding'
    };
  }
}
