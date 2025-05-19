
import { GeocodeResult } from './types.ts';

export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodeResult> {
  try {
    // Geocode the address to get coordinates
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const geocodeData = await geocodeResponse.json();
    console.log('Geocode API response status:', geocodeData.status);
    
    if (geocodeData.results && geocodeData.results.length > 0) {
      const location = geocodeData.results[0].geometry.location;
      const coordinates = { lat: location.lat, lng: location.lng };
      
      // Check if the country is supported by Google Solar API
      const addressComponents = geocodeData.results[0].address_components || [];
      const countryComponent = addressComponents.find(
        (component: any) => component.types.includes('country')
      );
      
      // Google Solar API currently only supports certain countries fully
      // As of 2025, primarily US with limited support in other regions
      if (countryComponent) {
        const countryCode = countryComponent.short_name;
        if (countryCode !== 'US') {
          console.log(`Country detected: ${countryCode}. Google Solar API may have limited support.`);
          
          // Check for known unsupported countries
          const unsupportedCountries = ['IL', 'PS', 'SY', 'LB', 'JO', 'IR', 'IQ'];
          if (unsupportedCountries.includes(countryCode)) {
            return {
              countryCode,
              unsupported: true,
              error: `Solar API not available in ${countryCode}`,
              details: 'Google Solar API currently has limited coverage in this region.'
            };
          }
        }
        
        return { coordinates, countryCode };
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
      details: error.message
    };
  }
}
