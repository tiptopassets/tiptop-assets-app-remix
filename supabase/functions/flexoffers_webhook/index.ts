
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.1';

// Define CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle incoming FlexOffers webhook notifications
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received FlexOffers webhook:', payload);

    if (!payload.transaction_id || !payload.program_name || !payload.commission || !payload.status || !payload.sub_affiliate_id || !payload.transaction_date) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      });
    }

    // Find the user associated with the sub-affiliate ID
    const { data: userMapping, error: userMappingError } = await supabaseClient
      .from('flexoffers_user_mapping')
      .select('user_id')
      .eq('sub_affiliate_id', payload.sub_affiliate_id)
      .single();

    if (userMappingError || !userMapping) {
      console.error('Error finding user for sub-affiliate ID:', payload.sub_affiliate_id, userMappingError);
      return new Response(JSON.stringify({ error: 'User not found for sub-affiliate ID' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      });
    }

    // Insert transaction into database
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('flexoffers_transactions')
      .insert({
        user_id: userMapping.user_id,
        transaction_id: payload.transaction_id,
        program_name: payload.program_name,
        commission: payload.commission,
        status: payload.status,
        transaction_date: new Date(payload.transaction_date).toISOString(),
        click_date: payload.click_date ? new Date(payload.click_date).toISOString() : null,
        payload: payload
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error storing transaction:', transactionError);
      return new Response(JSON.stringify({ error: 'Failed to store transaction' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      });
    }

    // Update affiliate_earnings with summed total for the user
    const { data: existingEarnings, error: earningsQueryError } = await supabaseClient
      .from('affiliate_earnings')
      .select('id, earnings')
      .eq('user_id', userMapping.user_id)
      .eq('service', 'FlexOffers')
      .single();

    let earningsResponse;
    if (!existingEarnings) {
      // Create new earnings record
      earningsResponse = await supabaseClient
        .from('affiliate_earnings')
        .insert({
          user_id: userMapping.user_id,
          service: 'FlexOffers',
          earnings: payload.commission,
          last_sync_status: 'success',
          updated_at: new Date().toISOString()
        });
    } else {
      // Update existing earnings record
      earningsResponse = await supabaseClient
        .from('affiliate_earnings')
        .update({
          earnings: (existingEarnings.earnings || 0) + parseFloat(payload.commission),
          last_sync_status: 'success',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEarnings.id);
    }

    if (earningsResponse.error) {
      console.error('Error updating earnings:', earningsResponse.error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Transaction recorded successfully' 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});
