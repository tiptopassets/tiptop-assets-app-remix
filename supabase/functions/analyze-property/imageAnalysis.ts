
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const analyzeImage = async (imageBase64: string, address: string) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Starting enhanced image analysis with OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert property monetization analyst with specialized training in satellite imagery analysis. Your analysis directly impacts investment decisions worth thousands of dollars.

ANALYSIS FRAMEWORK:
1. ROOF ANALYSIS (Priority: Critical)
   - Measure roof area using visual reference points (cars ~15ft, swimming pools ~30ft)
   - Identify roof material, slope, orientation, and obstructions
   - Assess solar potential based on shading, orientation (south-facing ideal)
   - Rate roof condition: Excellent/Good/Fair/Poor

2. PARKING ASSESSMENT (Priority: High)
   - Count distinct parking spaces (driveway + street + garage)
   - Measure dimensions using reference objects
   - Assess accessibility and safety for renters
   - Identify EV charging potential (proximity to electrical)

3. PROPERTY FEATURES (Priority: Medium)
   - Pool detection and size estimation
   - Garden/yard space measurement
   - Storage building identification
   - Property boundary assessment

4. MONETIZATION READINESS (Priority: High)
   - Rate each asset's monetization potential: High/Medium/Low
   - Identify immediate barriers or requirements
   - Assess neighborhood suitability for each opportunity

MEASUREMENT STANDARDS:
- Use visual references: Cars (15ft), Houses (30-40ft width), Pools (20-30ft)
- Provide specific square footage estimates
- Include confidence levels for measurements

RESPONSE REQUIREMENTS:
- Be specific with numbers, not ranges
- Include confidence scores (0.1-1.0) for each assessment
- Identify any limitations or assumptions made`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this satellite image of property at ${address}. 

REQUIRED ANALYSIS:
1. Roof Analysis: Measure total roof area, assess condition, identify optimal solar zones
2. Parking Assessment: Count spaces, measure dimensions, assess rental suitability
3. Property Features: Detect pool, measure yard area, identify storage opportunities
4. Revenue Readiness: Rate each asset's monetization potential and identify barriers

Provide specific measurements in square feet and confidence scores for each assessment.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Enhanced image analysis completed successfully');
    
    return {
      analysis: data.choices[0].message.content,
      roofSize: 'Measured from satellite analysis',
      solarPotential: 'Assessed based on orientation and shading'
    };
  } catch (error) {
    console.error('Error in enhanced image analysis:', error);
    throw error;
  }
};
