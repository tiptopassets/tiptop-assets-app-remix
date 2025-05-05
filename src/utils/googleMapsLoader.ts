
import { Loader } from '@googlemaps/js-api-loader';

// Replace with your API key
export const API_KEY = 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';

export const initializeGoogleMaps = async () => {
  const loader = new Loader({
    apiKey: API_KEY,
    version: 'weekly',
    libraries: ['places']
  });

  return await loader.load();
};
