import { ServiceAvailabilityVerifier } from '../../../src/utils/serviceAvailabilityVerifier.ts';

interface LocationInfo {
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface PropertyDetails {
  type: string;
  size?: number;
  hasHOA?: boolean;
}

export async function getLocationFromCoordinates(lat: number, lng: number): Promise<LocationInfo> {
  try {
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const components = result.address_components;

    const location: LocationInfo = {
      country: 'US', // default
      coordinates: { lat, lng }
    };

    // Parse address components
    for (const component of components) {
      const types = component.types;
      
      if (types.includes('country')) {
        location.country = component.short_name;
      } else if (types.includes('administrative_area_level_1')) {
        location.state = component.short_name;
      } else if (types.includes('locality')) {
        location.city = component.long_name;
      } else if (types.includes('postal_code')) {
        location.zipCode = component.long_name;
      }
    }

    return location;
  } catch (error) {
    console.error('Error getting location info:', error);
    // Fallback to US location
    return {
      country: 'US',
      coordinates: { lat, lng }
    };
  }
}

export async function verifyAndFilterProviders(
  serviceType: string,
  providers: any[],
  location: LocationInfo,
  propertyDetails: PropertyDetails
): Promise<any[]> {
  
  const availabilityResults = await ServiceAvailabilityVerifier.verifyServiceAvailability(
    serviceType,
    location,
    propertyDetails
  );

  const verifiedProviders = [];
  
  for (const provider of providers) {
    const availability = availabilityResults.find(a => 
      a.providerId === provider.name.toLowerCase().replace(/\s+/g, '-')
    );
    
    if (availability?.available) {
      // Add availability info to provider
      verifiedProviders.push({
        ...provider,
        availability: {
          coverage: availability.coverage,
          restrictions: availability.restrictions || []
        }
      });
    } else if (availability) {
      // Add as unavailable with reason
      verifiedProviders.push({
        ...provider,
        available: false,
        unavailableReason: availability.restrictions?.[0] || 'Not available in your area',
        availability: {
          coverage: 'none',
          restrictions: availability.restrictions || []
        }
      });
    } else {
      // Keep provider but mark as unverified
      verifiedProviders.push({
        ...provider,
        availability: {
          coverage: 'unverified',
          restrictions: ['Service availability not verified']
        }
      });
    }
  }

  // Sort: available first, then by coverage quality
  verifiedProviders.sort((a, b) => {
    if (a.available !== false && b.available === false) return -1;
    if (a.available === false && b.available !== false) return 1;
    
    const aCoverage = a.availability?.coverage || 'none';
    const bCoverage = b.availability?.coverage || 'none';
    
    if (aCoverage === 'full' && bCoverage !== 'full') return -1;
    if (aCoverage !== 'full' && bCoverage === 'full') return 1;
    
    return 0;
  });

  return verifiedProviders;
}

export function addServiceAvailabilityToAnalysis(
  analysis: any,
  location: LocationInfo,
  propertyDetails: PropertyDetails
): any {
  
  return {
    ...analysis,
    locationInfo: {
      country: location.country,
      state: location.state,
      city: location.city,
      zipCode: location.zipCode
    },
    serviceAvailability: {
      verified: true,
      location: `${location.city || 'Unknown'}, ${location.state || location.country}`,
      coverage: 'Services verified for your location'
    }
  };
}
