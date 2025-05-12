
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GPT_API_KEY = Deno.env.get('GPT') || '';
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';

interface AnalysisRequest {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { address, coordinates }: AnalysisRequest = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Property address is required' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Create Supabase client to store results later
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get property details from Google Maps API if coordinates aren't provided
    let propertyCoordinates = coordinates;
    let propertyDetails: any = {};
    
    if (!propertyCoordinates && GOOGLE_MAPS_API_KEY) {
      try {
        // Geocode the address to get coordinates
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          propertyCoordinates = { lat: location.lat, lng: location.lng };
          
          // Get additional property details
          propertyDetails = {
            formattedAddress: geocodeData.results[0].formatted_address,
            placeId: geocodeData.results[0].place_id
          };
          
          // Get more details using Places API
          if (propertyDetails.placeId) {
            const placeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${propertyDetails.placeId}&fields=name,geometry,formatted_address,type,vicinity&key=${GOOGLE_MAPS_API_KEY}`
            );
            
            const placeData = await placeResponse.json();
            if (placeData.result) {
              propertyDetails.type = placeData.result.types;
              propertyDetails.vicinity = placeData.result.vicinity;
            }
          }
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
        // Continue with just the address if geocoding fails
      }
    }
    
    // Use GPT to analyze the property
    if (!GPT_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GPT API key not configured' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Create a prompt for GPT based on the property information
    const propertyInfo = JSON.stringify({
      address: address,
      coordinates: propertyCoordinates,
      details: propertyDetails
    });
    
    const systemPrompt = `You are a real estate and property monetization expert. Analyze this property information and identify potential monetization opportunities for the owner. Focus on:
1. Rooftop solar potential
2. Parking spaces rental
3. Storage space rental
4. Garden/yard rental or urban farming
5. Internet bandwidth sharing
6. Swimming pool rental (if applicable)
7. Short-term rental potential
Your analysis should be data-driven and realistic.`;

    const userPrompt = `Here is the property information: ${propertyInfo}. Please analyze this property and generate a comprehensive assessment of monetization opportunities. Return your analysis as a JSON object with the following structure:
{
  "propertyType": "residential/commercial/etc",
  "amenities": ["array", "of", "amenities"],
  "rooftop": { "area": number_in_sqft, "solarCapacity": kilowatts, "revenue": dollars_per_month },
  "garden": { "area": number_in_sqft, "opportunity": "Low/Medium/High", "revenue": dollars_per_month },
  "parking": { "spaces": number, "rate": dollars_per_day, "revenue": dollars_per_month },
  "pool": { "present": boolean, "area": number_in_sqft, "type": "inground/above-ground", "revenue": dollars_per_month },
  "storage": { "volume": cubic_feet, "revenue": dollars_per_month },
  "bandwidth": { "available": mbps, "revenue": dollars_per_month },
  "shortTermRental": { "nightlyRate": dollars, "monthlyProjection": dollars },
  "permits": ["array", "of", "required", "permits"],
  "restrictions": "summary of restrictions",
  "topOpportunities": [
    { "icon": "icon_name", "title": "Opportunity Name", "monthlyRevenue": number, "description": "short description" }
  ]
}`;

    // Call OpenAI API
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use the best available model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });
    
    const gptData = await gptResponse.json();
    
    if (!gptData.choices || gptData.choices.length === 0) {
      throw new Error('Failed to generate property analysis');
    }
    
    // Extract and parse the GPT response
    let analysis;
    try {
      // Get the content from GPT response and parse as JSON
      const content = gptData.choices[0].message.content;
      
      // Extract JSON from the response (in case GPT adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch (e) {
      console.error('Error parsing GPT response:', e);
      throw new Error('Failed to parse property analysis');
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        propertyInfo: {
          address: propertyDetails.formattedAddress || address,
          coordinates: propertyCoordinates
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in analyze-property function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred during property analysis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
