
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
    let syncMethod = serviceInfo.integration_type;
    let syncDetails = '';
    
    // Priority-based selection logic for integration method
    // This implements the source selection logic described in the plan
    try {
      switch (serviceInfo.integration_type) {
        case 'api':
          // First priority: Official API integration
          syncedEarnings = await syncViaAPI(supabase, user_id, serviceInfo);
          syncDetails = 'Synced via official API';
          break;
          
        case 'oauth':
          // Second priority: OAuth integration
          syncedEarnings = await syncViaOAuth(supabase, user_id, serviceInfo);
          syncDetails = 'Synced via OAuth connection';
          break;
          
        case 'puppeteer':
          // Third priority: Puppeteer automation
          if (credentials?.email && credentials?.password) {
            syncedEarnings = await syncViaPuppeteer(supabase, user_id, serviceInfo, {
              email: credentials.email,
              password: credentials.password
            });
            syncDetails = 'Synced via automated login';
          } else {
            // Try to get stored credentials
            const { data: storedCreds } = await supabase
              .from('affiliate_credentials')
              .select('encrypted_email, encrypted_password')
              .eq('user_id', user_id)
              .eq('service', service)
              .single();
              
            if (storedCreds?.encrypted_email && storedCreds?.encrypted_password) {
              syncedEarnings = await syncViaPuppeteer(
                supabase, 
                user_id, 
                serviceInfo, 
                { 
                  email: storedCreds.encrypted_email, 
                  password: storedCreds.encrypted_password 
                }
              );
              syncDetails = 'Synced via stored credentials';
            } else {
              throw new Error('Credentials required for puppeteer integration');
            }
          }
          break;
          
        case 'extension':
          // Fourth priority: Chrome extension integration
          if (earnings !== undefined) {
            syncedEarnings = earnings;
            syncDetails = 'Synced via browser extension';
          } else {
            throw new Error('Earnings data required for extension integration');
          }
          break;
          
        case 'manual':
          // Fifth priority: Manual entry
          if (earnings === undefined) {
            throw new Error('Earnings required for manual integration');
          }
          syncedEarnings = earnings;
          syncDetails = 'Manually entered earnings';
          break;
          
        default:
          throw new Error('Unsupported integration type');
      }
    } catch (syncError) {
      console.error(`Sync error for ${serviceInfo.integration_type}:`, syncError);
      syncStatus = 'error';
      syncDetails = syncError instanceof Error ? syncError.message : 'Unknown error during sync';
      
      // Try fallback methods if primary method fails
      if (serviceInfo.integration_type === 'api' && earnings !== undefined) {
        // Fallback to manual entry if API fails but earnings were provided
        syncedEarnings = earnings;
        syncMethod = 'manual';
        syncStatus = 'success';
        syncDetails = 'Fallback to manual entry after API failure';
      } else if (serviceInfo.integration_type === 'puppeteer' && earnings !== undefined) {
        // Fallback to manual entry if puppeteer fails but earnings were provided
        syncedEarnings = earnings;
        syncMethod = 'manual';
        syncStatus = 'success';
        syncDetails = 'Fallback to manual entry after automation failure';
      }
    }
    
    if (syncStatus === 'error' && syncedEarnings === null) {
      return new Response(
        JSON.stringify({ 
          error: 'Sync failed', 
          details: syncDetails,
          fallback_options: serviceInfo.integration_type === 'puppeteer' ? ['extension', 'manual'] : ['manual']
        }),
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
    
    const timestamp = new Date().toISOString();
    
    if (existingEarnings && existingEarnings.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('affiliate_earnings')
        .update({ 
          earnings: syncedEarnings,
          updated_at: timestamp,
          last_sync_status: syncStatus,
          last_sync_method: syncMethod,
          sync_details: syncDetails
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
          last_sync_status: syncStatus,
          last_sync_method: syncMethod,
          sync_details: syncDetails,
          updated_at: timestamp
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
        method: syncMethod,
        details: syncDetails,
        timestamp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Service-specific integration functions

async function syncViaAPI(supabase: any, userId: string, service: ServiceInfo): Promise<number> {
  console.log(`Syncing ${service.name} via API for user ${userId}`);
  
  if (!service.api_url) {
    throw new Error('API URL not configured for this service');
  }
  
  // For demo purposes, this returns random values
  // In production, this would make actual API calls
  return Math.floor(Math.random() * 200) + 50;
}

async function syncViaOAuth(supabase: any, userId: string, service: ServiceInfo): Promise<number> {
  console.log(`Syncing ${service.name} via OAuth for user ${userId}`);
  
  // Get OAuth tokens from secure storage
  const { data: tokenData } = await supabase
    .from('affiliate_credentials')
    .select('oauth_token, oauth_refresh_token')
    .eq('user_id', userId)
    .eq('service', service.name)
    .single();
  
  if (!tokenData?.oauth_token) {
    throw new Error('OAuth token not found');
  }
  
  // For demo purposes, this returns random values
  // In production, this would make actual OAuth API calls with token refresh
  return Math.floor(Math.random() * 250) + 100;
}

async function syncViaPuppeteer(
  supabase: any, 
  userId: string, 
  service: ServiceInfo, 
  credentials: { email: string; password: string }
): Promise<number> {
  console.log(`Syncing ${service.name} via Puppeteer for user ${userId}`);
  
  if (!service.login_url) {
    throw new Error('Login URL not configured for this service');
  }
  
  // In production, this would trigger a job to run a headless browser
  // For demo purposes, this returns random values with a delay to simulate automation
  await new Promise(resolve => setTimeout(resolve, 1500));
  return Math.floor(Math.random() * 150) + 75;
}
