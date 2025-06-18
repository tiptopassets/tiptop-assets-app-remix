
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const generatePropertyAnalysis = async (propertyInfo: any, imageAnalysis: any) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Generating enhanced property analysis with OpenAI...');
    
    const prompt = `
PROPERTY MONETIZATION ANALYSIS - EXPERT LEVEL WITH BUILDING TYPE RESTRICTIONS
You are a certified property investment analyst with 15+ years experience in residential monetization strategies.

PROPERTY PROFILE:
Address: ${propertyInfo.address}
Coordinates: ${propertyInfo.coordinates ? `${propertyInfo.coordinates.lat}, ${propertyInfo.coordinates.lng}` : 'Location data unavailable'}
Property Type: ${propertyInfo.propertyType || 'Residential'}
Market Data: ${propertyInfo.solarData ? 'Real solar data available' : 'Using market estimates'}

${imageAnalysis?.analysis ? `SATELLITE ANALYSIS INSIGHTS:\n${imageAnalysis.analysis}` : ''}
${propertyInfo.solarData ? `VERIFIED SOLAR DATA:\n${JSON.stringify(propertyInfo.solarData)}` : ''}

CRITICAL BUILDING TYPE RESTRICTIONS:
1. APARTMENT BUILDINGS/CONDOS/MULTI-UNIT PROPERTIES:
   - NO rooftop access (roof belongs to HOA/building management)
   - NO solar panel installation rights
   - NO shared garden/outdoor space rental rights
   - NO parking space rental (building-managed)
   - ONLY available: Internet bandwidth, storage (if personal unit storage)

2. SINGLE FAMILY HOMES:
   - Full access to all monetization opportunities
   - Owner controls roof, garden, parking, storage

3. TOWNHOUSES/DUPLEXES:
   - LIMITED rooftop access (check HOA restrictions)
   - LIMITED garden access (may be shared/restricted)
   - PARKING may be available if private driveway

4. COMMERCIAL BUILDINGS:
   - DIFFERENT analysis entirely - higher solar potential
   - Commercial parking rates apply
   - Storage opportunities vary

BUILDING TYPE DETECTION RULES:
- If address contains "Apt", "Unit", "Suite", "#" = APARTMENT (NO roof/garden access)
- If property type mentions "Condo", "Apartment", "Multi" = NO individual access
- If building appears multi-story in satellite = ASSUME apartment building
- When in doubt about building type = ASSUME RESTRICTED ACCESS

ANALYSIS REQUIREMENTS:

1. ROOFTOP MONETIZATION (RESTRICTED FOR APARTMENTS/CONDOS)
   - IF apartment/condo/multi-unit: SET rooftop revenue = $0, explain restriction
   - IF single family home: Base monthly revenue: $75-250
   - Solar capacity: Only if property owner has roof access
   - Setup costs: Include HOA approval costs if applicable
   - Payback period: 6-12 years typical for single family homes only

2. PARKING MONETIZATION (RESTRICTED FOR APARTMENTS)
   - IF apartment/condo: Parking usually building-managed, revenue = $0
   - IF single family home with driveway: $50-300/month per space
   - Geographic pricing adjustments apply
   - EV charging: Only if private parking available

3. POOL RENTAL (VERY RESTRICTED FOR APARTMENTS)
   - IF apartment/condo: Pool is shared amenity, NOT rentable, revenue = $0
   - IF single family home: Swimply rates apply
   - Setup requirements: Insurance, cleaning, safety equipment

4. STORAGE SPACE (LIMITED FOR APARTMENTS)
   - IF apartment: Only personal unit storage/closets, limited revenue
   - IF single family: Full garage/basement/attic access
   - Market rates vary by property type and access

5. INTERNET BANDWIDTH (AVAILABLE FOR ALL)
   - $20-50/month passive income regardless of building type
   - Requires stable high-speed connection
   - No setup costs, immediate revenue potential

6. GARDEN/OUTDOOR SPACE (HEAVILY RESTRICTED FOR APARTMENTS)
   - IF apartment/condo: NO access to shared spaces, revenue = $0
   - IF single family: Community garden plots, event hosting available
   - Zoning and HOA restrictions apply

PROPERTY TYPE VALIDATION:
- Cross-reference address format against building type indicators
- Apply conservative assumptions for ambiguous cases
- When satellite shows multi-story structure = treat as apartment building
- Single-story detached = likely single family home with full access

OUTPUT FORMAT (JSON ONLY):
{
  "propertyType": "Single Family Home|Apartment|Condo|Townhouse",
  "buildingTypeRestrictions": {
    "hasRooftopAccess": boolean,
    "hasGardenAccess": boolean,
    "hasParkingControl": boolean,
    "restrictionExplanation": "Detailed explanation of why certain opportunities are restricted"
  },
  "marketAnalysis": {
    "locationScore": 1-10,
    "competitionLevel": "Low|Medium|High",
    "regulatoryRisk": "Low|Medium|High"
  },
  "rooftop": {
    "area": number,
    "solarCapacity": number,
    "solarPotential": boolean,
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackYears": number,
    "confidenceScore": 0.1-1.0,
    "usingRealSolarData": boolean,
    "restrictionReason": "string or null"
  },
  "parking": {
    "spaces": number,
    "monthlyRevenuePerSpace": number,
    "totalMonthlyRevenue": number,
    "evChargerPotential": boolean,
    "locationPremium": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": "string or null"
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": number,
    "seasonalVariation": number,
    "setupCost": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": "string or null"
  },
  "storage": {
    "available": boolean,
    "type": "garage|basement|attic|shed|unit_storage",
    "monthlyRevenue": number,
    "confidenceScore": 0.1-1.0,
    "restrictionReason": "string or null"
  },
  "internet": {
    "monthlyRevenue": number,
    "requirements": "High-speed internet connection",
    "confidenceScore": 0.9
  },
  "garden": {
    "area": number,
    "monthlyRevenue": number,
    "opportunity": "High|Medium|Low|None",
    "restrictions": "Check local zoning",
    "confidenceScore": 0.1-1.0,
    "restrictionReason": "string or null"
  },
  "topOpportunities": [
    {
      "title": string,
      "monthlyRevenue": number,
      "setupCost": number,
      "paybackMonths": number,
      "confidenceScore": 0.1-1.0,
      "description": string,
      "immediateSteps": [string],
      "riskFactors": [string],
      "availableForPropertyType": boolean
    }
  ],
  "totalMonthlyRevenue": number,
  "totalSetupInvestment": number,
  "overallConfidenceScore": 0.1-1.0,
  "keyRecommendations": [string],
  "marketWarnings": [string],
  "buildingTypeWarnings": [string]
}

CRITICAL REQUIREMENTS:
1. ALWAYS check building type before assigning revenue opportunities
2. SET revenue to $0 for restricted opportunities with clear explanation
3. PRIORITIZE available opportunities based on building type
4. EXPLAIN restrictions in user-friendly language
5. FOCUS on realistic opportunities for the specific property type
6. INCLUDE building type warnings in recommendations
7. VALIDATE all revenue estimates against property type restrictions

Generate a building-type-aware analysis that respects property ownership and access limitations.
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
            content: 'You are an expert property monetization analyst with deep knowledge of building type restrictions and property access rights. Always consider building type when analyzing monetization opportunities. Always return valid JSON that matches the required schema exactly.'
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
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse enhanced analysis JSON:', parseError);
      // Enhanced fallback analysis with building type restrictions
      const isApartment = propertyInfo.propertyType?.toLowerCase().includes('apartment') || 
                         propertyInfo.propertyType?.toLowerCase().includes('condo') ||
                         propertyInfo.address?.includes('Apt') ||
                         propertyInfo.address?.includes('Unit') ||
                         propertyInfo.address?.includes('#');
      
      analysis = {
        propertyType: propertyInfo.propertyType || (isApartment ? 'Apartment' : 'Single Family Home'),
        buildingTypeRestrictions: {
          hasRooftopAccess: !isApartment,
          hasGardenAccess: !isApartment,
          hasParkingControl: !isApartment,
          restrictionExplanation: isApartment ? 
            'Apartment/condo buildings typically restrict access to rooftops, shared gardens, and parking management to building owners/HOA.' :
            'Single family home has full access to all property monetization opportunities.'
        },
        marketAnalysis: {
          locationScore: 7,
          competitionLevel: 'Medium',
          regulatoryRisk: 'Low'
        },
        rooftop: { 
          area: isApartment ? 0 : 1200, 
          solarCapacity: isApartment ? 0 : 8, 
          solarPotential: !isApartment, 
          monthlyRevenue: isApartment ? 0 : 125, 
          setupCost: isApartment ? 0 : 20000,
          paybackYears: isApartment ? 0 : 8,
          confidenceScore: 0.9,
          usingRealSolarData: false,
          restrictionReason: isApartment ? 'No rooftop access in apartment/condo buildings' : null
        },
        parking: { 
          spaces: isApartment ? 0 : 2, 
          monthlyRevenuePerSpace: isApartment ? 0 : 85, 
          totalMonthlyRevenue: isApartment ? 0 : 170, 
          evChargerPotential: !isApartment,
          locationPremium: 0,
          confidenceScore: 0.8,
          restrictionReason: isApartment ? 'Parking typically managed by building/HOA' : null
        },
        pool: { 
          present: false, 
          monthlyRevenue: 0,
          seasonalVariation: 0,
          setupCost: 0,
          confidenceScore: 0.9,
          restrictionReason: isApartment ? 'Shared pool amenities cannot be rented individually' : null
        },
        storage: { 
          available: true, 
          type: isApartment ? 'unit_storage' : 'garage',
          monthlyRevenue: isApartment ? 25 : 75,
          confidenceScore: 0.7,
          restrictionReason: isApartment ? 'Limited to personal unit storage space only' : null
        },
        internet: { 
          monthlyRevenue: 35,
          requirements: 'High-speed internet connection',
          confidenceScore: 0.9
        },
        garden: { 
          area: isApartment ? 0 : 800, 
          monthlyRevenue: isApartment ? 0 : 60, 
          opportunity: isApartment ? 'None' : 'Medium',
          restrictions: 'Check local zoning',
          confidenceScore: 0.6,
          restrictionReason: isApartment ? 'No access to shared garden/outdoor spaces' : null
        },
        topOpportunities: isApartment ? [
          { 
            title: 'Internet Bandwidth Sharing', 
            monthlyRevenue: 35, 
            setupCost: 0, 
            paybackMonths: 0,
            confidenceScore: 0.9,
            description: 'Share unused internet bandwidth passively',
            immediateSteps: ['Sign up for Honeygain or similar services'],
            riskFactors: ['Requires stable high-speed internet'],
            availableForPropertyType: true
          }
        ] : [
          { 
            title: 'Parking Space Rental', 
            monthlyRevenue: 170, 
            setupCost: 50, 
            paybackMonths: 1,
            confidenceScore: 0.8,
            description: 'Rent 2 parking spaces to local commuters',
            immediateSteps: ['Post on SpotHero', 'Install basic lighting'],
            riskFactors: ['Local parking regulations', 'Seasonal demand variation'],
            availableForPropertyType: true
          },
          { 
            title: 'Solar Panel Installation', 
            monthlyRevenue: 125, 
            setupCost: 20000, 
            paybackMonths: 96,
            confidenceScore: 0.7,
            description: 'Install 8kW solar system for energy savings and potential income',
            immediateSteps: ['Get solar quotes', 'Check local incentives'],
            riskFactors: ['Weather dependency', 'Initial investment required'],
            availableForPropertyType: true
          }
        ],
        totalMonthlyRevenue: isApartment ? 35 : 465,
        totalSetupInvestment: isApartment ? 0 : 20050,
        overallConfidenceScore: 0.75,
        keyRecommendations: isApartment ? [
          'Focus on internet bandwidth sharing as primary opportunity',
          'Check for any unit-specific storage rental possibilities',
          'Explore personal item storage within your unit'
        ] : [
          'Start with parking rental for immediate income',
          'Research local solar incentives before installation',
          'Consider storage rental as low-risk additional income'
        ],
        marketWarnings: [
          'Verify local zoning regulations for all activities',
          isApartment ? 'Building management may restrict certain activities' : 'Solar payback period requires long-term commitment'
        ],
        buildingTypeWarnings: isApartment ? [
          'Apartment/condo buildings have significant restrictions on monetization opportunities',
          'Most outdoor and structural opportunities are not available',
          'Focus on interior and internet-based income streams'
        ] : [
          'Single family homes have full access to all monetization opportunities',
          'Verify any HOA restrictions before proceeding'
        ]
      };
    }
    
    return analysis;
  } catch (error) {
    console.error('Error in enhanced property analysis:', error);
    throw error;
  }
};
