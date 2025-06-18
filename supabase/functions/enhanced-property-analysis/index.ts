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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, userId }: AnalysisRequest = await req.json();

    console.log(`Starting premium analysis for: ${address}`);

    // Validate API keys
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Step 1: Geocode the address
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`
    );
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      throw new Error('Failed to geocode address');
    }

    const location = geocodeData.results[0].geometry.location;
    const coordinates = { lat: location.lat, lng: location.lng };

    // Step 2: Get satellite imagery from Google Static Maps
    const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=20&size=640x640&maptype=satellite&key=${googleMapsKey}`;

    // Step 3: Get Street View imagery
    const streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${location.lat},${location.lng}&key=${googleMapsKey}`;

    // Step 4: Get Google Solar API data
    let googleSolarData = null;
    try {
      const solarResponse = await fetch(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${location.lat}&location.longitude=${location.lng}&key=${googleMapsKey}`
      );
      if (solarResponse.ok) {
        googleSolarData = await solarResponse.json();
      }
    } catch (error) {
      console.log('Solar API not available, using market estimation:', error);
    }

    // Step 5: Market Intelligence Analysis with Building Type Restrictions
    const analysisPrompt = `
You are a PREMIUM property monetization expert with 20+ years of investment experience and deep knowledge of building type restrictions.

PROPERTY INTELLIGENCE PROFILE:
- Address: ${address}
- Coordinates: ${location.lat}, ${location.lng}
- Google Solar Data: ${googleSolarData ? 'VERIFIED REAL DATA AVAILABLE' : 'Using Market Intelligence Models'}
- Analysis Date: ${new Date().toISOString()}

CRITICAL BUILDING TYPE RESTRICTIONS & DETECTION:
1. ADDRESS PATTERN ANALYSIS:
   - Contains "Apt", "Unit", "Suite", "#" → APARTMENT BUILDING
   - Contains "Condo", "Condominium" → CONDO COMPLEX  
   - Multi-story building in satellite → MULTI-UNIT BUILDING
   - When uncertain → ASSUME RESTRICTED ACCESS

2. APARTMENT/CONDO/MULTI-UNIT RESTRICTIONS:
   - ❌ NO rooftop access (managed by HOA/building owner)
   - ❌ NO solar panel installation rights
   - ❌ NO shared garden/outdoor space rental
   - ❌ NO parking space rental (building-managed)
   - ❌ NO pool rental (shared amenity)
   - ✅ ONLY: Internet bandwidth, personal unit storage

3. SINGLE FAMILY HOME OPPORTUNITIES:
   - ✅ Full rooftop access and solar rights
   - ✅ Garden and outdoor space control
   - ✅ Private parking rental options
   - ✅ Pool rental if present
   - ✅ All storage opportunities

4. TOWNHOUSE/DUPLEX (MIXED RESTRICTIONS):
   - ⚠️ Limited rooftop (check HOA)
   - ⚠️ Shared garden restrictions possible
   - ✅ Private driveway parking usually available

${googleSolarData ? `VERIFIED SOLAR INTELLIGENCE:\n${JSON.stringify(googleSolarData, null, 2)}` : ''}

BUILDING-TYPE-AWARE MARKET INTELLIGENCE:

1. ROOFTOP SOLAR MONETIZATION (SINGLE FAMILY HOMES ONLY)
   ${googleSolarData ? 
     `- VERIFIED roof access and solar rights required
      - VERIFIED solar capacity: ${googleSolarData.solarPotential?.maxArrayPanelsCount || 'TBD'} panels
      - VERIFIED yearly energy: ${googleSolarData.solarPotential?.yearlyEnergyDcKwh || 'TBD'} kWh/year` :
     `- Must verify property owner has roof access rights
      - Calculate capacity only if individual roof access confirmed
      - Apartment/condo buildings: SET REVENUE = $0`
   }
   - IF apartment/condo: Explain "No individual roof access in multi-unit buildings"
   - IF single family: Full solar potential analysis

2. PARKING MONETIZATION (PRIVATE ACCESS REQUIRED)
   - IF apartment/condo: "Parking managed by building - no individual rental rights"
   - IF single family with driveway: Full market analysis
   - Geographic pricing only applies to privately controlled spaces

3. POOL RENTAL (PRIVATE POOLS ONLY)
   - IF apartment/condo: "Shared pool amenities cannot be individually rented"
   - IF single family with private pool: Swimply market rates apply
   - Community pools are NOT monetizable by residents

4. STORAGE SPACE (ACCESS-DEPENDENT)
   - IF apartment: Only personal unit storage, limited revenue potential
   - IF single family: Full garage/basement/attic monetization
   - Shared building storage is NOT individually rentable

5. INTERNET BANDWIDTH (UNIVERSAL OPPORTUNITY)
   - Available regardless of building type
   - Requires individual internet service control
   - $20-60/month across all property types

6. GARDEN/OUTDOOR MONETIZATION (PRIVATE ACCESS ONLY)
   - IF apartment/condo: "No access to shared outdoor spaces for rental"
   - IF single family: Full garden monetization potential
   - Balcony gardening: Very limited revenue potential

RESPONSE FORMAT (STRICT JSON WITH BUILDING RESTRICTIONS):
{
  "propertyType": "Single Family Home|Apartment|Condo|Townhouse",
  "buildingTypeAnalysis": {
    "detectedFromAddress": boolean,
    "hasRooftopAccess": boolean,
    "hasGardenAccess": boolean,
    "hasParkingControl": boolean,
    "accessRestrictions": [string],
    "availableOpportunities": [string]
  },
  "marketIntelligence": {
    "locationScore": 1-10,
    "buildingTypeScore": 1-10,
    "opportunityDensity": "High|Medium|Low",
    "restrictionLevel": "None|Moderate|Severe"
  },
  "rooftop": {
    "hasAccess": boolean,
    "area": number,
    "solarCapacity": number,
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackYears": number,
    "usingRealSolarData": boolean,
    "restrictionExplanation": "string or null",
    "confidenceScore": 0.1-1.0
  },
  "parking": {
    "hasControl": boolean,
    "spaces": number,
    "monthlyRevenue": number,
    "restrictionExplanation": "string or null",
    "confidenceScore": 0.1-1.0
  },
  "pool": {
    "present": boolean,
    "privateAccess": boolean,
    "monthlyRevenue": number,
    "restrictionExplanation": "string or null",
    "confidenceScore": 0.1-1.0
  },
  "internet": {
    "monthlyRevenue": number,
    "universallyAvailable": true,
    "confidenceScore": 0.9
  },
  "storage": {
    "accessLevel": "Full|Limited|None",
    "monthlyRevenue": number,
    "storageTypes": [string],
    "restrictionExplanation": "string or null",
    "confidenceScore": 0.1-1.0
  },
  "garden": {
    "hasAccess": boolean,
    "monthlyRevenue": number,
    "restrictionExplanation": "string or null",
    "confidenceScore": 0.1-1.0
  },
  "topOpportunities": [
    {
      "title": string,
      "monthlyRevenue": number,
      "partner": string,
      "availableForBuildingType": boolean,
      "setupCost": number,
      "paybackMonths": number,
      "confidenceScore": 0.1-1.0,
      "actionSteps": [string],
      "buildingTypeRequirements": [string]
    }
  ],
  "totalMonthlyPotential": number,
  "buildingTypeWarnings": [string],
  "recommendedFocus": [string],
  "accuracyScore": 0.1-1.0
}

CRITICAL SUCCESS FACTORS:
1. DETECT building type from address patterns and context
2. APPLY appropriate restrictions based on building type
3. SET revenue to $0 for unavailable opportunities with clear explanations
4. PRIORITIZE realistic opportunities for the specific building type
5. PROVIDE building-type-specific action steps
6. WARN about common misconceptions (apartment dwellers thinking they can rent shared amenities)
7. FOCUS recommendations on actually available opportunities

This analysis directly influences investment decisions. Building type accuracy is CRITICAL.
`;

    console.log('Calling OpenAI for building-type-aware premium analysis...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a premium property monetization expert with deep expertise in building type restrictions and property access rights. ALWAYS consider building type when analyzing opportunities. Apartment/condo residents typically have NO access to rooftops, shared gardens, or building-managed parking. Always respond with valid JSON.' },
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
      throw new Error('Invalid premium analysis response format');
    }

    // Step 6: Save premium analysis to database
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
        accuracy_score: analysisResults.accuracyScore || 0.90,
        data_sources_used: analysisResults.dataSourcesUsed || ['google_maps', 'google_solar', 'gpt4_premium', 'market_intelligence'],
        analysis_version: 'v3.0-premium'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving premium analysis:', saveError);
      throw saveError;
    }

    console.log('Premium market intelligence analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysisId: savedAnalysis.id,
      results: analysisResults,
      images: {
        satellite: satelliteImageUrl,
        streetView: streetViewImageUrl
      },
      dataQuality: {
        hasGoogleSolar: !!googleSolarData,
        accuracyScore: analysisResults.accuracyScore || 0.90,
        analysisVersion: 'v3.0-premium',
        dataSourcesUsed: analysisResults.dataSourcesUsed || ['market_intelligence', 'google_apis', 'gpt4_premium']
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
