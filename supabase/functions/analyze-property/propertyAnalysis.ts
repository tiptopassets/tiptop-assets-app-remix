
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
  
  const systemPrompt = createSystemPrompt(imageAnalysis);
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
  
  // Parse the raw GPT response
  const parsedAnalysis = extractStructuredData(content);
  
  // Enhance the analysis with precise calculated values
  return enhancePropertyAnalysis(parsedAnalysis, imageAnalysis);
}

/**
 * Creates the system prompt for OpenAI with enhanced precision instructions
 */
function createSystemPrompt(imageAnalysis: ImageAnalysis): string {
  return `You are a real estate and property monetization expert with deep knowledge of service providers and precise measurement analysis. Analyze this property information and identify specific monetization opportunities for the owner, with accurate and realistic valuation assessments. 

IMPORTANT: Always provide your calculation methodology and confidence scores. Be extremely transparent about your process.

Use these precise measurements from satellite image analysis as your primary data source:
${formatImageAnalysisForPrompt(imageAnalysis)}

Focus on:

1. Rooftop solar potential
   - Use the precise roof measurements provided: ${imageAnalysis.roofSize || 'unknown'} sq ft
   - Calculate solar capacity using this formula: 1 kW per 100 sq ft of usable roof space
   - Adjust based on roof orientation (${imageAnalysis.roofOrientation || 'unknown'}) and solar potential score (${imageAnalysis.solarPotentialScore || 'unknown'})
   - Monthly revenue formula: kW capacity × 120 avg kWh per kW × $0.10/kWh
   - Provide confidence score based on measurement confidence (${imageAnalysis.roofSizeConfidence || 'unknown'}%)
   - Recommend specific solar providers like SunRun, Tesla Solar, Sunpower
   - Calculate accurate setup costs ($2,000-3,000 per kW) and ROI timeline

2. Parking spaces rental
   - Use the precise parking count: ${imageAnalysis.parkingSpaces || 'unknown'} spaces
   - Use the parking dimensions: ${imageAnalysis.parkingLength || 'unknown'} × ${imageAnalysis.parkingWidth || 'unknown'} ft
   - Calculate monthly revenue based on location: urban ($200-400/mo), suburban ($100-200/mo), rural ($50-100/mo)
   - Adjust rates based on demand in the area (high/medium/low)
   - Suggest specific platforms like Neighbor, ParkingPanda, SpotHero
   - Evaluate EV charger potential and associated additional revenue ($50-100/mo per charger)

3. Garden/yard rental or urban farming
   - Use the precise garden measurements provided: ${imageAnalysis.gardenArea || 'unknown'} sq ft
   - Calculate rental potential based on $0.50-1.50 per sq ft annually
   - Adjust based on garden potential score (${imageAnalysis.gardenPotentialScore || 'unknown'})
   - Recommend platforms like Peerspace, YardYum
   - Estimate startup costs for different garden use cases

4. Swimming pool rental if present
   - Only include if pool is detected with high confidence (${imageAnalysis.poolConfidence || 'unknown'}%)
   - Calculate hourly rental rates based on pool size (${imageAnalysis.poolSize || 'unknown'} sq ft)
   - Estimate peak season monthly revenue (3-4 months per year)
   - Suggest platforms like Swimply
   - Include maintenance costs in calculations

5. Internet bandwidth sharing
   - Estimate potential revenue based on location ($5-50 per month)
   - Recommend services like Honeygain
   - Provide setup steps and requirements
   - Include typical earnings in the area

For each opportunity:
- Show your exact calculation methodology
- Provide confidence score based on measurement reliability
- Always include a range (low-high estimate) for revenue projections
- Include setup costs with specific dollar amounts
- Provide ROI timeline in months
- Suggest specific service providers

Be extremely realistic, data-driven, and transparent in your analysis. DO NOT exaggerate opportunities or include features that aren't clearly visible.`;
}

/**
 * Format the image analysis for inclusion in the prompt
 */
function formatImageAnalysisForPrompt(imageAnalysis: ImageAnalysis): string {
  const sections = [];
  
  sections.push(`ROOF ANALYSIS:
- Total roof area: ${imageAnalysis.roofSize || 'unknown'} sq ft (${imageAnalysis.roofSizeConfidence || 'unknown'}% confidence)
- Roof type: ${imageAnalysis.roofType || 'unknown'}
- Solar potential area: ${imageAnalysis.solarArea || 'unknown'} sq ft
- Roof orientation: ${imageAnalysis.roofOrientation || 'unknown'}
- Solar potential score: ${imageAnalysis.solarPotentialScore || 'unknown'}/100`);

  sections.push(`PARKING ANALYSIS:
- Number of spaces: ${imageAnalysis.parkingSpaces || 'unknown'} (${imageAnalysis.parkingConfidence || 'unknown'}% confidence)
- Average dimensions: ${imageAnalysis.parkingLength || 'unknown'} × ${imageAnalysis.parkingWidth || 'unknown'} ft`);

  sections.push(`GARDEN/YARD ANALYSIS:
- Total area: ${imageAnalysis.gardenArea || 'unknown'} sq ft (${imageAnalysis.gardenConfidence || 'unknown'}% confidence)
- Garden potential: ${imageAnalysis.gardenPotential || 'unknown'}`);

  if (imageAnalysis.poolPresent) {
    sections.push(`POOL ANALYSIS:
- Pool size: ${imageAnalysis.poolSize || 'unknown'} sq ft (${imageAnalysis.poolConfidence || 'unknown'}% confidence)
- Pool dimensions: ${imageAnalysis.poolLength || 'unknown'} × ${imageAnalysis.poolWidth || 'unknown'} ft
- Pool type: ${imageAnalysis.poolType || 'unknown'}`);
  }

  sections.push(`OVERALL MEASUREMENT RELIABILITY: ${imageAnalysis.overallReliability || 'unknown'}%`);

  if (imageAnalysis.measurementMethodology) {
    sections.push(`MEASUREMENT METHODOLOGY: ${imageAnalysis.measurementMethodology}`);
  }

  return sections.join('\n\n');
}

/**
 * Creates the user prompt for OpenAI with property and image analysis
 */
function createUserPrompt(propertyInfo: PropertyInfo, imageAnalysis: ImageAnalysis): string {
  return `Here is the property information: ${JSON.stringify(propertyInfo)}
    
I've analyzed the satellite image with precision measurements and here are the key findings:
${formatImageAnalysisForPrompt(imageAnalysis)}

Based on these precise measurements, please generate a comprehensive monetization assessment that:
1. Shows your exact calculation methodology for each revenue source
2. Assigns confidence scores to each revenue projection
3. Provides realistic revenue ranges based on available data
4. Identifies the most reliable/profitable opportunities
5. Recommends specific service providers with accurate setup costs and ROI timelines

For each revenue source, explicitly show how you calculated the monthly amounts based on the measurements, and provide a confidence score between 0-100% that reflects the reliability of the data and calculations.

Return your analysis as a JSON object with the structure I need, but make sure it includes confidence scores, calculation methodologies, and value ranges for each revenue source.`;
}

/**
 * Enhances the property analysis with additional calculated values
 */
function enhancePropertyAnalysis(analysis: PropertyAnalysis, imageAnalysis: ImageAnalysis): PropertyAnalysis {
  // Add confidence scores from image analysis
  if (analysis.rooftop) {
    analysis.rooftop.confidenceScore = imageAnalysis.roofSizeConfidence || null;
    analysis.rooftop.methodology = imageAnalysis.measurementMethodology || null;
  }
  
  if (analysis.parking) {
    analysis.parking.confidenceScore = imageAnalysis.parkingConfidence || null;
    analysis.parking.dimensions = {
      length: imageAnalysis.parkingLength || null,
      width: imageAnalysis.parkingWidth || null
    };
    analysis.parking.methodology = imageAnalysis.measurementMethodology || null;
  }
  
  if (analysis.garden) {
    analysis.garden.confidenceScore = imageAnalysis.gardenConfidence || null;
    analysis.garden.methodology = imageAnalysis.measurementMethodology || null;
  }
  
  if (analysis.pool && analysis.pool.present) {
    analysis.pool.confidenceScore = imageAnalysis.poolConfidence || null;
    analysis.pool.dimensions = {
      length: imageAnalysis.poolLength || null,
      width: imageAnalysis.poolWidth || null
    };
    analysis.pool.methodology = imageAnalysis.measurementMethodology || null;
  }
  
  // Add overall reliability score
  analysis.overallReliability = imageAnalysis.overallReliability || null;
  
  // Enhance top opportunities with confidence scores
  if (analysis.topOpportunities) {
    analysis.topOpportunities = analysis.topOpportunities.map(opportunity => {
      let confidenceScore = null;
      
      // Assign confidence scores based on opportunity type
      if (opportunity.title.toLowerCase().includes('solar') || opportunity.title.toLowerCase().includes('roof')) {
        confidenceScore = imageAnalysis.roofSizeConfidence || null;
      } else if (opportunity.title.toLowerCase().includes('parking')) {
        confidenceScore = imageAnalysis.parkingConfidence || null;
      } else if (opportunity.title.toLowerCase().includes('garden') || opportunity.title.toLowerCase().includes('yard')) {
        confidenceScore = imageAnalysis.gardenConfidence || null;
      } else if (opportunity.title.toLowerCase().includes('pool')) {
        confidenceScore = imageAnalysis.poolConfidence || null;
      }
      
      return {
        ...opportunity,
        confidenceScore
      };
    });
  }
  
  // If the analysis doesn't have an image summary but we have good image data,
  // create a comprehensive summary
  if (!analysis.imageAnalysisSummary && imageAnalysis.overallReliability) {
    const summaryParts = [];
    
    if (imageAnalysis.roofSize) {
      summaryParts.push(`${imageAnalysis.roofSize} sq ft ${imageAnalysis.roofType || ''} roof`);
    }
    
    if (imageAnalysis.parkingSpaces) {
      summaryParts.push(`${imageAnalysis.parkingSpaces} parking spaces`);
    }
    
    if (imageAnalysis.gardenArea) {
      summaryParts.push(`${imageAnalysis.gardenArea} sq ft garden/yard area`);
    }
    
    if (imageAnalysis.poolPresent && imageAnalysis.poolSize) {
      summaryParts.push(`${imageAnalysis.poolSize} sq ft ${imageAnalysis.poolType || ''} pool`);
    }
    
    if (summaryParts.length > 0) {
      analysis.imageAnalysisSummary = `Satellite image analysis detected: ${summaryParts.join(', ')}. Overall measurement reliability: ${imageAnalysis.overallReliability}%.`;
    }
  }
  
  return analysis;
}
