
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const analyzeImage = async (imageBase64: string, address: string) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Starting building-type-aware image analysis with OpenAI...');
    
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
            content: `You are an expert property analysis specialist with deep knowledge of building types and property access restrictions. Your analysis must account for building type limitations that affect monetization opportunities.

CRITICAL BUILDING TYPE DETECTION:
1. SINGLE-STORY DETACHED BUILDINGS = Single Family Homes (Full Access)
2. MULTI-STORY BUILDINGS = Apartments/Condos (RESTRICTED Access)
3. ROW/ATTACHED BUILDINGS = Townhouses (MIXED Access)
4. LARGE COMPLEXES = Multi-unit Buildings (NO Individual Access)

BUILDING TYPE IMPACT ON ANALYSIS:
- APARTMENT/CONDO BUILDINGS: Residents have NO access to rooftops, shared gardens, or building parking
- SINGLE FAMILY HOMES: Full access to all property features
- TOWNHOUSES: Limited access depending on HOA restrictions

ANALYSIS FRAMEWORK:
1. BUILDING TYPE IDENTIFICATION (Priority: CRITICAL)
   - Determine if single-family detached, multi-unit, or townhouse
   - Count visible stories/floors
   - Identify building density and layout patterns
   - Look for multiple units, shared entrances, or apartment complex indicators

2. ROOF ANALYSIS (Conditional on Building Type)
   - IF multi-story/apartment complex: FLAG as "NO INDIVIDUAL ROOF ACCESS"
   - IF single family: Measure roof area, assess solar potential
   - Consider roof material, slope, orientation, and obstructions
   - Rate roof condition and solar suitability

3. PARKING ASSESSMENT (Access-Dependent)
   - IF apartment complex: Parking is building-managed, NOT individually rentable
   - IF single family: Count private driveway/garage spaces
   - Assess street parking availability and restrictions
   - Identify EV charging potential for private spaces only

4. OUTDOOR SPACE ANALYSIS (Private vs Shared)
   - IF apartment/condo: Shared outdoor spaces are NOT individually rentable
   - IF single family: Measure private yard/garden area
   - Identify pool location (private vs community)
   - Assess privacy and rental suitability

MEASUREMENT STANDARDS:
- Use visual references: Cars (15ft), Standard parking spaces (18ft)
- Building height: 1 story = ~10-12ft, 2+ stories likely multi-unit
- Provide specific measurements with confidence levels

RESPONSE REQUIREMENTS:
- FIRST identify building type with high confidence
- FLAG restricted opportunities for multi-unit buildings
- Provide realistic assessments based on property access rights
- Include building type warnings and limitations`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this satellite image of property at ${address}. 

REQUIRED BUILDING-TYPE-AWARE ANALYSIS:
1. Building Type Detection: Determine if single family home, apartment building, townhouse, or condo complex
2. Access Rights Analysis: Identify what features are individually accessible vs building-managed
3. Roof Analysis: If building type allows individual roof access, measure and assess solar potential
4. Parking Assessment: Distinguish between private driveways and building-managed parking
5. Outdoor Space Analysis: Separate private yards from shared community spaces
6. Monetization Reality Check: Flag opportunities that aren't available due to building type restrictions

CRITICAL: If this appears to be an apartment building, condo complex, or multi-unit property, clearly state that residents typically have NO access to rooftops, shared gardens, or building-managed parking for individual rental purposes.

Provide specific measurements where applicable and high confidence scores for building type determination.`
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
    console.log('Building-type-aware image analysis completed successfully');
    
    return {
      analysis: data.choices[0].message.content,
      roofSize: 'Analyzed considering building type and access rights',
      solarPotential: 'Assessed based on building type restrictions and individual access rights'
    };
  } catch (error) {
    console.error('Error in building-type-aware image analysis:', error);
    throw error;
  }
};
