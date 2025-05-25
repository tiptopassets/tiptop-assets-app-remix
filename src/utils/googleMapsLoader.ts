
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places']
});

let googleMapsPromise: Promise<typeof google.maps> | null = null;

export const loadGoogleMaps = (): Promise<typeof google.maps> => {
  if (!googleMapsPromise) {
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
  return GOOGLE_MAPS_API_KEY;
};

// Verify API key configuration
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string }> => {
  if (!GOOGLE_MAPS_API_KEY) {
    return { valid: false, message: 'Google Maps API key not configured' };
  }
  
  try {
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
