import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { analyzeImage } from './image-analysis.ts';
import { getSolarData } from '../solar-api/index.ts';
import { SolarApiResult } from '../solar-api/types.ts';
import { ImageAnalysis } from './types.ts';

import {
  AnalysisRequest,
  AnalysisResults,
  PropertyInfo,
} from './types.ts';

import { getLocationFromCoordinates, verifyAndFilterProviders, addServiceAvailabilityToAnalysis } from './serviceVerification.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, coordinates, satelliteImage, forceLocalAnalysis }: AnalysisRequest = await req.json();
    
    console.log('Starting property analysis');
    
    let finalCoordinates = coordinates;
    let locationInfo;
    
    // Enhanced coordinate handling with location detection
    if (!finalCoordinates && address) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`
        );
        
        const geocodeData = await geocodeResponse.json();
        console.log('Google geocode response status:', geocodeData.status);
        
        if (geocodeData.status === 'OK' && geocodeData.results?.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          finalCoordinates = { lat: location.lat, lng: location.lng };
        } else {
          console.error('Geocoding failed:', geocodeData.status, geocodeData.error_message || 'API keys with referer restrictions cannot be used with this API.');
          throw new Error('Could not geocode the address: ' + geocodeData.status);
        }
      } catch (error) {
        console.error('Google Maps API error:', error);
        throw new Error('Failed to geocode address. Please provide valid coordinates.');
      }
    }
    
    if (!finalCoordinates) {
      throw new Error('Failed to geocode address. Please provide valid coordinates.');
    }

    // Get detailed location information
    locationInfo = await getLocationFromCoordinates(finalCoordinates.lat, finalCoordinates.lng);
    console.log('Location info:', locationInfo);

    let solarData: SolarApiResult | undefined;
    try {
      solarData = await getSolarData({
        address,
        coordinates: finalCoordinates,
      });
      console.log('Solar API Result:', solarData);
    } catch (solarError) {
      console.error('Error fetching solar data:', solarError);
    }

    let imageAnalysis: string | undefined;
    try {
      if (satelliteImage) {
        const analysis = await analyzeImage(satelliteImage);
        imageAnalysis = JSON.stringify(analysis);
        console.log('Image Analysis Result:', analysis);
      } else {
        console.warn('No satellite image provided, skipping image analysis.');
      }
    } catch (imageError) {
      console.error('Error during image analysis:', imageError);
    }

    // Enhanced property analysis with location-aware logic
    console.log('Calling OpenAI API for enhanced property analysis...');
    
    const propertyDetails = {
      type: 'single-family', // This should be detected from analysis
      size: undefined,
      hasHOA: false
    };

    const analysisPrompt = `
    You are a property monetization expert. Analyze this property and provide realistic revenue estimates based on the location: ${locationInfo.city || 'Unknown'}, ${locationInfo.state || locationInfo.country}.

    Address: ${address || 'Unknown'}
    Coordinates: ${finalCoordinates.lat}, ${finalCoordinates.lng}
    Location: ${locationInfo.city}, ${locationInfo.state}, ${locationInfo.country}
    
    Solar Data Available: ${solarData ? 'Yes' : 'No'}
    ${solarData ? `Solar Details:
    - Roof Area: ${solarData.roofTotalAreaSqFt} sq ft
    - Usable Area: ${solarData.roofUsableAreaSqFt} sq ft
    - Solar Capacity: ${solarData.maxSolarCapacityKW} kW
    - Annual Energy: ${solarData.yearlyEnergyKWh} kWh
    - Monthly Revenue: $${solarData.monthlyRevenue}
    - Setup Cost: $${solarData.setupCost}` : ''}
    
    Image Analysis: ${imageAnalysis}
    
    IMPORTANT: Consider location-specific factors:
    1. Local market rates for rental properties, parking, pool rentals
    2. Solar incentives and utility rates in ${locationInfo.state || locationInfo.country}
    3. Regulatory environment (HOA restrictions, permits, zoning laws)
    4. Climate considerations for pool rentals, solar efficiency
    5. Urban density for parking demand, internet sharing
    
    Provide realistic estimates that reflect the actual market in this location. Don't use generic nationwide averages.
    
    Return a JSON response with this exact structure:
    ${JSON.stringify({
      propertyType: "single-family",
      amenities: [],
      rooftop: {
        area: 0,
        type: "unknown",
        solarCapacity: 0,
        solarPotential: false,
        revenue: 0,
        usingRealSolarData: false,
        providers: []
      },
      garden: { area: 0, opportunity: "Low", revenue: 0, providers: [] },
      parking: { spaces: 0, rate: 0, revenue: 0, evChargerPotential: false, providers: [] },
      pool: { present: false, area: 0, type: "none", revenue: 0, providers: [] },
      storage: { volume: 0, revenue: 0, providers: [] },
      bandwidth: { available: 0, revenue: 0, providers: [] },
      shortTermRental: { nightlyRate: 0, monthlyProjection: 0, providers: [] },
      permits: [],
      restrictions: null,
      topOpportunities: [],
      imageAnalysisSummary: "",
      propertyValuation: {
        totalMonthlyRevenue: 0,
        totalAnnualRevenue: 0,
        totalSetupCosts: 0,
        averageROI: 0,
        bestOpportunity: ""
      }
    }, null, 2)}`;

    console.log('Analysis Prompt:', analysisPrompt);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.5,
      }),
    });

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text();
      console.error('OpenAI API Error:', openAIResponse.status, errorBody);
      throw new Error(`OpenAI API request failed with status ${openAIResponse.status}: ${errorBody}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI Response:', openAIData);

    const analysisResults: AnalysisResults = JSON.parse(openAIData.choices[0].message.content);

    // Verify service availability for each asset type
    if (analysisResults.rooftop?.providers) {
      analysisResults.rooftop.providers = await verifyAndFilterProviders(
        'solar',
        analysisResults.rooftop.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    if (analysisResults.parking?.providers) {
      analysisResults.parking.providers = await verifyAndFilterProviders(
        'parking',
        analysisResults.parking.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    if (analysisResults.storage?.providers) {
      analysisResults.storage.providers = await verifyAndFilterProviders(
        'storage',
        analysisResults.storage.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    if (analysisResults.pool?.providers) {
      analysisResults.pool.providers = await verifyAndFilterProviders(
        'pool',
        analysisResults.pool.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    if (analysisResults.bandwidth?.providers) {
      analysisResults.bandwidth.providers = await verifyAndFilterProviders(
        'bandwidth',
        analysisResults.bandwidth.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    if (analysisResults.shortTermRental?.providers) {
      analysisResults.shortTermRental.providers = await verifyAndFilterProviders(
        'rental',
        analysisResults.shortTermRental.providers,
        locationInfo,
        { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
      );
    }

    // Add location and service availability info to the response
    const enhancedResults = addServiceAvailabilityToAnalysis(
      analysisResults,
      locationInfo,
      { ...propertyDetails, type: analysisResults.propertyType || 'single-family' }
    );

    if (solarData?.solarData) {
      enhancedResults.rooftop.solarPotential = true;
      enhancedResults.rooftop.area = solarData.solarData.roofTotalAreaSqFt;
      enhancedResults.rooftop.solarCapacity = solarData.solarData.maxSolarCapacityKW;
      enhancedResults.rooftop.revenue = solarData.solarData.monthlyRevenue;
      enhancedResults.rooftop.usingRealSolarData = true;
      enhancedResults.rooftop.yearlyEnergyKWh = solarData.solarData.yearlyEnergyKWh;
      enhancedResults.rooftop.panelsCount = solarData.solarData.panelsCount;
      enhancedResults.rooftop.setupCost = solarData.solarData.setupCost;
    }

    console.log('Analysis completed successfully');
    
    return new Response(JSON.stringify(enhancedResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

Deno.serve(handler);
