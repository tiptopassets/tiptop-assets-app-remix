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
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert property analysis specialist with comprehensive knowledge of all property types including residential, commercial, industrial, and vacant land. Your analysis must provide detailed property classification and comprehensive assessment.

COMPREHENSIVE PROPERTY TYPE DETECTION:
1. RESIDENTIAL PROPERTIES:
   - Single Family Homes: Detached houses with individual lots
   - Multi-Family: Apartments, condos, townhouses, duplexes
   - Mixed Residential: Buildings with residential and commercial use
   
2. COMMERCIAL PROPERTIES:
   - Retail: Stores, shops, malls, restaurants
   - Office: Business buildings, professional services
   - Hospitality: Hotels, motels, short-term rentals
   - Mixed Commercial: Multiple commercial uses
   
3. INDUSTRIAL PROPERTIES:
   - Manufacturing: Factories, production facilities
   - Warehouses: Storage and distribution centers
   - Utilities: Power plants, substations, treatment facilities
   
4. VACANT LAND:
   - Undeveloped: Raw land, empty lots
   - Agricultural: Farms, ranches, crop land
   - Development Sites: Cleared land ready for construction
   
5. SPECIAL USE PROPERTIES:
   - Institutional: Schools, hospitals, government buildings
   - Transportation: Airports, train stations, parking facilities
   - Recreation: Parks, sports facilities, entertainment venues

COMPREHENSIVE ANALYSIS FRAMEWORK:
1. PROPERTY TYPE IDENTIFICATION (Critical Priority)
   - Identify primary use and secondary uses if mixed-use
   - Assess building age, condition, and architectural style
   - Determine zoning implications and permitted uses
   
2. BUILDING AND LAND ASSESSMENT
   - Count buildings, stories, and estimate square footage
   - Assess land area and development density
   - Identify parking availability and configuration
   - Note landscaping, outdoor amenities, and site features
   
3. COMMERCIAL VIABILITY ANALYSIS
   - Assess location for foot traffic and visibility
   - Evaluate proximity to major roads, public transportation
   - Note nearby businesses and commercial activity level
   - Identify signage opportunities and advertising potential
   
4. MONETIZATION OPPORTUNITIES ASSESSMENT
   - Evaluate all potential revenue streams based on property type
   - Consider both traditional and innovative income sources
   - Assess regulatory and zoning constraints
   - Factor in market demand and competition

RESPONSE REQUIREMENTS:
- Provide detailed property type classification with confidence levels
- Identify ALL potential monetization opportunities
- Include building characteristics, land features, and location advantages
- Assess commercial potential and market factors
- Note any unique features or special use potential`
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

CRITICAL: Provide comprehensive classification that goes beyond just "residential" or "commercial" - identify specific subtypes and mixed-use potential. Consider all innovative monetization opportunities including but not limited to:
- Traditional rentals and leases
- Parking and storage solutions
- Solar and renewable energy
- Advertising and signage
- Event hosting and entertainment
- Agricultural and gardening uses
- Telecommunications and utilities
- Short-term and specialty rentals

Provide specific observations about the property's unique characteristics and revenue potential.`
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
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
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
    const nearbyResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=500&key=${apiKey}`
    );
    
    if (nearbyResponse.ok) {
      const nearbyData = await nearbyResponse.json();
      enhancedData.nearbyPlaces = nearbyData.results?.slice(0, 20) || [];
      
      // Analyze area characteristics from nearby places
      enhancedData.areaAnalysis = analyzeAreaCharacteristics(enhancedData.nearbyPlaces);
    }

    // Get detailed place information if we have a place_id
    console.log('📍 Getting detailed place information...');
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
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