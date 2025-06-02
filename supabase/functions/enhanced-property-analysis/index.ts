
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

    console.log(`Starting enhanced analysis for: ${address}`);

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
      console.log('Solar API not available, using estimation:', error);
    }

    // Step 5: Enhanced GPT-4o Analysis
    const analysisPrompt = `
You are a property monetization expert analyzing a residential property for revenue opportunities. 

PROPERTY DETAILS:
- Address: ${address}
- Coordinates: ${location.lat}, ${location.lng}
- Google Solar Data: ${googleSolarData ? JSON.stringify(googleSolarData) : 'Not available - use estimation'}

ANALYSIS REQUIREMENTS:
1. ROOFTOP ANALYSIS:
   - Estimate roof area in sq ft ${googleSolarData ? 'based on Google Solar data' : 'from typical property size'}
   - Solar panel capacity potential
   - Monthly solar revenue estimate ($50-300 range typical)
   - Setup cost estimate

2. PARKING ANALYSIS:
   - Estimate parking spaces (driveway, garage, street)
   - Monthly parking rental potential ($100-500 range)
   - EV charging station potential

3. PROPERTY ASSETS:
   - Pool presence and rental potential (Swimply)
   - Storage space rental potential
   - Internet bandwidth sharing potential (Honeygain)
   - Short-term rental potential (Airbnb/Booking.com)

4. PARTNER MATCHING:
   For each identified opportunity, recommend from these partners:
   - Solar: Tesla Energy
   - Parking: SpotHero (via FlexOffers)
   - Pool: Swimply
   - Internet: Honeygain
   - Storage/General: FlexOffers, Rakuten
   - Rental: Airbnb, Booking.com

RESPONSE FORMAT (JSON):
{
  "propertyType": "Single Family Home|Apartment|Condo",
  "rooftop": {
    "area": number,
    "solarCapacity": number,
    "monthlyRevenue": number,
    "setupCost": number,
    "usingRealSolarData": boolean,
    "recommendedPartner": "Tesla Energy"
  },
  "parking": {
    "spaces": number,
    "monthlyRevenue": number,
    "evChargerPotential": boolean,
    "recommendedPartner": "SpotHero"
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": number,
    "recommendedPartner": "Swimply"
  },
  "internet": {
    "monthlyRevenue": number,
    "recommendedPartner": "Honeygain"
  },
  "storage": {
    "monthlyRevenue": number,
    "recommendedPartner": "FlexOffers"
  },
  "rental": {
    "monthlyRevenue": number,
    "recommendedPartner": "Airbnb"
  },
  "topOpportunities": [
    {
      "title": "Solar Panels",
      "monthlyRevenue": number,
      "partner": "Tesla Energy",
      "description": "Install solar panels on your roof",
      "setupCost": number
    }
  ],
  "totalMonthlyPotential": number,
  "accuracyScore": number,
  "dataSourcesUsed": ["google_solar", "street_view", "satellite", "gpt4"]
}

Be realistic with estimates. Provide specific dollar amounts, not ranges.
`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert property monetization analyst. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const gptData = await gptResponse.json();
    let analysisResults;
    
    try {
      analysisResults = JSON.parse(gptData.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      throw new Error('Invalid analysis response format');
    }

    // Step 6: Save enhanced analysis to database
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
        data_sources_used: analysisResults.dataSourcesUsed || ['google_maps', 'gpt4'],
        analysis_version: 'v2.0'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw saveError;
    }

    // Step 7: Create affiliate journey tracking
    const { error: journeyError } = await supabase
      .from('user_affiliate_journeys')
      .insert({
        user_id: userId,
        property_analysis_id: savedAnalysis.id,
        journey_status: 'started',
        total_estimated_monthly: analysisResults.totalMonthlyPotential || 0
      });

    if (journeyError) {
      console.error('Error creating journey:', journeyError);
    }

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
        accuracyScore: analysisResults.accuracyScore || 0.85
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
