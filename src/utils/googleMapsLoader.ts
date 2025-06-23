
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Enhanced Google Maps API key retrieval with comprehensive logging
const fetchGoogleMapsApiKey = async (): Promise<string> => {
  try {
    console.log('🗺️ Fetching Google Maps API key from Supabase edge function');
    console.log('🌐 Current origin:', window.location.origin);
    
    const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
      body: { origin: window.location.origin }
    });
    
    if (error) {
      console.error('❌ Error from Supabase function:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ No data returned from Supabase function');
      throw new Error('No response data from server');
    }
    
    if (!data.apiKey) {
      console.error('❌ No API key in response data:', data);
      throw new Error('No API key returned from server');
    }
    
    console.log('✅ Successfully retrieved API key from Supabase');
    console.log('📍 API key prefix:', data.apiKey.substring(0, 10) + '...');
    console.log('🏠 Domain:', data.domain);
    
    return data.apiKey;
  } catch (error) {
    console.error('💥 Failed to get Google Maps API key:', error);
    
    // Enhanced error information
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to Supabase. Please check your internet connection.');
    } else if (error.message?.includes('function error')) {
      throw new Error('Server configuration error: Google Maps API key not properly configured in Supabase.');
    } else {
      throw new Error(`Google Maps API key not available: ${error.message}`);
    }
  }
};

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let apiKey: string = '';

export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  console.log('🚀 loadGoogleMaps called');
  
  if (!googleMapsPromise) {
    try {
      console.log('🔑 Getting API key...');
      // Get the API key from Supabase
      apiKey = await fetchGoogleMapsApiKey();
      
      if (!apiKey) {
        throw new Error('Google Maps API key not available');
      }
      
      console.log('⚙️ Initializing Google Maps Loader...');
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      googleMapsPromise = loader.load().then((google) => {
        console.log('🎉 Google Maps API loaded successfully');
        console.log('📦 Google Maps version:', google.maps.version);
        return google.maps;
      });
    } catch (error) {
      console.error('💥 Error initializing Google Maps:', error);
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
  console.log('🔑 getGoogleMapsApiKey called');
  
  if (!apiKey) {
    console.log('🔄 API key not cached, fetching...');
    apiKey = await fetchGoogleMapsApiKey();
  } else {
    console.log('✨ Using cached API key');
  }
  
  return apiKey;
};

// Verify API key configuration with enhanced diagnostics
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string }> => {
  try {
    console.log('🔍 Verifying API key configuration...');
    
    const key = await getGoogleMapsApiKey();
    if (!key) {
      return { valid: false, message: 'Google Maps API key not configured' };
    }
    
    console.log('🧪 Testing Google Maps API loading...');
    await loadGoogleMaps();
    
    console.log('✅ API key verification successful');
    return { valid: true, message: 'API key is valid and Maps loaded successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ API key verification failed:', message);
    return { valid: false, message: `API key validation failed: ${message}` };
  }
};

export const geocodeAddress = async (address: string): Promise<google.maps.LatLngLiteral | null> => {
  try {
    console.log('🏠 Geocoding address:', address);
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };
          console.log('✅ Geocoding successful:', coords);
          resolve(coords);
        } else {
          console.error('❌ Geocoding failed:', status);
          reject(null);
        }
      });
    });
  } catch (error) {
    console.error('💥 Error geocoding address:', error);
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
