
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface AffiliateRequest {
  action: 'register' | 'track_click' | 'sync_earnings' | 'get_referral_link';
  userId: string;
  provider: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, provider, data }: AffiliateRequest = await req.json();

    switch (action) {
      case 'get_referral_link':
        return await generateReferralLink(userId, provider, data?.destinationUrl);
      
      case 'register':
        return await registerWithPartner(userId, provider, data);
      
      case 'track_click':
        return await trackAffiliateClick(userId, provider, data);
      
      case 'sync_earnings':
        return await syncPartnerEarnings(userId, provider);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Affiliate integration error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateReferralLink(userId: string, provider: string, destinationUrl: string) {
  // Get provider configuration
  const { data: providerData } = await supabase
    .from('enhanced_service_providers')
    .select('*')
    .eq('name', provider)
    .single();

  if (!providerData) {
    throw new Error('Provider not found');
  }

  let referralLink = '';
  const userSubId = `tiptop_${userId.substring(0, 8)}`;

  switch (provider.toLowerCase()) {
    case 'flexoffers':
      const encodedUrl = encodeURIComponent(destinationUrl);
      referralLink = `https://track.flexoffers.com/a/${userSubId}?url=${encodedUrl}`;
      break;
    
    case 'honeygain':
      referralLink = `https://r.honeygain.me/TIPTOP${userSubId}`;
      break;
    
    case 'tesla energy':
      referralLink = `https://www.tesla.com/referral/tiptop${userSubId}`;
      break;
    
    case 'swimply':
      referralLink = `https://swimply.com/for-hosts?ref=tiptop${userSubId}`;
      break;
    
    case 'airbnb':
      referralLink = `https://www.airbnb.com/host/homes?ref=tiptop${userSubId}`;
      break;
    
    case 'booking.com':
      referralLink = `https://partner.booking.com/?aid=tiptop${userSubId}`;
      break;
    
    default:
      referralLink = providerData.affiliate_base_url || destinationUrl;
  }

  return new Response(JSON.stringify({
    success: true,
    referralLink,
    provider,
    userSubId
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function registerWithPartner(userId: string, provider: string, registrationData: any) {
  // Update user journey
  const { error: journeyError } = await supabase
    .from('user_affiliate_journeys')
    .update({
      registrations_completed: supabase.rpc('jsonb_array_append', {
        target: 'registrations_completed',
        new_value: { provider, timestamp: new Date().toISOString() }
      }),
      journey_status: 'registrations_completed'
    })
    .eq('user_id', userId);

  if (journeyError) {
    console.error('Journey update error:', journeyError);
  }

  // Initialize earnings tracking
  const { error: earningsError } = await supabase
    .from('partner_earnings_sync')
    .insert({
      user_id: userId,
      provider_name: provider,
      sync_method: 'api',
      earnings_data: { initial_registration: registrationData },
      sync_status: 'pending'
    });

  if (earningsError) {
    console.error('Earnings tracking error:', earningsError);
  }

  return new Response(JSON.stringify({
    success: true,
    message: `Successfully registered with ${provider}`,
    nextSteps: getNextSteps(provider)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function trackAffiliateClick(userId: string, provider: string, clickData: any) {
  const { error } = await supabase
    .from('user_affiliate_journeys')
    .update({
      affiliate_clicks: supabase.rpc('jsonb_array_append', {
        target: 'affiliate_clicks',
        new_value: { 
          provider, 
          timestamp: new Date().toISOString(),
          ...clickData 
        }
      })
    })
    .eq('user_id', userId);

  return new Response(JSON.stringify({
    success: !error,
    tracked: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function syncPartnerEarnings(userId: string, provider: string) {
  // This would integrate with each partner's API
  // For now, we'll simulate the sync process
  
  let earnings = 0;
  let syncMethod = 'manual';

  switch (provider.toLowerCase()) {
    case 'honeygain':
      // Would use Honeygain API with user token
      earnings = Math.random() * 50; // Simulated
      syncMethod = 'api';
      break;
    
    case 'flexoffers':
      // Would use FlexOffers reporting API
      earnings = Math.random() * 100; // Simulated
      syncMethod = 'api';
      break;
    
    default:
      earnings = Math.random() * 25; // Simulated
  }

  const { error } = await supabase
    .from('partner_earnings_sync')
    .upsert({
      user_id: userId,
      provider_name: provider,
      sync_method: syncMethod,
      earnings_data: { 
        amount: earnings,
        currency: 'USD',
        sync_timestamp: new Date().toISOString()
      },
      last_sync_at: new Date().toISOString(),
      sync_status: 'success'
    });

  return new Response(JSON.stringify({
    success: !error,
    earnings,
    provider,
    lastSync: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getNextSteps(provider: string): string[] {
  const steps: Record<string, string[]> = {
    'FlexOffers': [
      'Complete FlexOffers account setup',
      'Verify your identity and tax information',
      'Start promoting parking and storage solutions'
    ],
    'Honeygain': [
      'Download and install Honeygain app',
      'Keep the app running to share bandwidth',
      'Monitor your daily earnings in the dashboard'
    ],
    'Tesla Energy': [
      'Contact Tesla Energy for solar consultation',
      'Schedule property assessment',
      'Review solar installation proposal'
    ],
    'Swimply': [
      'Create your pool listing on Swimply',
      'Upload high-quality photos',
      'Set competitive pricing for your area'
    ]
  };

  return steps[provider] || ['Complete account setup', 'Start earning!'];
}
