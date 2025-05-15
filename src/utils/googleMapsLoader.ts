
import { Loader } from '@googlemaps/js-api-loader';

// API key from environment
export const API_KEY = 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';

export const initializeGoogleMaps = async () => {
  const loader = new Loader({
    apiKey: API_KEY,
    version: 'weekly',
    libraries: ['places']
  });

  return await loader.load();
};

// Helper to generate higher resolution satellite images
export const generateHighResolutionMapURL = (coordinates: google.maps.LatLngLiteral) => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${API_KEY}`;
};
