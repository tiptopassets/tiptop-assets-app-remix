import { PropertyInfo, ImageAnalysis, PropertyAnalysis } from './types.ts';
import { extractStructuredData } from './dataExtraction.ts';
import { validateAndCorrectRevenue, getMarketDataForValidation } from './marketDataValidator.ts';

const GPT_API_KEY = Deno.env.get('GPT') || '';

/**
 * Generates a comprehensive property analysis using OpenAI with enhanced validation
 */
export async function generatePropertyAnalysis(propertyInfo: PropertyInfo, imageAnalysis: ImageAnalysis): Promise<PropertyAnalysis> {
  if (!GPT_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }
  
  const systemPrompt = createEnhancedSystemPrompt();
  const userPrompt = createUserPrompt(propertyInfo, imageAnalysis);
  
  console.log('Calling OpenAI API for property analysis...');
  
  const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GPT_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
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
  let analysisData = extractStructuredData(content);
  
  // Apply market-based validation and corrections
  if (propertyInfo.coordinates) {
    analysisData = validateAndCorrectRevenue(
      analysisData, 
      propertyInfo.coordinates, 
      propertyInfo.propertyType || analysisData.propertyType
    );
  }
  
  // Apply final validation and realistic constraints
  return validateAndNormalizeAnalysis(analysisData, propertyInfo.propertyType);
}

/**
 * Creates an enhanced system prompt with explicit revenue constraints
 */
function createEnhancedSystemPrompt(): string {
  return `You are a real estate and property monetization expert with deep knowledge of service providers. Analyze this property information and identify specific monetization opportunities for the owner, with STRICTLY ACCURATE and realistic valuation assessments.

CRITICAL REVENUE CONSTRAINTS - DO NOT EXCEED THESE LIMITS:

SOLAR REVENUE LIMITS:
- Residential properties: MAXIMUM $200/month
- Commercial properties: MAXIMUM $500/month
- Calculate as: (roof_area_sqft × 0.7 usable × 15W per sqft × 4 hours × 30 days × $0.15/kWh) / 1000
- Example: 1500 sqft roof = 1050 usable × 15W = 15.75kW × 4h × 30d = 1890 kWh × $0.15 = $284/month (too high, cap at $200)

PARKING REVENUE LIMITS:
- MAXIMUM rate: $50/day per space
- Residential homes: MAXIMUM 3 spaces
- Commercial properties: MAXIMUM 20 spaces
- Calculate as: spaces × daily_rate × 20_days_per_month
- Example: 2 spaces × $15/day × 20 days = $600/month (acceptable)
- Example: 5 spaces × $25/day × 20 days = $2500/month (too high, reduce spaces to 3 max)

POOL REVENUE LIMITS:
- MAXIMUM $800/month for any pool
- Calculate based on pool size and local demand
- Example: 400 sqft pool = max $400/month

OTHER LIMITS:
- Garden rental: MAXIMUM $200/month
- Internet bandwidth: MAXIMUM $50/month
- Storage space: MAXIMUM $300/month

PROPERTY TYPE DETECTION:
First determine if the property is:
1. Single-family home (1-3 parking spaces max, roof access likely)
2. Apartment/Condo (1-2 parking spaces max, no roof access typically)
3. Commercial property (5-20 parking spaces max, large roof potential)
4. Multi-family (varies by units)

Your analysis MUST be appropriate for the correct property type and NEVER exceed the revenue limits above.

For each opportunity, provide highly specific estimates based on what you can realistically see:
- BE EXTREMELY REALISTIC AND CONSERVATIVE with counts and measurements
- Installation/setup costs with dollar amounts
- Monthly revenue potential within the strict limits above
- Recommended service providers with URLs
- Any regulatory considerations or permits required
- ROI timeline in months

EXAMPLE REALISTIC OUTPUTS:
- Single-family home solar: $120/month (not $12,000)
- Driveway parking (2 spaces): $400/month (not $4,000)
- Pool rental: $300/month (not $6,000)

Your analysis must be data-driven, realistic, actionable, and stay within all revenue constraints. DO NOT exaggerate opportunities.`;
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

  // Add market context if coordinates are available
  let marketContext = "";
  if (propertyInfo.coordinates) {
    const marketData = getMarketDataForValidation(propertyInfo.coordinates);
    marketContext = `

MARKET CONTEXT FOR THIS LOCATION:
- Average parking rate in area: $${marketData.parkingRates}/day
- Solar savings potential: $${marketData.solarSavings}/month average
- Market trend: ${marketData.marketTrend}

Use this market data to inform your revenue estimates and ensure they align with local conditions.`;
  }

  return `Here is the property information: ${JSON.stringify(propertyInfo)}
    
Here is the satellite image analysis: ${JSON.stringify(imageAnalysis)}

IMPORTANT: Based on the address and image analysis, the property appears to be a "${propertyTypeHint}" type, but make your own determination.

${marketContext}

CRITICAL RULES - THESE ARE NON-NEGOTIABLE:
- Solar revenue: MAX $200/month residential, MAX $500/month commercial
- Parking rates: MAX $50/day per space
- Parking spaces: MAX 3 for residential, MAX 20 for commercial
- Pool revenue: MAX $800/month
- For parking: calculate as (spaces × daily_rate × 20_days), cap total at $1000/month
- For solar: use realistic calculations based on roof size, never exceed caps

EXAMPLES OF CORRECT OUTPUTS:
- 1800 sqft residential roof → $150/month solar revenue
- 2 parking spaces at $20/day → $800/month parking revenue
- 500 sqft pool → $350/month rental revenue

Please analyze this property and generate a comprehensive assessment with realistic valuations that stay within all limits. Return your analysis as a JSON object with the following structure:

{
  "propertyType": "single_family|apartment|commercial|multi_family",
  "amenities": ["array", "of", "amenities"],
  "rooftop": { 
    "area": number_in_sqft, 
    "type": "flat/pitched/etc",
    "solarCapacity": kilowatts, 
    "solarPotential": boolean,
    "revenue": dollars_per_month_MAX_200_residential_500_commercial,
    "providers": [...]
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
    "spaces": number_MAX_3_residential_20_commercial, 
    "rate": dollars_per_day_MAX_50, 
    "revenue": dollars_per_month_calculated_correctly,
    "evChargerPotential": boolean,
    "providers": [
      {"name": "Provider Name", "setupCost": dollars, "roi": months, "url": "provider_url"}
    ]
  },
  "pool": { 
    "present": boolean, 
    "area": number_in_sqft, 
    "type": "inground/above-ground", 
    "revenue": dollars_per_month_MAX_800,
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

REMEMBER: All revenue values must be realistic and within the specified limits!`;
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
