
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Define types for our function
interface AffiliateRequest {
  user_id: string;
  service: string;
  credentials?: {
    email?: string;
    password?: string;
  };
  earnings?: number; // For manual entry
}

interface ServiceInfo {
  name: string;
  integration_type: string;
  api_url: string | null;
  login_url: string | null;
  status: string | null;
}

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { user_id, service, credentials, earnings } = await req.json() as AffiliateRequest;
    
    if (!user_id || !service) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing sync request for user ${user_id} and service ${service}`);
    
    // Get service details
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('name', service)
      .single();
    
    if (serviceError || !serviceData) {
      console.error('Service fetch error:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const serviceInfo = serviceData as ServiceInfo;
    let syncedEarnings: number | null = null;
    let syncStatus = 'success';
    
    // Handle different integration types
    switch (serviceInfo.integration_type) {
      case 'manual':
        // For manual integration, use provided earnings
        if (earnings === undefined) {
          return new Response(
            JSON.stringify({ error: 'Earnings required for manual integration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        syncedEarnings = earnings;
        break;
        
      case 'api':
        // TODO: Implement API integrations
        // This would call the external API using the service URL and credentials
        // For now, return mock data
        syncedEarnings = Math.floor(Math.random() * 100) + 50;
        break;
        
      case 'puppeteer':
        // For demonstration, we'll return mock data since we can't run Puppeteer in edge functions
        // In a real implementation, this would call a separate service or worker that runs Puppeteer
        syncedEarnings = Math.floor(Math.random() * 200) + 100;
        break;
        
      case 'extension':
        // For extension, we're just accepting the provided earnings
        if (earnings === undefined) {
          return new Response(
            JSON.stringify({ error: 'Earnings required for extension integration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        syncedEarnings = earnings;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported integration type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    // Update or insert earnings record
    const { data: existingEarnings, error: fetchError } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('user_id', user_id)
      .eq('service', service);
      
    if (fetchError) {
      console.error('Error fetching existing earnings:', fetchError);
      syncStatus = 'error';
    }
    
    if (existingEarnings && existingEarnings.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('affiliate_earnings')
        .update({ 
          earnings: syncedEarnings,
          updated_at: new Date().toISOString(),
          last_sync_status: syncStatus
        })
        .eq('id', existingEarnings[0].id);
        
      if (updateError) {
        console.error('Error updating earnings:', updateError);
        syncStatus = 'error';
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('affiliate_earnings')
        .insert({
          user_id,
          service,
          earnings: syncedEarnings,
          last_sync_status: syncStatus
        });
        
      if (insertError) {
        console.error('Error inserting earnings:', insertError);
        syncStatus = 'error';
      }
    }
    
    // Store credentials if provided (encrypted in a real implementation)
    if (credentials?.email && credentials?.password) {
      // NOTE: In a production app, these credentials should be encrypted
      // For this demo, we'll store them as-is with a note
      const { error: credentialsError } = await supabase
        .from('affiliate_credentials')
        .upsert({
          user_id,
          service,
          encrypted_email: credentials.email, // Should be encrypted in production
          encrypted_password: credentials.password, // Should be encrypted in production
        }, {
          onConflict: 'user_id,service'
        });
        
      if (credentialsError) {
        console.error('Error storing credentials:', credentialsError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: syncStatus === 'success',
        earnings: syncedEarnings,
        status: syncStatus,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
