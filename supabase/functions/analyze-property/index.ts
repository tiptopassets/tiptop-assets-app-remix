
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GPT_API_KEY = Deno.env.get('GPT') || '';
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';

interface AnalysisRequest {
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  satelliteImage?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { address, coordinates, satelliteImage }: AnalysisRequest = await req.json();
    
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
    let satelliteImageUrl = '';
    
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
          
          // Get satellite imagery with high zoom level (20)
          satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${propertyCoordinates.lat},${propertyCoordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
          
          // Get more details using Places API
          if (propertyDetails.placeId) {
            const placeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${propertyDetails.placeId}&fields=name,geometry,formatted_address,type,vicinity,building_levels&key=${GOOGLE_MAPS_API_KEY}`
            );
            
            const placeData = await placeResponse.json();
            if (placeData.result) {
              propertyDetails.type = placeData.result.types;
              propertyDetails.vicinity = placeData.result.vicinity;
              propertyDetails.buildingLevels = placeData.result.building_levels;
            }
          }
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
        // Continue with just the address if geocoding fails
      }
    }
    
    // Use provided satellite image if available, otherwise use the URL we generated
    const imageForAnalysis = satelliteImage || satelliteImageUrl;
    
    // Check if we have the OpenAI API key
    if (!GPT_API_KEY) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Create property info for GPT
    const propertyInfo = JSON.stringify({
      address: address,
      coordinates: propertyCoordinates,
      details: propertyDetails
    });
    
    console.log('Using OpenAI API key to analyze property');
    
    // First analyze the satellite image if available
    let imageAnalysis = {};
    if (imageForAnalysis && imageForAnalysis.startsWith('data:image')) {
      try {
        console.log('Analyzing satellite image with GPT vision...');
        const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GPT_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o', // Using GPT-4o with vision capabilities
            messages: [
              { 
                role: 'system', 
                content: 'You are a property analyst specializing in satellite imagery analysis. Analyze this satellite image of a property and extract key measurements and features that could be monetized.' 
              },
              { 
                role: 'user', 
                content: [
                  { 
                    type: 'text', 
                    text: 'Analyze this satellite image of a property. Estimate: 1) Roof size in square feet, 2) Available parking spaces, 3) Garden/yard area in square feet, 4) Any other monetizable features you can identify. Use pixel measurements and known scaling to make your best estimates.' 
                  },
                  { 
                    type: 'image_url', 
                    image_url: { url: imageForAnalysis }
                  }
                ]
              }
            ],
            max_tokens: 1000
          })
        });
        
        if (!visionResponse.ok) {
          const errorData = await visionResponse.json();
          console.error('OpenAI Vision API error:', errorData);
          // Continue without image analysis
        } else {
          const visionData = await visionResponse.json();
          if (visionData.choices && visionData.choices.length > 0) {
            const visionContent = visionData.choices[0].message.content;
            console.log('Vision analysis:', visionContent);
            
            // Try to extract structured info from the vision analysis
            try {
              // Extract roof size estimate from text using regex
              const roofSizeMatch = visionContent.match(/roof\s*(?:size|area)?\s*[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
              const roofSize = roofSizeMatch ? parseFloat(roofSizeMatch[1].replace(/,/g, '')) : null;
              
              // Extract parking spaces estimate
              const parkingMatch = visionContent.match(/(?:parking|park|car)\s*(?:spaces?|spots?)?[^0-9]*([0-9]+)/i);
              const parkingSpaces = parkingMatch ? parseInt(parkingMatch[1]) : null;
              
              // Extract garden/yard area
              const gardenMatch = visionContent.match(/(?:garden|yard|outdoor)[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
              const gardenArea = gardenMatch ? parseFloat(gardenMatch[1].replace(/,/g, '')) : null;
              
              imageAnalysis = {
                roofSize,
                parkingSpaces,
                gardenArea,
                fullAnalysis: visionContent
              };
            } catch (e) {
              console.error('Error parsing vision analysis:', e);
              imageAnalysis = { fullAnalysis: visionContent };
            }
          }
        }
      } catch (error) {
        console.error('Error analyzing image with OpenAI:', error);
        // Continue without image analysis
      }
    }

    const systemPrompt = `You are a real estate and property monetization expert. Analyze this property information and identify potential monetization opportunities for the owner. Focus on:
1. Rooftop solar potential - use the roof size estimate from image analysis if available
2. Parking spaces rental - use the parking space count from image analysis if available
3. Storage space rental
4. Garden/yard rental or urban farming - use the garden size estimate from image analysis if available
5. Internet bandwidth sharing
6. Swimming pool rental (if applicable)
7. Short-term rental potential
Your analysis should be data-driven and realistic. Use the satellite image analysis results to make more accurate estimates.`;

    const userPrompt = `Here is the property information: ${propertyInfo}
    
Here is the satellite image analysis: ${JSON.stringify(imageAnalysis)}

Please analyze this property and generate a comprehensive assessment of monetization opportunities. Return your analysis as a JSON object with the following structure:
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
  ],
  "imageAnalysisSummary": "summary of what was detected in the satellite image"
}`;

    // Call OpenAI API
    console.log('Calling OpenAI API for property analysis...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more affordable model for text analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });
    
    if (!gptResponse.ok) {
      const errorData = await gptResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    const gptData = await gptResponse.json();
    console.log('OpenAI response received');
    
    if (!gptData.choices || gptData.choices.length === 0) {
      throw new Error('Failed to generate property analysis');
    }
    
    // Extract and parse the GPT response
    let analysis;
    try {
      // Get the content from GPT response and parse as JSON
      const content = gptData.choices[0].message.content;
      console.log('Raw GPT response:', content);
      
      // Extract JSON from the response (in case GPT adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
      
      console.log('Parsed analysis:', analysis);
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
        },
        imageAnalysis: imageAnalysis
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
