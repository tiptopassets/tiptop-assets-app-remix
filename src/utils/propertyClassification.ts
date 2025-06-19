
export interface PropertyClassificationResult {
  primaryType: 'residential' | 'commercial' | 'vacant_land' | 'industrial' | 'mixed_use';
  subType: string;
  confidence: number;
  restrictions: string[];
  availableOpportunities: string[];
  marketContext: {
    zoning?: string;
    developmentPotential?: 'high' | 'medium' | 'low';
    commercialViability?: 'high' | 'medium' | 'low';
  };
}

// Enhanced address analysis patterns
const PROPERTY_TYPE_PATTERNS = {
  vacant_land: {
    keywords: [
      'vacant', 'empty', 'lot', 'land', 'parcel', 'acres', 'development',
      'undeveloped', 'raw', 'buildable', 'zoned', 'site', 'plot',
      'development opportunity', 'investment land', 'commercial land'
    ],
    addressPatterns: [
      /\b(lot|parcel)\s*\d+/i,
      /\b\d+\s*acres?\b/i,
      /vacant\s+(lot|land|parcel)/i,
      /undeveloped\s+(land|lot)/i,
      /development\s+(site|opportunity)/i
    ]
  },
  commercial: {
    keywords: [
      'office', 'retail', 'store', 'shop', 'mall', 'plaza', 'center', 'building',
      'warehouse', 'industrial', 'factory', 'business', 'commercial', 'suite',
      'unit', 'floor', 'tower', 'complex', 'park', 'district'
    ],
    addressPatterns: [
      /\b(suite|ste|unit|#)\s*\d+/i,
      /\b\d+\s*(office|retail|commercial)\b/i,
      /\b(business|industrial)\s+(park|center|district)/i
    ]
  },
  residential: {
    keywords: [
      'house', 'home', 'residence', 'dwelling', 'family', 'bedroom', 'bath',
      'apartment', 'condo', 'townhouse', 'duplex', 'single', 'multi'
    ],
    addressPatterns: [
      /\b\d+\s+(bedroom|bed|br)\b/i,
      /\b(single|multi)\s*family/i,
      /\b(apartment|apt|condo|townhouse)/i
    ]
  }
};

export const classifyPropertyFromAddress = (address: string, propertyType?: string): PropertyClassificationResult => {
  const lowerAddress = address.toLowerCase();
  const lowerPropertyType = propertyType?.toLowerCase() || '';
  
  let scores = {
    vacant_land: 0,
    commercial: 0,
    residential: 0,
    industrial: 0,
    mixed_use: 0
  };

  // Enhanced scoring for vacant land detection
  Object.entries(PROPERTY_TYPE_PATTERNS).forEach(([type, patterns]) => {
    patterns.keywords.forEach(keyword => {
      if (lowerAddress.includes(keyword) || lowerPropertyType.includes(keyword)) {
        // Give higher score for vacant land keywords
        const multiplier = type === 'vacant_land' ? 2 : 1;
        scores[type as keyof typeof scores] += multiplier;
      }
    });

    patterns.addressPatterns.forEach(pattern => {
      if (pattern.test(lowerAddress) || pattern.test(lowerPropertyType)) {
        const multiplier = type === 'vacant_land' ? 3 : 2;
        scores[type as keyof typeof scores] += multiplier;
      }
    });
  });

  // Additional context-based scoring
  if (lowerAddress.includes('commercial') && (lowerAddress.includes('vacant') || lowerAddress.includes('land'))) {
    scores.vacant_land += 5;
  }

  // Determine primary type
  const maxScore = Math.max(...Object.values(scores));
  const primaryType = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'residential';
  
  const confidence = maxScore > 0 ? Math.min(0.95, 0.6 + (maxScore * 0.05)) : 0.3;

  return buildClassificationResult(primaryType as any, lowerAddress, confidence);
};

export const classifyPropertyFromImageAnalysis = (imageAnalysis: string): PropertyClassificationResult => {
  const lowerAnalysis = imageAnalysis.toLowerCase();
  
  // Vacant land indicators (highest priority)
  if ((lowerAnalysis.includes('vacant') || lowerAnalysis.includes('empty') || lowerAnalysis.includes('undeveloped')) && 
      (lowerAnalysis.includes('lot') || lowerAnalysis.includes('land') || lowerAnalysis.includes('site'))) {
    return buildClassificationResult('vacant_land', lowerAnalysis, 0.9);
  }

  // Commercial vacant land
  if (lowerAnalysis.includes('commercial') && 
      (lowerAnalysis.includes('vacant') || lowerAnalysis.includes('undeveloped'))) {
    return buildClassificationResult('vacant_land', lowerAnalysis, 0.85);
  }

  // Commercial indicators
  if (lowerAnalysis.includes('parking lot') && 
      (lowerAnalysis.includes('commercial') || lowerAnalysis.includes('business') || lowerAnalysis.includes('retail'))) {
    return buildClassificationResult('commercial', lowerAnalysis, 0.8);
  }

  // Industrial indicators
  if (lowerAnalysis.includes('warehouse') || lowerAnalysis.includes('industrial') || lowerAnalysis.includes('factory')) {
    return buildClassificationResult('industrial', lowerAnalysis, 0.8);
  }

  // Default to residential with low confidence if no clear indicators
  return buildClassificationResult('residential', lowerAnalysis, 0.4);
};

const buildClassificationResult = (
  primaryType: PropertyClassificationResult['primaryType'], 
  context: string, 
  confidence: number
): PropertyClassificationResult => {
  const baseResult: PropertyClassificationResult = {
    primaryType,
    subType: 'unknown',
    confidence,
    restrictions: [],
    availableOpportunities: [],
    marketContext: {}
  };

  switch (primaryType) {
    case 'vacant_land':
      return {
        ...baseResult,
        subType: context.includes('commercial') ? 'commercial_land' : 'undeveloped_land',
        availableOpportunities: ['land_lease', 'parking_lot', 'solar_farm', 'agriculture', 'storage_facility', 'ev_charging', 'advertising_space'],
        restrictions: ['Zoning compliance required', 'Environmental permits may be needed', 'Utility access verification'],
        marketContext: {
          developmentPotential: 'high',
          commercialViability: context.includes('commercial') ? 'high' : 'medium',
          zoning: context.includes('commercial') ? 'commercial' : 'mixed'
        }
      };

    case 'commercial':
      return {
        ...baseResult,
        subType: determineCommercialSubType(context),
        availableOpportunities: ['parking_rental', 'ev_charging', 'rooftop_solar', 'advertising_space', 'storage_rental'],
        restrictions: ['Commercial zoning compliance required', 'Business permits may be needed'],
        marketContext: {
          commercialViability: 'high',
          developmentPotential: 'medium'
        }
      };

    case 'industrial':
      return {
        ...baseResult,
        subType: 'industrial_facility',
        availableOpportunities: ['rooftop_solar', 'storage_rental', 'equipment_rental', 'parking_rental'],
        restrictions: ['Industrial zoning requirements', 'Environmental compliance needed'],
        marketContext: {
          commercialViability: 'medium',
          developmentPotential: 'low'
        }
      };

    case 'residential':
      return {
        ...baseResult,
        subType: determineResidentialSubType(context),
        availableOpportunities: ['rooftop_solar', 'parking_rental', 'pool_rental', 'storage_rental', 'internet_sharing'],
        restrictions: context.includes('apartment') || context.includes('condo') ? 
          ['Limited individual property control', 'HOA restrictions may apply'] : [],
        marketContext: {
          commercialViability: 'low',
          developmentPotential: 'low'
        }
      };

    default:
      return baseResult;
  }
};

const determineCommercialSubType = (context: string): string => {
  if (context.includes('retail') || context.includes('store')) return 'retail';
  if (context.includes('office')) return 'office';
  if (context.includes('warehouse')) return 'warehouse';
  if (context.includes('restaurant') || context.includes('food')) return 'restaurant';
  return 'general_commercial';
};

const determineResidentialSubType = (context: string): string => {
  if (context.includes('apartment') || context.includes('apt')) return 'apartment';
  if (context.includes('condo')) return 'condominium';
  if (context.includes('townhouse')) return 'townhouse';
  if (context.includes('duplex')) return 'duplex';
  return 'single_family_home';
};
