
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { corsHeaders } from '../_shared/cors.ts';
import { analyzeImage } from './imageAnalysis.ts';
import { generatePropertyAnalysis } from './propertyAnalysis.ts';
import { extractStructuredData } from './dataExtraction.ts';
import { AnalysisRequest, PropertyInfo, ImageAnalysis } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { address, coordinates, satelliteImage }: AnalysisRequest = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Property address is required' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get property details from Google Maps API if coordinates aren't provided
    const { propertyCoordinates, propertyDetails, satelliteImageUrl } = 
      await fetchPropertyDetails(address, coordinates, GOOGLE_MAPS_API_KEY);
    
    console.log('Starting property analysis');
    
    // Get Solar API data instead of using image analysis
    let solarData = null;
    let imageAnalysis: ImageAnalysis = {};
    
    try {
      console.log('Fetching solar data from Solar API...');
      // Call the Solar API edge function
      const { data: solarResponse, error } = await supabase.functions.invoke('solar-api', {
        body: { 
          address: address,
          coordinates: propertyCoordinates
        }
      });
      
      if (error) {
        console.error('Error calling Solar API:', error);
        // Fall back to image analysis if Solar API fails
        if (satelliteImage && satelliteImage.startsWith('data:image')) {
          console.log('Falling back to image analysis...');
          imageAnalysis = await analyzeImage(satelliteImage, address);
        }
      } else if (solarResponse.success && solarResponse.solarData) {
        console.log('Received solar data:', solarResponse.solarData);
        solarData = solarResponse.solarData;
        
        // Use solar data to enhance the image analysis
        imageAnalysis = {
          ...imageAnalysis,
          roofSize: solarData.roofTotalAreaSqFt,
          solarPotential: solarData.solarPotential ? 'High' : 'Low'
        };
      }
    } catch (error) {
      console.error('Error fetching solar data:', error);
      
      // Fall back to image analysis if needed for non-solar data
      if (satelliteImage && satelliteImage.startsWith('data:image')) {
        console.log('Falling back to image analysis for non-solar data...');
        imageAnalysis = await analyzeImage(satelliteImage, address);
      }
    }

    // Create property info for analysis
    const propertyInfo: PropertyInfo = {
      address: address,
      coordinates: propertyCoordinates,
      details: propertyDetails,
      solarData: solarData // Add solar data to the property info
    };
    
    // Generate property analysis using AI
    const analysis = await generatePropertyAnalysis(propertyInfo, imageAnalysis);
    
    // If we have solar data, enhance the analysis with it
    if (solarData) {
      analysis.rooftop = {
        ...analysis.rooftop,
        area: solarData.roofTotalAreaSqFt,
        solarCapacity: solarData.maxSolarCapacityKW,
        solarPotential: solarData.solarPotential,
        yearlyEnergyKWh: solarData.yearlyEnergyKWh,
        panelsCount: solarData.panelsCount,
        revenue: solarData.monthlyRevenue,
        setupCost: solarData.setupCost,
        usingRealSolarData: true
      };
      
      // Update the top opportunity for solar if it exists
      const solarOpportunityIndex = analysis.topOpportunities.findIndex(
        opp => opp.title.toLowerCase().includes('solar')
      );
      
      if (solarOpportunityIndex >= 0) {
        analysis.topOpportunities[solarOpportunityIndex] = {
          ...analysis.topOpportunities[solarOpportunityIndex],
          monthlyRevenue: solarData.monthlyRevenue,
          setupCost: solarData.setupCost,
          roi: Math.ceil(solarData.setupCost / solarData.monthlyRevenue),
          description: `Install ${solarData.panelsCount} solar panels producing ${solarData.yearlyEnergyKWh} kWh/year on your ${solarData.roofTotalAreaSqFt} sq ft roof.`,
          usingRealSolarData: true
        };
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        propertyInfo: {
          address: propertyDetails.formattedAddress || address,
          coordinates: propertyCoordinates
        },
        imageAnalysis: imageAnalysis,
        solarData: solarData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in analyze-property function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred during property analysis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

/**
 * Fetches property details from Google Maps API if coordinates aren't provided
 */
async function fetchPropertyDetails(
  address: string, 
  coordinates: { lat: number; lng: number } | null | undefined,
  apiKey: string
) {
  let propertyCoordinates = coordinates;
  let propertyDetails: any = {};
  let satelliteImageUrl = '';
  
  if (!propertyCoordinates && apiKey) {
    try {
      // Geocode the address to get coordinates
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        propertyCoordinates = { lat: location.lat, lng: location.lng };
        
        // Get additional property details
        propertyDetails = {
          formattedAddress: geocodeData.results[0].formatted_address,
          placeId: geocodeData.results[0].place_id
        };
        
        // Get satellite imagery with high zoom level (20)
        satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${propertyCoordinates.lat},${propertyCoordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${apiKey}`;
        
        // Get more details using Places API
        if (propertyDetails.placeId) {
          const placeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${propertyDetails.placeId}&fields=name,geometry,formatted_address,type,vicinity,building_levels&key=${apiKey}`
          );
          
          const placeData = await placeResponse.json();
          if (placeData.result) {
            propertyDetails.type = placeData.result.types;
            propertyDetails.vicinity = placeData.result.vicinity;
            propertyDetails.buildingLevels = placeData.result.building_levels;
          }
        }
      }
    } catch (error) {
      console.error('Google Maps API error:', error);
      // Continue with just the address if geocoding fails
    }
  }
  
  return { propertyCoordinates, propertyDetails, satelliteImageUrl };
}
