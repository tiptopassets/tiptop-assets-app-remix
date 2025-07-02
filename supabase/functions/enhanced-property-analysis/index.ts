
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY')!;
const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface AnalysisRequest {
  address: string;
  userId: string;
}

// Building type detection with smart logic
const detectBuildingTypeFromAddress = (address: string) => {
  const lowerAddress = address.toLowerCase();
  
  // Strong apartment/condo indicators
  const apartmentKeywords = ['apt', 'apartment', 'unit', 'suite', '#', 'condo', 'condominium'];
  const hasApartmentKeywords = apartmentKeywords.some(keyword => lowerAddress.includes(keyword));
  
  if (hasApartmentKeywords) {
    return {
      type: 'APARTMENT',
      hasRooftopAccess: false,
      hasGardenAccess: false,
      hasParkingControl: false,
      confidenceLevel: 'HIGH',
      restrictions: [
        'No individual rooftop access (roof managed by HOA/building)',
        'No access to shared garden/outdoor spaces for rental',
        'Parking is building-managed, not individually rentable',
        'Pool amenities are shared and cannot be rented individually'
      ]
    };
  }
  
  // Townhouse indicators
  const townhouseKeywords = ['townhouse', 'townhome', 'duplex', 'row house'];
  const hasTownhouseKeywords = townhouseKeywords.some(keyword => lowerAddress.includes(keyword));
  
  if (hasTownhouseKeywords) {
    return {
      type: 'TOWNHOUSE',
      hasRooftopAccess: false, // Usually HOA controlled
      hasGardenAccess: false,  // Usually shared/restricted
      hasParkingControl: true, // Usually have private driveways
      confidenceLevel: 'HIGH',
      restrictions: [
        'Limited rooftop access due to HOA restrictions',
        'Garden access may be shared or restricted by HOA',
        'Private driveway parking usually available'
      ]
    };
  }
  
  // Default to single family home
  return {
    type: 'SINGLE_FAMILY_HOME',
    hasRooftopAccess: true,
    hasGardenAccess: true,
    hasParkingControl: true,
    confidenceLevel: 'MEDIUM',
    restrictions: []
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, userId }: AnalysisRequest = await req.json();

    console.log(`Starting premium analysis with building type detection for: ${address}`);

    // Validate API keys
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Step 1: Detect building type from address FIRST
    const buildingTypeInfo = detectBuildingTypeFromAddress(address);
    console.log('Building type detected:', buildingTypeInfo);

    // Step 2: Geocode the address
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`
    );
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      throw new Error('Failed to geocode address');
    }

    const location = geocodeData.results[0].geometry.location;
    const coordinates = { lat: location.lat, lng: location.lng };

    // Step 3: Get satellite imagery from Google Static Maps
    const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=20&size=640x640&maptype=satellite&key=${googleMapsKey}`;

    // Step 4: Get Street View imagery
    const streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${location.lat},${location.lng}&key=${googleMapsKey}`;

    // Step 5: Get Google Solar API data via unified solar-api function
    let googleSolarData = null;
    if (buildingTypeInfo.hasRooftopAccess) {
      try {
        console.log('☀️ Calling unified solar-api function...');
        const { data: solarResponse, error: solarError } = await supabase.functions.invoke('solar-api', {
          body: { 
            address: address,
            coordinates: location
          }
        });
        
        if (solarError) {
          console.log('Solar API error (expected for some buildings):', solarError);
        } else if (solarResponse?.success && solarResponse?.solarData) {
          googleSolarData = solarResponse.solarData;
          console.log('✅ Received solar data from unified API');
        }
      } catch (error) {
        console.log('Solar API not available (expected for restricted buildings):', error);
      }
    } else {
      console.log('Skipping Solar API call - no rooftop access for', buildingTypeInfo.type);
    }

    // Step 6: Building-Type-Aware Premium Analysis
    const analysisPrompt = `
You are a PREMIUM property monetization expert with deep knowledge of building type restrictions and property access rights.

CRITICAL BUILDING TYPE ANALYSIS:
- Address: ${address}
- DETECTED BUILDING TYPE: ${buildingTypeInfo.type}
- ROOFTOP ACCESS: ${buildingTypeInfo.hasRooftopAccess ? 'AVAILABLE' : 'RESTRICTED'}
- GARDEN ACCESS: ${buildingTypeInfo.hasGardenAccess ? 'AVAILABLE' : 'RESTRICTED'}
- PARKING CONTROL: ${buildingTypeInfo.hasParkingControl ? 'AVAILABLE' : 'RESTRICTED'}
- CONFIDENCE: ${buildingTypeInfo.confidenceLevel}

MANDATORY RESTRICTIONS FOR ${buildingTypeInfo.type}:
${buildingTypeInfo.restrictions.map(r => `- ${r}`).join('\n')}

PROPERTY INTELLIGENCE PROFILE:
- Coordinates: ${location.lat}, ${location.lng}
- Google Solar Data: ${googleSolarData ? 'VERIFIED REAL DATA AVAILABLE' : buildingTypeInfo.hasRooftopAccess ? 'API Error - Using Market Intelligence' : 'NOT APPLICABLE - NO ROOFTOP ACCESS'}
- Analysis Date: ${new Date().toISOString()}

${googleSolarData ? `VERIFIED SOLAR INTELLIGENCE:\n${JSON.stringify(googleSolarData, null, 2)}` : ''}

BUILDING-TYPE-SPECIFIC ANALYSIS REQUIREMENTS:

1. ROOFTOP SOLAR MONETIZATION
   ${buildingTypeInfo.hasRooftopAccess ? 
     `✅ AVAILABLE - Full analysis required
      ${googleSolarData ? 
        `- VERIFIED solar capacity: ${googleSolarData.solarPotential?.maxArrayPanelsCount || 'TBD'} panels
         - VERIFIED yearly energy: ${googleSolarData.solarPotential?.yearlyEnergyDcKwh || 'TBD'} kWh/year` :
        '- Use market intelligence for solar estimates'
      }` :
     `❌ RESTRICTED - SET ALL ROOFTOP VALUES TO ZERO
      - monthlyRevenue: 0
      - solarCapacity: 0  
      - area: 0
      - setupCost: 0
      - Explanation: "${buildingTypeInfo.restrictions.find(r => r.includes('rooftop')) || 'No individual rooftop access'}"`
   }

2. PARKING MONETIZATION
   ${buildingTypeInfo.hasParkingControl ? 
     `✅ AVAILABLE - Analyze private parking opportunities
      - Include EV charging potential
      - Calculate market rates for area` :
     `❌ RESTRICTED - SET ALL PARKING VALUES TO ZERO
      - spaces: 0
      - monthlyRevenue: 0
      - Explanation: "Parking managed by building - no individual rental rights"`
   }

3. POOL RENTAL
   ${buildingTypeInfo.type !== 'APARTMENT' ? 
     `✅ POTENTIALLY AVAILABLE - Analyze if private pool present
      - Only private pools can be rented
      - Community pools are excluded` :
     `❌ RESTRICTED - SET POOL VALUES TO ZERO
      - monthlyRevenue: 0
      - Explanation: "Shared pool amenities cannot be individually rented"`
   }

4. STORAGE SPACE
   ${buildingTypeInfo.type === 'APARTMENT' ? 
     `⚠️ LIMITED - Personal unit storage only
      - Focus on closet/unit storage space
      - Limited revenue potential ($10-30/month max)
      - No access to building storage areas` :
     `✅ FULL ACCESS - Analyze all storage opportunities
      - Garage, basement, attic monetization
      - Full storage rental potential`
   }

5. INTERNET BANDWIDTH (UNIVERSAL)
   ✅ AVAILABLE FOR ALL BUILDING TYPES
   - $20-60/month potential regardless of building type
   - Requires individual internet service control

6. GARDEN/OUTDOOR MONETIZATION
   ${buildingTypeInfo.hasGardenAccess ? 
     `✅ AVAILABLE - Analyze private garden opportunities
      - Community garden plots
      - Event hosting potential` :
     `❌ RESTRICTED - SET GARDEN VALUES TO ZERO
      - monthlyRevenue: 0
      - area: 0
      - Explanation: "No access to shared outdoor spaces for rental"`
   }

RESPONSE FORMAT (STRICT JSON WITH BUILDING RESTRICTIONS ENFORCED):
{
  "propertyType": "${buildingTypeInfo.type}",
  "buildingTypeAnalysis": {
    "detectedFromAddress": true,
    "hasRooftopAccess": ${buildingTypeInfo.hasRooftopAccess},
    "hasGardenAccess": ${buildingTypeInfo.hasGardenAccess},
    "hasParkingControl": ${buildingTypeInfo.hasParkingControl},
    "accessRestrictions": ${JSON.stringify(buildingTypeInfo.restrictions)},
    "availableOpportunities": [/* Only list actually available opportunities */]
  },
  "marketIntelligence": {
    "locationScore": 1-10,
    "buildingTypeScore": 1-10,
    "opportunityDensity": "High|Medium|Low",
    "restrictionLevel": "${buildingTypeInfo.restrictions.length > 0 ? 'Severe' : 'None'}"
  },
  "rooftop": {
    "hasAccess": ${buildingTypeInfo.hasRooftopAccess},
    "area": ${buildingTypeInfo.hasRooftopAccess ? 'number' : '0'},
    "solarCapacity": ${buildingTypeInfo.hasRooftopAccess ? 'number' : '0'},
    "monthlyRevenue": ${buildingTypeInfo.hasRooftopAccess ? 'number' : '0'},
    "setupCost": ${buildingTypeInfo.hasRooftopAccess ? 'number' : '0'},
    "paybackYears": ${buildingTypeInfo.hasRooftopAccess ? 'number' : '0'},
    "usingRealSolarData": ${!!googleSolarData},
    "restrictionExplanation": ${buildingTypeInfo.hasRooftopAccess ? 'null' : '"No individual rooftop access in ' + buildingTypeInfo.type.toLowerCase().replace('_', ' ') + ' buildings"'},
    "confidenceScore": 0.1-1.0
  },
  "parking": {
    "hasControl": ${buildingTypeInfo.hasParkingControl},
    "spaces": ${buildingTypeInfo.hasParkingControl ? 'number' : '0'},
    "monthlyRevenue": ${buildingTypeInfo.hasParkingControl ? 'number' : '0'},
    "restrictionExplanation": ${buildingTypeInfo.hasParkingControl ? 'null' : '"Parking managed by building/HOA - no individual rental rights"'},
    "confidenceScore": 0.1-1.0
  },
  "pool": {
    "present": boolean,
    "privateAccess": ${buildingTypeInfo.type !== 'APARTMENT'},
    "monthlyRevenue": ${buildingTypeInfo.type === 'APARTMENT' ? '0' : 'number'},
    "restrictionExplanation": ${buildingTypeInfo.type === 'APARTMENT' ? '"Shared pool amenities cannot be individually rented"' : 'null'},
    "confidenceScore": 0.1-1.0
  },
  "internet": {
    "monthlyRevenue": number,
    "universallyAvailable": true,
    "confidenceScore": 0.9
  },
  "storage": {
    "accessLevel": "${buildingTypeInfo.type === 'APARTMENT' ? 'Limited' : 'Full'}",
    "monthlyRevenue": number,
    "storageTypes": [/* List available storage types for building type */],
    "restrictionExplanation": ${buildingTypeInfo.type === 'APARTMENT' ? '"Limited to personal unit storage space only"' : 'null'},
    "confidenceScore": 0.1-1.0
  },
  "garden": {
    "hasAccess": ${buildingTypeInfo.hasGardenAccess},
    "monthlyRevenue": ${buildingTypeInfo.hasGardenAccess ? 'number' : '0'},
    "restrictionExplanation": ${buildingTypeInfo.hasGardenAccess ? 'null' : '"No access to shared garden/outdoor spaces for rental"'},
    "confidenceScore": 0.1-1.0
  },
  "topOpportunities": [
    /* ONLY include opportunities that are available for this building type
       NO solar/rooftop if hasRooftopAccess = false
       NO parking if hasParkingControl = false  
       NO garden if hasGardenAccess = false
       ALWAYS include internet (universal)
       Focus on realistic opportunities */
  ],
  "totalMonthlyPotential": number,
  "buildingTypeWarnings": [/* List all applicable restrictions */],
  "recommendedFocus": [/* Building-type-specific recommendations */],
  "accuracyScore": 0.1-1.0
}

CRITICAL ENFORCEMENT RULES:
1. NEVER assign revenue to restricted opportunities
2. SET values to 0 for all restricted building features  
3. EXPLAIN restrictions clearly in restrictionExplanation fields
4. ONLY include available opportunities in topOpportunities
5. FOCUS on realistic monetization for the specific building type
6. VALIDATE that totalMonthlyPotential only includes available revenue streams

This analysis will guide real investment decisions. Building type restrictions MUST be enforced.
`;

    console.log('Calling OpenAI for building-type-enforced premium analysis...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `You are a premium property monetization expert with deep expertise in building type restrictions. You MUST enforce building type limitations and NEVER assign revenue to restricted opportunities. ${buildingTypeInfo.type} buildings have specific access restrictions that MUST be reflected in your analysis. Always respond with valid JSON that respects building type limitations.`
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!gptResponse.ok) {
      const errorData = await gptResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const gptData = await gptResponse.json();
    let analysisResults;
    
    try {
      const responseContent = gptData.choices[0].message.content;
      console.log('Raw premium analysis response received');
      
      // Extract JSON from response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in premium analysis response');
      }
    } catch (error) {
      console.error('Failed to parse premium analysis response:', error);
      
      // Fallback with building type restrictions enforced
      analysisResults = {
        propertyType: buildingTypeInfo.type,
        buildingTypeAnalysis: {
          detectedFromAddress: true,
          hasRooftopAccess: buildingTypeInfo.hasRooftopAccess,
          hasGardenAccess: buildingTypeInfo.hasGardenAccess,
          hasParkingControl: buildingTypeInfo.hasParkingControl,
          accessRestrictions: buildingTypeInfo.restrictions,
          availableOpportunities: ['internet']
        },
        marketIntelligence: {
          locationScore: 7,
          buildingTypeScore: buildingTypeInfo.type === 'SINGLE_FAMILY_HOME' ? 9 : 4,
          opportunityDensity: buildingTypeInfo.type === 'SINGLE_FAMILY_HOME' ? 'High' : 'Low',
          restrictionLevel: buildingTypeInfo.restrictions.length > 0 ? 'Severe' : 'None'
        },
        rooftop: {
          hasAccess: buildingTypeInfo.hasRooftopAccess,
          area: buildingTypeInfo.hasRooftopAccess ? 1200 : 0,
          solarCapacity: buildingTypeInfo.hasRooftopAccess ? 8 : 0,
          monthlyRevenue: buildingTypeInfo.hasRooftopAccess ? 125 : 0,
          setupCost: buildingTypeInfo.hasRooftopAccess ? 20000 : 0,
          paybackYears: buildingTypeInfo.hasRooftopAccess ? 8 : 0,
          usingRealSolarData: !!googleSolarData,
          restrictionExplanation: buildingTypeInfo.hasRooftopAccess ? null : `No individual rooftop access in ${buildingTypeInfo.type.toLowerCase().replace('_', ' ')} buildings`,
          confidenceScore: 0.9
        },
        parking: {
          hasControl: buildingTypeInfo.hasParkingControl,
          spaces: buildingTypeInfo.hasParkingControl ? 2 : 0,
          monthlyRevenue: buildingTypeInfo.hasParkingControl ? 170 : 0,
          restrictionExplanation: buildingTypeInfo.hasParkingControl ? null : 'Parking managed by building/HOA - no individual rental rights',
          confidenceScore: 0.8
        },
        pool: {
          present: false,
          privateAccess: buildingTypeInfo.type !== 'APARTMENT',
          monthlyRevenue: 0,
          restrictionExplanation: buildingTypeInfo.type === 'APARTMENT' ? 'Shared pool amenities cannot be individually rented' : null,
          confidenceScore: 0.9
        },
        internet: {
          monthlyRevenue: 35,
          universallyAvailable: true,
          confidenceScore: 0.9
        },
        storage: {
          accessLevel: buildingTypeInfo.type === 'APARTMENT' ? 'Limited' : 'Full',
          monthlyRevenue: buildingTypeInfo.type === 'APARTMENT' ? 25 : 75,
          storageTypes: buildingTypeInfo.type === 'APARTMENT' ? ['unit_storage'] : ['garage', 'basement', 'attic'],
          restrictionExplanation: buildingTypeInfo.type === 'APARTMENT' ? 'Limited to personal unit storage space only' : null,
          confidenceScore: 0.7
        },
        garden: {
          hasAccess: buildingTypeInfo.hasGardenAccess,
          monthlyRevenue: buildingTypeInfo.hasGardenAccess ? 60 : 0,
          restrictionExplanation: buildingTypeInfo.hasGardenAccess ? null : 'No access to shared garden/outdoor spaces for rental',
          confidenceScore: 0.6
        },
        topOpportunities: [],
        totalMonthlyPotential: 0,
        buildingTypeWarnings: buildingTypeInfo.restrictions,
        recommendedFocus: [],
        accuracyScore: 0.85
      };
      
      // Calculate available opportunities
      const opportunities = [];
      
      // Internet is always available
      opportunities.push({
        title: 'Internet Bandwidth Sharing',
        monthlyRevenue: 35,
        partner: 'Honeygain',
        availableForBuildingType: true,
        setupCost: 0,
        paybackMonths: 0,
        confidenceScore: 0.9,
        actionSteps: ['Sign up for bandwidth sharing service', 'Ensure stable internet connection'],
        buildingTypeRequirements: ['Individual internet service control']
      });
      
      if (buildingTypeInfo.hasParkingControl) {
        opportunities.push({
          title: 'Parking Space Rental',
          monthlyRevenue: 170,
          partner: 'SpotHero',
          availableForBuildingType: true,
          setupCost: 50,
          paybackMonths: 1,
          confidenceScore: 0.8,
          actionSteps: ['List parking spaces', 'Install basic lighting'],
          buildingTypeRequirements: ['Private parking control']
        });
      }
      
      if (buildingTypeInfo.hasRooftopAccess) {
        opportunities.push({
          title: 'Solar Panel Installation',
          monthlyRevenue: 125,
          partner: 'Solar Installers',
          availableForBuildingType: true,
          setupCost: 20000,
          paybackMonths: 96,
          confidenceScore: 0.7,
          actionSteps: ['Get solar quotes', 'Check local incentives'],
          buildingTypeRequirements: ['Individual rooftop access']
        });
      }
      
      analysisResults.topOpportunities = opportunities;
      analysisResults.totalMonthlyPotential = opportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0);
      
      // Building-specific recommendations
      if (buildingTypeInfo.type === 'APARTMENT') {
        analysisResults.recommendedFocus = [
          'Focus on internet bandwidth sharing as primary income source',
          'Maximize unit storage rental potential',
          'Avoid shared amenity monetization attempts'
        ];
      } else {
        analysisResults.recommendedFocus = [
          'Prioritize parking rental for immediate income',
          'Consider solar installation for long-term returns',
          'Explore all available storage opportunities'
        ];
      }
    }

    // Step 7: Save premium analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('enhanced_property_analyses')
      .insert({
        user_id: userId,
        property_address: address,
        coordinates,
        satellite_image_url: satelliteImageUrl,
        street_view_image_url: streetViewImageUrl,
        google_solar_data: googleSolarData,
        gpt_analysis_raw: gptData,
        final_analysis_results: analysisResults,
        accuracy_score: analysisResults.accuracyScore || 0.85,
        data_sources_used: ['google_maps', googleSolarData ? 'google_solar' : 'market_intelligence', 'gpt4_premium', 'building_type_detection'],
        analysis_version: 'v4.0-building-type-aware'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving premium analysis:', saveError);
      throw saveError;
    }

    console.log('Building-type-aware premium analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysisId: savedAnalysis.id,
      results: analysisResults,
      buildingTypeInfo,
      images: {
        satellite: satelliteImageUrl,
        streetView: streetViewImageUrl
      },
      dataQuality: {
        hasGoogleSolar: !!googleSolarData,
        buildingTypeDetected: true,
        accuracyScore: analysisResults.accuracyScore || 0.85,
        analysisVersion: 'v4.0-building-type-aware',
        dataSourcesUsed: ['building_type_detection', 'google_maps', googleSolarData ? 'google_solar' : 'market_intelligence', 'gpt4_premium']
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Premium analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
