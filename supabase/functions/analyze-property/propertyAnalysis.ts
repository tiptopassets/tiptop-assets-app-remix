
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Building type detection helper
const detectBuildingType = (propertyInfo: any, imageAnalysis: any) => {
  const address = propertyInfo.address?.toLowerCase() || '';
  const propertyType = propertyInfo.propertyType?.toLowerCase() || '';
  const imageAnalysisText = imageAnalysis?.analysis?.toLowerCase() || '';
  
  // Check for apartment/condo indicators in address
  const apartmentIndicators = ['apt', 'apartment', 'unit', 'suite', '#', 'condo', 'condominium'];
  const hasApartmentKeywords = apartmentIndicators.some(indicator => 
    address.includes(indicator) || propertyType.includes(indicator)
  );
  
  // Check for multi-story building indicators in image analysis
  const multiStoryIndicators = ['multi-story', 'multiple floors', 'apartment building', 'high-rise', 'complex'];
  const hasMultiStoryIndicators = multiStoryIndicators.some(indicator => 
    imageAnalysisText.includes(indicator)
  );
  
  // Determine building type
  if (hasApartmentKeywords || hasMultiStoryIndicators) {
    return {
      type: 'apartment',
      hasRooftopAccess: false,
      hasGardenAccess: false,
      hasParkingControl: false,
      restrictions: 'Multi-unit building - no individual access to roof, shared spaces, or building parking'
    };
  }
  
  // Check for townhouse/duplex indicators
  const townhouseIndicators = ['townhouse', 'townhome', 'duplex', 'row house'];
  const hasTownhouseKeywords = townhouseIndicators.some(indicator => 
    address.includes(indicator) || propertyType.includes(indicator)
  );
  
  if (hasTownhouseKeywords) {
    return {
      type: 'townhouse',
      hasRooftopAccess: false, // Usually HOA controlled
      hasGardenAccess: false,  // Usually shared/restricted
      hasParkingControl: true, // Usually have private driveways
      restrictions: 'Townhouse - limited roof/garden access due to HOA restrictions'
    };
  }
  
  // Default to single family home
  return {
    type: 'single_family',
    hasRooftopAccess: true,
    hasGardenAccess: true,
    hasParkingControl: true,
    restrictions: null
  };
};

// Normalize topOpportunities to ensure consistent object structure
const normalizeTopOpportunities = (opportunities: any[]): any[] => {
  if (!Array.isArray(opportunities)) {
    console.log('topOpportunities is not an array, returning empty array');
    return [];
  }

  return opportunities.map((opp, index) => {
    // If it's already an object with title, return as-is
    if (typeof opp === 'object' && opp !== null && opp.title) {
      return opp;
    }
    
    // If it's a string, convert to object format
    if (typeof opp === 'string') {
      console.log(`Converting string opportunity "${opp}" to object format`);
      return {
        title: opp,
        monthlyRevenue: 0,
        setupCost: 0,
        paybackMonths: 0,
        confidenceScore: 0.5,
        description: opp,
        immediateSteps: [],
        riskFactors: [],
        availableForPropertyType: true
      };
    }
    
    // If it's something else, create a generic object
    console.log(`Converting unknown opportunity type at index ${index} to object format`);
    return {
      title: `Opportunity ${index + 1}`,
      monthlyRevenue: 0,
      setupCost: 0,
      paybackMonths: 0,
      confidenceScore: 0.5,
      description: 'Unknown opportunity type',
      immediateSteps: [],
      riskFactors: [],
      availableForPropertyType: true
    };
  });
};

// Apply building restrictions to analysis
const applyBuildingRestrictions = (analysis: any, buildingInfo: any) => {
  const restrictedAnalysis = { ...analysis };
  
  if (!buildingInfo.hasRooftopAccess) {
    restrictedAnalysis.rooftop = {
      ...restrictedAnalysis.rooftop,
      area: 0,
      solarCapacity: 0,
      solarPotential: false,
      monthlyRevenue: 0,
      setupCost: 0,
      paybackYears: 0,
      restrictionReason: `No individual rooftop access in ${buildingInfo.type} buildings`
    };
  }
  
  if (!buildingInfo.hasGardenAccess) {
    restrictedAnalysis.garden = {
      ...restrictedAnalysis.garden,
      area: 0,
      monthlyRevenue: 0,
      opportunity: 'None',
      restrictionReason: `No individual garden access in ${buildingInfo.type} buildings - shared spaces cannot be rented`
    };
  }
  
  if (!buildingInfo.hasParkingControl) {
    restrictedAnalysis.parking = {
      ...restrictedAnalysis.parking,
      spaces: 0,
      monthlyRevenuePerSpace: 0,
      totalMonthlyRevenue: 0,
      evChargerPotential: false,
      restrictionReason: `Parking is building-managed in ${buildingInfo.type} buildings - no individual rental rights`
    };
  }
  
  // Always restrict pool for apartments/condos (shared amenity)
  if (buildingInfo.type === 'apartment') {
    restrictedAnalysis.pool = {
      ...restrictedAnalysis.pool,
      present: false,
      monthlyRevenue: 0,
      restrictionReason: 'Shared pool amenities in apartment buildings cannot be individually rented'
    };
  }
  
  // Recalculate total revenue after restrictions
  restrictedAnalysis.totalMonthlyRevenue = 
    (restrictedAnalysis.rooftop?.monthlyRevenue || 0) +
    (restrictedAnalysis.parking?.totalMonthlyRevenue || 0) +
    (restrictedAnalysis.pool?.monthlyRevenue || 0) +
    (restrictedAnalysis.storage?.monthlyRevenue || 0) +
    (restrictedAnalysis.internet?.monthlyRevenue || 0) +
    (restrictedAnalysis.garden?.monthlyRevenue || 0);
  
  // Normalize and filter top opportunities to ensure consistent structure
  const normalizedOpportunities = normalizeTopOpportunities(restrictedAnalysis.topOpportunities || []);
  restrictedAnalysis.topOpportunities = normalizedOpportunities.filter(opp => {
    // Ensure opp has a title property before calling toLowerCase
    const title = opp.title || '';
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('solar') && !buildingInfo.hasRooftopAccess) return false;
    if (titleLower.includes('parking') && !buildingInfo.hasParkingControl) return false;
    if (titleLower.includes('garden') && !buildingInfo.hasGardenAccess) return false;
    if (titleLower.includes('pool') && buildingInfo.type === 'apartment') return false;
    return true;
  });
  
  // Add building type warnings
  restrictedAnalysis.buildingTypeWarnings = restrictedAnalysis.buildingTypeWarnings || [];
  if (buildingInfo.restrictions) {
    restrictedAnalysis.buildingTypeWarnings.push(buildingInfo.restrictions);
  }
  
  return restrictedAnalysis;
};

export const generatePropertyAnalysis = async (propertyInfo: any, imageAnalysis: any) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Generating enhanced property analysis with building type restrictions...');
    
    // Detect building type BEFORE sending to GPT
    const buildingInfo = detectBuildingType(propertyInfo, imageAnalysis);
    console.log('Detected building type:', buildingInfo);
    
    const prompt = `
PROPERTY MONETIZATION ANALYSIS - EXPERT LEVEL WITH BUILDING TYPE RESTRICTIONS
You are a certified property investment analyst with 15+ years experience in residential monetization strategies.

CRITICAL BUILDING TYPE DETECTED: ${buildingInfo.type.toUpperCase()}
ROOFTOP ACCESS: ${buildingInfo.hasRooftopAccess ? 'AVAILABLE' : 'RESTRICTED'}
GARDEN ACCESS: ${buildingInfo.hasGardenAccess ? 'AVAILABLE' : 'RESTRICTED'}  
PARKING CONTROL: ${buildingInfo.hasParkingControl ? 'AVAILABLE' : 'RESTRICTED'}

PROPERTY PROFILE:
Address: ${propertyInfo.address}
Coordinates: ${propertyInfo.coordinates ? `${propertyInfo.coordinates.lat}, ${propertyInfo.coordinates.lng}` : 'Location data unavailable'}
Building Type: ${buildingInfo.type}
Restrictions: ${buildingInfo.restrictions || 'None - full access to all monetization opportunities'}

${imageAnalysis?.analysis ? `SATELLITE ANALYSIS INSIGHTS:\n${imageAnalysis.analysis}` : ''}
${propertyInfo.solarData ? `VERIFIED SOLAR DATA:\n${JSON.stringify(propertyInfo.solarData)}` : ''}

MANDATORY BUILDING RESTRICTIONS TO APPLY:

1. ${buildingInfo.type.toUpperCase()} BUILDING TYPE:
${!buildingInfo.hasRooftopAccess ? '   ❌ NO ROOFTOP ACCESS - Set all solar/roof revenue to $0' : '   ✅ ROOFTOP ACCESS AVAILABLE'}
${!buildingInfo.hasGardenAccess ? '   ❌ NO GARDEN ACCESS - Set all garden revenue to $0' : '   ✅ GARDEN ACCESS AVAILABLE'}
${!buildingInfo.hasParkingControl ? '   ❌ NO PARKING CONTROL - Set all parking revenue to $0' : '   ✅ PARKING CONTROL AVAILABLE'}

2. REVENUE CALCULATION RULES:
- IF rooftop restricted: rooftop.monthlyRevenue = 0, rooftop.solarPotential = false
- IF garden restricted: garden.monthlyRevenue = 0, garden.opportunity = "None"  
- IF parking restricted: parking.totalMonthlyRevenue = 0, parking.spaces = 0
- IF apartment building: pool.monthlyRevenue = 0 (shared amenity)

3. OPPORTUNITY FILTERING:
- Only include opportunities that are actually available for this building type
- Remove any solar/rooftop opportunities if rooftop restricted
- Remove parking opportunities if parking restricted
- Focus on available opportunities like internet bandwidth and personal storage

CRITICAL: topOpportunities MUST be an array of objects with this exact structure:
[
  {
    "title": "String description of opportunity",
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackMonths": number,
    "confidenceScore": 0.1-1.0,
    "description": "Detailed description",
    "immediateSteps": ["Step 1", "Step 2"],
    "riskFactors": ["Risk 1", "Risk 2"],
    "availableForPropertyType": boolean
  }
]

DO NOT return topOpportunities as an array of strings. Each item MUST be an object with the above properties.

ANALYSIS REQUIREMENTS:

1. ROOFTOP MONETIZATION 
   ${buildingInfo.hasRooftopAccess ? 
     '- Analyze rooftop potential with solar capacity and revenue estimates' :
     '- SET rooftop revenue = $0, explain restriction clearly'}

2. PARKING MONETIZATION
   ${buildingInfo.hasParkingControl ? 
     '- Analyze private parking opportunities and EV charging potential' :
     '- SET parking revenue = $0, explain building management restriction'}

3. POOL RENTAL
   ${buildingInfo.type !== 'apartment' ? 
     '- Analyze private pool rental potential if present' :
     '- SET pool revenue = $0, shared amenity cannot be individually rented'}

4. STORAGE SPACE
   ${buildingInfo.type === 'apartment' ? 
     '- Focus on personal unit storage only, limited revenue potential' :
     '- Analyze full garage/basement/attic storage opportunities'}

5. INTERNET BANDWIDTH (UNIVERSAL OPPORTUNITY)
   - Available regardless of building type, $20-50/month potential

6. GARDEN/OUTDOOR SPACE
   ${buildingInfo.hasGardenAccess ? 
     '- Analyze private garden monetization opportunities' :
     '- SET garden revenue = $0, no access to shared outdoor spaces'}

OUTPUT FORMAT (STRICT JSON WITH ENFORCED RESTRICTIONS):
{
  "propertyType": "${buildingInfo.type}",
  "buildingTypeRestrictions": {
    "hasRooftopAccess": ${buildingInfo.hasRooftopAccess},
    "hasGardenAccess": ${buildingInfo.hasGardenAccess},
    "hasParkingControl": ${buildingInfo.hasParkingControl},
    "restrictionExplanation": "${buildingInfo.restrictions || 'No restrictions - full access available'}"
  },
  "marketAnalysis": {
    "locationScore": 1-10,
    "competitionLevel": "Low|Medium|High",
    "regulatoryRisk": "Low|Medium|High"
  },
  "rooftop": {
    "area": ${buildingInfo.hasRooftopAccess ? 'number' : '0'},
    "solarCapacity": ${buildingInfo.hasRooftopAccess ? 'number' : '0'},
    "solarPotential": ${buildingInfo.hasRooftopAccess},
    "monthlyRevenue": ${buildingInfo.hasRooftopAccess ? 'number' : '0'},
    "setupCost": ${buildingInfo.hasRooftopAccess ? 'number' : '0'},
    "paybackYears": ${buildingInfo.hasRooftopAccess ? 'number' : '0'},
    "confidenceScore": 0.1-1.0,
    "usingRealSolarData": boolean,
    "restrictionReason": ${buildingInfo.hasRooftopAccess ? 'null' : '"No individual rooftop access in ' + buildingInfo.type + ' buildings"'}
  },
  "parking": {
    "spaces": ${buildingInfo.hasParkingControl ? 'number' : '0'},
    "monthlyRevenuePerSpace": ${buildingInfo.hasParkingControl ? 'number' : '0'},
    "totalMonthlyRevenue": ${buildingInfo.hasParkingControl ? 'number' : '0'},
    "evChargerPotential": ${buildingInfo.hasParkingControl},
    "locationPremium": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": ${buildingInfo.hasParkingControl ? 'null' : '"Parking managed by building/HOA - no individual rental rights"'}
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": ${buildingInfo.type === 'apartment' ? '0' : 'number'},
    "seasonalVariation": number,
    "setupCost": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": ${buildingInfo.type === 'apartment' ? '"Shared pool amenities cannot be rented individually"' : 'null'}
  },
  "storage": {
    "available": boolean,
    "type": "${buildingInfo.type === 'apartment' ? 'unit_storage' : 'garage|basement|attic'}",
    "monthlyRevenue": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": ${buildingInfo.type === 'apartment' ? '"Limited to personal unit storage space only"' : 'null'}
  },
  "internet": {
    "monthlyRevenue": number,
    "requirements": "High-speed internet connection",
    "confidenceScore": 0.9
  },
  "garden": {
    "area": ${buildingInfo.hasGardenAccess ? 'number' : '0'},
    "monthlyRevenue": ${buildingInfo.hasGardenAccess ? 'number' : '0'},
    "opportunity": "${buildingInfo.hasGardenAccess ? 'High|Medium|Low' : 'None'}",
    "restrictions": "Check local zoning",
    "confidenceScore": 0.1-1.0,
    "restrictionReason": ${buildingInfo.hasGardenAccess ? 'null' : '"No access to shared garden/outdoor spaces in ' + buildingInfo.type + ' buildings"'}
  },
  "topOpportunities": [
    // CRITICAL: Each item MUST be an object with title, monthlyRevenue, setupCost, paybackMonths, confidenceScore, description, immediateSteps, riskFactors, availableForPropertyType
    // DO NOT use strings - only objects with the required properties
    // ONLY include opportunities available for this building type
    // NO solar opportunities if rooftop restricted
    // NO parking opportunities if parking restricted  
    // NO garden opportunities if garden restricted
    // FOCUS on available opportunities like internet, storage
  ],
  "totalMonthlyRevenue": number,
  "totalSetupInvestment": number,
  "overallConfidenceScore": 0.1-1.0,
  "keyRecommendations": [string],
  "marketWarnings": [string],
  "buildingTypeWarnings": ["${buildingInfo.restrictions || 'No building type restrictions'}"]
}

CRITICAL SUCCESS FACTORS:
1. ENFORCE building type restrictions detected in pre-analysis
2. SET revenue to $0 for all restricted opportunities  
3. ONLY include available opportunities in topOpportunities array as OBJECTS (not strings)
4. EXPLAIN restrictions clearly in restrictionReason fields
5. FOCUS recommendations on realistic opportunities for this building type
6. CALCULATE total revenue only from available opportunities
7. topOpportunities MUST be objects with required properties, NOT strings

This analysis will guide real investment decisions. Building type accuracy is CRITICAL.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert property monetization analyst. You MUST enforce building type restrictions. NEVER assign revenue to restricted opportunities. Always return valid JSON with building type restrictions properly applied. topOpportunities MUST be an array of objects with title, monthlyRevenue, setupCost, paybackMonths, confidenceScore, description, immediateSteps, riskFactors, and availableForPropertyType properties - NEVER return strings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Enhanced property analysis completed successfully');
    
    let analysis;
    try {
      const responseContent = data.choices[0].message.content;
      console.log('Raw GPT response:', responseContent);
      
      // Clean up the response to extract JSON
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        
        // Ensure topOpportunities is properly structured
        analysis.topOpportunities = normalizeTopOpportunities(analysis.topOpportunities || []);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse enhanced analysis JSON:', parseError);
      
      // Enhanced fallback analysis with building type restrictions and proper object structure
      analysis = {
        propertyType: buildingInfo.type,
        buildingTypeRestrictions: {
          hasRooftopAccess: buildingInfo.hasRooftopAccess,
          hasGardenAccess: buildingInfo.hasGardenAccess,
          hasParkingControl: buildingInfo.hasParkingControl,
          restrictionExplanation: buildingInfo.restrictions || 'Building type restrictions detected'
        },
        marketAnalysis: {
          locationScore: 7,
          competitionLevel: 'Medium',
          regulatoryRisk: 'Low'
        },
        rooftop: { 
          area: buildingInfo.hasRooftopAccess ? 1200 : 0,
          solarCapacity: buildingInfo.hasRooftopAccess ? 8 : 0,
          solarPotential: buildingInfo.hasRooftopAccess,
          monthlyRevenue: buildingInfo.hasRooftopAccess ? 125 : 0,
          setupCost: buildingInfo.hasRooftopAccess ? 20000 : 0,
          paybackYears: buildingInfo.hasRooftopAccess ? 8 : 0,
          confidenceScore: 0.9,
          usingRealSolarData: false,
          restrictionReason: buildingInfo.hasRooftopAccess ? null : `No rooftop access in ${buildingInfo.type} buildings`
        },
        parking: { 
          spaces: buildingInfo.hasParkingControl ? 2 : 0,
          monthlyRevenuePerSpace: buildingInfo.hasParkingControl ? 85 : 0,
          totalMonthlyRevenue: buildingInfo.hasParkingControl ? 170 : 0,
          evChargerPotential: buildingInfo.hasParkingControl,
          locationPremium: 0,
          confidenceScore: 0.8,
          restrictionReason: buildingInfo.hasParkingControl ? null : 'Parking managed by building/HOA'
        },
        pool: { 
          present: false,
          monthlyRevenue: 0,
          seasonalVariation: 0,
          setupCost: 0,
          confidenceScore: 0.9,
          restrictionReason: buildingInfo.type === 'apartment' ? 'Shared pool amenities cannot be rented individually' : null
        },
        storage: { 
          available: true,
          type: buildingInfo.type === 'apartment' ? 'unit_storage' : 'garage',
          monthlyRevenue: buildingInfo.type === 'apartment' ? 25 : 75,
          confidenceScore: 0.7,
          restrictionReason: buildingInfo.type === 'apartment' ? 'Limited to personal unit storage space only' : null
        },
        internet: { 
          monthlyRevenue: 35,
          requirements: 'High-speed internet connection',
          confidenceScore: 0.9
        },
        garden: { 
          area: buildingInfo.hasGardenAccess ? 800 : 0,
          monthlyRevenue: buildingInfo.hasGardenAccess ? 60 : 0,
          opportunity: buildingInfo.hasGardenAccess ? 'Medium' : 'None',
          restrictions: 'Check local zoning',
          confidenceScore: 0.6,
          restrictionReason: buildingInfo.hasGardenAccess ? null : `No access to shared garden/outdoor spaces in ${buildingInfo.type} buildings`
        },
        topOpportunities: [],
        totalMonthlyRevenue: 0,
        totalSetupInvestment: 0,
        overallConfidenceScore: 0.75,
        keyRecommendations: [],
        marketWarnings: [
          'Verify local zoning regulations for all activities'
        ],
        buildingTypeWarnings: [buildingInfo.restrictions || 'Building type restrictions detected']
      };
      
      // Calculate available opportunities based on building type with proper object structure
      const availableOpportunities = [];
      
      if (buildingInfo.hasParkingControl) {
        availableOpportunities.push({ 
          title: 'Parking Space Rental', 
          monthlyRevenue: 170, 
          setupCost: 50, 
          paybackMonths: 1,
          confidenceScore: 0.8,
          description: 'Rent parking spaces to local commuters',
          immediateSteps: ['Post on SpotHero', 'Install basic lighting'],
          riskFactors: ['Local parking regulations'],
          availableForPropertyType: true
        });
      }
      
      if (buildingInfo.hasRooftopAccess) {
        availableOpportunities.push({ 
          title: 'Solar Panel Installation', 
          monthlyRevenue: 125, 
          setupCost: 20000, 
          paybackMonths: 96,
          confidenceScore: 0.7,
          description: 'Install solar system for energy savings',
          immediateSteps: ['Get solar quotes', 'Check local incentives'],
          riskFactors: ['Weather dependency', 'Initial investment required'],
          availableForPropertyType: true
        });
      }
      
      // Internet is always available
      availableOpportunities.push({ 
        title: 'Internet Bandwidth Sharing', 
        monthlyRevenue: 35, 
        setupCost: 0, 
        paybackMonths: 0,
        confidenceScore: 0.9,
        description: 'Share unused internet bandwidth passively',
        immediateSteps: ['Sign up for Honeygain or similar services'],
        riskFactors: ['Requires stable high-speed internet'],
        availableForPropertyType: true
      });
      
      analysis.topOpportunities = availableOpportunities;
      analysis.totalMonthlyRevenue = availableOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0);
      analysis.totalSetupInvestment = availableOpportunities.reduce((sum, opp) => sum + opp.setupCost, 0);
      
      // Add building-specific recommendations
      if (buildingInfo.type === 'apartment') {
        analysis.keyRecommendations = [
          'Focus on internet bandwidth sharing as primary opportunity',
          'Check for any unit-specific storage rental possibilities',
          'Explore personal item storage within your unit'
        ];
      } else {
        analysis.keyRecommendations = [
          'Start with parking rental for immediate income',
          'Research local solar incentives before installation',
          'Consider storage rental as low-risk additional income'
        ];
      }
    }
    
    // Apply additional building restrictions to ensure consistency
    const finalAnalysis = applyBuildingRestrictions(analysis, buildingInfo);
    
    return finalAnalysis;
  } catch (error) {
    console.error('Error in enhanced property analysis:', error);
    throw error;
  }
};
