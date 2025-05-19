
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Get API key from environment or fallback to a publicly restricted key for development
// In production, this should use the Supabase secret
export const getGoogleMapsApiKey = async (): Promise<string> => {
  try {
    // Try to get API key from Supabase edge function
    const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
      body: { origin: window.location.origin }
    });
    
    if (error || !data?.apiKey) {
      console.warn('Could not get secure Google Maps API key, using fallback:', error);
      // Fallback to the restricted development key with domain authorization
      return 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';
    }
    
    return data.apiKey;
  } catch (err) {
    console.error('Error getting Google Maps API key:', err);
    // Fallback to the restricted development key
    return 'AIzaSyBbclc8qxh5NVR9skf6XCz_xRJCZsnmUGA';
  }
};

export const initializeGoogleMaps = async () => {
  try {
    const apiKey = await getGoogleMapsApiKey();
    
    // Create and initialize the loader with the API key
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
      // Add authorized domains to solve RefererNotAllowedMapError
      authReferrerPolicy: 'origin'
    });

    // Load Google Maps API
    return await loader.load();
  } catch (error) {
    console.error("Failed to initialize Google Maps:", error);
    throw error;
  }
};

// Helper to generate higher resolution satellite images
export const generateHighResolutionMapURL = async (coordinates: google.maps.LatLngLiteral) => {
  const apiKey = await getGoogleMapsApiKey();
  return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${apiKey}`;
};
