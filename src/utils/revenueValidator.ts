
// Centralized revenue validation service
export interface RevenueValidationResult {
  originalRevenue: number;
  validatedRevenue: number;
  wasAdjusted: boolean;
  reason?: string;
  marketRate?: number;
}

export interface ValidationContext {
  propertyType: string;
  assetType: 'parking' | 'solar' | 'pool' | 'garden' | 'bandwidth' | 'storage';
  marketRate?: number;
  coordinates?: google.maps.LatLngLiteral;
}

// Realistic revenue caps by asset type
const REVENUE_CAPS = {
  parking: {
    residential: 800,   // $800/month max for residential parking
    commercial: 1000,   // $1000/month max for commercial parking
    hotel: 1200        // $1200/month max for hotel parking
  },
  solar: {
    residential: 200,   // $200/month max for residential solar
    commercial: 500,    // $500/month max for commercial solar
    hotel: 400         // $400/month max for hotel solar
  },
  pool: {
    all: 800           // $800/month max for pool rental
  },
  garden: {
    all: 300           // $300/month max for garden rental
  },
  bandwidth: {
    all: 50            // $50/month max for bandwidth sharing
  },
  storage: {
    all: 200           // $200/month max for storage rental
  }
};

export const validateRevenue = (
  revenue: number, 
  context: ValidationContext
): RevenueValidationResult => {
  console.log('💰 Validating revenue:', { revenue, context });
  
  const { propertyType, assetType } = context;
  const propertyCategory = getPropertyCategory(propertyType);
  
  let cap: number;
  let reason: string | undefined;
  
  // Get the appropriate cap based on asset and property type
  switch (assetType) {
    case 'parking':
      cap = REVENUE_CAPS.parking[propertyCategory as keyof typeof REVENUE_CAPS.parking] || REVENUE_CAPS.parking.residential;
      break;
    case 'solar':
      cap = REVENUE_CAPS.solar[propertyCategory as keyof typeof REVENUE_CAPS.solar] || REVENUE_CAPS.solar.residential;
      break;
    case 'pool':
      cap = REVENUE_CAPS.pool.all;
      break;
    case 'garden':
      cap = REVENUE_CAPS.garden.all;
      break;
    case 'bandwidth':
      cap = REVENUE_CAPS.bandwidth.all;
      break;
    case 'storage':
      cap = REVENUE_CAPS.storage.all;
      break;
    default:
      cap = 1000; // Default cap
  }
  
  const validatedRevenue = Math.min(revenue, cap);
  const wasAdjusted = validatedRevenue !== revenue;
  
  if (wasAdjusted) {
    reason = `Revenue capped at $${cap}/month for ${propertyCategory} ${assetType}`;
    console.log(`⚠️ Revenue adjusted: ${revenue} → ${validatedRevenue} (${reason})`);
  } else {
    console.log(`✅ Revenue validated: $${validatedRevenue}/month`);
  }
  
  return {
    originalRevenue: revenue,
    validatedRevenue,
    wasAdjusted,
    reason,
    marketRate: context.marketRate
  };
};

const getPropertyCategory = (propertyType: string): 'residential' | 'commercial' | 'hotel' => {
  const type = propertyType.toLowerCase();
  
  if (type.includes('commercial') || type.includes('office') || type.includes('business')) {
    return 'commercial';
  }
  
  if (type.includes('hotel') || type.includes('motel') || type.includes('inn') || type.includes('resort')) {
    return 'hotel';
  }
  
  return 'residential';
};

// Parking-specific validation with market rate enforcement
export const validateParkingRevenue = (
  spaces: number,
  rate: number,
  propertyType: string,
  daysPerMonth: number = 20
): RevenueValidationResult => {
  const calculatedRevenue = spaces * rate * daysPerMonth;
  
  const context: ValidationContext = {
    propertyType,
    assetType: 'parking',
    marketRate: rate
  };
  
  const result = validateRevenue(calculatedRevenue, context);
  
  // Additional parking-specific validation
  if (spaces > 20) {
    console.warn(`⚠️ Parking spaces (${spaces}) seems high, may need verification`);
  }
  
  if (rate > 50) {
    console.warn(`⚠️ Parking rate ($${rate}/day) seems high, may need verification`);
  }
  
  return result;
};
