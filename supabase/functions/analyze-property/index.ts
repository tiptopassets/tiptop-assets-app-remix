
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
    
    // Use provided satellite image if available, otherwise use the URL we generated
    const imageForAnalysis = satelliteImage || satelliteImageUrl;
    
    // Create property info for analysis
    const propertyInfo: PropertyInfo = {
      address: address,
      coordinates: propertyCoordinates,
      details: propertyDetails
    };
    
    console.log('Starting property analysis');
    
    // First analyze the satellite image if available
    let imageAnalysis: ImageAnalysis = {};
    if (imageForAnalysis && imageForAnalysis.startsWith('data:image')) {
      try {
        console.log('Analyzing satellite image...');
        imageAnalysis = await analyzeImage(imageForAnalysis, address);
      } catch (error) {
        console.error('Error analyzing image:', error);
        // Continue without image analysis
      }
    }

    // Generate property analysis using AI
    const analysis = await generatePropertyAnalysis(propertyInfo, imageAnalysis);
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        propertyInfo: {
          address: propertyDetails.formattedAddress || address,
          coordinates: propertyCoordinates
        },
        imageAnalysis: imageAnalysis
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
