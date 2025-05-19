
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
  const content = gptData.choices[0].message.content;
  console.log('Raw GPT response:', content);
  
  // Generate the analysis data
  const analysisData = extractStructuredData(content);
  
  // Apply validation and realistic constraints
  return validateAndNormalizeAnalysis(analysisData, propertyInfo.propertyType);
}

/**
 * Creates the system prompt for OpenAI with stronger emphasis on reality-checking
 */
function createSystemPrompt(): string {
  return `You are a real estate and property monetization expert with deep knowledge of service providers. Analyze this property information and identify specific monetization opportunities for the owner, with STRICTLY ACCURATE and realistic valuation assessments.

CRITICAL INSTRUCTION: First determine if the property is a single-family home, multi-family home, apartment building, commercial property, or other type. Your analysis MUST be appropriate for the correct property type.

1. Rooftop solar potential - use the roof size estimate from image analysis if available
   - Calculate potential solar capacity in kW (approx. 15 sq ft per 1 kW)
   - Realistically estimate monthly revenue from solar panels (use $100-150 per kW)
   - Consider roof type and orientation from image analysis
   - Recommend specific solar providers like SunRun, Tesla Solar, Sunpower
   - Provide accurate setup costs and ROI timeline

2. Parking spaces rental - use the parking space count from image analysis if available
   - BE EXTREMELY REALISTIC AND CONSERVATIVE with parking space counts:
     * Single-family homes typically have 1-3 spaces MAXIMUM
     * Multi-family homes typically have 1-2 spaces per unit
     * Apartment buildings often have shared parking (do not assume individual spaces are available)
   - Calculate monthly revenue potential with realistic rates based on location
   - Suggest specific platforms like Neighbor, ParkingPanda, SpotHero
   - Evaluate EV charger potential and associated additional revenue

3. Storage space rental
   - Single-family homes may have garage or basement space
   - Apartment buildings typically do NOT have extra storage unless explicitly mentioned
   - Calculate monthly revenue potential ($1-2 per sq ft)
   - Recommend services like Neighbor, STOW IT
   - Include setup costs and barriers to entry

4. Garden/yard rental or urban farming - use the garden size estimate from image analysis if available
   - Single-family homes may have yards, apartment buildings typically do NOT
   - Assess suitability for urban farming based on image analysis
   - Calculate rental potential with specific dollar amounts
   - Recommend platforms like Peerspace, YardYum
   - Estimate startup costs for different garden use cases

5. Swimming pool rental if present - use pool information from image analysis
   - ONLY if you can confidently detect a pool in the image analysis
   - Estimate hourly/daily rental rates based on pool size and type
   - Calculate monthly revenue during swimming season
   - Suggest platforms like Swimply
   - Include maintenance considerations in valuation

6. Internet bandwidth sharing
   - Estimate potential revenue based on location (typically $5-50 per month)
   - Recommend services like Honeygain
   - Provide setup steps and requirements
   - Include typical earnings in the area

7. Property valuation
   - Provide a comprehensive valuation of the entire property's monetization potential
   - Calculate total monthly and annual revenue potential
   - Rank opportunities by profitability
   - Estimate total setup costs and ROI timeline

For each opportunity, provide highly specific estimates based on what you can realistically see in the image:
- BE EXTREMELY REALISTIC AND CONSERVATIVE with counts and measurements - NEVER exaggerate
- If you cannot confidently determine a feature exists, DO NOT include it
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
  // Try to determine property type from address components or details
  let propertyTypeHint = "unknown";
  if (propertyInfo.details && propertyInfo.details.addressComponents) {
    const addressComponents = propertyInfo.details.addressComponents;
    // Look for apartment numbers, unit numbers, etc.
    const hasApartmentIndicators = addressComponents.some(component => 
      component.types.includes('subpremise') || 
      /apt|unit|suite|#/i.test(component.long_name || '')
    );
    
    if (hasApartmentIndicators) {
      propertyTypeHint = "apartment";
    } else if (propertyInfo.details.type && Array.isArray(propertyInfo.details.type)) {
      if (propertyInfo.details.type.includes('premise')) {
        propertyTypeHint = "single_family";
      } else if (propertyInfo.details.type.includes('establishment')) {
        propertyTypeHint = "commercial";
      }
    }
  }

  return `Here is the property information: ${JSON.stringify(propertyInfo)}
    
Here is the satellite image analysis: ${JSON.stringify(imageAnalysis)}

IMPORTANT: Based on the address and image analysis, the property appears to be a "${propertyTypeHint}" type, but make your own determination.

CRITICAL RULES:
- Be extremely realistic and conservative in your assessments
- For parking spaces: single-family homes have 1-3 spaces MAX, apartment units typically have 1 space
- For solar panels, only estimate based on visible roof area in proper orientation
- For swimming pools, only include if clearly detected
- For garden space, estimate conservatively based on visible yard area
- For apartment buildings, do NOT assume individual residents can rent out common areas or shared facilities

Please analyze this property and generate a comprehensive assessment of monetization opportunities with specific service provider recommendations and accurate valuations. Return your analysis as a JSON object with the following structure:
{
  "propertyType": "single_family|apartment|commercial|multi_family",
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

IMPORTANT: Make sure to provide complete information for ALL applicable categories. If data is limited, use reasonable estimates based on location and property type. Don't omit any relevant fields.`;
}

/**
 * Applies realistic constraints to the analysis based on property type
 */
function validateAndNormalizeAnalysis(analysis: PropertyAnalysis, detectedPropertyType: string | undefined): PropertyAnalysis {
  // Determine property type - either use the one provided by API or the one from the analysis
  const propertyType = detectedPropertyType || analysis.propertyType || 'single_family';
  
  // Apply constraints based on property type
  if (propertyType.toLowerCase().includes('apartment') || propertyType.toLowerCase() === 'multi_family') {
    // Apartments and multi-family homes have limited parking
    if (analysis.parking && analysis.parking.spaces > 3) {
      // Limit to reasonable number (1-2 spots per unit is typical)
      const originalSpaces = analysis.parking.spaces;
      analysis.parking.spaces = Math.min(3, originalSpaces);
      analysis.parking.revenue = Math.floor(analysis.parking.revenue * (analysis.parking.spaces / originalSpaces));
      
      // Update related opportunities
      const parkingOpportunityIndex = analysis.topOpportunities.findIndex(
        opp => opp.title.toLowerCase().includes('parking')
      );
      
      if (parkingOpportunityIndex >= 0) {
        analysis.topOpportunities[parkingOpportunityIndex].monthlyRevenue = analysis.parking.revenue;
        analysis.topOpportunities[parkingOpportunityIndex].description = 
          `Rent out ${analysis.parking.spaces} parking spaces at $${analysis.parking.rate} per day.`;
      }
      
      // Update property valuation
      if (analysis.propertyValuation) {
        const revenueDifference = analysis.parking.revenue - (originalSpaces * analysis.parking.rate * 30);
        analysis.propertyValuation.totalMonthlyRevenue += revenueDifference;
        analysis.propertyValuation.totalAnnualRevenue += (revenueDifference * 12);
      }
    }
  } else if (propertyType.toLowerCase() === 'single_family') {
    // Single family homes typically have limited parking (1-3 spaces)
    if (analysis.parking && analysis.parking.spaces > 3) {
      const originalSpaces = analysis.parking.spaces;
      analysis.parking.spaces = 2; // Default to 2 for single family
      analysis.parking.revenue = Math.floor(analysis.parking.revenue * (analysis.parking.spaces / originalSpaces));
      
      // Update related opportunities
      const parkingOpportunityIndex = analysis.topOpportunities.findIndex(
        opp => opp.title.toLowerCase().includes('parking')
      );
      
      if (parkingOpportunityIndex >= 0) {
        analysis.topOpportunities[parkingOpportunityIndex].monthlyRevenue = analysis.parking.revenue;
        analysis.topOpportunities[parkingOpportunityIndex].description = 
          `Rent out ${analysis.parking.spaces} parking spaces at $${analysis.parking.rate} per day.`;
      }
    }
  }
  
  // Ensure all necessary fields exist
  analysis.propertyType = propertyType;
  
  // Validate garden areas
  if (analysis.garden && !analysis.garden.area) {
    analysis.garden.area = 0;
  }
  
  // Validate rooftop data
  if (analysis.rooftop && !analysis.rooftop.area) {
    analysis.rooftop.area = 0;
  }
  
  return analysis;
}
