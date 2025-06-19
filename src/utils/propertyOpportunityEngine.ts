
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
    id: 'parking_rental',
    title: 'Parking Space Rental',
    category: 'parking',
    applicablePropertyTypes: ['commercial', 'residential', 'vacant_land', 'industrial'],
    baseMonthlyRevenue: 100,
    setupCost: 500,
    requirements: ['Available parking spaces', 'Legal parking rights'],
    restrictions: ['Local parking regulations'],
    scalingFactors: {
      commercial: 2.5,
      residential: 1.0,
      vacant_land: 1.8,
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
    id: 'solar_farm',
    title: 'Ground-Mount Solar Farm',
    category: 'energy',
    applicablePropertyTypes: ['vacant_land'],
    baseMonthlyRevenue: 500,
    setupCost: 100000,
    requirements: ['Large open space', 'Grid connection access'],
    restrictions: ['Zoning approval required', 'Environmental impact assessment'],
    scalingFactors: {
      commercial: 0,
      residential: 0,
      vacant_land: 1.0,
      industrial: 0
    }
  },
  {
    id: 'ev_charging',
    title: 'EV Charging Stations',
    category: 'automotive',
    applicablePropertyTypes: ['commercial', 'vacant_land'],
    baseMonthlyRevenue: 300,
    setupCost: 15000,
    requirements: ['Electrical infrastructure', 'Public accessibility'],
    restrictions: ['Commercial zoning preferred', 'Utility permits required'],
    scalingFactors: {
      commercial: 1.5,
      residential: 0.3,
      vacant_land: 1.2,
      industrial: 0.8
    }
  },
  {
    id: 'storage_facility',
    title: 'Self-Storage Units',
    category: 'storage',
    applicablePropertyTypes: ['vacant_land', 'commercial', 'industrial'],
    baseMonthlyRevenue: 800,
    setupCost: 50000,
    requirements: ['Buildable space', 'Zoning compliance'],
    restrictions: ['Construction permits required', 'Security system needed'],
    scalingFactors: {
      commercial: 1.2,
      residential: 0.1,
      vacant_land: 1.0,
      industrial: 0.8
    }
  },
  {
    id: 'advertising_space',
    title: 'Billboard/Advertising Space',
    category: 'advertising',
    applicablePropertyTypes: ['commercial', 'vacant_land'],
    baseMonthlyRevenue: 400,
    setupCost: 5000,
    requirements: ['High visibility location', 'Traffic exposure'],
    restrictions: ['Local signage ordinances', 'Zoning compliance'],
    scalingFactors: {
      commercial: 1.5,
      residential: 0.2,
      vacant_land: 1.0,
      industrial: 0.6
    }
  },
  {
    id: 'land_lease',
    title: 'Land Lease for Development',
    category: 'real_estate',
    applicablePropertyTypes: ['vacant_land'],
    baseMonthlyRevenue: 1200,
    setupCost: 1000,
    requirements: ['Developable land', 'Clear title'],
    restrictions: ['Zoning restrictions', 'Development agreements needed'],
    scalingFactors: {
      commercial: 0,
      residential: 0,
      vacant_land: 1.0,
      industrial: 0
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
  const applicableTemplates = OPPORTUNITY_TEMPLATES.filter(template =>
    template.applicablePropertyTypes.includes(classification.primaryType) &&
    classification.availableOpportunities.some(opp => 
      template.id.includes(opp.replace('_', '')) || opp.includes(template.category)
    )
  );

  return applicableTemplates.map(template => {
    const scalingFactor = template.scalingFactors[classification.primaryType];
    const adjustedRevenue = Math.round(template.baseMonthlyRevenue * scalingFactor);
    const adjustedSetupCost = Math.round(template.setupCost * scalingFactor);

    return {
      title: template.title,
      category: template.category,
      monthlyRevenue: adjustedRevenue,
      setupCost: adjustedSetupCost,
      paybackMonths: adjustedRevenue > 0 ? Math.ceil(adjustedSetupCost / adjustedRevenue) : 0,
      confidenceScore: classification.confidence,
      description: generateOpportunityDescription(template, classification),
      requirements: template.requirements,
      restrictions: [...template.restrictions, ...classification.restrictions],
      availableForPropertyType: true,
      propertyTypeOptimized: true,
      scalingFactor
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
    case 'parking_rental':
      return classification.primaryType === 'vacant_land' 
        ? `Convert vacant land into paid parking lot for nearby businesses and commuters`
        : `Rent available parking spaces on your ${context} to local commuters`;
    
    case 'solar_farm':
      return `Install ground-mounted solar panels across your vacant land to generate clean energy revenue`;
    
    case 'ev_charging':
      return `Install EV charging stations on your ${context} to serve the growing electric vehicle market`;
    
    case 'storage_facility':
      return classification.primaryType === 'vacant_land'
        ? `Build self-storage units on your land to serve local storage demand`
        : `Convert available space into storage units for rental income`;
    
    case 'land_lease':
      return `Lease your vacant land to developers or businesses for long-term passive income`;
    
    default:
      return `Monetize your ${context} with ${template.title.toLowerCase()}`;
  }
};
