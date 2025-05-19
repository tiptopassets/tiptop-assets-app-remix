
import { PropertyInfo, ImageAnalysis, PropertyAnalysis } from './types.ts';
import { extractStructuredData } from './dataExtraction.ts';

const GPT_API_KEY = Deno.env.get('GPT') || '';

/**
 * Generates a comprehensive property analysis using OpenAI
 */
export async function generatePropertyAnalysis(propertyInfo: PropertyInfo, imageAnalysis: ImageAnalysis): Promise<PropertyAnalysis> {
  if (!GPT_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }
  
  const systemPrompt = createSystemPrompt();
  const userPrompt = createUserPrompt(propertyInfo, imageAnalysis);
  
  console.log('Calling OpenAI API for property analysis...');
  
  const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GPT_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o', // Using a more powerful model for better analysis
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent results
      max_tokens: 3000
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
  const content = gptData.choices[0].message.content;
  console.log('Raw GPT response:', content);
  
  return extractStructuredData(content);
}

/**
 * Creates the system prompt for OpenAI
 */
function createSystemPrompt(): string {
  return `You are a real estate and property monetization expert with deep knowledge of service providers. Analyze this property information and identify specific monetization opportunities for the owner, with accurate and realistic valuation assessments. Focus on:

1. Accurately determine the property type first - differentiate between:
   - Single-family home
   - Apartment/Condominium (individual unit)
   - Apartment building (multi-unit property)
   - Commercial property
   - Mixed-use property

2. Rooftop solar potential - use the roof size estimate from image analysis if available
   - Calculate potential solar capacity in kW (approx. 15 sq ft per 1 kW)
   - Realistically estimate monthly revenue from solar panels (use $100-150 per kW)
   - Consider roof type and orientation from image analysis
   - Recommend specific solar providers like SunRun, Tesla Solar, Sunpower
   - Provide accurate setup costs and ROI timeline
   - IMPORTANT: Only include solar as an option for properties with own roofs (not apartment units)

3. Parking spaces rental - use the parking space count from image analysis if available
   - BE REALISTIC with the parking spaces count, most residential homes have 1-3 spaces maximum
   - For apartment buildings, estimate based on visible spaces in satellite images
   - Calculate monthly revenue potential with realistic rates based on location
   - Suggest specific platforms like Neighbor, ParkingPanda, SpotHero
   - Evaluate EV charger potential and associated additional revenue
   - Note: If the property is an apartment unit without dedicated parking, don't include this option

4. Storage space rental
   - Identify areas suitable for storage based on property layout
   - Calculate monthly revenue potential ($1-2 per sq ft)
   - Recommend services like Neighbor, STOW IT
   - Include setup costs and barriers to entry
   - IMPORTANT: Only include for properties that would have extra storage space

5. Garden/yard rental or urban farming - use the garden size estimate from image analysis if available
   - Assess suitability for urban farming based on image analysis
   - Calculate rental potential with specific dollar amounts
   - Recommend platforms like Peerspace, YardYum
   - Estimate startup costs for different garden use cases
   - Note: If the property is an apartment unit without a garden, don't include this option

6. Swimming pool rental if present - use pool information from image analysis
   - ONLY if you can confidently detect a pool in the image analysis
   - CAREFULLY CHECK for pool features in the image analysis - look for blue rectangular shapes
   - Estimate hourly/daily rental rates based on pool size and type
   - Calculate monthly revenue during swimming season
   - Suggest platforms like Swimply
   - Include maintenance considerations in valuation

7. Internet bandwidth sharing
   - Estimate potential revenue based on location (typically $5-50 per month)
   - Recommend services like Honeygain
   - Provide setup steps and requirements
   - Include typical earnings in the area

8. Property valuation
   - Provide a comprehensive valuation of the entire property's monetization potential
   - Calculate total monthly and annual revenue potential
   - Rank opportunities by profitability
   - Estimate total setup costs and ROI timeline

For each opportunity, provide highly specific estimates based on what you can realistically see in the image:
- BE EXTREMELY REALISTIC with counts and measurements - do not exaggerate
- Installation/setup costs with dollar amounts
- Monthly revenue potential with realistic ranges based on market data
- Recommended service providers with URLs
- Any regulatory considerations or permits required
- ROI timeline in months

Your analysis must be data-driven, realistic, actionable, and include complete information for all applicable categories. DO NOT exaggerate opportunities or include features that aren't clearly visible.`;
}

/**
 * Creates the user prompt for OpenAI with property and image analysis
 */
function createUserPrompt(propertyInfo: PropertyInfo, imageAnalysis: ImageAnalysis): string {
  return `Here is the property information: ${JSON.stringify(propertyInfo)}
    
Here is the satellite image analysis: ${JSON.stringify(imageAnalysis)}

IMPORTANT: Be extremely realistic in your assessments. If you're unsure about something, be conservative in your estimates or indicate uncertainty.
- First determine if this is a single-family home, an apartment unit, or an apartment building
- For parking spaces, most residential homes have 1-3 spaces - DO NOT claim 10+ parking spaces for a standard home
- For solar panels, only estimate based on visible roof area in proper orientation
- For swimming pools, carefully look for blue rectangular shapes and only include if clearly detected
- For garden space, estimate conservatively based on visible yard area
- For apartment units specifically, do NOT include rooftop or other shared amenities unless specifically owned

Please analyze this property and generate a comprehensive assessment of monetization opportunities with specific service provider recommendations and accurate valuations. Return your analysis as a JSON object with the following structure:
{
  "propertyType": "residential-house/residential-apartment-unit/residential-apartment-building/commercial/etc",
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
  "imageAnalysisSummary": "summary of what was detected in the satellite image",
  "propertyValuation": {
    "totalMonthlyRevenue": dollars,
    "totalAnnualRevenue": dollars,
    "totalSetupCosts": dollars,
    "averageROI": months,
    "bestOpportunity": "name of best opportunity"
  }
}

IMPORTANT: Make sure to provide complete information for ALL applicable categories and be extremely accurate about property type. If data is limited, use reasonable estimates based on location and property type. Don't omit any relevant fields.`;
}
