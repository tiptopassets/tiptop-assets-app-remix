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

  // Detect building type and access rights
  const buildingTypeInfo = await detectBuildingTypeAndRestrictions(propertyInfo, imageAnalysis, openaiApiKey);
  console.log('🏢 Detected building type:', buildingTypeInfo);

  // Generate analysis with building-type-aware logic
  const analysisPrompt = createEnhancedAnalysisPrompt(propertyInfo, imageAnalysis, buildingTypeInfo);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a property monetization expert. Analyze properties and provide realistic revenue opportunities based on building type and access rights.
          
          CRITICAL BUILDING TYPE RULES:
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
          
          Always return valid JSON with realistic opportunities based on actual property access rights.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawResponse = data.choices[0].message.content;
  console.log('Raw GPT response:', rawResponse);

  // Parse the JSON response
  const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) || rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from OpenAI response');
  }

  let analysisData;
  try {
    analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (error) {
    console.error('JSON parsing error:', error);
    throw new Error('Invalid JSON in OpenAI response');
  }

  // Convert to our AnalysisResults format with enhanced apartment handling
  const results: AnalysisResults = {
    propertyType: analysisData.propertyType || buildingTypeInfo.type,
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
    restrictions: buildingTypeInfo.restrictions,
    topOpportunities: [],
    imageAnalysisSummary: imageAnalysis.summary || '',
    // Extract totalMonthlyRevenue from GPT response
    totalMonthlyRevenue: analysisData.totalMonthlyRevenue || 0
  };

  // Generate top opportunities based on building type and actual revenue potential - IMPROVED LOGIC
  results.topOpportunities = generateBuildingTypeAwareOpportunities(results, buildingTypeInfo, analysisData);

  console.log('Enhanced property analysis completed successfully');
  return results;
};

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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300
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
