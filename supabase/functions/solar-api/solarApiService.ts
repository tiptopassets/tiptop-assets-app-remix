
import { SolarPotentialResponse, SolarApiResult } from './types.ts';
import { formatSolarData } from './utils.ts';

export async function handleSolarApiRequest(
  coordinates: { lat: number; lng: number },
  apiKey: string,
  referrerUrl: string
): Promise<SolarApiResult> {
  // Configure headers to address referrer restrictions
  // Note: Different APIs have different requirements for referrer handling
  const headers = {
    // Use dynamic referrer based on the environment
    'Referer': referrerUrl || 'https://tiptop-app.com',
    'Origin': referrerUrl || 'https://tiptop-app.com',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  // Make the API request to Google's Solar API
  const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location=latitude=${coordinates.lat}%26longitude=${coordinates.lng}&requiredQuality=HIGH&key=${apiKey}`;
  
  try {
    console.log('Calling Google Solar API with coordinates:', JSON.stringify(coordinates));
    
    // Attempt API call with headers
    const solarResponse = await fetch(solarApiUrl, { headers });
    const solarData = await solarResponse.json();

    // Check for errors in the Solar API response
    if (solarData.error) {
      console.error('Solar API error:', solarData.error);
      
      // Handle specific error cases
      let errorMessage = solarData.error.message || 'Error fetching solar data';
      let errorDetails = '';
      
      // Check for common error types
      if (solarData.error.status === 'PERMISSION_DENIED') {
        if (solarData.error.message?.includes('API_KEY_HTTP_REFERRER_BLOCKED')) {
          errorDetails = 'API key referrer restriction is blocking requests. Check API key configuration.';
        } else {
          errorDetails = 'API key may not be configured for Solar API. Falling back to estimated data.';
        }
      } else if (solarData.error.status === 'NOT_FOUND') {
        errorDetails = 'No building data found at this location or the Solar API may not cover this region.';
      } else if (solarData.error.status === 'RESOURCE_EXHAUSTED') {
        errorDetails = 'API quota exceeded for Google Solar API.';
      }
      
      return {
        error: errorMessage,
        details: errorDetails,
        apiError: solarData.error
      };
    }

    // Extract relevant solar data for our use case
    const formattedSolarData = formatSolarData(solarData);

    return {
      solarData: formattedSolarData,
      rawResponse: solarData
    };
  } catch (apiError) {
    console.error('Error calling Google Solar API:', apiError);
    return {
      error: 'Failed to connect to Google Solar API',
      details: apiError.message
    };
  }
}
