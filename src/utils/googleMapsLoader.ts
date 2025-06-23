
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Enhanced logging for debugging
const logWithContext = (level: 'info' | 'error' | 'warn', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const context = {
    timestamp,
    environment: window.location.hostname,
    userAgent: navigator.userAgent.substring(0, 50),
    ...data
  };
  
  if (level === 'error') {
    console.error(`🗺️ [${timestamp}] ${message}`, context);
  } else if (level === 'warn') {
    console.warn(`🗺️ [${timestamp}] ${message}`, context);
  } else {
    console.log(`🗺️ [${timestamp}] ${message}`, context);
  }
};

// Securely fetch Google Maps API key with enhanced error handling
const fetchGoogleMapsApiKey = async (): Promise<string> => {
  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  logWithContext('info', 'Starting API key fetch process', {
    domain: currentDomain,
    origin: currentOrigin
  });

  // 1. Try environment variable first
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envApiKey) {
    logWithContext('info', 'Using Google Maps API key from environment variable', {
      keyLength: envApiKey.length,
      keyPrefix: envApiKey.substring(0, 8) + '...'
    });
    return envApiKey;
  }
  
  // 2. Fallback to Supabase edge function
  try {
    logWithContext('info', 'Attempting to fetch API key from Supabase edge function');
    
    const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
      body: { origin: currentOrigin }
    });
    
    if (error) {
      logWithContext('error', 'Supabase function error', {
        error: error.message,
        details: error
      });
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (!data?.apiKey) {
      logWithContext('error', 'No API key returned from server', {
        responseData: data,
        configured: data?.configured
      });
      throw new Error('No API key returned from server');
    }
    
    logWithContext('info', 'Successfully retrieved API key from Supabase', {
      keyLength: data.apiKey.length,
      keyPrefix: data.apiKey.substring(0, 8) + '...',
      domain: data.domain,
      configured: data.configured
    });
    
    return data.apiKey;
  } catch (error) {
    logWithContext('error', 'Failed to get Google Maps API key', {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Google Maps API key not available: ${error.message}`);
  }
};

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let apiKey: string = '';
let retryCount = 0;
const MAX_RETRIES = 3;

// Reset function to clear singleton state on errors
const resetGoogleMapsState = () => {
  logWithContext('info', 'Resetting Google Maps singleton state');
  googleMapsPromise = null;
  apiKey = '';
  retryCount = 0;
};

export const loadGoogleMaps = async (): Promise<typeof google.maps> => {
  if (!googleMapsPromise) {
    try {
      logWithContext('info', 'Initializing Google Maps API', {
        retryAttempt: retryCount + 1,
        maxRetries: MAX_RETRIES
      });
      
      // Get the API key first
      apiKey = await fetchGoogleMapsApiKey();
      
      if (!apiKey) {
        throw new Error('Google Maps API key not available');
      }
      
      logWithContext('info', 'API key obtained, creating loader', {
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 8) + '...'
      });
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      googleMapsPromise = loader.load().then((google) => {
        logWithContext('info', 'Google Maps API loaded successfully', {
          version: google.maps.version,
          retryCount
        });
        retryCount = 0; // Reset retry count on success
        return google.maps;
      }).catch((error) => {
        logWithContext('error', 'Google Maps loader failed', {
          error: error.message,
          stack: error.stack,
          retryCount,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
        });
        
        // Enhanced error handling for specific error types
        let enhancedError = error;
        
        if (error.message.includes('RefererNotAllowedMapError') || 
            error.message.includes('ApiNotActivatedMapError') ||
            error.message.includes('InvalidKeyMapError')) {
          
          const currentDomain = window.location.hostname;
          const isPreviewDomain = currentDomain.includes('preview--') || currentDomain.includes('.lovable.app');
          
          enhancedError = new Error(
            `Google Maps API Error: ${error.message}\n\n` +
            `Current domain: ${currentDomain}\n` +
            `Origin: ${window.location.origin}\n` +
            `Is preview domain: ${isPreviewDomain}\n\n` +
            (error.message.includes('RefererNotAllowedMapError') ? 
              `Domain restriction error. Please add the following domains to your Google Cloud Console API key restrictions:\n` +
              `• ${window.location.origin}/*\n` +
              `• https://*.lovable.app/*\n` +
              `• https://*.lovableproject.com/*\n\n` +
              `The exact failing domain is: ${currentDomain}` :
              `Please check your Google Maps API key configuration.`
            )
          );
        }
        
        // Reset promise so it can be retried
        resetGoogleMapsState();
        throw enhancedError;
      });
    } catch (error) {
      logWithContext('error', 'Error initializing Google Maps', {
        error: error.message,
        stack: error.stack,
        retryCount
      });
      
      // Reset promise so it can be retried
      resetGoogleMapsState();
      throw error;
    }
  }
  return googleMapsPromise;
};

// Enhanced retry mechanism with exponential backoff
export const loadGoogleMapsWithRetry = async (): Promise<typeof google.maps> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      retryCount = attempt;
      return await loadGoogleMaps();
    } catch (error) {
      logWithContext('warn', `Google Maps load attempt ${attempt + 1} failed`, {
        error: error.message,
        attempt: attempt + 1,
        maxRetries: MAX_RETRIES
      });
      
      if (attempt === MAX_RETRIES - 1) {
        logWithContext('error', 'All Google Maps load attempts exhausted', {
          totalAttempts: MAX_RETRIES,
          finalError: error.message
        });
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      logWithContext('info', `Waiting ${waitTime}ms before retry`, { waitTime });
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset state before retry
      resetGoogleMapsState();
    }
  }
  
  throw new Error('Failed to load Google Maps after all retry attempts');
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

// Enhanced API key verification with detailed domain checking
export const verifyApiKeyConfiguration = async (): Promise<{ valid: boolean; message: string; details?: any }> => {
  try {
    logWithContext('info', 'Starting API key configuration verification');
    
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;
    const isPreviewDomain = currentDomain.includes('preview--') || currentDomain.includes('.lovable.app');
    
    const key = await getGoogleMapsApiKey();
    if (!key) {
      return { 
        valid: false, 
        message: 'Google Maps API key not configured',
        details: { currentDomain, currentOrigin, isPreviewDomain }
      };
    }
    
    logWithContext('info', 'Testing Google Maps API loading with current configuration');
    
    try {
      await loadGoogleMaps();
      logWithContext('info', 'API key verification successful');
      return { 
        valid: true, 
        message: 'API key is valid and Maps loaded successfully',
        details: { currentDomain, currentOrigin, isPreviewDomain, keyLength: key.length }
      };
    } catch (loadError) {
      logWithContext('error', 'API key verification failed during Maps loading', {
        error: loadError.message,
        currentDomain,
        currentOrigin,
        isPreviewDomain
      });
      
      return {
        valid: false,
        message: `API key validation failed: ${loadError.message}`,
        details: { 
          currentDomain, 
          currentOrigin, 
          isPreviewDomain,
          keyLength: key.length,
          errorType: loadError.message.includes('RefererNotAllowedMapError') ? 'domain_restriction' : 'other'
        }
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    logWithContext('error', 'API key validation failed', {
      error: message,
      currentDomain: window.location.hostname,
      currentOrigin: window.location.origin
    });
    
    return { 
      valid: false, 
      message: `API key validation failed: ${message}`,
      details: { 
        currentDomain: window.location.hostname,
        currentOrigin: window.location.origin,
        error: message
      }
    };
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
          logWithContext('error', 'Geocoding failed', { address, status });
          reject(null);
        }
      });
    });
  } catch (error) {
    logWithContext('error', 'Error geocoding address', { address, error: error.message });
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
