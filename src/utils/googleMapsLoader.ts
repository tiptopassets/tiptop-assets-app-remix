import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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

// Add the missing function
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
      type: 'establishment' as google.maps.places.PlaceType
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
