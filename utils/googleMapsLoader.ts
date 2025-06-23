
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Enhanced Google Maps API key retrieval with better error handling
export const getGoogleMapsApiKey = async (): Promise<string> => {
  try {
    const origin = window.location.origin;
    
    // Try to get API key from Supabase edge function
    const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
      body: { origin }
    });
    
    if (error || !data?.apiKey) {
      console.warn('Could not get secure Google Maps API key, using fallback:', error);
      // Fallback to the restricted development key with domain authorization
      return 'AIzaSyDWLvyJBwGHS_U2KeeLzZJ1tiMvzNnnH40';
    }
    
    console.log(`Got API key for domain: ${data.domain || origin}`);
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
    const origin = window.location.origin;
    
    // Create and initialize the loader with enhanced configuration
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      // Enhanced referrer configuration
      authReferrerPolicy: 'origin',
      // Add current domain to reduce referrer issues
      region: 'US'
    });

    // Load Google Maps API
    return await loader.load();
  } catch (error) {
    console.error("Failed to initialize Google Maps:", error);
    throw error;
  }
};

// Enhanced satellite image URL generation with better error handling
export const generateHighResolutionMapURL = async (coordinates: google.maps.LatLngLiteral) => {
  const apiKey = await getGoogleMapsApiKey();
  const origin = encodeURIComponent(window.location.origin);
  
  // Include multiple parameters to improve success rate
  return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${apiKey}&format=png&maptype=satellite&style=feature:all|element:labels|visibility:off`;
};

// New function to get property type from Google Places API
export const getPropertyTypeFromPlaces = async (coordinates: google.maps.LatLngLiteral): Promise<string> => {
  try {
    const apiKey = await getGoogleMapsApiKey();
    
    // Use Nearby Search to find property type
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=50&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const place = data.results[0];
      const types = place.types || [];
      
      // Determine property type based on Google Places types
      if (types.includes('premise') || types.includes('subpremise')) {
        return types.includes('establishment') ? 'Commercial Property' : 'Residential Property';
      }
      if (types.includes('lodging')) return 'Hotel/Lodging';
      if (types.includes('real_estate_agency')) return 'Commercial Property';
      
      // Default classification
      return 'Residential Property';
    }
    
    return 'Unknown Property Type';
  } catch (error) {
    console.error('Error determining property type:', error);
    return 'Residential Property'; // Default fallback
  }
};
