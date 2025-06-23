
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Securely fetch Google Maps API key
const fetchGoogleMapsApiKey = async (): Promise<string> => {
  // 1. Try environment variable first
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envApiKey) {
    console.log('✅ Using Google Maps API key from environment variable');
    return envApiKey;
  }
  
  // 2. Fallback to Supabase edge function using the client
  try {
    console.log('🔄 Attempting to fetch Google Maps API key from Supabase edge function...');
    const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
      body: { origin: window.location.origin }
    });
    
    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (!data?.apiKey) {
      console.error('❌ No API key returned from server. Response:', data);
      throw new Error('No API key returned from server');
    }
    
    console.log('✅ Successfully retrieved API key from Supabase');
    return data.apiKey;
  } catch (error) {
    console.error('❌ Failed to get Google Maps API key:', error);
    throw new Error(`Google Maps API key not available: ${error.message}`);
  }
};

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let apiKey: string = '';

export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  if (!googleMapsPromise) {
    try {
      console.log('🗺️ Initializing Google Maps API...');
      
      // Get the API key first
      apiKey = await fetchGoogleMapsApiKey();
      
      if (!apiKey) {
        throw new Error('Google Maps API key not available');
      }
      
      console.log('🔑 API key obtained, creating loader...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      googleMapsPromise = loader.load().then((google) => {
        console.log('✅ Google Maps API loaded successfully');
        return google.maps;
      }).catch((error) => {
        console.error('❌ Google Maps loader failed:', error);
        // Reset promise so it can be retried
        googleMapsPromise = null;
        throw error;
      });
    } catch (error) {
      console.error('❌ Error initializing Google Maps:', error);
      // Reset promise so it can be retried
      googleMapsPromise = null;
      throw error;
    }
  }
  return googleMapsPromise;
};

// Alias for backward compatibility
export const initializeGoogleMaps = loadGoogleMaps;

// Function to get the API key (for components that need it)
export const getGoogleMapsApiKey = async (): Promise<string> => {
  if (!apiKey) {
    apiKey = await fetchGoogleMapsApiKey();
  }
  return apiKey;
};

// Verify API key configuration
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string }> => {
  try {
    console.log('🔍 Verifying API key configuration...');
    const key = await getGoogleMapsApiKey();
    if (!key) {
      return { valid: false, message: 'Google Maps API key not configured' };
    }
    
    console.log('🧪 Testing Google Maps API loading...');
    await loadGoogleMaps();
    return { valid: true, message: 'API key is valid and Maps loaded successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ API key validation failed:', message);
    return { valid: false, message: `API key validation failed: ${message}` };
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
