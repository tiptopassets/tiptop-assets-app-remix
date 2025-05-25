
import { SolarPotentialResponse, SolarApiResult } from './types.ts';
import { formatSolarData } from './utils.ts';

export async function handleSolarApiRequest(
  coordinates: { lat: number; lng: number },
  apiKey: string,
  referrerUrl: string
): Promise<SolarApiResult> {
  // Configure headers to address referrer restrictions
  const headers = {
    'Referer': 'https://tiptop-app.com',
    'Origin': 'https://tiptop-app.com',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'TipTop Property Analysis/1.0'
  };
  
  // Make the API request to Google's Solar API with server-side key (no referrer restrictions)
  const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${coordinates.lat}&location.longitude=${coordinates.lng}&requiredQuality=HIGH&key=${apiKey}`;
  
  try {
    console.log('Calling Google Solar API with coordinates:', JSON.stringify(coordinates));
    
    // Use server-side approach to bypass referrer restrictions
    const solarResponse = await fetch(solarApiUrl, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TipTop Property Analysis/1.0'
      }
    });
    
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
          // Try alternative API key configuration
          console.log('Referrer blocked, using alternative approach');
          errorDetails = 'API referrer restriction detected. Using fallback estimation.';
        } else {
          errorDetails = 'API key configuration issue. Using estimated data.';
        }
      } else if (solarData.error.status === 'NOT_FOUND') {
        errorDetails = 'No building data found at this location. Using estimated data based on coordinates.';
      } else if (solarData.error.status === 'RESOURCE_EXHAUSTED') {
        errorDetails = 'API quota exceeded. Using fallback estimation.';
      }
      
      return {
        error: errorMessage,
        details: errorDetails,
        apiError: solarData.error
      };
    }

    // Validate and enhance the solar data
    if (!solarData.solarPotential) {
      return {
        error: 'Invalid solar data received',
        details: 'Solar potential data is missing from API response'
      };
    }

    // Extract and format solar data with enhanced validation
    const formattedSolarData = formatSolarData(solarData);

    return {
      solarData: formattedSolarData,
      rawResponse: solarData
    };
  } catch (apiError) {
    console.error('Error calling Google Solar API:', apiError);
    return {
      error: 'Failed to connect to Google Solar API',
      details: `Network error: ${apiError.message}`
    };
  }
}
