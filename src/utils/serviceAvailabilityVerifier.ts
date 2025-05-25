
interface ServiceAvailability {
  providerId: string;
  available: boolean;
  coverage: 'full' | 'partial' | 'none';
  restrictions?: string[];
  alternativeProviders?: string[];
}

interface LocationConstraints {
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ProviderCoverage {
  providerId: string;
  serviceType: string;
  coverageAreas: {
    countries: string[];
    states?: string[];
    metros?: string[];
    zipCodes?: string[];
    coordinates?: {
      lat: number;
      lng: number;
      radius: number; // in miles
    }[];
  };
  restrictions: {
    hoa?: boolean;
    permits?: string[];
    minimumPropertySize?: number;
    propertyTypes?: string[];
  };
}

// Provider coverage data - in production this would come from a database
const PROVIDER_COVERAGE: ProviderCoverage[] = [
  {
    providerId: 'tesla-solar',
    serviceType: 'solar',
    coverageAreas: {
      countries: ['US'],
      states: ['CA', 'TX', 'FL', 'NY', 'AZ', 'NV', 'NJ', 'MA', 'CT', 'DE', 'MD', 'PA', 'VA', 'NC', 'SC']
    },
    restrictions: {
      permits: ['solar-permit'],
      minimumPropertySize: 1000,
      propertyTypes: ['single-family', 'townhouse']
    }
  },
  {
    providerId: 'sunrun',
    serviceType: 'solar',
    coverageAreas: {
      countries: ['US'],
      states: ['CA', 'AZ', 'NV', 'TX', 'FL', 'SC', 'NC', 'VA', 'MD', 'DE', 'NJ', 'PA', 'CT', 'MA', 'RI', 'NY', 'VT', 'NH']
    },
    restrictions: {
      permits: ['solar-permit'],
      propertyTypes: ['single-family', 'townhouse']
    }
  },
  {
    providerId: 'spothero',
    serviceType: 'parking',
    coverageAreas: {
      countries: ['US'],
      metros: ['NYC', 'CHI', 'LA', 'SF', 'BOS', 'DC', 'PHI', 'SEA', 'DEN', 'ATL', 'MIA', 'DAL']
    },
    restrictions: {
      propertyTypes: ['single-family', 'multi-family', 'commercial']
    }
  },
  {
    providerId: 'neighbor',
    serviceType: 'storage',
    coverageAreas: {
      countries: ['US'],
      states: ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI']
    },
    restrictions: {
      propertyTypes: ['single-family', 'townhouse']
    }
  },
  {
    providerId: 'swimply',
    serviceType: 'pool',
    coverageAreas: {
      countries: ['US'],
      states: ['CA', 'TX', 'FL', 'AZ', 'NV', 'GA', 'NC', 'SC', 'TN', 'AL', 'LA', 'AR', 'OK']
    },
    restrictions: {
      permits: ['pool-rental-permit'],
      propertyTypes: ['single-family']
    }
  },
  {
    providerId: 'honeygain',
    serviceType: 'bandwidth',
    coverageAreas: {
      countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI']
    },
    restrictions: {}
  },
  {
    providerId: 'airbnb',
    serviceType: 'rental',
    coverageAreas: {
      countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'JP', 'KR']
    },
    restrictions: {
      permits: ['short-term-rental-permit'],
      propertyTypes: ['single-family', 'multi-family', 'condo']
    }
  }
];

export class ServiceAvailabilityVerifier {
  
  static async verifyServiceAvailability(
    serviceType: string,
    location: LocationConstraints,
    propertyInfo: {
      type: string;
      size?: number;
      hasHOA?: boolean;
    }
  ): Promise<ServiceAvailability[]> {
    
    const relevantProviders = PROVIDER_COVERAGE.filter(p => p.serviceType === serviceType);
    const results: ServiceAvailability[] = [];
    
    for (const provider of relevantProviders) {
      const availability = await this.checkProviderAvailability(provider, location, propertyInfo);
      results.push(availability);
    }
    
    // Sort by availability (available first) and coverage quality
    results.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      if (a.coverage === 'full' && b.coverage !== 'full') return -1;
      if (a.coverage !== 'full' && b.coverage === 'full') return 1;
      return 0;
    });
    
    return results;
  }
  
  private static async checkProviderAvailability(
    provider: ProviderCoverage,
    location: LocationConstraints,
    propertyInfo: { type: string; size?: number; hasHOA?: boolean }
  ): Promise<ServiceAvailability> {
    
    const result: ServiceAvailability = {
      providerId: provider.providerId,
      available: false,
      coverage: 'none',
      restrictions: []
    };
    
    // Check geographic coverage
    const geoCoverage = this.checkGeographicCoverage(provider, location);
    if (!geoCoverage.available) {
      result.coverage = 'none';
      result.restrictions = ['Service not available in your area'];
      return result;
    }
    
    result.coverage = geoCoverage.coverage;
    
    // Check property type restrictions
    if (provider.restrictions.propertyTypes?.length) {
      if (!provider.restrictions.propertyTypes.includes(propertyInfo.type)) {
        result.available = false;
        result.restrictions = [`Not available for ${propertyInfo.type} properties`];
        return result;
      }
    }
    
    // Check minimum property size
    if (provider.restrictions.minimumPropertySize && propertyInfo.size) {
      if (propertyInfo.size < provider.restrictions.minimumPropertySize) {
        result.available = false;
        result.restrictions = [`Minimum property size: ${provider.restrictions.minimumPropertySize} sq ft`];
        return result;
      }
    }
    
    // Check HOA restrictions (for now, assume HOA doesn't block services)
    if (propertyInfo.hasHOA && ['solar', 'rental'].includes(provider.serviceType)) {
      result.restrictions?.push('HOA approval may be required');
    }
    
    // Check permit requirements
    if (provider.restrictions.permits?.length) {
      result.restrictions?.push(`Permits required: ${provider.restrictions.permits.join(', ')}`);
    }
    
    result.available = true;
    return result;
  }
  
  private static checkGeographicCoverage(
    provider: ProviderCoverage,
    location: LocationConstraints
  ): { available: boolean; coverage: 'full' | 'partial' | 'none' } {
    
    const { coverageAreas } = provider;
    
    // Check country coverage
    if (!coverageAreas.countries.includes(location.country)) {
      return { available: false, coverage: 'none' };
    }
    
    // Check state coverage (US specific)
    if (location.country === 'US' && coverageAreas.states?.length) {
      if (!coverageAreas.states.includes(location.state || '')) {
        return { available: false, coverage: 'none' };
      }
    }
    
    // Check metro area coverage (more specific)
    if (coverageAreas.metros?.length) {
      const cityMetroMap: Record<string, string> = {
        'New York': 'NYC',
        'Brooklyn': 'NYC',
        'Manhattan': 'NYC',
        'Chicago': 'CHI',
        'Los Angeles': 'LA',
        'San Francisco': 'SF',
        'Boston': 'BOS',
        'Washington': 'DC',
        'Philadelphia': 'PHI',
        'Seattle': 'SEA',
        'Denver': 'DEN',
        'Atlanta': 'ATL',
        'Miami': 'MIA',
        'Dallas': 'DAL'
      };
      
      const userMetro = cityMetroMap[location.city || ''];
      if (userMetro && coverageAreas.metros.includes(userMetro)) {
        return { available: true, coverage: 'full' };
      } else if (coverageAreas.metros.length > 0) {
        return { available: false, coverage: 'none' };
      }
    }
    
    // Check coordinate-based coverage
    if (coverageAreas.coordinates?.length) {
      for (const area of coverageAreas.coordinates) {
        const distance = this.calculateDistance(
          location.coordinates.lat,
          location.coordinates.lng,
          area.lat,
          area.lng
        );
        
        if (distance <= area.radius) {
          return { available: true, coverage: 'full' };
        } else if (distance <= area.radius * 1.5) {
          return { available: true, coverage: 'partial' };
        }
      }
      return { available: false, coverage: 'none' };
    }
    
    // Default to available if no specific restrictions
    return { available: true, coverage: 'full' };
  }
  
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  static getAlternativeProviders(
    serviceType: string,
    unavailableProviders: string[],
    location: LocationConstraints
  ): string[] {
    const allProviders = PROVIDER_COVERAGE
      .filter(p => p.serviceType === serviceType)
      .map(p => p.providerId);
    
    return allProviders.filter(id => !unavailableProviders.includes(id));
  }
}
