import { Loader } from '@googlemaps/js-api-loader';

// Try to get API key from environment first, then fallback to Supabase function
const fetchGoogleMapsApiKey = async (): Promise<string> => {
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (envApiKey) {
    return envApiKey;
  }
  
  try {
    // Fallback to Supabase edge function - use correct URL
    const response = await fetch('https://cxvdcdatxewrvwbcnksg.supabase.co/functions/v1/get-google-maps-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dmRjZGF0eGV3cnZ3YmNua3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMzQ3NzAsImV4cCI6MjA2MTkxMDc3MH0.bhO2Y4n8E3Quj59Ve21nBRUspORKUVPa5t5fgV1XBdI`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dmRjZGF0eGV3cnZ3YmNua3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMzQ3NzAsImV4cCI6MjA2MTkxMDc3MH0.bhO2Y4n8E3Quj59Ve21nBRUspORKUVPa5t5fgV1XBdI'
      },
      body: JSON.stringify({
        origin: window.location.origin
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get API key from server');
    }
    
    const data = await response.json();
    return data.apiKey || '';
  } catch (error) {
    console.error('Failed to get Google Maps API key:', error);
    return '';
  }
};

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let apiKey: string = '';

export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  if (!googleMapsPromise) {
    // Get the API key first
    apiKey = await fetchGoogleMapsApiKey();
    
    if (!apiKey) {
      throw new Error('Google Maps API key not available');
    }
    
    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    googleMapsPromise = loader.load().then((google) => {
      console.log('Google Maps API loaded');
      return google.maps;
    });
  }
  return googleMapsPromise;
};

// Alias for backward compatibility
export const initializeGoogleMaps = loadGoogleMaps;

// Function to get the API key
export const getGoogleMapsApiKey = async (): Promise<string> => {
  if (!apiKey) {
    apiKey = await fetchGoogleMapsApiKey();
  }
  return apiKey;
};

// Verify API key configuration
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string }> => {
  try {
    const key = await getGoogleMapsApiKey();
    if (!key) {
      return { valid: false, message: 'Google Maps API key not configured' };
    }
    
    await loadGoogleMaps();
    return { valid: true, message: 'API key is valid and Maps loaded successfully' };
  } catch (error) {
    return { valid: false, message: `API key validation failed: ${error}` };
  }
};

export const geocodeAddress = async (address: string): Promise<google.maps.LatLngLiteral | null> => {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocoding failed:', status);
          reject(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const getPropertyTypeFromPlaces = async (coordinates: google.maps.LatLngLiteral): Promise<string> => {
  if (!window.google?.maps) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: coordinates,
      radius: 50,
      type: 'establishment' as const
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Analyze the nearby places to determine property type
        const residentialTypes = ['lodging', 'real_estate_agency', 'moving_company'];
        const commercialTypes = ['store', 'restaurant', 'gas_station', 'bank'];
        
        let residentialCount = 0;
        let commercialCount = 0;
        
        results.forEach(place => {
          if (place.types) {
            place.types.forEach(type => {
              if (residentialTypes.includes(type)) residentialCount++;
              if (commercialTypes.includes(type)) commercialCount++;
            });
          }
        });
        
        if (commercialCount > residentialCount) {
          resolve('commercial');
        } else {
          resolve('residential');
        }
      } else {
        // Default to residential if we can't determine
        resolve('residential');
      }
    });
  });
};
