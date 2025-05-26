
import { SolarPotentialResponse, SolarApiResult } from './types.ts';
import { formatSolarData } from './utils.ts';

export async function handleSolarApiRequest(
  coordinates: { lat: number; lng: number },
  apiKey: string,
  referrerUrl: string
): Promise<SolarApiResult> {
  // Remove referrer headers that are causing issues with Google's API restrictions
  const headers: Record<string, string> = {};
  
  // Make the API request to Google's Solar API without problematic headers
  const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${coordinates.lat}&location.longitude=${coordinates.lng}&requiredQuality=HIGH&key=${apiKey}`;
  
  try {
    console.log('Calling Google Solar API with coordinates:', JSON.stringify(coordinates));
    
    // Attempt API call without custom headers to avoid referrer issues
    const solarResponse = await fetch(solarApiUrl);
    const solarData = await solarResponse.json();

    // Check for errors in the Solar API response
    if (solarData.error) {
      console.error('Solar API error:', JSON.stringify(solarData.error, null, 2));
      
      // Handle specific error cases
      let errorMessage = solarData.error.message || 'Error fetching solar data';
      let errorDetails = '';
      
      // Check for common error types
      if (solarData.error.status === 'PERMISSION_DENIED') {
        if (solarData.error.message?.includes('API_KEY_HTTP_REFERRER_BLOCKED') || 
            solarData.error.message?.includes('referer')) {
          errorDetails = 'API key referrer restriction detected. Using estimated solar data instead.';
          errorMessage = 'Solar API access restricted';
        } else {
          errorDetails = 'API key may not be configured for Solar API. Using estimated data.';
        }
      } else if (solarData.error.status === 'NOT_FOUND') {
        errorDetails = 'No building data found at this location. Solar API may not cover this region.';
      } else if (solarData.error.status === 'RESOURCE_EXHAUSTED') {
        errorDetails = 'API quota exceeded for Google Solar API.';
        errorMessage = 'quota_exceeded';
      } else if (solarData.error.status === 'INVALID_ARGUMENT') {
        errorDetails = 'Invalid coordinates or parameters provided to Solar API.';
      }
      
      return {
        error: errorMessage,
        details: errorDetails,
        apiError: solarData.error
      };
    }

    // Validate response structure
    if (!solarData.solarPotential && !solarData.buildingInsights) {
      return {
        error: 'Invalid response structure from Solar API',
        details: 'The API response does not contain expected solar potential data.'
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
    
    // Handle network errors
    if (apiError instanceof TypeError && apiError.message.includes('fetch')) {
      return {
        error: 'Network error connecting to Solar API',
        details: 'Unable to reach Google Solar API. Please check internet connection.'
      };
    }
    
    return {
      error: 'Failed to connect to Google Solar API',
      details: apiError.message || 'Unknown network error'
    };
  }
}
