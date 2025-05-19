
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { corsHeaders } from '../_shared/cors.ts';

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Define interfaces for the response types
interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  pitchDegrees: number;
  azimuthDegrees: number;
}

interface SolarPotentialResponse {
  solarPotential: {
    maxArrayPanelsCount: number;
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    panels: {
      center: {
        latitude: number;
        longitude: number;
      };
      orientation: string;
      yearlyEnergyDcKwh: number;
    }[];
    solarPanelConfigs: SolarPanelConfig[];
    financialAnalysis: {
      initialAcKwhPerYear: number;
      remainingLifetimeUtilityBill: {
        currencyCode: string;
        units: string;
        nanos: number;
      };
      federalIncentiveValue: {
        currencyCode: string;
        units: string;
        nanos: number;
      };
      panelLifetimeYears: number;
    };
  };
  roofs: {
    areaMeters2: number;
    centerPoint: {
      latitude: number;
      longitude: number;
    };
    pitchDegrees: number;
    azimuthDegrees: number;
    sunshineQuantiles: number[];
    boundingBox: {
      sw: {
        latitude: number;
        longitude: number;
      };
      ne: {
        latitude: number;
        longitude: number;
      };
    };
  }[];
}

interface SolarApiRequest {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, coordinates }: SolarApiRequest = await req.json();
    
    if (!address && !coordinates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either address or coordinates must be provided'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Maps API key is not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // First get coordinates if only address was provided
    let locationCoordinates = coordinates;
    let countryCode = null;
    
    if (!locationCoordinates && address) {
      try {
        // Geocode the address to get coordinates
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodeResponse.json();
        console.log('Geocode API response status:', geocodeData.status);
        
        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          locationCoordinates = { lat: location.lat, lng: location.lng };
          
          // Check if the country is supported by Google Solar API
          const addressComponents = geocodeData.results[0].address_components || [];
          const countryComponent = addressComponents.find(
            (component: any) => component.types.includes('country')
          );
          
          // Google Solar API currently only supports certain countries fully
          // As of 2025, primarily US with limited support in other regions
          if (countryComponent) {
            countryCode = countryComponent.short_name;
            if (countryCode !== 'US') {
              console.log(`Country detected: ${countryCode}. Google Solar API may have limited support.`);
              
              // Check for known unsupported countries
              const unsupportedCountries = ['IL', 'PS', 'SY', 'LB', 'JO', 'IR', 'IQ'];
              if (unsupportedCountries.includes(countryCode)) {
                return new Response(
                  JSON.stringify({
                    success: false,
                    error: `Solar API not available in ${countryCode}`,
                    details: 'Google Solar API currently has limited coverage in this region.',
                    countryCode: countryCode
                  }),
                  {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                  }
                );
              }
            }
          }
        } else {
          throw new Error('Could not geocode the provided address');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
      }
    }

    // If we don't have coordinates at this point, can't continue
    if (!locationCoordinates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not determine coordinates',
          details: 'Both geocoding and provided coordinates failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Call Google Solar API with coordinates
    console.log('Calling Google Solar API with coordinates:', locationCoordinates);
    
    // Add referrer to prevent RefererNotAllowedMapError
    const headers = {
      'Referer': SUPABASE_URL,
      'Origin': SUPABASE_URL
    };
    
    // Make the API request to Google's Solar API
    const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location=latitude=${locationCoordinates.lat}%26longitude=${locationCoordinates.lng}&requiredQuality=HIGH&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const solarResponse = await fetch(solarApiUrl, { headers });
      const solarData = await solarResponse.json();

      // Check for errors in the Solar API response
      if (solarData.error) {
        console.error('Solar API error:', solarData.error);
        
        // Handle specific error cases
        let errorMessage = solarData.error.message || 'Error fetching solar data';
        let errorDetails = '';
        
        // Check for common error types
        if (solarData.error.status === 'PERMISSION_DENIED') {
          errorDetails = 'API key may not be configured for Solar API or domain restrictions are in place.';
        } else if (solarData.error.status === 'NOT_FOUND') {
          errorDetails = 'No building data found at this location or the Solar API may not cover this region.';
        } else if (solarData.error.status === 'RESOURCE_EXHAUSTED') {
          errorDetails = 'API quota exceeded for Google Solar API.';
        }
        
        // For unsupported regions, generate estimated data
        if (countryCode && countryCode !== 'US') {
          console.log(`Generating estimated solar data for ${countryCode}`);
          // Generate estimated values based on location and roof size
          
          // Calculate approximate roof size based on latitude (just a heuristic)
          const estimatedRoofSize = 1500; // sq ft average home
          const estimatedSolarData = generateEstimatedSolarData(locationCoordinates, estimatedRoofSize, countryCode);
          
          return new Response(
            JSON.stringify({
              success: true,
              solarData: estimatedSolarData,
              coordinates: locationCoordinates,
              estimatedData: true,
              countryCode: countryCode,
              apiError: {
                message: errorMessage,
                details: errorDetails
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage,
            details: errorDetails,
            apiError: solarData.error
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      // Extract relevant solar data for our use case
      const formattedSolarData = formatSolarData(solarData);

      // Store the API response in the database for future reference
      if (locationCoordinates) {
        try {
          // Store the raw API response in a table for reference
          await supabase
            .from('solar_api_cache')
            .upsert({
              coordinates: `POINT(${locationCoordinates.lng} ${locationCoordinates.lat})`,
              raw_response: solarData,
              formatted_data: formattedSolarData,
              requested_at: new Date().toISOString()
            })
            .select();
        } catch (dbError) {
          console.log('Database storage error (non-critical):', dbError);
          // Continue execution even if database storage fails
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          solarData: formattedSolarData,
          coordinates: locationCoordinates
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (apiError) {
      console.error('Error calling Google Solar API:', apiError);
      
      // Generate estimated data for failed API calls
      const estimatedRoofSize = 1500; // sq ft average home
      const estimatedSolarData = generateEstimatedSolarData(locationCoordinates, estimatedRoofSize, countryCode || '');
      
      return new Response(
        JSON.stringify({
          success: true,
          solarData: estimatedSolarData,
          coordinates: locationCoordinates,
          estimatedData: true,
          error: 'Failed to connect to Google Solar API - using estimates',
          message: apiError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Error in solar-api function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Helper function to generate estimated solar data when the API is not available
function generateEstimatedSolarData(coordinates: { lat: number, lng: number }, roofSize: number, countryCode: string) {
  // Base values adjusted by latitude for solar potential
  const latitude = Math.abs(coordinates.lat);
  let solarEfficiencyFactor = 1.0;
  
  // Adjust for latitude - closer to equator = better solar
  if (latitude < 20) {
    solarEfficiencyFactor = 1.3; // Near equator, very good
  } else if (latitude < 30) {
    solarEfficiencyFactor = 1.2; // Good solar region
  } else if (latitude < 40) {
    solarEfficiencyFactor = 1.0; // Average
  } else if (latitude < 50) {
    solarEfficiencyFactor = 0.8; // Below average
  } else {
    solarEfficiencyFactor = 0.6; // Poor solar region
  }
  
  // Country-specific adjustments
  const countryFactors: {[key: string]: number} = {
    'US': 1.0, // Baseline
    'AU': 1.2, // Australia - good sun
    'DE': 0.7, // Germany - less sun
    'UK': 0.6, // United Kingdom - cloudy
    'CA': 0.8, // Canada - northern
    'MX': 1.1, // Mexico - good sun
    'ES': 1.1, // Spain - good sun
    'IT': 1.0, // Italy
    'FR': 0.9, // France
    'IL': 1.1, // Israel - good sun
    'BR': 1.2, // Brazil - good sun
    'IN': 1.1, // India - good sun
    'CN': 0.9  // China - varies
  };
  
  // Apply country factor if available
  if (countryCode in countryFactors) {
    solarEfficiencyFactor *= countryFactors[countryCode];
  }
  
  // Calculate usable roof area (typically 70% of roof can be used)
  const usableRoofArea = roofSize * 0.7;
  
  // Average panel size is about 20 sq ft
  const panelsCount = Math.floor(usableRoofArea / 20);
  
  // Average panel capacity is 300-350 watts
  const panelCapacityWatts = 325;
  
  // Calculate max solar capacity in kW
  const maxSolarCapacityKW = (panelsCount * panelCapacityWatts) / 1000;
  
  // Estimate yearly energy production based on capacity and efficiency factor
  const yearlyEnergyKWh = Math.round(maxSolarCapacityKW * 1400 * solarEfficiencyFactor);
  
  // Calculate monthly revenue (average electricity rate)
  const electricityRate = 0.15; // $0.15 per kWh is a global average
  const yearlyRevenue = yearlyEnergyKWh * electricityRate;
  const monthlyRevenue = Math.round(yearlyRevenue / 12);
  
  // Estimate setup cost ($2.5 per watt is common)
  const setupCost = Math.round(panelCapacityWatts * panelsCount * 2.5);
  
  return {
    roofTotalAreaSqFt: roofSize,
    solarPotential: true,
    maxSolarCapacityKW: parseFloat(maxSolarCapacityKW.toFixed(2)),
    yearlyEnergyKWh: yearlyEnergyKWh,
    panelsCount: panelsCount,
    monthlyRevenue: monthlyRevenue,
    setupCost: setupCost,
    estimatedData: true,
    solarEfficiency: parseFloat((solarEfficiencyFactor * 100).toFixed(0))
  };
}

// Helper function to format the Solar API response into our app's data model
function formatSolarData(apiResponse: SolarPotentialResponse) {
  // Default values in case the API response is incomplete
  const defaultData = {
    roofTotalAreaSqFt: 0,
    solarPotential: true,
    maxSolarCapacityKW: 0,
    yearlyEnergyKWh: 0,
    panelsCount: 0,
    averageHoursOfSunPerYear: 0,
    carbonOffsetKg: 0,
    monthlyRevenue: 0,
    setupCost: 0,
    roofSegments: [],
    financialAnalysis: {
      initialYearlyProduction: 0,
      federalIncentiveValue: 0,
      panelLifetimeYears: 25
    }
  };

  if (!apiResponse.solarPotential) {
    return defaultData;
  }

  try {
    // Convert square meters to square feet for roof area
    const totalRoofAreaSqFt = apiResponse.roofs.reduce(
      (total, roof) => total + convertSquareMetersToSquareFeet(roof.areaMeters2),
      0
    );

    // Get the best configuration (usually the one with the most panels)
    const bestConfig = apiResponse.solarPotential.solarPanelConfigs.reduce(
      (best, current) => (current.panelsCount > best.panelsCount ? current : best),
      apiResponse.solarPotential.solarPanelConfigs[0] || { panelsCount: 0, yearlyEnergyDcKwh: 0 }
    );

    // Calculate max solar capacity in kW
    const maxSolarCapacityKW = 
      (apiResponse.solarPotential.panelCapacityWatts * bestConfig.panelsCount) / 1000;

    // Calculate monthly revenue (simplified estimate)
    // Average electricity rate of $0.15 per kWh
    const electricityRate = 0.15;
    const yearlyRevenue = bestConfig.yearlyEnergyDcKwh * electricityRate;
    const monthlyRevenue = Math.round(yearlyRevenue / 12);

    // Estimate setup cost ($2.5 per watt is a common industry estimate)
    const setupCostPerWatt = 2.5;
    const setupCost = Math.round(
      apiResponse.solarPotential.panelCapacityWatts * 
      bestConfig.panelsCount * 
      setupCostPerWatt
    );

    // Format financial analysis
    const financialAnalysis = {
      initialYearlyProduction: apiResponse.solarPotential.financialAnalysis?.initialAcKwhPerYear || 0,
      federalIncentiveValue: 
        apiResponse.solarPotential.financialAnalysis?.federalIncentiveValue?.units || 0,
      panelLifetimeYears: 
        apiResponse.solarPotential.financialAnalysis?.panelLifetimeYears || 25
    };

    // Build the response
    return {
      roofTotalAreaSqFt: Math.round(totalRoofAreaSqFt),
      solarPotential: true,
      maxSolarCapacityKW: parseFloat(maxSolarCapacityKW.toFixed(2)),
      yearlyEnergyKWh: Math.round(bestConfig.yearlyEnergyDcKwh),
      panelsCount: bestConfig.panelsCount,
      averageHoursOfSunPerYear: 
        apiResponse.solarPotential.maxSunshineHoursPerYear || 0,
      carbonOffsetKg: 
        (apiResponse.solarPotential.carbonOffsetFactorKgPerMwh * bestConfig.yearlyEnergyDcKwh) / 1000,
      monthlyRevenue: monthlyRevenue,
      setupCost: setupCost,
      roofSegments: apiResponse.roofs.map(roof => ({
        areaSqFt: Math.round(convertSquareMetersToSquareFeet(roof.areaMeters2)),
        pitchDegrees: roof.pitchDegrees,
        azimuthDegrees: roof.azimuthDegrees,
        sunshineQuantiles: roof.sunshineQuantiles
      })),
      financialAnalysis: financialAnalysis
    };
  } catch (error) {
    console.error('Error formatting solar data:', error);
    return defaultData;
  }
}

// Helper function to convert square meters to square feet
function convertSquareMetersToSquareFeet(squareMeters: number): number {
  return squareMeters * 10.764;
}
