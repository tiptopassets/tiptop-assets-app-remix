const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export const analyzeStreetViewImage = async (streetViewBase64: string, address: string) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('🚗 Starting comprehensive Street View analysis with OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert property analysis specialist. Analyze the property image and provide detailed classification in JSON format.

PROPERTY TYPE DETECTION:
1. RESIDENTIAL: Single family homes, apartments, condos, townhouses
2. COMMERCIAL: Retail stores, offices, restaurants, hotels  
3. INDUSTRIAL: Warehouses, factories, manufacturing
4. VACANT LAND: Empty lots, undeveloped land, agricultural
5. INSTITUTIONAL: Schools, hospitals, government buildings

For multi-unit buildings, carefully distinguish:
- APARTMENT BUILDINGS: Multiple units, shared entrances, balconies
- SINGLE FAMILY HOMES: Detached houses with individual entrances

RESPONSE FORMAT: Return valid JSON only with your analysis.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this Street View image of property at ${address}. 

REQUIRED COMPREHENSIVE ANALYSIS:
1. Property Type Classification: Determine if residential (single/multi-family), commercial (retail/office/hospitality), industrial, vacant land, or special use
2. Building Assessment: Count buildings, estimate size, assess condition and architectural style
3. Land Analysis: Estimate lot size, assess development density, note landscaping and features
4. Commercial Potential: Evaluate location advantages, visibility, accessibility, and market factors
5. Monetization Opportunities: Identify ALL potential revenue streams based on property type and location
6. Zoning and Regulatory: Assess likely zoning and any visible regulatory constraints
7. Market Context: Note surrounding area characteristics and competitive landscape

ANALYSIS REQUIREMENTS - Return as JSON:
1. Property Type Classification: residential, commercial, industrial, vacant_land, institutional
2. Building Details: Count units/buildings, estimate size, assess condition
3. Multi-Unit Detection: Look for apartment buildings, condo complexes
4. Access Assessment: Individual vs shared property control
5. Revenue Opportunities: Based on property type and access rights

Provide detailed observations in JSON format about the property characteristics.
              },
              {
                type: 'image_url',
                image_url: {
                  url: streetViewBase64
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('OpenAI API error: ' + (errorData.error?.message || 'Unknown error'));
    }

    const data = await response.json();
    console.log('✅ Comprehensive Street View analysis completed');
    
    return {
      analysis: data.choices[0].message.content,
      source: 'street_view',
      analysisType: 'comprehensive_property_classification'
    };
  } catch (error) {
    console.error('Error in Street View analysis:', error);
    throw error;
  }
};

export const gatherEnhancedPropertyData = async (
  address: string, 
  coordinates: google.maps.LatLngLiteral, 
  apiKey: string
) => {
  const enhancedData: any = {
    nearbyPlaces: [],
    areaAnalysis: {},
    zoningHints: [],
    marketFactors: {}
  };

  try {
    // Get nearby places for context analysis
    console.log('🗺️ Gathering nearby places data...');
    const nearbyUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + coordinates.lat + ',' + coordinates.lng + '&radius=500&key=' + apiKey;
    const nearbyResponse = await fetch(nearbyUrl);
    
    if (nearbyResponse.ok) {
      const nearbyData = await nearbyResponse.json();
      enhancedData.nearbyPlaces = nearbyData.results?.slice(0, 20) || [];
      
      // Analyze area characteristics from nearby places
      enhancedData.areaAnalysis = analyzeAreaCharacteristics(enhancedData.nearbyPlaces);
    }

    // Get detailed place information if we have a place_id
    console.log('📍 Getting detailed place information...');
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + apiKey;
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (geocodeResponse.ok) {
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.results?.[0]) {
        const result = geocodeData.results[0];
        enhancedData.placeDetails = {
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components,
          types: result.types,
          geometry: result.geometry
        };
        
        // Extract zoning hints from address components
        enhancedData.zoningHints = extractZoningHints(result.address_components, result.types);
      }
    }

    // Analyze market factors based on location and nearby businesses
    enhancedData.marketFactors = analyzeMarketFactors(enhancedData.nearbyPlaces, coordinates);

    console.log('✅ Enhanced property data gathering completed');
    return enhancedData;
    
  } catch (error) {
    console.error('❌ Error gathering enhanced property data:', error);
    return enhancedData; // Return partial data even if some requests fail
  }
};

const analyzeAreaCharacteristics = (nearbyPlaces: any[]) => {
  const placeTypes = nearbyPlaces.flatMap(place => place.types || []);
  const typeCount = placeTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    predominantTypes: Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count })),
    
    commercialDensity: placeTypes.filter(type => 
      ['store', 'restaurant', 'shopping_mall', 'gas_station', 'bank'].includes(type)
    ).length,
    
    residentialIndicators: placeTypes.filter(type => 
      ['neighborhood', 'sublocality', 'residential'].includes(type)
    ).length,
    
    industrialIndicators: placeTypes.filter(type => 
      ['industrial', 'warehouse', 'factory'].includes(type)
    ).length,
    
    institutionalPresence: placeTypes.filter(type => 
      ['school', 'hospital', 'government', 'library', 'church'].includes(type)
    ).length
  };
};

const extractZoningHints = (addressComponents: any[], types: string[]) => {
  const hints = [];
  
  // Check for commercial indicators in types
  if (types.some(type => ['establishment', 'point_of_interest'].includes(type))) {
    hints.push('Commercial zoning likely');
  }
  
  // Check for residential indicators
  if (types.some(type => ['premise', 'street_address'].includes(type)) && 
      !types.some(type => ['establishment', 'point_of_interest'].includes(type))) {
    hints.push('Residential zoning likely');
  }
  
  // Check address components for zoning clues
  const administrativeAreas = addressComponents.filter(comp => 
    comp.types.includes('administrative_area_level_2') || 
    comp.types.includes('locality')
  );
  
  administrativeAreas.forEach(area => {
    if (area.long_name.toLowerCase().includes('industrial')) {
      hints.push('Industrial zoning possible');
    }
    if (area.long_name.toLowerCase().includes('commercial')) {
      hints.push('Commercial zoning possible');
    }
  });
  
  return hints;
};

const analyzeMarketFactors = (nearbyPlaces: any[], coordinates: google.maps.LatLngLiteral) => {
  const factors = {
    accessibility: 0,
    commercialActivity: 0,
    touristAttraction: 0,
    residentialDensity: 0,
    parkingDemand: 0,
    eventVenues: 0
  };
  
  nearbyPlaces.forEach(place => {
    const types = place.types || [];
    const rating = place.rating || 0;
    const userRatingsTotal = place.user_ratings_total || 0;
    
    // Accessibility factors
    if (types.includes('transit_station') || types.includes('bus_station')) {
      factors.accessibility += 2;
    }
    if (types.includes('parking')) {
      factors.parkingDemand += 1;
    }
    
    // Commercial activity
    if (types.includes('shopping_mall') || types.includes('department_store')) {
      factors.commercialActivity += 3;
    }
    if (types.includes('restaurant') || types.includes('store')) {
      factors.commercialActivity += 1;
    }
    
    // Tourist attractions
    if (types.includes('tourist_attraction') || types.includes('museum')) {
      factors.touristAttraction += rating > 4 ? 3 : 2;
    }
    if (types.includes('amusement_park') || types.includes('zoo')) {
      factors.touristAttraction += 4;
    }
    
    // Residential density
    if (types.includes('residential') || types.includes('neighborhood')) {
      factors.residentialDensity += 1;
    }
    
    // Event venues
    if (types.includes('stadium') || types.includes('convention_center')) {
      factors.eventVenues += 4;
    }
    if (types.includes('movie_theater') || types.includes('bowling_alley')) {
      factors.eventVenues += 2;
    }
  });
  
  return factors;
};