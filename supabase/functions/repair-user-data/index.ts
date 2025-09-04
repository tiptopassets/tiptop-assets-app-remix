import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, forceRepair = false } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`🔧 [REPAIR] Starting data repair for user: ${userId}`);

    // Step 1: Check for existing property analyses
    const { data: existingAnalyses } = await supabase
      .from('user_property_analyses')
      .select('id, address_id, total_monthly_revenue')
      .eq('user_id', userId);

    console.log(`📊 [REPAIR] Found ${existingAnalyses?.length || 0} existing analyses`);

    // Step 2: Get journey data and asset selections that need repair
    const { data: journeyData } = await supabase
      .from('user_journey_complete')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: orphanedAssets } = await supabase
      .from('user_asset_selections')
      .select('*')
      .eq('user_id', userId)
      .is('analysis_id', null);

    console.log(`🔍 [REPAIR] Found journey:`, !!journeyData);
    console.log(`🔍 [REPAIR] Found ${orphanedAssets?.length || 0} orphaned asset selections`);

    if (!journeyData || !orphanedAssets?.length) {
      console.log(`⚠️ [REPAIR] No data to repair for user ${userId}`);
      return new Response(JSON.stringify({
        success: true,
        message: 'No data repair needed',
        details: {
          hasJourney: !!journeyData,
          orphanedAssets: orphanedAssets?.length || 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Get property address from journey data (don't use hardcoded values)
    const propertyAddress = journeyData.property_address;
    const coordinates = journeyData.property_coordinates || null;
    
    if (!propertyAddress) {
      throw new Error('No property address found in journey data - cannot repair without valid address');
    }

    // Step 4: Create missing user address
    const { data: addressData, error: addressError } = await supabase
      .from('user_addresses')
      .upsert({
        user_id: userId,
        address: propertyAddress,
        formatted_address: propertyAddress,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
        is_primary: !existingAnalyses?.length // Make primary if no existing analyses
      }, {
        onConflict: 'user_id,address',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (addressError && !addressError.message.includes('duplicate')) {
      throw new Error(`Failed to create address: ${addressError.message}`);
    }

    const addressId = addressData?.id || (await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('address', propertyAddress)
      .single()).data?.id;

    console.log(`🏠 [REPAIR] Address created/found: ${addressId}`);

    // Step 5: Calculate analysis data from asset selections
    const totalMonthlyRevenue = orphanedAssets.reduce((sum, asset) => sum + (asset.monthly_revenue || 0), 0);
    const totalOpportunities = orphanedAssets.length;

    // Use existing analysis results from journey data or create minimal structure
    const analysisResults = journeyData.analysis_results || {
      propertyType: "unknown",
      propertyAddress: propertyAddress,
      coordinates: coordinates,
      topOpportunities: orphanedAssets.map(asset => ({
        title: asset.asset_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        monthlyRevenue: asset.monthly_revenue || 0,
        setupCost: asset.setup_cost || 0,
        paybackMonths: asset.roi_months || 0,
        confidenceScore: 0.7
      })),
      totalMonthlyRevenue: totalMonthlyRevenue,
      totalSetupInvestment: orphanedAssets.reduce((sum, asset) => sum + (asset.setup_cost || 0), 0),
      overallConfidenceScore: 0.7,
      repaired: true
    };

    // Step 6: Create missing property analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('user_property_analyses')
      .insert({
        user_id: userId,
        address_id: addressId,
        analysis_results: analysisResults,
        total_monthly_revenue: totalMonthlyRevenue,
        total_opportunities: totalOpportunities,
        coordinates: coordinates,
        analysis_version: 'v1.0-recovered',
        using_real_solar_data: false,
        property_type: 'apartment'
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to create analysis: ${analysisError.message}`);
    }

    const analysisId = analysisData.id;
    console.log(`🏗️ [REPAIR] Analysis created: ${analysisId}`);

    // Step 7: Link orphaned asset selections to the new analysis
    const { error: assetUpdateError } = await supabase
      .from('user_asset_selections')
      .update({ analysis_id: analysisId })
      .eq('user_id', userId)
      .is('analysis_id', null);

    if (assetUpdateError) {
      console.error(`⚠️ [REPAIR] Failed to link asset selections: ${assetUpdateError.message}`);
    } else {
      console.log(`🔗 [REPAIR] Linked ${orphanedAssets.length} asset selections to analysis`);
    }

    // Step 8: Update journey record with proper analysis_id and address
    const { error: journeyUpdateError } = await supabase
      .from('user_journey_complete')
      .update({ 
        analysis_id: analysisId,
        property_address: propertyAddress,
        property_coordinates: coordinates,
        analysis_results: analysisResults,
        total_monthly_revenue: totalMonthlyRevenue,
        total_opportunities: totalOpportunities
      })
      .eq('user_id', userId)
      .eq('id', journeyData.id);

    if (journeyUpdateError) {
      console.error(`⚠️ [REPAIR] Failed to update journey: ${journeyUpdateError.message}`);
    } else {
      console.log(`📋 [REPAIR] Updated journey record with analysis data`);
    }

    // Step 9: Verification - Check that everything is properly linked
    const { data: verificationData } = await supabase
      .from('user_property_analyses')
      .select(`
        id,
        total_monthly_revenue,
        total_opportunities,
        user_addresses!inner(address, formatted_address)
      `)
      .eq('user_id', userId);

    const { data: linkedAssets } = await supabase
      .from('user_asset_selections')
      .select('id, asset_type, monthly_revenue, analysis_id')
      .eq('user_id', userId)
      .not('analysis_id', 'is', null);

    console.log(`✅ [REPAIR] Verification complete:`);
    console.log(`   - Properties: ${verificationData?.length}`);
    console.log(`   - Linked assets: ${linkedAssets?.length}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'User data repair completed successfully',
      details: {
        addressId,
        analysisId,
        propertiesCreated: 1,
        assetsLinked: orphanedAssets.length,
        totalRevenue: totalMonthlyRevenue,
        verificationData: {
          properties: verificationData?.length,
          linkedAssets: linkedAssets?.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [REPAIR] Error in data repair function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});