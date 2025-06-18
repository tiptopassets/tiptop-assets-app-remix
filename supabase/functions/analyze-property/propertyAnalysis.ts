
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const generatePropertyAnalysis = async (propertyInfo: any, imageAnalysis: any) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Generating property analysis with OpenAI...');
    
    const prompt = `
    Analyze this property for monetization opportunities:
    
    Property: ${propertyInfo.address}
    Coordinates: ${propertyInfo.coordinates ? `${propertyInfo.coordinates.lat}, ${propertyInfo.coordinates.lng}` : 'Not available'}
    Property Type: ${propertyInfo.propertyType || 'Residential'}
    
    ${imageAnalysis?.analysis ? `Image Analysis: ${imageAnalysis.analysis}` : ''}
    ${propertyInfo.solarData ? `Solar Data: ${JSON.stringify(propertyInfo.solarData)}` : ''}
    
    Provide a comprehensive analysis with realistic revenue estimates for:
    1. Rooftop/Solar opportunities
    2. Parking spaces
    3. Pool/recreational areas
    4. Storage space
    5. Internet bandwidth sharing
    6. Garden/outdoor space
    
    Return as JSON with this structure:
    {
      "propertyType": "Single Family Home|Apartment|Condo",
      "rooftop": {
        "area": number,
        "solarCapacity": number,
        "solarPotential": boolean,
        "revenue": number,
        "setupCost": number
      },
      "parking": {
        "spaces": number,
        "revenue": number,
        "evChargerPotential": boolean
      },
      "pool": {
        "present": boolean,
        "revenue": number
      },
      "storage": {
        "available": boolean,
        "revenue": number
      },
      "internet": {
        "revenue": number
      },
      "garden": {
        "area": number,
        "revenue": number,
        "opportunity": "High|Medium|Low"
      },
      "topOpportunities": [
        {
          "title": string,
          "monthlyRevenue": number,
          "setupCost": number,
          "roi": number,
          "description": string
        }
      ],
      "totalMonthlyRevenue": number,
      "totalOpportunities": number
    }
    `;

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
            content: 'You are a property monetization expert. Analyze properties and provide realistic revenue estimates. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Property analysis completed successfully');
    
    let analysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Fallback analysis
      analysis = {
        propertyType: propertyInfo.propertyType || 'Single Family Home',
        rooftop: { area: 1000, solarCapacity: 5, solarPotential: true, revenue: 150, setupCost: 15000 },
        parking: { spaces: 2, revenue: 100, evChargerPotential: true },
        pool: { present: false, revenue: 0 },
        storage: { available: true, revenue: 50 },
        internet: { revenue: 30 },
        garden: { area: 500, revenue: 75, opportunity: 'Medium' },
        topOpportunities: [
          { title: 'Solar Panels', monthlyRevenue: 150, setupCost: 15000, roi: 100, description: 'Install solar panels for energy savings' }
        ],
        totalMonthlyRevenue: 405,
        totalOpportunities: 6
      };
    }
    
    return analysis;
  } catch (error) {
    console.error('Error in property analysis:', error);
    throw error;
  }
};
