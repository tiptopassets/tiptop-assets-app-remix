
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const analyzeImage = async (imageBase64: string, address: string) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Starting image analysis with OpenAI...');
    
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this satellite image of the property at ${address}. Extract details about:
                - Roof size and condition
                - Solar panel potential
                - Parking spaces/driveway
                - Pool presence
                - Garden/yard area
                - Any other monetizable features
                
                Provide specific measurements and assessments.`
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
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI analysis completed successfully');
    
    return {
      analysis: data.choices[0].message.content,
      roofSize: 'Estimated from analysis',
      solarPotential: 'Determined from analysis'
    };
  } catch (error) {
    console.error('Error in image analysis:', error);
    throw error;
  }
};
