import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceProvider {
  name: string;
  description: string;
  logo: string;
  url: string;
  login_url: string;
  asset_types: string[];
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
  priority: number;
  is_active: boolean;
  setup_instructions: string;
  referral_link_template: string;
}

const MISSING_PROVIDERS: ServiceProvider[] = [
  {
    name: 'Honeygain',
    description: 'Share your unused internet bandwidth and earn passive income',
    logo: 'https://honeygain.com/favicon.ico',
    url: 'https://honeygain.com',
    login_url: 'https://honeygain.com/login',
    asset_types: ['internet', 'bandwidth', 'wifi'],
    avg_monthly_earnings_low: 20,
    avg_monthly_earnings_high: 80,
    priority: 8,
    is_active: true,
    setup_instructions: 'Download the Honeygain app and create an account to start earning from your unused internet bandwidth.',
    referral_link_template: 'https://r.honeygain.me/EDUARCE2A5'
  },
  {
    name: 'Gympass',
    description: 'Corporate wellness platform for fitness and wellness services',
    logo: 'https://gympass.com/favicon.ico',
    url: 'https://gympass.com',
    login_url: 'https://gympass.com/login',
    asset_types: ['fitness', 'wellness', 'home_gym'],
    avg_monthly_earnings_low: 100,
    avg_monthly_earnings_high: 500,
    priority: 6,
    is_active: true,
    setup_instructions: 'Sign up as a wellness provider and offer fitness services through the Gympass platform.',
    referral_link_template: 'https://gympass.com'
  },
  {
    name: 'Airbnb Unit Rental',
    description: 'Rent out your property or spare rooms to travelers on Airbnb',
    logo: 'https://www.airbnb.com/favicon.ico',
    url: 'https://www.airbnb.com',
    login_url: 'https://www.airbnb.com/login',
    asset_types: ['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'],
    avg_monthly_earnings_low: 800,
    avg_monthly_earnings_high: 3000,
    priority: 10,
    is_active: true,
    setup_instructions: 'Create a host profile, upload property photos, set pricing and availability, complete verification.',
    referral_link_template: 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9'
  },
  {
    name: 'Airbnb Experience',
    description: 'Create and host unique experiences for travelers in your area',
    logo: 'https://www.airbnb.com/favicon.ico',
    url: 'https://www.airbnb.com/experiences',
    login_url: 'https://www.airbnb.com/login',
    asset_types: ['experience', 'tours', 'activities', 'local_expertise', 'hosting'],
    avg_monthly_earnings_low: 200,
    avg_monthly_earnings_high: 1500,
    priority: 8,
    is_active: true,
    setup_instructions: 'Define your experience concept, create detailed description, set pricing, complete host verification.',
    referral_link_template: 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a'
  },
  {
    name: 'Airbnb Service',
    description: 'Offer services to Airbnb hosts and guests in your area',
    logo: 'https://www.airbnb.com/favicon.ico',
    url: 'https://www.airbnb.com/help',
    login_url: 'https://www.airbnb.com/login',
    asset_types: ['services', 'cleaning', 'maintenance', 'hospitality'],
    avg_monthly_earnings_low: 300,
    avg_monthly_earnings_high: 2000,
    priority: 7,
    is_active: true,
    setup_instructions: 'Define service offerings, set pricing, complete verification, start accepting bookings.',
    referral_link_template: 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b'
  },
  {
    name: 'Kolonia Energy',
    description: 'Solar energy solutions for Florida and Texas properties',
    logo: 'https://koloniahouse.com/favicon.ico',
    url: 'https://koloniahouse.com',
    login_url: 'https://koloniahouse.com/login',
    asset_types: ['solar', 'rooftop', 'energy', 'renewable_energy'],
    avg_monthly_earnings_low: 180,
    avg_monthly_earnings_high: 750,
    priority: 8,
    is_active: true,
    setup_instructions: 'Schedule initial consultation, complete roof evaluation, review system design, proceed with installation.',
    referral_link_template: 'https://koloniahouse.com'
  }
];

const PROVIDER_UPDATES = [
  {
    name: 'Swimply',
    logo: 'https://swimply.com/favicon.ico',
    referral_link_template: 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523'
  },
  {
    name: 'Neighbor.com',
    logo: 'https://www.neighbor.com/favicon.ico',
    referral_link_template: 'http://www.neighbor.com/invited/eduardo-944857?program_version=1'
  },
  {
    name: 'Peerspace',
    logo: 'https://www.peerspace.com/favicon.ico',
    referral_link_template: 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq'
  },
  {
    name: 'SpotHero',
    logo: 'https://spothero.com/favicon.ico',
    referral_link_template: 'https://spothero.com/developers'
  },
  {
    name: 'Turo',
    logo: 'https://turo.com/favicon.ico',
    referral_link_template: 'https://turo.com/us/en/list-your-car'
  },
  {
    name: 'Tesla Energy',
    logo: 'https://www.tesla.com/favicon.ico',
    referral_link_template: 'https://www.tesla.com/solar'
  },
  {
    name: 'ChargePoint',
    logo: 'https://www.chargepoint.com/favicon.ico',
    referral_link_template: 'https://www.chargepoint.com/businesses/property-managers/'
  },
  {
    name: 'EVgo',
    logo: 'https://www.evgo.com/favicon.ico',
    referral_link_template: 'https://www.evgo.com/partners/'
  },
  {
    name: 'Little Free Library',
    logo: 'https://littlefreelibrary.org/favicon.ico',
    referral_link_template: 'https://littlefreelibrary.org/start/'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting service provider sync...');

    let addedCount = 0;
    let updatedCount = 0;
    let duplicatesRemoved = 0;

    // Step 1: Add missing providers
    console.log('📝 Adding missing providers...');
    for (const provider of MISSING_PROVIDERS) {
      const { data: existing, error: checkError } = await supabase
        .from('enhanced_service_providers')
        .select('id')
        .eq('name', provider.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking for ${provider.name}:`, checkError);
        continue;
      }

      if (!existing) {
        const { error: insertError } = await supabase
          .from('enhanced_service_providers')
          .insert(provider);

        if (insertError) {
          console.error(`Error inserting ${provider.name}:`, insertError);
        } else {
          console.log(`✅ Added ${provider.name}`);
          addedCount++;
        }
      } else {
        console.log(`⚠️ ${provider.name} already exists, skipping...`);
      }
    }

    // Step 2: Update existing providers with missing data
    console.log('🔧 Updating existing providers...');
    for (const update of PROVIDER_UPDATES) {
      const { error: updateError } = await supabase
        .from('enhanced_service_providers')
        .update({
          logo: update.logo,
          referral_link_template: update.referral_link_template
        })
        .eq('name', update.name)
        .or('logo.is.null,referral_link_template.is.null');

      if (updateError) {
        console.error(`Error updating ${update.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${update.name}`);
        updatedCount++;
      }
    }

    // Step 3: Remove duplicate Peerspace entries (keep the first one)
    console.log('🧹 Cleaning up duplicates...');
    const { data: peerspaceEntries, error: fetchError } = await supabase
      .from('enhanced_service_providers')
      .select('id, created_at')
      .eq('name', 'Peerspace')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching Peerspace entries:', fetchError);
    } else if (peerspaceEntries && peerspaceEntries.length > 1) {
      // Keep the first entry, delete the rest
      const idsToDelete = peerspaceEntries.slice(1).map(entry => entry.id);
      
      const { error: deleteError } = await supabase
        .from('enhanced_service_providers')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error removing duplicate Peerspace entries:', deleteError);
      } else {
        duplicatesRemoved = idsToDelete.length;
        console.log(`✅ Removed ${duplicatesRemoved} duplicate Peerspace entries`);
      }
    }

    // Step 4: Get final count of providers
    const { count: totalProviders, error: countError } = await supabase
      .from('enhanced_service_providers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting providers:', countError);
    }

    const result = {
      success: true,
      summary: {
        added: addedCount,
        updated: updatedCount,
        duplicatesRemoved,
        totalProviders: totalProviders || 0
      },
      message: `Sync completed: ${addedCount} added, ${updatedCount} updated, ${duplicatesRemoved} duplicates removed. Total providers: ${totalProviders || 0}`
    };

    console.log('✅ Service provider sync completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Service provider sync failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Service provider sync failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
