import { PropertyInfo, ImageAnalysis, AnalysisResults } from './types.ts';

export const generatePropertyAnalysis = async (
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis = {}
): Promise<AnalysisResults> => {
  console.log('🏗️ Generating enhanced property analysis with improved classification...');
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  // Enhanced property classification using all available data sources
  const comprehensiveClassification = await performComprehensivePropertyAnalysis(propertyInfo, imageAnalysis, openaiApiKey);
  console.log('🏢 Comprehensive property classification:', comprehensiveClassification);

  // Generate analysis with comprehensive property-aware logic
  const analysisPrompt = createComprehensiveAnalysisPrompt(propertyInfo, imageAnalysis, comprehensiveClassification);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        {
          role: 'system',
          content: `You are a property monetization expert. Analyze properties and provide realistic revenue opportunities based on building type and access rights.
          
          CRITICAL: ALWAYS respond with valid JSON format. Do not include any text before or after the JSON.
          
          BUILDING TYPE RULES:
          - APARTMENTS/CONDOS: Residents have NO access to roofs, shared parking, pools, or gardens for individual monetization
          - SINGLE FAMILY HOMES: Full access to all property features
          - COMMERCIAL: Business-focused opportunities only
          - VACANT LAND: Development and leasing opportunities
          
          For APARTMENTS specifically:
          - Rooftop revenue: $0 (no individual access)
          - Parking revenue: $0 (building/HOA controlled)
          - Pool revenue: $0 (shared amenity, cannot rent individually)
          - Garden revenue: $0 (no individual garden access)
          - Storage revenue: $5-15/month (limited to personal unit storage)
          - Internet revenue: $25-50/month (bandwidth sharing within unit)
          
          RESPONSE FORMAT: Return ONLY valid JSON with no additional text or markdown formatting.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_completion_tokens: 2500,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    console.error(`OpenAI API error: ${response.status}`);
    // Return fallback analysis instead of throwing
    return generateFallbackAnalysis(propertyInfo, imageAnalysis, comprehensiveClassification);
  }

  const data = await response.json();
  const rawResponse = data.choices[0]?.message?.content;
  console.log('Raw GPT response length:', rawResponse?.length || 0);

  if (!rawResponse || rawResponse.trim().length === 0) {
    console.error('Empty OpenAI response, using fallback');
    return generateFallbackAnalysis(propertyInfo, imageAnalysis, comprehensiveClassification);
  }

  let analysisData;
  try {
    // Since we're using response_format: json_object, the response should be pure JSON
    analysisData = JSON.parse(rawResponse);
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.log('Attempting fallback JSON extraction...');
    
    // Fallback: try to extract JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        analysisData = JSON.parse(jsonMatch[0]);
      } catch (fallbackError) {
        console.error('Fallback JSON parsing also failed:', fallbackError);
        return generateFallbackAnalysis(propertyInfo, imageAnalysis, comprehensiveClassification);
      }
    } else {
      console.error('No JSON found in response, using fallback');
      return generateFallbackAnalysis(propertyInfo, imageAnalysis, comprehensiveClassification);
    }
  }

  // Convert to our AnalysisResults format with comprehensive property handling
  const results: AnalysisResults = {
    propertyType: analysisData.propertyType || comprehensiveClassification.primaryType,
    amenities: extractAmenities(analysisData),
    rooftop: {
      area: analysisData.rooftop?.area || 0,
      type: analysisData.rooftop?.type || 'standard',
      solarCapacity: analysisData.rooftop?.solarCapacity || 0,
      solarPotential: analysisData.rooftop?.solarPotential || false,
      revenue: analysisData.rooftop?.monthlyRevenue || 0,
      setupCost: analysisData.rooftop?.setupCost || 0,
      usingRealSolarData: analysisData.rooftop?.usingRealSolarData || false
    },
    garden: {
      area: analysisData.garden?.area || 0,
      opportunity: analysisData.garden?.opportunity || 'None',
      revenue: analysisData.garden?.monthlyRevenue || 0
    },
    parking: {
      spaces: analysisData.parking?.spaces || 0,
      rate: analysisData.parking?.monthlyRevenuePerSpace || 0,
      revenue: analysisData.parking?.totalMonthlyRevenue || 0,
      evChargerPotential: analysisData.parking?.evChargerPotential || false
    },
    pool: {
      present: analysisData.pool?.present || false,
      area: analysisData.pool?.area || 0,
      type: analysisData.pool?.type || 'none',
      revenue: analysisData.pool?.monthlyRevenue || 0
    },
    sportsCourts: {
      present: analysisData.sportsCourts?.present || false,
      types: analysisData.sportsCourts?.types || [],
      count: analysisData.sportsCourts?.count || 0,
      revenue: analysisData.sportsCourts?.monthlyRevenue || 0
    },
    storage: {
      volume: analysisData.storage?.volume || 0,
      revenue: analysisData.storage?.monthlyRevenue || 0
    },
    bandwidth: {
      available: analysisData.internet?.bandwidth || 100,
      revenue: analysisData.internet?.monthlyRevenue || 0
    },
    shortTermRental: {
      nightlyRate: 0,
      monthlyProjection: 0
    },
    permits: analysisData.permits || [],
    restrictions: comprehensiveClassification.restrictions,
    topOpportunities: [],
    imageAnalysisSummary: imageAnalysis.summary || '',
    // Extract totalMonthlyRevenue from GPT response
    totalMonthlyRevenue: analysisData.totalMonthlyRevenue || 0
  };

  // Generate top opportunities based on comprehensive property analysis and actual revenue potential
  results.topOpportunities = generateComprehensiveOpportunities(results, comprehensiveClassification, analysisData);

  console.log('Enhanced property analysis completed successfully');
  return results;
};

import { performComprehensivePropertyAnalysis, createComprehensiveAnalysisPrompt, generateComprehensiveOpportunities } from './comprehensiveAnalysis.ts';

async function detectBuildingTypeAndRestrictions(
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis,
  openaiApiKey: string
) {
  console.log('🔍 Analyzing property type from:', {
    address: propertyInfo.address,
    propertyType: propertyInfo.propertyType,
    imageAnalysisText: imageAnalysis.summary || ''
  });

  const prompt = `Analyze this property to determine building type and individual access rights:

Address: ${propertyInfo.address}
Property Type: ${propertyInfo.propertyType || 'unknown'}
Image Analysis: ${imageAnalysis.summary || 'No image analysis available'}

Determine:
1. Building type (single_family, apartment, commercial, vacant_land)
2. Individual access rights for monetization

For APARTMENTS/CONDOS specifically:
- Residents have NO individual access to rooftops for solar installations
- Parking is typically building/HOA managed, not individually rentable
- Pools are shared amenities, cannot be rented individually
- No individual garden access in most cases
- Only personal unit storage and internet bandwidth can be monetized

Return JSON with:
{
  "type": "building_type",
  "hasRooftopAccess": boolean,
  "hasGardenAccess": boolean, 
  "hasParkingControl": boolean,
  "hasLandControl": boolean,
  "restrictions": "explanation of restrictions or null"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'You are a building classification expert. Analyze the property and return only valid JSON with building type and access rights.'
        },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 300,
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  const rawResponse = data.choices[0].message.content;
  
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Fallback based on classification
    const isApartment = propertyInfo.classification?.subType === 'apartment' || 
                       propertyInfo.propertyType?.toLowerCase().includes('apartment') ||
                       propertyInfo.address.toLowerCase().includes('apt') ||
                       propertyInfo.address.toLowerCase().includes('unit');
    
    return {
      type: isApartment ? 'apartment' : 'single_family',
      hasRooftopAccess: !isApartment,
      hasGardenAccess: !isApartment,
      hasParkingControl: !isApartment,
      hasLandControl: false,
      restrictions: isApartment ? 'Multi-unit building - limited individual monetization access' : null
    };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error parsing building type JSON:', error);
    return {
      type: 'single_family',
      hasRooftopAccess: true,
      hasGardenAccess: true,
      hasParkingControl: true,
      hasLandControl: false,
      restrictions: null
    };
  }
}

function createEnhancedAnalysisPrompt(
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis,
  buildingTypeInfo: any
): string {
  return `Analyze this property for monetization opportunities with STRICT building type awareness:

PROPERTY DETAILS:
- Address: ${propertyInfo.address}
- Building Type: ${buildingTypeInfo.type}
- Property Type: ${propertyInfo.propertyType || 'residential'}
- Coordinates: ${JSON.stringify(propertyInfo.coordinates)}

ACCESS RIGHTS ANALYSIS:
  - Rooftop Access: ${buildingTypeInfo.hasRooftopAccess}
- Garden Access: ${buildingTypeInfo.hasGardenAccess} 
- Parking Control: ${buildingTypeInfo.hasParkingControl}
- Building Restrictions: ${buildingTypeInfo.restrictions || 'None'}

IMAGE ANALYSIS: ${imageAnalysis.summary || 'No image analysis available'}

SPORTS COURTS ANALYSIS:
- Look for tennis courts, pickleball courts, basketball courts, volleyball courts
- Consider court condition, accessibility, and rental potential
- Sports courts can be rented hourly through platforms like Swimply

CRITICAL CONSTRAINTS FOR ${buildingTypeInfo.type.toUpperCase()}:
${buildingTypeInfo.type === 'apartment' ? `
- NO rooftop access = $0 solar revenue
- NO parking control = $0 parking revenue  
- NO pool access = $0 pool revenue
- NO garden access = $0 garden revenue
- ONLY unit-level opportunities: storage ($5-15/month), internet ($25-50/month)
` : ''}

Return a JSON analysis with realistic revenue based on actual property access rights:

{
  "propertyType": "${buildingTypeInfo.type}",
  "buildingTypeRestrictions": {
    "hasRooftopAccess": ${buildingTypeInfo.hasRooftopAccess},
    "hasGardenAccess": ${buildingTypeInfo.hasGardenAccess},
    "hasParkingControl": ${buildingTypeInfo.hasParkingControl},
    "restrictionExplanation": "explanation"
  },
  "marketAnalysis": {
    "locationScore": 1-10,
    "competitionLevel": "Low/Medium/High",
    "regulatoryRisk": "Low/Medium/High"
  },
  "rooftop": {
    "area": number,
    "solarCapacity": number,
    "solarPotential": boolean,
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackYears": number,
    "confidenceScore": 0-1,
    "usingRealSolarData": false,
    "restrictionReason": "reason if restricted"
  },
  "parking": {
    "spaces": number,
    "monthlyRevenuePerSpace": number,
    "totalMonthlyRevenue": number,
    "evChargerPotential": boolean,
    "locationPremium": number,
    "confidenceScore": 0-1,
    "restrictionReason": "reason if restricted"
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": number,
    "seasonalVariation": number,
    "setupCost": number,
    "confidenceScore": 0-1,
    "restrictionReason": "reason if restricted"
  },
  "sportsCourts": {
    "present": boolean,
    "types": ["tennis", "pickleball", "basketball"],
    "count": number,
    "monthlyRevenue": number,
    "hourlyRate": number,
    "seasonalVariation": number,
    "setupCost": number,
    "confidenceScore": 0-1,
    "restrictionReason": "reason if restricted"
  },
  "storage": {
    "available": boolean,
    "type": "garage/basement/unit_storage",
    "monthlyRevenue": number,
    "confidenceScore": 0-1,
    "restrictionReason": "reason if restricted"
  },
  "internet": {
    "monthlyRevenue": number,
    "requirements": "description",
    "confidenceScore": 0-1
  },
  "garden": {
    "area": number,
    "monthlyRevenue": number,
    "opportunity": "None/Small/Medium/Large",
    "restrictions": "local restrictions",
    "confidenceScore": 0-1,
    "restrictionReason": "reason if restricted"
  },
  "topOpportunities": [
    {
      "title": "opportunity name",
      "monthlyRevenue": number,
      "setupCost": number,
      "paybackMonths": number,
      "confidenceScore": 0-1,
      "description": "detailed description",
      "immediateSteps": ["step1", "step2"],
      "riskFactors": ["risk1", "risk2"],
      "availableForPropertyType": boolean
    }
  ],
  "totalMonthlyRevenue": number,
  "totalSetupInvestment": number,
  "overallConfidenceScore": 0-1,
  "keyRecommendations": ["rec1", "rec2"],
  "marketWarnings": ["warning1", "warning2"],
  "buildingTypeWarnings": ["restriction warnings based on building type"]
}`;
}

function generateBuildingTypeAwareOpportunities(
  results: AnalysisResults,
  buildingTypeInfo: any,
  analysisData: any
) {
  const opportunities = [];

  // For apartments, focus only on available opportunities and ensure both are included
  if (buildingTypeInfo.type === 'apartment') {
    console.log('🏢 Generating apartment-specific opportunities');
    console.log('🏢 Results data:', { bandwidth: results.bandwidth, storage: results.storage });
    console.log('🏢 Analysis data:', { internet: analysisData.internet, storage: analysisData.storage });
    
    // Internet bandwidth sharing - always available for apartments
    if (results.bandwidth.revenue > 0) {
      console.log('🏢 Adding Internet opportunity:', results.bandwidth.revenue);
      opportunities.push({
        title: 'Internet Bandwidth Sharing',
        icon: 'wifi',
        monthlyRevenue: results.bandwidth.revenue,
        description: `Share unused internet bandwidth for passive income. Available for apartment residents.`,
        setupCost: 0,
        roi: 0
      });
    }

    // Personal storage rental - available for apartments
    if (results.storage.revenue > 0) {
      console.log('🏢 Adding Storage opportunity from results:', results.storage.revenue);
      opportunities.push({
        title: 'Personal Storage Rental',
        icon: 'storage',
        monthlyRevenue: results.storage.revenue,
        description: `Rent out personal storage space within your unit to neighbors or visitors.`,
        setupCost: 0,
        roi: 0
      });
    }

    // Fallback: check analysisData if results don't have it
    if (analysisData.internet?.monthlyRevenue > 0) {
      const hasInternet = opportunities.some(opp => opp.title.includes('Internet'));
      if (!hasInternet) {
        console.log('🏢 Adding Internet opportunity from analysisData:', analysisData.internet.monthlyRevenue);
        opportunities.push({
          title: 'Internet Bandwidth Sharing',
          icon: 'wifi',
          monthlyRevenue: analysisData.internet.monthlyRevenue,
          description: 'Share unused internet bandwidth for passive income',
          setupCost: 0,
          roi: 0
        });
      }
    }
    
    if (analysisData.storage?.monthlyRevenue > 0) {
      const hasStorage = opportunities.some(opp => opp.title.includes('Storage'));
      if (!hasStorage) {
        console.log('🏢 Adding Storage opportunity from analysisData:', analysisData.storage.monthlyRevenue);
        opportunities.push({
          title: 'Unit Storage Rental',
          icon: 'storage',
          monthlyRevenue: analysisData.storage.monthlyRevenue,
          description: 'Rent out available storage space within the unit',
          setupCost: 0,
          roi: 0
        });
      }
    }

    console.log('🏢 Final apartment opportunities:', opportunities);
  } else {
    // For single family homes, include all applicable opportunities
    if (results.rooftop.revenue > 0 && buildingTypeInfo.hasRooftopAccess) {
      opportunities.push({
        title: 'Rooftop Solar Installation',
        icon: 'sun',
        monthlyRevenue: results.rooftop.revenue,
        description: `Install solar panels on your ${results.rooftop.area} sq ft roof to generate clean energy and income.`,
        setupCost: results.rooftop.setupCost || 15000,
        roi: Math.ceil((results.rooftop.setupCost || 15000) / Math.max(results.rooftop.revenue, 1))
      });
    }

    if (results.parking.revenue > 0 && buildingTypeInfo.hasParkingControl) {
      opportunities.push({
        title: 'Parking Space Rental',
        icon: 'car',
        monthlyRevenue: results.parking.revenue,
        description: `Rent out ${results.parking.spaces} parking spaces to neighbors, commuters, or event attendees.`,
        setupCost: 200,
        roi: Math.ceil(200 / Math.max(results.parking.revenue, 1))
      });
    }

    if (results.pool.revenue > 0) {
      opportunities.push({
        title: 'Pool Rental',
        icon: 'waves',
        monthlyRevenue: results.pool.revenue,
        description: `Rent your ${results.pool.type} pool by the hour through platforms like Swimply.`,
        setupCost: 300,
        roi: Math.ceil(300 / Math.max(results.pool.revenue, 1))
      });
    }

    if (results.sportsCourts.revenue > 0) {
      const courtTypes = results.sportsCourts.types.join(', ');
      opportunities.push({
        title: 'Sports Courts Rental',
        icon: 'activity',
        monthlyRevenue: results.sportsCourts.revenue,
        description: `Rent your ${courtTypes} court${results.sportsCourts.count > 1 ? 's' : ''} by the hour through platforms like Swimply.`,
        setupCost: 200,
        roi: Math.ceil(200 / Math.max(results.sportsCourts.revenue, 1))
      });
    }

    if (results.garden.revenue > 0 && buildingTypeInfo.hasGardenAccess) {
      opportunities.push({
        title: 'Garden Space Rental',
        icon: 'leaf',
        monthlyRevenue: results.garden.revenue,
        description: `${results.garden.opportunity} garden opportunities on ${results.garden.area} sq ft of space.`,
        setupCost: 150,
        roi: Math.ceil(150 / Math.max(results.garden.revenue, 1))
      });
    }

    if (results.storage.revenue > 0) {
      opportunities.push({
        title: 'Storage Space Rental',
        icon: 'storage',
        monthlyRevenue: results.storage.revenue,
        description: `Rent out garage, basement, or storage space to people needing extra storage.`,
        setupCost: 100,
        roi: Math.ceil(100 / Math.max(results.storage.revenue, 1))
      });
    }

    if (results.bandwidth.revenue > 0) {
      opportunities.push({
        title: 'Internet Bandwidth Sharing',
        icon: 'wifi',
        monthlyRevenue: results.bandwidth.revenue,
        description: `Share ${results.bandwidth.available} GB of unused internet bandwidth for passive income.`,
        setupCost: 0,
        roi: 0
      });
    }
  }

  // Sort by monthly revenue and return top opportunities
  return opportunities
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5);
}

function extractAmenities(analysisData: any): string[] {
  const amenities = [];
  
  if (analysisData.rooftop?.solarPotential) amenities.push('Solar Ready Roof');
  if (analysisData.parking?.evChargerPotential) amenities.push('EV Charging Potential');
  if (analysisData.pool?.present) amenities.push('Swimming Pool');
  if (analysisData.garden?.area > 0) amenities.push('Garden Space');
  if (analysisData.storage?.available) amenities.push('Storage Space');
  if (analysisData.internet?.monthlyRevenue > 0) amenities.push('High-Speed Internet');
  
  return amenities;
}

function generateFallbackAnalysis(
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis,
  comprehensiveClassification: any
): AnalysisResults {
  console.log('🔄 Generating fallback analysis due to OpenAI issues');
  
  const isApartment = comprehensiveClassification.primaryType === 'residential' && 
                     !comprehensiveClassification.accessRights?.hasIndividualControl;
  
  // Generate basic fallback data based on property type
  const fallbackData = {
    propertyType: comprehensiveClassification.primaryType || 'residential',
    rooftop: {
      area: imageAnalysis.roofSize || 1000,
      solarCapacity: isApartment ? 0 : (imageAnalysis.roofSize || 1000) * 0.15,
      solarPotential: !isApartment,
      monthlyRevenue: isApartment ? 0 : Math.round((imageAnalysis.roofSize || 1000) * 0.1),
      setupCost: isApartment ? 0 : 15000
    },
    parking: {
      spaces: imageAnalysis.parkingSpaces || (isApartment ? 0 : 2),
      monthlyRevenuePerSpace: isApartment ? 0 : 100,
      totalMonthlyRevenue: isApartment ? 0 : (imageAnalysis.parkingSpaces || 2) * 100,
      evChargerPotential: !isApartment
    },
    pool: {
      present: imageAnalysis.hasPool || false,
      monthlyRevenue: isApartment ? 0 : (imageAnalysis.hasPool ? 150 : 0)
    },
    storage: {
      available: true,
      monthlyRevenue: isApartment ? 15 : 50
    },
    internet: {
      monthlyRevenue: 35
    },
    garden: {
      area: imageAnalysis.gardenArea || (isApartment ? 0 : 500),
      monthlyRevenue: isApartment ? 0 : 30
    }
  };

  const totalRevenue = (fallbackData.rooftop.monthlyRevenue || 0) +
                      (fallbackData.parking.totalMonthlyRevenue || 0) +
                      (fallbackData.pool.monthlyRevenue || 0) +
                      (fallbackData.storage.monthlyRevenue || 0) +
                      (fallbackData.internet.monthlyRevenue || 0) +
                      (fallbackData.garden.monthlyRevenue || 0);

  const results: AnalysisResults = {
    propertyType: fallbackData.propertyType,
    amenities: extractAmenities(fallbackData),
    rooftop: {
      area: fallbackData.rooftop.area,
      type: 'standard',
      solarCapacity: fallbackData.rooftop.solarCapacity,
      solarPotential: fallbackData.rooftop.solarPotential,
      revenue: fallbackData.rooftop.monthlyRevenue,
      setupCost: fallbackData.rooftop.setupCost,
      usingRealSolarData: false
    },
    garden: {
      area: fallbackData.garden.area,
      opportunity: fallbackData.garden.monthlyRevenue > 0 ? 'Small' : 'None',
      revenue: fallbackData.garden.monthlyRevenue
    },
    parking: {
      spaces: fallbackData.parking.spaces,
      rate: fallbackData.parking.monthlyRevenuePerSpace,
      revenue: fallbackData.parking.totalMonthlyRevenue,
      evChargerPotential: fallbackData.parking.evChargerPotential
    },
    pool: {
      present: fallbackData.pool.present,
      area: fallbackData.pool.present ? 300 : 0,
      type: fallbackData.pool.present ? 'standard' : 'none',
      revenue: fallbackData.pool.monthlyRevenue
    },
    sportsCourts: {
      present: false,
      types: [],
      count: 0,
      revenue: 0
    },
    storage: {
      volume: 100,
      revenue: fallbackData.storage.monthlyRevenue
    },
    bandwidth: {
      available: 100,
      revenue: fallbackData.internet.monthlyRevenue
    },
    shortTermRental: {
      nightlyRate: 0,
      monthlyProjection: 0
    },
    permits: [],
    restrictions: comprehensiveClassification.restrictions,
    topOpportunities: generateFallbackOpportunities(fallbackData, isApartment),
    imageAnalysisSummary: imageAnalysis.summary || 'Fallback analysis due to API issues',
    totalMonthlyRevenue: totalRevenue
  };

  return results;
}

function generateFallbackOpportunities(fallbackData: any, isApartment: boolean) {
  const opportunities = [];

  if (!isApartment && fallbackData.rooftop.monthlyRevenue > 0) {
    opportunities.push({
      title: 'Rooftop Solar Installation',
      icon: 'sun',
      monthlyRevenue: fallbackData.rooftop.monthlyRevenue,
      description: 'Install solar panels for clean energy and savings',
      setupCost: fallbackData.rooftop.setupCost,
      roi: Math.ceil(fallbackData.rooftop.setupCost / fallbackData.rooftop.monthlyRevenue)
    });
  }

  if (!isApartment && fallbackData.parking.totalMonthlyRevenue > 0) {
    opportunities.push({
      title: 'Parking Space Rental',
      icon: 'car',
      monthlyRevenue: fallbackData.parking.totalMonthlyRevenue,
      description: 'Rent parking spaces to neighbors and commuters',
      setupCost: 200,
      roi: 2
    });
  }

  if (fallbackData.internet.monthlyRevenue > 0) {
    opportunities.push({
      title: 'Internet Bandwidth Sharing',
      icon: 'wifi',
      monthlyRevenue: fallbackData.internet.monthlyRevenue,
      description: isApartment ? 'Share unused internet bandwidth (apartment-friendly)' : 'Share unused internet bandwidth for passive income',
      setupCost: 0,
      roi: 0
    });
  }

  if (fallbackData.storage.monthlyRevenue > 0) {
    opportunities.push({
      title: isApartment ? 'Unit Storage Rental' : 'Storage Space Rental',
      icon: 'storage',
      monthlyRevenue: fallbackData.storage.monthlyRevenue,
      description: isApartment ? 'Rent personal storage space within your unit' : 'Rent storage space in garage or outbuildings',
      setupCost: 0,
      roi: 0
    });
  }

  return opportunities.slice(0, 5); // Return top 5
}
