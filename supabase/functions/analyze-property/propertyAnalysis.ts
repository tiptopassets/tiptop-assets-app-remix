
import { PropertyInfo, ImageAnalysis, AnalysisResults } from './types.ts';

const GPT_API_KEY = Deno.env.get('GPT') || '';

export async function generatePropertyAnalysis(
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis
): Promise<AnalysisResults> {
  if (!GPT_API_KEY) {
    console.error('OpenAI API key not found, using fallback analysis');
    return generateFallbackAnalysis(propertyInfo, imageAnalysis);
  }

  try {
    console.log('Calling OpenAI API for enhanced property analysis...');
    
    // Enhanced prompt for better property understanding
    const analysisPrompt = `You are an expert property analyst specializing in monetization opportunities. 
    Analyze the following property data and provide accurate revenue estimates.

    Property Information:
    - Address: ${propertyInfo.address}
    - Coordinates: ${propertyInfo.coordinates ? `${propertyInfo.coordinates.lat}, ${propertyInfo.coordinates.lng}` : 'Not available'}
    - Property Details: ${JSON.stringify(propertyInfo.details || {})}
    
    ${propertyInfo.solarData ? `
    Google Solar API Data (REAL DATA - USE THIS):
    - Total Roof Area: ${propertyInfo.solarData.roofTotalAreaSqFt} sq ft
    - Usable Roof Area: ${propertyInfo.solarData.roofUsableAreaSqFt} sq ft
    - Solar Capacity: ${propertyInfo.solarData.maxSolarCapacityKW} kW
    - Annual Energy: ${propertyInfo.solarData.yearlyEnergyKWh} kWh
    - Panel Count: ${propertyInfo.solarData.panelsCount}
    - Monthly Revenue: $${propertyInfo.solarData.monthlyRevenue}
    - Setup Cost: $${propertyInfo.solarData.setupCost}
    - Payback: ${propertyInfo.solarData.paybackYears} years
    ` : ''}

    ${imageAnalysis.fullAnalysis ? `
    Image Analysis Results:
    ${imageAnalysis.fullAnalysis}
    
    Extracted Measurements:
    - Roof Size: ${imageAnalysis.roofSize || 'Not detected'} sq ft
    - Roof Type: ${imageAnalysis.roofType || 'Unknown'}
    - Solar Potential: ${imageAnalysis.solarPotential || 'Unknown'}
    - Parking Spaces: ${imageAnalysis.parkingSpaces || 'Not detected'}
    - Garden Area: ${imageAnalysis.gardenArea || 'Not detected'} sq ft
    - Pool Present: ${imageAnalysis.poolPresent ? 'Yes' : 'No'}
    ` : ''}

    CRITICAL INSTRUCTIONS:
    1. If Google Solar API data is provided, USE THOSE EXACT VALUES for roof area and solar calculations
    2. Determine property type based on address and context (single-family, multi-family, commercial, etc.)
    3. Estimate parking spaces based on property type: single-family (2-4 spaces), multi-family (1.5x units), commercial (varies)
    4. Use location-aware pricing: research typical rates for the area
    5. Be realistic about revenue estimates - avoid overestimation
    6. Include setup costs and ROI calculations
    7. Consider local regulations and restrictions

    Property Type Classification:
    - Analyze address components to determine if residential, commercial, or mixed-use
    - Single-family: typically 2-4 parking spaces, moderate garden potential
    - Multi-family: parking per unit ratio, limited individual garden space
    - Commercial: variable parking, potential for different monetization strategies

    Respond with a detailed JSON object following this exact structure:
    {
      "propertyType": "single-family|multi-family|commercial|mixed-use",
      "amenities": ["list of detected amenities"],
      "rooftop": {
        "area": number (use Google Solar API if available, otherwise estimate),
        "type": "flat|pitched|mixed",
        "solarCapacity": number (kW),
        "solarPotential": boolean,
        "revenue": number (monthly),
        "usingRealSolarData": boolean,
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "garden": {
        "area": number (sq ft),
        "opportunity": "High|Medium|Low",
        "revenue": number (monthly),
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "parking": {
        "spaces": number (realistic based on property type),
        "rate": number (daily rate based on location),
        "revenue": number (monthly),
        "evChargerPotential": boolean,
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "pool": {
        "present": boolean,
        "area": number (sq ft),
        "type": "in-ground|above-ground|spa",
        "revenue": number (monthly),
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "storage": {
        "volume": number (cubic feet),
        "revenue": number (monthly),
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "bandwidth": {
        "available": number (Mbps),
        "revenue": number (monthly),
        "providers": [{"name": "string", "setupCost": number, "fee": "string", "url": "string"}]
      },
      "shortTermRental": {
        "nightlyRate": number,
        "monthlyProjection": number,
        "providers": [{"name": "string", "setupCost": number, "roi": number, "url": "string"}]
      },
      "permits": ["list of required permits"],
      "restrictions": "string describing any limitations",
      "topOpportunities": [
        {
          "icon": "solar|parking|pool|internet|storage|garden",
          "title": "string",
          "monthlyRevenue": number,
          "description": "string",
          "provider": "string",
          "setupCost": number,
          "roi": number (months),
          "formFields": [
            {
              "type": "text|number|select|checkbox",
              "name": "string",
              "label": "string",
              "value": "string|number",
              "options": ["array for select fields"]
            }
          ]
        }
      ],
      "imageAnalysisSummary": "string summarizing what was detected",
      "propertyValuation": {
        "totalMonthlyRevenue": number,
        "totalAnnualRevenue": number,
        "totalSetupCosts": number,
        "averageROI": number (months),
        "bestOpportunity": "string"
      }
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional property monetization analyst. Provide accurate, realistic revenue estimates based on market data and property characteristics. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Raw GPT response:', content);

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in GPT response');
    }

    const analysisResults = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the results
    return validateAndEnhanceResults(analysisResults, propertyInfo, imageAnalysis);
    
  } catch (error) {
    console.error('Error in GPT property analysis:', error);
    return generateFallbackAnalysis(propertyInfo, imageAnalysis);
  }
}

function validateAndEnhanceResults(
  results: any,
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis
): AnalysisResults {
  // Ensure all required fields exist with proper defaults
  const validated: AnalysisResults = {
    propertyType: results.propertyType || 'single-family',
    amenities: results.amenities || [],
    rooftop: {
      area: results.rooftop?.area || 1500,
      type: results.rooftop?.type || 'pitched',
      solarCapacity: results.rooftop?.solarCapacity || 0,
      solarPotential: results.rooftop?.solarPotential || false,
      revenue: results.rooftop?.revenue || 0,
      usingRealSolarData: !!propertyInfo.solarData,
      providers: results.rooftop?.providers || []
    },
    garden: {
      area: results.garden?.area || 0,
      opportunity: results.garden?.opportunity || 'Low',
      revenue: results.garden?.revenue || 0,
      providers: results.garden?.providers || []
    },
    parking: {
      spaces: results.parking?.spaces || 2,
      rate: results.parking?.rate || 10,
      revenue: results.parking?.revenue || 0,
      evChargerPotential: results.parking?.evChargerPotential || false,
      providers: results.parking?.providers || []
    },
    pool: {
      present: results.pool?.present || false,
      area: results.pool?.area || 0,
      type: results.pool?.type || '',
      revenue: results.pool?.revenue || 0,
      providers: results.pool?.providers || []
    },
    storage: {
      volume: results.storage?.volume || 0,
      revenue: results.storage?.revenue || 0,
      providers: results.storage?.providers || []
    },
    bandwidth: {
      available: results.bandwidth?.available || 0,
      revenue: results.bandwidth?.revenue || 0,
      providers: results.bandwidth?.providers || []
    },
    shortTermRental: {
      nightlyRate: results.shortTermRental?.nightlyRate || 0,
      monthlyProjection: results.shortTermRental?.monthlyProjection || 0,
      providers: results.shortTermRental?.providers || []
    },
    permits: results.permits || [],
    restrictions: results.restrictions || null,
    topOpportunities: results.topOpportunities || [],
    imageAnalysisSummary: results.imageAnalysisSummary || '',
    propertyValuation: results.propertyValuation || {
      totalMonthlyRevenue: 0,
      totalAnnualRevenue: 0,
      totalSetupCosts: 0,
      averageROI: 0,
      bestOpportunity: ''
    }
  };

  // If we have real solar data, update the rooftop section
  if (propertyInfo.solarData) {
    validated.rooftop = {
      ...validated.rooftop,
      area: propertyInfo.solarData.roofTotalAreaSqFt,
      solarCapacity: propertyInfo.solarData.maxSolarCapacityKW,
      solarPotential: propertyInfo.solarData.solarPotential,
      revenue: propertyInfo.solarData.monthlyRevenue,
      usingRealSolarData: true,
      panelsCount: propertyInfo.solarData.panelsCount,
      yearlyEnergyKWh: propertyInfo.solarData.yearlyEnergyKWh,
      setupCost: propertyInfo.solarData.setupCost
    };
  }

  return validated;
}

function generateFallbackAnalysis(
  propertyInfo: PropertyInfo,
  imageAnalysis: ImageAnalysis
): AnalysisResults {
  // Generate basic fallback analysis when GPT is not available
  const fallbackAnalysis: AnalysisResults = {
    propertyType: 'single-family',
    amenities: [],
    rooftop: {
      area: imageAnalysis.roofSize || 1500,
      type: imageAnalysis.roofType || 'pitched',
      solarCapacity: 8,
      solarPotential: true,
      revenue: 120,
      usingRealSolarData: !!propertyInfo.solarData,
      providers: [
        { name: 'SunRun', setupCost: 15000, roi: 8, url: 'https://www.sunrun.com' }
      ]
    },
    garden: {
      area: imageAnalysis.gardenArea || 500,
      opportunity: 'Medium',
      revenue: 50,
      providers: [
        { name: 'Neighbor', setupCost: 0, roi: 0, url: 'https://www.neighbor.com' }
      ]
    },
    parking: {
      spaces: imageAnalysis.parkingSpaces || 2,
      rate: 10,
      revenue: 150,
      evChargerPotential: true,
      providers: [
        { name: 'Neighbor', setupCost: 0, roi: 0, url: 'https://www.neighbor.com' }
      ]
    },
    pool: {
      present: imageAnalysis.poolPresent || false,
      area: imageAnalysis.poolSize || 0,
      type: imageAnalysis.poolType || '',
      revenue: imageAnalysis.poolPresent ? 200 : 0,
      providers: imageAnalysis.poolPresent ? [
        { name: 'Swimply', setupCost: 0, roi: 0, url: 'https://www.swimply.com' }
      ] : []
    },
    storage: {
      volume: 0,
      revenue: 0,
      providers: []
    },
    bandwidth: {
      available: 100,
      revenue: 20,
      providers: [
        { name: 'Honeygain', setupCost: 0, fee: 'Free', url: 'https://www.honeygain.com' }
      ]
    },
    shortTermRental: {
      nightlyRate: 0,
      monthlyProjection: 0,
      providers: []
    },
    permits: [],
    restrictions: null,
    topOpportunities: [
      {
        icon: 'solar',
        title: 'Solar Panel Installation',
        monthlyRevenue: 120,
        description: 'Install solar panels to generate clean energy and reduce electricity costs.',
        provider: 'SunRun',
        setupCost: 15000,
        roi: 8,
        formFields: []
      }
    ],
    imageAnalysisSummary: 'Fallback analysis used due to API limitations.',
    propertyValuation: {
      totalMonthlyRevenue: 340,
      totalAnnualRevenue: 4080,
      totalSetupCosts: 15000,
      averageROI: 8,
      bestOpportunity: 'Solar Panel Installation'
    }
  };

  // Update with real solar data if available
  if (propertyInfo.solarData) {
    fallbackAnalysis.rooftop = {
      ...fallbackAnalysis.rooftop,
      area: propertyInfo.solarData.roofTotalAreaSqFt,
      solarCapacity: propertyInfo.solarData.maxSolarCapacityKW,
      solarPotential: propertyInfo.solarData.solarPotential,
      revenue: propertyInfo.solarData.monthlyRevenue,
      usingRealSolarData: true
    };
  }

  return fallbackAnalysis;
}
