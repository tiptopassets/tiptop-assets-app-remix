import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Securely fetch Google Maps API key with enhanced error handling
const fetchGoogleMapsApiKey = async (): Promise<string> => {
  console.log('🔑 Fetching Google Maps API key...');
  
  // 1. Try environment variable first
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envApiKey) {
    console.log('✅ Using Google Maps API key from environment variable');
    return envApiKey;
  }
  
  // 2. Fallback to Supabase edge function using the client
  try {
    console.log('🔄 Fetching Google Maps API key from Supabase edge function');
    
    // Add timeout to the edge function call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API key fetch timeout')), 15000);
    });
    
    const fetchPromise = supabase.functions.invoke('get-google-maps-key', {
      body: { origin: window.location.origin }
    });
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Error from Supabase function:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (!data?.apiKey) {
      console.error('❌ No API key returned from server');
      throw new Error('No API key returned from server');
    }
    
    console.log('✅ Successfully retrieved API key from Supabase');
    return data.apiKey;
  } catch (error) {
    console.error('❌ Failed to get Google Maps API key:', error);
    throw new Error(`Google Maps API key not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let apiKey: string = '';

export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  if (!googleMapsPromise) {
    try {
      console.log('🚀 Initializing Google Maps loader...');
      
      // Get the API key first with timeout protection
      const keyFetchPromise = fetchGoogleMapsApiKey();
      const keyTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API key fetch timeout after 15 seconds')), 15000);
      });
      
      apiKey = await Promise.race([keyFetchPromise, keyTimeoutPromise]);
      
      if (!apiKey) {
        throw new Error('Google Maps API key not available');
      }
      
      console.log('📚 Creating Google Maps loader with API key');
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
        throw new Error(`Google Maps loader failed: ${error.message}`);
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

// Verify API key configuration with timeout
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string }> => {
  try {
    console.log('🔍 Verifying API key configuration...');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Verification timeout')), 10000);
    });
    
    const verifyPromise = async () => {
      const key = await getGoogleMapsApiKey();
      if (!key) {
        return { valid: false, message: 'Google Maps API key not configured' };
      }
      
      await loadGoogleMaps();
      return { valid: true, message: 'API key is valid and Maps loaded successfully' };
    };
    
    return await Promise.race([verifyPromise(), timeoutPromise]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ API key verification failed:', message);
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
