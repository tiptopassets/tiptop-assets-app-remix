
import { PropertyClassificationResult } from './propertyClassification';

export interface OpportunityTemplate {
  id: string;
  title: string;
  category: string;
  applicablePropertyTypes: string[];
  baseMonthlyRevenue: number;
  setupCost: number;
  requirements: string[];
  restrictions: string[];
  scalingFactors: {
    commercial: number;
    residential: number;
    vacant_land: number;
    industrial: number;
  };
}

const OPPORTUNITY_TEMPLATES: OpportunityTemplate[] = [
  {
    id: 'land_lease',
    title: 'Land Lease for Development',
    category: 'real_estate',
    applicablePropertyTypes: ['vacant_land'],
    baseMonthlyRevenue: 1500,
    setupCost: 1000,
    requirements: ['Clear title', 'Developable land', 'Zoning compliance'],
    restrictions: ['Development agreements needed', 'Zoning restrictions may apply'],
    scalingFactors: {
      commercial: 0,
      residential: 0,
      vacant_land: 1.0,
      industrial: 0
    }
  },
  {
    id: 'solar_farm',
    title: 'Ground-Mount Solar Farm',
    category: 'energy',
    applicablePropertyTypes: ['vacant_land'],
    baseMonthlyRevenue: 800,
    setupCost: 50000,
    requirements: ['Large open space (min 1 acre)', 'Grid connection access', 'Good sun exposure'],
    restrictions: ['Environmental impact assessment', 'Utility interconnection agreements'],
    scalingFactors: {
      commercial: 0,
      residential: 0,
      vacant_land: 1.0,
      industrial: 0
    }
  },
  {
    id: 'parking_lot',
    title: 'Paid Parking Lot',
    category: 'parking',
    applicablePropertyTypes: ['vacant_land', 'commercial'],
    baseMonthlyRevenue: 600,
    setupCost: 8000,
    requirements: ['Accessible location', 'Traffic flow', 'Security measures'],
    restrictions: ['Parking regulations', 'ADA compliance required'],
    scalingFactors: {
      commercial: 1.2,
      residential: 0.3,
      vacant_land: 1.0,
      industrial: 0.8
    }
  },
  {
    id: 'storage_facility',
    title: 'Self-Storage Development',
    category: 'storage',
    applicablePropertyTypes: ['vacant_land', 'commercial'],
    baseMonthlyRevenue: 1200,
    setupCost: 80000,
    requirements: ['Zoning approval', 'Construction permits', 'Security system'],
    restrictions: ['Building codes compliance', 'Fire safety requirements'],
    scalingFactors: {
      commercial: 1.2,
      residential: 0.1,
      vacant_land: 1.0,
      industrial: 0.8
    }
  },
  {
    id: 'ev_charging',
    title: 'EV Charging Station Hub',
    category: 'automotive',
    applicablePropertyTypes: ['vacant_land', 'commercial'],
    baseMonthlyRevenue: 400,
    setupCost: 25000,
    requirements: ['Electrical infrastructure', 'High-traffic location', 'Utility agreements'],
    restrictions: ['Electrical permits required', 'ADA accessibility'],
    scalingFactors: {
      commercial: 1.5,
      residential: 0.2,
      vacant_land: 1.0,
      industrial: 0.8
    }
  },
  {
    id: 'advertising_space',
    title: 'Billboard/Digital Advertising',
    category: 'advertising',
    applicablePropertyTypes: ['vacant_land', 'commercial'],
    baseMonthlyRevenue: 500,
    setupCost: 12000,
    requirements: ['High visibility location', 'Traffic exposure', 'Zoning approval'],
    restrictions: ['Local signage ordinances', 'Height restrictions'],
    scalingFactors: {
      commercial: 1.3,
      residential: 0.1,
      vacant_land: 1.0,
      industrial: 0.6
    }
  },
  {
    id: 'agriculture',
    title: 'Agricultural Lease',
    category: 'agriculture',
    applicablePropertyTypes: ['vacant_land'],
    baseMonthlyRevenue: 300,
    setupCost: 2000,
    requirements: ['Suitable soil conditions', 'Water access', 'Agricultural zoning'],
    restrictions: ['Seasonal variations', 'Weather dependencies'],
    scalingFactors: {
      commercial: 0,
      residential: 0,
      vacant_land: 1.0,
      industrial: 0
    }
  },
  {
    id: 'parking_rental',
    title: 'Parking Space Rental',
    category: 'parking',
    applicablePropertyTypes: ['commercial', 'residential', 'industrial'],
    baseMonthlyRevenue: 100,
    setupCost: 500,
    requirements: ['Available parking spaces', 'Legal parking rights'],
    restrictions: ['Local parking regulations'],
    scalingFactors: {
      commercial: 2.5,
      residential: 1.0,
      vacant_land: 0,
      industrial: 1.2
    }
  },
  {
    id: 'rooftop_solar',
    title: 'Solar Panel Installation',
    category: 'energy',
    applicablePropertyTypes: ['commercial', 'residential', 'industrial'],
    baseMonthlyRevenue: 150,
    setupCost: 20000,
    requirements: ['Suitable roof space', 'Individual roof access'],
    restrictions: ['Building ownership required', 'Structural assessment needed'],
    scalingFactors: {
      commercial: 3.0,
      residential: 1.0,
      vacant_land: 0,
      industrial: 2.0
    }
  },
  {
    id: 'internet_sharing',
    title: 'Internet Bandwidth Sharing',
    category: 'technology',
    applicablePropertyTypes: ['residential', 'commercial'],
    baseMonthlyRevenue: 35,
    setupCost: 0,
    requirements: ['High-speed internet connection', 'Individual internet control'],
    restrictions: ['ISP terms of service'],
    scalingFactors: {
      commercial: 1.8,
      residential: 1.0,
      vacant_land: 0,
      industrial: 1.2
    }
  }
];

export const generatePropertyOpportunities = (
  classification: PropertyClassificationResult,
  coordinates?: google.maps.LatLngLiteral
): any[] => {
  // Get all templates that match the property type
  const applicableTemplates = OPPORTUNITY_TEMPLATES.filter(template =>
    template.applicablePropertyTypes.includes(classification.primaryType)
  );

  console.log(`🏗️ Found ${applicableTemplates.length} applicable templates for ${classification.primaryType}`);

  return applicableTemplates.map(template => {
    const scalingFactor = template.scalingFactors[classification.primaryType];
    const adjustedRevenue = Math.round(template.baseMonthlyRevenue * scalingFactor);
    const adjustedSetupCost = Math.round(template.setupCost * scalingFactor);

    // Apply market context adjustments
    let marketMultiplier = 1.0;
    if (classification.marketContext.commercialViability === 'high') {
      marketMultiplier = 1.2;
    } else if (classification.marketContext.commercialViability === 'low') {
      marketMultiplier = 0.8;
    }

    const finalRevenue = Math.round(adjustedRevenue * marketMultiplier);

    console.log(`💰 ${template.title}: Base: $${template.baseMonthlyRevenue}, Scaled: $${adjustedRevenue}, Final: $${finalRevenue}`);

    return {
      title: template.title,
      category: template.category,
      monthlyRevenue: finalRevenue,
      setupCost: adjustedSetupCost,
      paybackMonths: finalRevenue > 0 ? Math.ceil(adjustedSetupCost / finalRevenue) : 0,
      confidenceScore: classification.confidence,
      description: generateOpportunityDescription(template, classification),
      requirements: template.requirements,
      restrictions: [...template.restrictions, ...classification.restrictions],
      availableForPropertyType: true,
      propertyTypeOptimized: true,
      scalingFactor,
      marketMultiplier
    };
  }).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
};

const generateOpportunityDescription = (
  template: OpportunityTemplate,
  classification: PropertyClassificationResult
): string => {
  const propertyTypeContext = {
    commercial: 'commercial property',
    vacant_land: 'vacant land',
    residential: 'residential property',
    industrial: 'industrial facility',
    mixed_use: 'mixed-use property'
  };

  const context = propertyTypeContext[classification.primaryType];
  
  switch (template.id) {
    case 'land_lease':
      return `Lease your vacant land to developers or businesses for long-term passive income with potential for significant returns`;
    
    case 'solar_farm':
      return `Install ground-mounted solar panels across your vacant land to generate clean energy revenue with 20+ year contracts`;
    
    case 'parking_lot':
      return classification.primaryType === 'vacant_land' 
        ? `Convert vacant land into a paid parking lot serving nearby businesses, events, and commuters`
        : `Optimize existing parking for rental income`;
    
    case 'storage_facility':
      return classification.primaryType === 'vacant_land'
        ? `Develop self-storage units on your land to serve growing storage demand in your area`
        : `Convert available space into storage units for rental income`;
    
    case 'ev_charging':
      return `Install EV charging stations on your ${context} to serve the rapidly growing electric vehicle market`;
    
    case 'advertising_space':
      return `Generate passive income by leasing space for billboards or digital advertising displays`;
    
    case 'agriculture':
      return `Lease your land to local farmers or agricultural businesses for seasonal crop production`;
    
    default:
      return `Monetize your ${context} with ${template.title.toLowerCase()}`;
  }
};
