
export interface PropertyClassificationResult {
  primaryType: 'residential' | 'commercial' | 'vacant_land' | 'industrial' | 'mixed_use' | 'apartment' | 'institutional' | 'agricultural';
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

// Enhanced address analysis patterns with more comprehensive detection
const PROPERTY_TYPE_PATTERNS = {
  vacant_land: {
    keywords: [
      'vacant lot', 'empty lot', 'undeveloped land', 'raw land', 'development site',
      'buildable lot', 'acres for sale', 'land parcel', 'development opportunity',
      'investment land', 'commercial land', 'zoned land', 'cleared lot'
    ],
    addressPatterns: [
      /\b(lot|parcel)\s*\d+/i,
      /\b\d+\s*acres?\b/i,
      /vacant\s+(lot|land|parcel)/i,
      /undeveloped\s+(land|lot)/i,
      /development\s+(site|opportunity)/i,
      /\blocated\s+on\s+\d+\s+acres/i,
      /\b\d+\.\d+\s+acres/i
    ],
    negativeKeywords: [
      'house', 'home', 'bedroom', 'bathroom', 'kitchen', 'living room',
      'apartment', 'condo', 'townhouse', 'residence', 'dwelling',
      'suite', 'unit', 'floor', 'story', 'garage', 'driveway'
    ]
  },
  residential: {
    keywords: [
      'house', 'home', 'residence', 'dwelling', 'single family', 'family home',
      'bedroom', 'bathroom', 'kitchen', 'living room', 'master suite',
      'garage', 'driveway', 'yard', 'patio', 'deck', 'basement', 'attic'
    ],
    addressPatterns: [
      /\b\d+\s+(bedroom|bed|br)\b/i,
      /\b\d+\s+(bathroom|bath|ba)\b/i,
      /\b(single|multi)\s*family/i,
      /\b\d+\s+story\b/i,
      /\b\d+\s+sq\s*ft\b/i,
      /\bbuilt\s+in\s+\d{4}/i
    ],
    negativeKeywords: [
      'vacant', 'empty', 'undeveloped', 'lot only', 'land only',
      'development site', 'acres', 'buildable lot'
    ]
  },
  apartment: {
    keywords: [
      'apartment', 'apt', 'unit', 'suite', 'condo', 'condominium',
      'townhouse', 'townhome', 'duplex', 'triplex', 'fourplex',
      'multi-unit', 'complex', 'building'
    ],
    addressPatterns: [
      /\b(apt|apartment|unit|suite|#)\s*\d+/i,
      /\b(condo|condominium)\b/i,
      /\btownhouse\b/i,
      /\bduplex\b/i,
      /\bfloor\s+\d+/i
    ],
    negativeKeywords: [
      'vacant', 'empty', 'undeveloped', 'lot', 'acres', 'land only'
    ]
  },
  commercial: {
    keywords: [
      'office', 'retail', 'store', 'shop', 'mall', 'plaza', 'center',
      'warehouse', 'industrial', 'factory', 'business', 'commercial'
    ],
    addressPatterns: [
      /\b(suite|ste|unit|#)\s*\d+/i,
      /\b\d+\s*(office|retail|commercial)\b/i,
      /\b(business|industrial)\s+(park|center|district)/i,
      /\bsq\s*ft\s+commercial/i
    ],
    negativeKeywords: [
      'vacant', 'empty', 'undeveloped', 'residential', 'home', 'house'
    ]
  }
};

// Enhanced residential sub-type classification
const RESIDENTIAL_SUBTYPES = {
  single_family: {
    keywords: ['single family', 'detached', 'house', 'home'],
    patterns: [/single\s+family/i, /detached\s+home/i],
    negativeKeywords: ['apartment', 'condo', 'unit', 'suite']
  },
  apartment: {
    keywords: ['apartment', 'apt', 'unit', 'complex'],
    patterns: [/apt\s*\d+/i, /unit\s*\d+/i, /apartment/i],
    negativeKeywords: ['single family', 'detached']
  },
  condominium: {
    keywords: ['condo', 'condominium'],
    patterns: [/condo(minium)?/i],
    negativeKeywords: ['apartment', 'rental']
  },
  townhouse: {
    keywords: ['townhouse', 'townhome', 'row house'],
    patterns: [/town(house|home)/i, /row\s+house/i],
    negativeKeywords: ['apartment', 'condo']
  },
  duplex: {
    keywords: ['duplex', 'triplex', 'fourplex'],
    patterns: [/(duplex|triplex|fourplex)/i],
    negativeKeywords: ['single family', 'apartment']
  }
};

export const classifyPropertyFromAddress = (address: string, propertyType?: string): PropertyClassificationResult => {
  const lowerAddress = address.toLowerCase();
  const lowerPropertyType = propertyType?.toLowerCase() || '';
  const combinedText = `${lowerAddress} ${lowerPropertyType}`;
  
  console.log(`🔍 Analyzing address: "${address}" with type: "${propertyType}"`);
  
  let scores = {
    vacant_land: 0,
    residential: 0,
    apartment: 0,
    commercial: 0,
    industrial: 0,
    mixed_use: 0
  };

  // Score each property type
  Object.entries(PROPERTY_TYPE_PATTERNS).forEach(([type, patterns]) => {
    let typeScore = 0;
    
    // Positive keyword scoring
    patterns.keywords.forEach(keyword => {
      if (combinedText.includes(keyword)) {
        const weight = type === 'vacant_land' ? 3 : 2; // Higher weight for vacant land detection
        typeScore += weight;
        console.log(`  ✓ Found "${keyword}" for ${type} (+${weight})`);
      }
    });
    
    // Pattern matching
    patterns.addressPatterns.forEach(pattern => {
      if (pattern.test(combinedText)) {
        const weight = type === 'vacant_land' ? 4 : 3; // Higher weight for vacant land patterns
        typeScore += weight;
        console.log(`  ✓ Matched pattern for ${type} (+${weight})`);
      }
    });
    
    // Negative keyword penalties
    if (patterns.negativeKeywords) {
      patterns.negativeKeywords.forEach(negativeKeyword => {
        if (combinedText.includes(negativeKeyword)) {
          typeScore -= 2;
          console.log(`  ✗ Found negative "${negativeKeyword}" for ${type} (-2)`);
        }
      });
    }
    
    scores[type as keyof typeof scores] = Math.max(0, typeScore);
  });

  // Address context analysis for better classification
  const addressContext = analyzeAddressContext(combinedText);
  
  // Apply contextual adjustments
  if (addressContext.hasStreetNumber && addressContext.hasStreetName && !addressContext.hasLotIndicators) {
    // Standard street addresses are more likely to be residential
    scores.residential += 2;
    scores.apartment += 1;
    console.log(`  📍 Standard street address detected (+2 residential, +1 apartment)`);
  }
  
  if (addressContext.hasResidentialIndicators) {
    scores.residential += 3;
    scores.apartment += 2;
    scores.vacant_land -= 2;
    console.log(`  🏠 Residential indicators found (+3 residential, +2 apartment, -2 vacant_land)`);
  }
  
  if (addressContext.hasVacantLandIndicators) {
    scores.vacant_land += 4;
    scores.residential -= 3;
    scores.apartment -= 3;
    console.log(`  🌍 Vacant land indicators found (+4 vacant_land, -3 residential, -3 apartment)`);
  }

  // Determine primary type with improved logic
  const maxScore = Math.max(...Object.values(scores));
  let primaryType: PropertyClassificationResult['primaryType'];
  
  if (maxScore === 0) {
    // Default to residential for standard addresses if no clear indicators
    if (addressContext.hasStreetNumber && addressContext.hasStreetName) {
      primaryType = 'residential';
      scores.residential = 1; // Give it a base score
      console.log(`  🏘️ Defaulting to residential for standard address`);
    } else {
      primaryType = 'residential'; // Changed from vacant_land to residential as default
      console.log(`  🏘️ Defaulting to residential (no clear indicators)`);
    }
  } else {
    const topEntry = Object.entries(scores).find(([_, score]) => score === maxScore);
    primaryType = topEntry![0] as PropertyClassificationResult['primaryType'];
  }
  
  // Handle apartment vs residential classification - apartments get their own primaryType
  if (scores.apartment > scores.residential && scores.apartment > 0) {
    primaryType = 'apartment'; // Apartments are now their own primary type
  }
  
  // Calculate confidence based on score distribution and context
  const confidence = calculateConfidence(scores, maxScore, addressContext);
  
  console.log(`  📊 Final scores:`, scores);
  console.log(`  🎯 Classification: ${primaryType} (confidence: ${Math.round(confidence * 100)}%)`);
  
  return buildClassificationResult(primaryType, combinedText, confidence, scores);
};

const analyzeAddressContext = (text: string) => {
  return {
    hasStreetNumber: /^\d+\s/.test(text.trim()),
    hasStreetName: /\b(st|street|ave|avenue|rd|road|dr|drive|ln|lane|way|blvd|boulevard|ct|court|pl|place)\b/i.test(text),
    hasUnitNumber: /\b(apt|apartment|unit|suite|#)\s*\d+/i.test(text),
    hasLotIndicators: /\b(lot|parcel)\s*\d+/i.test(text),
    hasResidentialIndicators: /\b(bedroom|bathroom|sq\s*ft|built\s+in|single\s+family|home|house)\b/i.test(text),
    hasVacantLandIndicators: /\b(vacant|empty|undeveloped|acres|development\s+site|buildable\s+lot)\b/i.test(text),
    hasCommercialIndicators: /\b(office|retail|commercial|business|warehouse|industrial)\b/i.test(text)
  };
};

const calculateConfidence = (scores: Record<string, number>, maxScore: number, context: any): number => {
  if (maxScore === 0) return 0.3; // Low confidence for unclear properties
  
  const secondHighest = Object.values(scores).sort((a, b) => b - a)[1] || 0;
  const scoreDifference = maxScore - secondHighest;
  
  let baseConfidence = 0.5 + (scoreDifference * 0.1);
  
  // Boost confidence for clear context indicators
  if (context.hasResidentialIndicators && maxScore >= 3) baseConfidence += 0.2;
  if (context.hasVacantLandIndicators && maxScore >= 4) baseConfidence += 0.3;
  if (context.hasCommercialIndicators && maxScore >= 3) baseConfidence += 0.2;
  
  // Reduce confidence for conflicting signals
  if (context.hasResidentialIndicators && context.hasVacantLandIndicators) baseConfidence -= 0.15;
  
  return Math.min(0.95, Math.max(0.1, baseConfidence));
};

const determineResidentialSubType = (text: string, scores: Record<string, number>): string => {
  let bestSubType = 'single_family_home';
  let bestScore = 0;
  
  Object.entries(RESIDENTIAL_SUBTYPES).forEach(([subType, config]) => {
    let score = 0;
    
    // Check keywords
    config.keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 2;
    });
    
    // Check patterns
    config.patterns.forEach(pattern => {
      if (pattern.test(text)) score += 3;
    });
    
    // Apply negative keyword penalties
    config.negativeKeywords.forEach(negative => {
      if (text.includes(negative)) score -= 1;
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestSubType = subType;
    }
  });
  
  // Special handling for apartment detection
  if (scores.apartment > scores.residential * 0.8) {
    return 'apartment';
  }
  
  return bestSubType;
};

export const classifyPropertyFromImageAnalysis = (imageAnalysis: string): PropertyClassificationResult => {
  const lowerAnalysis = imageAnalysis.toLowerCase();
  
  // Enhanced vacant land detection
  const vacantLandPatterns = [
    /vacant.*land/i,
    /empty.*lot/i,
    /undeveloped.*site/i,
    /cleared.*land/i,
    /development.*opportunity/i
  ];
  
  const residentialPatterns = [
    /residential.*building/i,
    /house/i,
    /home/i,
    /apartment.*building/i,
    /condo.*complex/i
  ];
  
  // Check for clear vacant land indicators
  if (vacantLandPatterns.some(pattern => pattern.test(lowerAnalysis))) {
    return buildClassificationResult('vacant_land', lowerAnalysis, 0.9, { vacant_land: 5 });
  }
  
  // Check for residential indicators
  if (residentialPatterns.some(pattern => pattern.test(lowerAnalysis))) {
    return buildClassificationResult('residential', lowerAnalysis, 0.8, { residential: 4 });
  }
  
  // Commercial indicators
  if (lowerAnalysis.includes('commercial') || lowerAnalysis.includes('business')) {
    return buildClassificationResult('commercial', lowerAnalysis, 0.8, { commercial: 4 });
  }
  
  // Default to residential with low confidence for unclear image analysis
  return buildClassificationResult('residential', lowerAnalysis, 0.4, { residential: 1 });
};

const buildClassificationResult = (
  primaryType: PropertyClassificationResult['primaryType'], 
  context: string, 
  confidence: number,
  scores: Record<string, number> = {}
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

    case 'apartment':
      return {
        ...baseResult,
        subType: context.includes('condo') ? 'condominium' : 'apartment_unit',
        availableOpportunities: ['internet_sharing', 'storage_rental'],
        restrictions: ['Limited individual property control', 'HOA restrictions may apply', 'Shared building amenities', 'No rooftop access', 'No parking control'],
        marketContext: {
          commercialViability: 'low',
          developmentPotential: 'low'
        }
      };

    case 'residential':
      const subType = determineResidentialSubType(context, scores);
      
      return {
        ...baseResult,
        subType,
        availableOpportunities: ['rooftop_solar', 'parking_rental', 'pool_rental', 'storage_rental', 'internet_sharing'],
        restrictions: [],
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
