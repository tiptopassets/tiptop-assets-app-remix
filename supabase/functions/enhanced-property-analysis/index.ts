
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

    // Step 5: Market Intelligence Analysis with Enhanced GPT-4o
    const analysisPrompt = `
You are a PREMIUM property monetization expert with access to real-time market data and 20+ years of investment experience.

PROPERTY INTELLIGENCE PROFILE:
- Address: ${address}
- Coordinates: ${location.lat}, ${location.lng}
- Google Solar Data: ${googleSolarData ? 'VERIFIED REAL DATA AVAILABLE' : 'Using Market Intelligence Models'}
- Analysis Date: ${new Date().toISOString()}

${googleSolarData ? `VERIFIED SOLAR INTELLIGENCE:\n${JSON.stringify(googleSolarData, null, 2)}` : ''}

MARKET INTELLIGENCE FRAMEWORK:

1. ROOFTOP SOLAR MONETIZATION (Real Data Integration)
   ${googleSolarData ? 
     `- VERIFIED roof area: ${googleSolarData.solarPotential?.roofSegmentStats?.reduce((total: number, segment: any) => total + (segment.stats?.areaMeters2 || 0), 0) || 'TBD'} m²
      - VERIFIED solar panels capacity: ${googleSolarData.solarPotential?.maxArrayPanelsCount || 'TBD'} panels
      - VERIFIED yearly energy: ${googleSolarData.solarPotential?.yearlyEnergyDcKwh || 'TBD'} kWh/year` :
     `- Estimate roof area using property size indicators
      - Calculate solar capacity: Area ÷ 17.5 sq ft per 400W panel
      - Estimate yearly production: Capacity × 1,400 kWh per kW (national average)`
   }
   - Monthly revenue calculation: (Yearly kWh × $0.12 average rate) ÷ 12
   - Setup cost: $2.80-$3.50 per watt (2024 market rates)
   - Net metering benefits: Full retail rate credit in most areas
   - Tax incentives: 30% federal credit through 2032

2. PARKING MONETIZATION (Location-Based Pricing Intelligence)
   - Geocoded pricing analysis for ${address}
   - Urban core (downtown): $150-350/month per space
   - Suburban residential: $75-175/month per space  
   - Near transit/airports: Premium +40-60%
   - Event venues nearby: Premium +25-40%
   - EV charging stations: Additional $100-200/month revenue
   - Platform integration: SpotHero, ParkWhiz market rates

3. POOL RENTAL (Swimply Market Analysis)
   - Average session rate: $6-12 per person per hour
   - Peak season earnings: $400-1,200/month (May-September)
   - Off-season potential: $100-300/month (heated pools)
   - Setup requirements: $200-500 (insurance, cleaning supplies)
   - Market saturation check: Analyze competitor density within 3-mile radius

4. STORAGE SPACE (Neighbor.com Intelligence)
   - Garage bay rental: $80-250/month (market-dependent)
   - Basement storage: $40-120/month per 100 sq ft
   - Attic space: $30-80/month per 100 sq ft  
   - Shed/outdoor storage: $25-75/month
   - Market demand analysis: Compare to local self-storage rates (typically 40-60% of commercial rates)

5. INTERNET BANDWIDTH (Honeygain + Competitors)
   - Honeygain: $20-50/month passive (bandwidth dependent)
   - PacketStream: $15-40/month
   - Peer2Profit: $25-60/month
   - Requirements: Stable 25+ Mbps connection
   - Zero setup costs, immediate revenue potential

6. GARDEN/OUTDOOR MONETIZATION
   - Community garden plots: $40-100/month per 100 sq ft
   - Event hosting: $300-1,500 per event (weddings, parties)
   - Equipment storage: $50-150/month for contractors
   - Pet exercise area: $30-80/month per dog

PARTNER ECOSYSTEM (2024 Active Integrations):
- Solar: Tesla Energy, Sunrun, SunPower (via affiliate programs)
- Parking: SpotHero, ParkWhiz (FlexOffers integration)
- Pool: Swimply (direct partnership)
- Storage: Neighbor.com, StoreAtMyHouse
- Internet: Honeygain, PacketStream, Peer2Profit
- General: FlexOffers affiliate network, Rakuten advertising

RESPONSE FORMAT (STRICT JSON):
{
  "propertyType": "Single Family Home|Apartment|Condo|Townhouse",
  "marketIntelligence": {
    "locationScore": 1-10,
    "demographicMatch": "Excellent|Good|Fair|Poor",
    "competitionDensity": "Low|Medium|High",
    "regulatoryEnvironment": "Favorable|Neutral|Restrictive",
    "marketTrends": "Growing|Stable|Declining"
  },
  "rooftop": {
    "area": number,
    "solarCapacity": number,
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackYears": number,
    "usingRealSolarData": boolean,
    "recommendedPartner": "Tesla Energy|Sunrun|SunPower",
    "confidenceScore": 0.1-1.0,
    "keyBenefits": [string]
  },
  "parking": {
    "spaces": number,
    "monthlyRevenue": number,
    "evChargerPotential": boolean,
    "locationPremiums": {
      "transit": number,
      "events": number,
      "downtown": number
    },
    "recommendedPartner": "SpotHero|ParkWhiz",
    "confidenceScore": 0.1-1.0
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": number,
    "seasonalVariation": {"summer": number, "winter": number},
    "setupCost": number,
    "recommendedPartner": "Swimply",
    "confidenceScore": 0.1-1.0
  },
  "internet": {
    "monthlyRevenue": number,
    "recommendedPartners": ["Honeygain", "PacketStream", "Peer2Profit"],
    "requirements": string,
    "confidenceScore": 0.9
  },
  "storage": {
    "monthlyRevenue": number,
    "spaceTypes": [string],
    "recommendedPartner": "Neighbor.com|StoreAtMyHouse",
    "confidenceScore": 0.1-1.0
  },
  "garden": {
    "monthlyRevenue": number,
    "opportunities": [string],
    "seasonalFactors": string,
    "confidenceScore": 0.1-1.0
  },
  "topOpportunities": [
    {
      "title": string,
      "monthlyRevenue": number,
      "partner": string,
      "description": string,
      "setupCost": number,
      "paybackMonths": number,
      "confidenceScore": 0.1-1.0,
      "actionSteps": [string],
      "riskMitigation": [string]
    }
  ],
  "totalMonthlyPotential": number,
  "totalSetupInvestment": number,
  "overallROI": number,
  "accuracyScore": 0.1-1.0,
  "dataSourcesUsed": [string],
  "premiumInsights": [string],
  "riskAssessment": {
    "overall": "Low|Medium|High",
    "factors": [string],
    "mitigation": [string]
  }
}

CRITICAL SUCCESS FACTORS:
1. Use ONLY realistic, market-validated revenue figures
2. Base estimates on actual 2024 market data and platform rates
3. Include specific partner recommendations with reasoning
4. Provide actionable next steps for each opportunity
5. Account for seasonal variations and market cycles
6. Include risk assessment and mitigation strategies
7. Validate against comparable properties in the area
8. Factor in local regulations and HOA restrictions

This analysis will directly influence investment decisions. Accuracy and actionability are paramount.
`;

    console.log('Calling OpenAI for premium market intelligence analysis...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a premium property monetization expert with access to real-time market intelligence. Provide investment-grade analysis with accurate revenue projections. Always respond with valid JSON that exactly matches the required schema.' },
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
