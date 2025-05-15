
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
                content: `You are a property analysis expert specializing in satellite imagery analysis for monetization opportunities. 
                Analyze satellite images with precision and extract key measurements and features that could be monetized.
                Pay special attention to:
                1. Roof size and type (flat, pitched, etc.) with accurate square footage
                2. Solar panel potential based on roof orientation and shading
                3. Swimming pool dimensions, condition, and type (in-ground or above-ground)
                4. Garden/yard areas suitable for urban farming or rental
                5. Parking spaces count and dimensions
                6. Storage potential areas
                7. Accessibility features for monetization
                
                Provide all measurements in square feet with high precision. For each feature, estimate the monetization potential in dollars per month.`
              },
              { 
                role: 'user', 
                content: [
                  { 
                    type: 'text', 
                    text: `Analyze this satellite image of a property located at ${address}. Extract and measure with high precision:
                    
                    1) Roof size in square feet and roof type (flat, pitched, etc.)
                    2) Solar potential based on roof orientation and shadow patterns
                    3) Available parking spaces and their dimensions
                    4) Garden/yard area in square feet and its suitability for urban farming
                    5) Swimming pool dimensions and type if present
                    6) Any other monetizable features you can identify
                    
                    For each feature, estimate the monthly revenue potential based on industry standards.
                    Organize your response in a structured format that's easy to parse.` 
                  },
                  { 
                    type: 'image_url', 
                    image_url: { url: imageForAnalysis }
                  }
                ]
              }
            ],
            max_tokens: 1500
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
              
              // Extract roof type
              const roofTypeMatch = visionContent.match(/roof\s*(?:type|style|is)?[^a-zA-Z]*(flat|pitched|gabled|hip|shed|mansard|gambrel|butterfly|dome|pyramid|skillion)/i);
              const roofType = roofTypeMatch ? roofTypeMatch[1].toLowerCase() : null;
              
              // Extract solar potential
              const solarPotentialMatch = visionContent.match(/solar\s*(?:potential|capacity|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low)/i);
              const solarPotential = solarPotentialMatch ? solarPotentialMatch[1].toLowerCase() : null;
              
              // Extract parking spaces estimate
              const parkingMatch = visionContent.match(/(?:parking|park|car)\s*(?:spaces?|spots?)?[^0-9]*([0-9]+)/i);
              const parkingSpaces = parkingMatch ? parseInt(parkingMatch[1]) : null;
              
              // Extract garden/yard area
              const gardenMatch = visionContent.match(/(?:garden|yard|outdoor)[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
              const gardenArea = gardenMatch ? parseFloat(gardenMatch[1].replace(/,/g, '')) : null;
              
              // Extract garden potential
              const gardenPotentialMatch = visionContent.match(/garden\s*(?:potential|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low)/i);
              const gardenPotential = gardenPotentialMatch ? gardenPotentialMatch[1].toLowerCase() : null;
              
              // Extract pool information
              const poolPresentMatch = visionContent.match(/(?:swimming|pool)[^a-zA-Z]*(present|visible|identified|detected|exists|yes)/i);
              const poolPresent = !!poolPresentMatch;
              
              // Extract pool size if present
              const poolSizeMatch = poolPresent ? visionContent.match(/pool\s*(?:size|area|dimensions)?[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i) : null;
              const poolSize = poolSizeMatch ? parseFloat(poolSizeMatch[1].replace(/,/g, '')) : null;
              
              // Extract pool type
              const poolTypeMatch = poolPresent ? visionContent.match(/pool\s*(?:type|is)[^a-zA-Z]*(in-ground|inground|above-ground|aboveground)/i) : null;
              const poolType = poolTypeMatch ? poolTypeMatch[1].toLowerCase() : null;
              
              imageAnalysis = {
                roofSize,
                roofType,
                solarPotential,
                parkingSpaces,
                gardenArea,
                gardenPotential,
                poolPresent,
                poolSize,
                poolType,
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

    const systemPrompt = `You are a real estate and property monetization expert with deep knowledge of service providers. Analyze this property information and identify specific monetization opportunities for the owner. Focus on:

1. Rooftop solar potential - use the roof size estimate from image analysis if available
   - Calculate potential solar capacity in kW (approx. 15 sq ft per 1 kW)
   - Estimate monthly revenue from solar panels (use $100-150 per kW)
   - Consider roof type and orientation from image analysis
   - Recommend specific solar providers like SunRun, Tesla Solar, Sunpower

2. Parking spaces rental - use the parking space count from image analysis if available
   - Estimate daily rental rates based on location
   - Calculate monthly revenue potential
   - Suggest specific platforms like Neighbor, ParkingPanda, SpotHero

3. Storage space rental
   - Identify areas suitable for storage based on property layout
   - Calculate monthly revenue potential ($1-2 per sq ft)
   - Recommend services like Neighbor, STOW IT

4. Garden/yard rental or urban farming - use the garden size estimate from image analysis if available
   - Assess suitability for urban farming based on image analysis
   - Calculate rental potential
   - Recommend platforms like Peerspace, YardYum

5. Swimming pool rental if present - use pool information from image analysis
   - Estimate hourly/daily rental rates based on pool size and type
   - Calculate monthly revenue during swimming season
   - Suggest platforms like Swimply

6. Short-term rental potential
   - Estimate nightly rates for whole or partial property
   - Calculate monthly projection accounting for occupancy rates
   - Recommend platforms like Airbnb, VRBO

7. Internet bandwidth sharing
   - Estimate potential revenue
   - Recommend services like Honeygain

For each opportunity, provide specific estimates of:
- Installation/setup costs where applicable
- Monthly revenue potential with realistic ranges
- Recommended service providers with URLs
- Any regulatory considerations or permits required

Your analysis should be data-driven, realistic, and actionable with specific recommendations.`;

    const userPrompt = `Here is the property information: ${propertyInfo}
    
Here is the satellite image analysis: ${JSON.stringify(imageAnalysis)}

Please analyze this property and generate a comprehensive assessment of monetization opportunities with specific service provider recommendations. Return your analysis as a JSON object with the following structure:
{
  "propertyType": "residential/commercial/etc",
  "amenities": ["array", "of", "amenities"],
  "rooftop": { 
    "area": number_in_sqft, 
    "type": "flat/pitched/etc",
    "solarCapacity": kilowatts, 
    "solarPotential": boolean,
    "revenue": dollars_per_month,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "roi": months, "url": "provider_url"}
    ]
  },
  "garden": { 
    "area": number_in_sqft, 
    "opportunity": "Low/Medium/High", 
    "revenue": dollars_per_month,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "roi": months, "url": "provider_url"}
    ]
  },
  "parking": { 
    "spaces": number, 
    "rate": dollars_per_day, 
    "revenue": dollars_per_month,
    "evChargerPotential": boolean,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "roi": months, "url": "provider_url"}
    ]
  },
  "pool": { 
    "present": boolean, 
    "area": number_in_sqft, 
    "type": "inground/above-ground", 
    "revenue": dollars_per_month,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "fee": percentage, "url": "provider_url"}
    ]
  },
  "storage": { 
    "volume": cubic_feet, 
    "revenue": dollars_per_month,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "fee": percentage, "url": "provider_url"}
    ]
  },
  "bandwidth": { 
    "available": mbps, 
    "revenue": dollars_per_month,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "fee": percentage, "url": "provider_url"}
    ]
  },
  "shortTermRental": { 
    "nightlyRate": dollars, 
    "monthlyProjection": dollars,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "fee": percentage, "url": "provider_url"}
    ]
  },
  "permits": ["array", "of", "required", "permits"],
  "restrictions": "summary of restrictions",
  "topOpportunities": [
    { 
      "icon": "icon_name", 
      "title": "Opportunity Name", 
      "monthlyRevenue": number, 
      "description": "short description",
      "provider": "Recommended Provider",
      "setupCost": dollars,
      "roi": months,
      "formFields": [
        {
          "type": "text/number/select",
          "name": "field_name",
          "label": "Field Label",
          "value": "default value",
          "options": ["option1", "option2"] // for select type only
        }
      ]
    }
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
        max_tokens: 2500
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
