import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ServiceIntegration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'pending' | 'inactive';
  monthly_revenue_low: number;
  monthly_revenue_high: number;
  integration_url: string | null;
  partner_name: string;
  created_at: string;
  asset_types: string[];
  total_clicks: number;
  conversion_rate: number;
  logo_url?: string;
};

export type PartnerClick = {
  id: string;
  user_id: string;
  partner_name: string;
  referral_link: string;
  clicked_at: string;
  integration_status: string;
  user_email?: string;
};

// Improved name matching function
const getPartnerNameVariations = (name: string): string[] => {
  const variations = [name.toLowerCase().trim()];
  
  // Add common variations
  const nameMap: Record<string, string[]> = {
    'tesla energy': ['tesla', 'tesla solar', 'tesla energy'],
    'tesla': ['tesla energy', 'tesla solar'],
    'airbnb unit rental': ['airbnb', 'airbnb unit', 'airbnb rental'],
    'airbnb experience': ['airbnb', 'airbnb experience', 'airbnb experiences'],
    'airbnb service': ['airbnb', 'airbnb service', 'airbnb services'],
    'kolonia energy': ['kolonia', 'kolonia energy', 'kolonia house'],
    'honeygain': ['honeygain', 'honey gain'],
    'peerspace': ['peerspace', 'peer space'],
    'neighbor.com': ['neighbor', 'neighbor.com'],
    'swimply': ['swimply'],
    'spothero': ['spothero', 'spot hero'],
    'turo': ['turo'],
    'chargepoint': ['chargepoint', 'charge point'],
    'evgo': ['evgo', 'ev go'],
    'little free library': ['little free library', 'library', 'free library']
  };
  
  const baseName = name.toLowerCase().trim();
  
  // Add exact matches and variations
  Object.entries(nameMap).forEach(([key, values]) => {
    if (values.includes(baseName) || key === baseName) {
      variations.push(...values);
    }
  });
  
  return [...new Set(variations)];
};

const matchesPartnerName = (clickName: string, providerName: string): boolean => {
  if (!clickName || !providerName) return false;
  
  const clickVariations = getPartnerNameVariations(clickName);
  const providerVariations = getPartnerNameVariations(providerName);
  
  // Check for any overlap between variations
  return clickVariations.some(clickVar => 
    providerVariations.some(provVar => 
      clickVar === provVar || 
      clickVar.includes(provVar) || 
      provVar.includes(clickVar)
    )
  );
};

export const useServiceIntegrations = () => {
  const [integrations, setIntegrations] = useState<ServiceIntegration[]>([]);
  const [partnerClicks, setPartnerClicks] = useState<Record<string, PartnerClick[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user emails using our edge function
  const fetchUserEmails = async (userIds: string[]): Promise<Record<string, string>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.warn('No session token available for fetching user emails');
        return {};
      }

      const response = await fetch('/supabase/functions/get-admin-user-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        console.warn('Failed to fetch user emails:', response.status);
        return {};
      }

      const { userEmails } = await response.json();
      return userEmails || {};
    } catch (error) {
      console.warn('Error fetching user emails:', error);
      return {};
    }
  };

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching partner integrations data...');
        
        // Fetch all active partner data from enhanced_service_providers
        const { data: providersData, error: providersError } = await supabase
          .from('enhanced_service_providers')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (providersError) {
          console.error('Error fetching providers:', providersError);
          throw providersError;
        }

        console.log('Fetched providers:', providersData?.length || 0);
        providersData?.forEach(p => console.log('Provider:', p.name));

        // Fetch click tracking data from partner_integration_progress
        const { data: clicksData, error: clicksError } = await supabase
          .from('partner_integration_progress')
          .select('*')
          .not('referral_link', 'is', null)
          .order('created_at', { ascending: false });

        if (clicksError) {
          console.error('Error fetching clicks:', clicksError);
          throw clicksError;
        }

        console.log('Fetched clicks:', clicksData?.length || 0);
        clicksData?.forEach(c => console.log('Click:', c.partner_name, 'at', c.created_at));

        // Get unique user IDs and fetch their emails
        const userIds = [...new Set(clicksData?.map(click => click.user_id).filter(Boolean) || [])];
        const userEmails = await fetchUserEmails(userIds);
        
        console.log('Fetched user emails for', Object.keys(userEmails).length, 'users');

        // Process the data with improved matching logic
        const processedIntegrations: ServiceIntegration[] = (providersData || []).map(provider => {
          // Use improved name matching
          const providerClicks = clicksData?.filter(click => {
            const matches = matchesPartnerName(click.partner_name, provider.name);
            if (matches) {
              console.log(`✅ Matched click "${click.partner_name}" to provider "${provider.name}"`);
            }
            return matches;
          }) || [];

          const totalClicks = providerClicks.length;
          const completedRegistrations = providerClicks.filter(click => 
            click.integration_status === 'completed'
          ).length;
          
          const conversionRate = totalClicks > 0 ? (completedRegistrations / totalClicks) * 100 : 0;

          console.log(`Processing ${provider.name}: ${totalClicks} clicks, ${completedRegistrations} completed`);

          return {
            id: provider.id,
            name: provider.name,
            description: provider.description || '',
            icon: getIconForAssetType(provider.asset_types?.[0] || 'general'),
            status: provider.is_active ? 'active' : 'inactive',
            monthly_revenue_low: provider.avg_monthly_earnings_low || 0,
            monthly_revenue_high: provider.avg_monthly_earnings_high || 0,
            integration_url: provider.login_url,
            partner_name: provider.name,
            created_at: provider.created_at || new Date().toISOString(),
            asset_types: provider.asset_types || [],
            total_clicks: totalClicks,
            conversion_rate: Math.round(conversionRate * 100) / 100,
            logo_url: provider.logo
          };
        });

        console.log('Processed integrations:', processedIntegrations.length);
        setIntegrations(processedIntegrations);

        // Group clicks by partner for detailed view with user emails and improved matching
        const groupedClicks: Record<string, PartnerClick[]> = {};
        
        // First, create groups for all providers
        for (const provider of providersData || []) {
          groupedClicks[provider.name] = [];
        }
        
        // Then assign clicks to the best matching provider
        for (const click of clicksData || []) {
          if (!click.partner_name) continue;
          
          // Find the best matching provider
          let bestMatch = null;
          let bestProvider = null;
          
          for (const provider of providersData || []) {
            if (matchesPartnerName(click.partner_name, provider.name)) {
              // Prefer exact matches or longer matches
              if (!bestMatch || provider.name.length > bestMatch.length) {
                bestMatch = provider.name;
                bestProvider = provider;
              }
            }
          }
          
          const targetGroup = bestMatch || click.partner_name;
          
          if (!groupedClicks[targetGroup]) {
            groupedClicks[targetGroup] = [];
          }
          
          groupedClicks[targetGroup].push({
            id: click.id,
            user_id: click.user_id,
            partner_name: click.partner_name,
            referral_link: click.referral_link || '',
            clicked_at: click.created_at || '',
            integration_status: click.integration_status || 'pending',
            user_email: userEmails[click.user_id] || `User ${click.user_id?.slice(0, 8)}...`
          });
        }

        console.log('Grouped clicks by partner:', Object.keys(groupedClicks).length, 'partners');
        Object.entries(groupedClicks).forEach(([partner, clicks]) => {
          if (clicks.length > 0) {
            console.log(`${partner}: ${clicks.length} clicks`);
          }
        });
        
        setPartnerClicks(groupedClicks);
        
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();

    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('service_integrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enhanced_service_providers'
        },
        () => {
          console.log('Enhanced service providers updated, refreshing...');
          fetchIntegrations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_integration_progress'
        },
        () => {
          console.log('Partner integration progress updated, refreshing...');
          fetchIntegrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addIntegration = async (integration: Omit<ServiceIntegration, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('enhanced_service_providers')
        .insert({
          name: integration.name,
          description: integration.description,
          asset_types: integration.asset_types,
          avg_monthly_earnings_low: integration.monthly_revenue_low,
          avg_monthly_earnings_high: integration.monthly_revenue_high,
          login_url: integration.integration_url,
          is_active: integration.status === 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      console.error('Error adding integration:', err);
      return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  const updateIntegrationStatus = async (id: string, status: 'active' | 'pending' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('enhanced_service_providers')
        .update({ is_active: status === 'active' })
        .eq('id', id);

      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error updating integration status:', err);
      return { success: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  return {
    integrations,
    partnerClicks,
    loading,
    error,
    addIntegration,
    updateIntegrationStatus
  };
};

// Helper function to get appropriate icon for asset type
function getIconForAssetType(assetType: string): string {
  const iconMap: Record<string, string> = {
    'short_term_rental': 'home',
    'rental': 'home',
    'room_rental': 'bed',
    'experience': 'calendar',
    'tours': 'map',
    'services': 'wrench',
    'solar': 'sun',
    'rooftop': 'sun',
    'energy': 'zap',
    'library': 'book',
    'community': 'users',
    'ev_charging': 'battery-charging',
    'internet': 'wifi',
    'bandwidth': 'wifi', 
    'pool': 'waves',
    'swimming_pool': 'waves',
    'parking': 'car',
    'driveway': 'car',
    'storage': 'package',
    'garage': 'package',
    'event_space': 'calendar',
    'garden': 'flower',
    'yard': 'trees',
    'home_gym': 'dumbbell',
    'fitness': 'dumbbell',
    'wellness': 'heart',
    'vehicle': 'car',
    'car': 'car',
    'home_interior': 'home',
    'general': 'settings'
  };

  return iconMap[assetType.toLowerCase()] || 'settings';
}
