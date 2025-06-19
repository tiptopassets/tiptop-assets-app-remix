
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { corsHeaders } from '../_shared/cors.ts';
import { analyzeImage } from './imageAnalysis.ts';
import { generatePropertyAnalysis } from './propertyAnalysis.ts';
import { extractStructuredData } from './dataExtraction.ts';
import { validateAndCorrectRevenue } from './marketDataValidator.ts';
import { AnalysisRequest, PropertyInfo, ImageAnalysis } from './types.ts';
import { classifyPropertyFromAddress } from '../../src/utils/propertyClassification.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { address, coordinates, satelliteImage, forceLocalAnalysis }: AnalysisRequest = await req.json();
    
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

    console.log('🏗️ Starting enhanced property analysis for:', address);
    console.log('📍 Coordinates provided:', !!coordinates);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let propertyCoordinates = coordinates;
    let propertyDetails: any = {};
    let satelliteImageUrl = '';
    
    // Enhanced property classification using address analysis
    const initialClassification = classifyPropertyFromAddress(address);
    console.log('🔍 Initial classification:', initialClassification);
    
    if (!propertyCoordinates && GOOGLE_MAPS_API_KEY) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodeResponse.json();
        console.log('🌍 Google geocode response status:', geocodeData.status);
        
        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          propertyCoordinates = { lat: location.lat, lng: location.lng };
          
          propertyDetails = {
            formattedAddress: geocodeData.results[0].formatted_address,
            placeId: geocodeData.results[0].place_id,
            addressComponents: geocodeData.results[0].address_components || []
          };
          
          satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${propertyCoordinates.lat},${propertyCoordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
          
          if (propertyDetails.placeId) {
            try {
              const placeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${propertyDetails.placeId}&fields=name,geometry,formatted_address,type,vicinity,building_levels&key=${GOOGLE_MAPS_API_KEY}`
              );
              
              const placeData = await placeResponse.json();
              if (placeData.result) {
                propertyDetails.type = placeData.result.types;
                propertyDetails.vicinity = placeData.result.vicinity;
                propertyDetails.buildingLevels = placeData.result.building_levels;
              }
            } catch (placeError) {
              console.error('❌ Places API error:', placeError);
            }
          }
        } else {
          console.error('❌ Geocoding failed:', geocodeData.status, geocodeData.error_message);
          throw new Error(`Could not geocode the address: ${geocodeData.status}`);
        }
      } catch (error) {
        console.error('❌ Google Maps API error:', error);
        throw new Error('Failed to geocode address. Please provide valid coordinates.');
      }
    }
    
    console.log('📊 Starting property analysis with enhanced classification');
    
    let solarData = null;
    let imageAnalysis: ImageAnalysis = {};
    
    if (!forceLocalAnalysis) {
      try {
        console.log('☀️ Fetching solar data from Solar API...');
        const { data: solarResponse, error } = await supabase.functions.invoke('solar-api', {
          body: { 
            address: address,
            coordinates: propertyCoordinates
          }
        });
        
        if (error) {
          console.error('❌ Error calling Solar API:', error);
          if (satelliteImage && satelliteImage.startsWith('data:image')) {
            console.log('📸 Falling back to image analysis...');
            imageAnalysis = await analyzeImage(satelliteImage, address);
          }
        } else if (solarResponse.success && solarResponse.solarData) {
          console.log('✅ Received solar data:', solarResponse.solarData);
          solarData = solarResponse.solarData;
          
          imageAnalysis = {
            ...imageAnalysis,
            roofSize: solarData.roofTotalAreaSqFt,
            solarPotential: solarData.solarPotential ? 'High' : 'Low'
          };
        }
      } catch (error) {
        console.error('❌ Error fetching solar data:', error);
        
        if (satelliteImage && satelliteImage.startsWith('data:image')) {
          console.log('📸 Falling back to image analysis for non-solar data...');
          imageAnalysis = await analyzeImage(satelliteImage, address);
        }
      }
    }

    const propertyInfo: PropertyInfo = {
      address: address,
      coordinates: propertyCoordinates,
      details: propertyDetails,
      solarData: solarData,
      propertyType: propertyDetails.type ? propertyDetails.type.join(', ') : initialClassification.primaryType,
      classification: initialClassification
    };
    
    console.log('🔬 Generating property analysis with classification:', propertyInfo.classification);
    let analysis = await generatePropertyAnalysis(propertyInfo, imageAnalysis);
    
    // Apply market validation for non-vacant land properties
    if (propertyCoordinates && analysis.propertyType !== 'vacant_land') {
      analysis = validateAndCorrectRevenue(analysis, propertyCoordinates, analysis.propertyType);
      console.log('✅ Applied market-based revenue validation');
    }
    
    // Enhanced solar data integration
    if (solarData && analysis.propertyType !== 'vacant_land') {
      const maxSolarRevenue = analysis.propertyType?.toLowerCase().includes('commercial') ? 500 : 200;
      const validatedSolarRevenue = Math.min(solarData.monthlyRevenue || 0, maxSolarRevenue);
      
      analysis.rooftop = {
        ...analysis.rooftop,
        area: solarData.roofTotalAreaSqFt,
        solarCapacity: solarData.maxSolarCapacityKW,
        solarPotential: solarData.solarPotential,
        yearlyEnergyKWh: solarData.yearlyEnergyKWh,
        panelsCount: solarData.panelsCount,
        revenue: validatedSolarRevenue,
        setupCost: solarData.setupCost,
        usingRealSolarData: true
      };
      
      const solarOpportunityIndex = analysis.topOpportunities.findIndex(
        opp => opp.title.toLowerCase().includes('solar')
      );
      
      if (solarOpportunityIndex >= 0) {
        analysis.topOpportunities[solarOpportunityIndex] = {
          ...analysis.topOpportunities[solarOpportunityIndex],
          monthlyRevenue: validatedSolarRevenue,
          setupCost: solarData.setupCost,
          roi: Math.ceil(solarData.setupCost / validatedSolarRevenue),
          description: `Install ${solarData.panelsCount} solar panels producing ${solarData.yearlyEnergyKWh} kWh/year on your ${solarData.roofTotalAreaSqFt} sq ft roof.`,
          usingRealSolarData: true
        };
      }
      
      console.log(`☀️ Solar revenue validated: ${solarData.monthlyRevenue} → ${validatedSolarRevenue}`);
    }
    
    // Ensure address is properly included in response
    const responseData = {
      success: true,
      analysis: {
        ...analysis,
        propertyAddress: propertyDetails.formattedAddress || address
      },
      propertyInfo: {
        address: propertyDetails.formattedAddress || address,
        coordinates: propertyCoordinates,
        classification: initialClassification
      },
      imageAnalysis: imageAnalysis,
      solarData: solarData,
      satelliteImageUrl: satelliteImageUrl,
      validationApplied: true,
      enhancedClassification: true
    };
    
    console.log('✅ Enhanced property analysis completed successfully');
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error in analyze-property function:', error);
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
