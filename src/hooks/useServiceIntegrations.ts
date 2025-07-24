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

// Comprehensive partner name matching with exact database names
const normalizePartnerName = (clickName: string): string => {
  if (!clickName) return '';
  
  const normalized = clickName.toLowerCase().trim();
  
  // Exact mappings to database partner names
  const nameMap: Record<string, string> = {
    // Tesla variations
    'tesla': 'Tesla Energy',
    'tesla solar': 'Tesla Energy',
    'tesla energy': 'Tesla Energy',
    
    // Airbnb variations
    'airbnb': 'Airbnb Unit Rental',
    'airbnb unit rental': 'Airbnb Unit Rental',
    'airbnb experience': 'Airbnb Experience',
    'airbnb service': 'Airbnb Service',
    
    // Kolonia variations
    'kolonia': 'Kolonia Energy',
    'kolonia house': 'Kolonia Energy',
    'kolonia energy': 'Kolonia Energy',
    
    // Honeygain variations
    'honeygain': 'Honeygain',
    'honey gain': 'Honeygain',
    
    // Gympass variations
    'gympass': 'Gympass',
    'gym pass': 'Gympass',
    
    // Neighbor variations
    'neighbor': 'Neighbor.com',
    'neighbor.com': 'Neighbor.com',
    
    // Other exact matches
    'swimply': 'Swimply',
    'peerspace': 'Peerspace',
    'spothero': 'SpotHero',
    'spot hero': 'SpotHero',
    'turo': 'Turo',
    'chargepoint': 'ChargePoint',
    'charge point': 'ChargePoint',
    'evgo': 'EVgo',
    'ev go': 'EVgo',
    'little free library': 'Little Free Library'
  };
  
  return nameMap[normalized] || clickName;
};

const matchesPartnerName = (clickName: string, providerName: string): boolean => {
  if (!clickName || !providerName) return false;
  
  const normalizedClickName = normalizePartnerName(clickName);
  const normalizedProviderName = providerName.trim();
  
  // Exact match after normalization
  if (normalizedClickName === normalizedProviderName) {
    return true;
  }
  
  // Fallback to loose matching
  const clickLower = clickName.toLowerCase().trim();
  const providerLower = providerName.toLowerCase().trim();
  
  return clickLower === providerLower || 
         clickLower.includes(providerLower) || 
         providerLower.includes(clickLower);
};

export const useServiceIntegrations = () => {
  const [integrations, setIntegrations] = useState<ServiceIntegration[]>([]);
  const [partnerClicks, setPartnerClicks] = useState<Record<string, PartnerClick[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user emails
  const fetchUserEmails = async (userIds: string[]): Promise<Record<string, string>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.warn('No session token available for fetching user emails');
        return {};
      }

      const response = await fetch('/functions/v1/get-admin-user-details', {
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
        console.log('🔄 Fetching enhanced service providers...');
        
        // Fetch all active providers from enhanced_service_providers
        const { data: providersData, error: providersError } = await supabase
          .from('enhanced_service_providers')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (providersError) {
          console.error('❌ Error fetching providers:', providersError);
          throw providersError;
        }

        console.log('✅ Fetched providers:', providersData?.length || 0);
        console.log('📋 Provider names:', providersData?.map(p => p.name) || []);

        // Fetch click tracking data
        const { data: clicksData, error: clicksError } = await supabase
          .from('partner_integration_progress')
          .select('*')
          .not('referral_link', 'is', null)
          .order('created_at', { ascending: false });

        if (clicksError) {
          console.error('❌ Error fetching clicks:', clicksError);
          throw clicksError;
        }

        console.log('✅ Fetched clicks:', clicksData?.length || 0);
        console.log('🔗 Click partner names:', [...new Set(clicksData?.map(c => c.partner_name) || [])]);

        // Get user emails
        const userIds = [...new Set(clicksData?.map(click => click.user_id).filter(Boolean) || [])];
        const userEmails = await fetchUserEmails(userIds);

        // Process integrations
        const processedIntegrations: ServiceIntegration[] = (providersData || []).map(provider => {
          const providerClicks = clicksData?.filter(click => 
            matchesPartnerName(click.partner_name, provider.name)
          ) || [];

          const totalClicks = providerClicks.length;
          const completedRegistrations = providerClicks.filter(click => 
            click.integration_status === 'completed'
          ).length;
          
          const conversionRate = totalClicks > 0 ? (completedRegistrations / totalClicks) * 100 : 0;

          console.log(`📊 ${provider.name}: ${totalClicks} clicks, ${completedRegistrations} completed`);

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

        setIntegrations(processedIntegrations);

        // Group clicks by partner
        const groupedClicks: Record<string, PartnerClick[]> = {};
        
        // Initialize groups for all providers
        for (const provider of providersData || []) {
          groupedClicks[provider.name] = [];
        }
        
        // Assign clicks to providers
        for (const click of clicksData || []) {
          if (!click.partner_name) continue;
          
          const matchingProvider = providersData?.find(provider => 
            matchesPartnerName(click.partner_name, provider.name)
          );
          
          const targetGroup = matchingProvider?.name || click.partner_name;
          
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
        
        setPartnerClicks(groupedClicks);
        
      } catch (err) {
        console.error('❌ Error fetching integrations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();

    // Set up real-time subscriptions
    const subscription = supabase
      .channel('service_integrations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enhanced_service_providers' }, fetchIntegrations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_integration_progress' }, fetchIntegrations)
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
          is_active: integration.status === 'active',
          logo: integration.logo_url
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
    'guest_room': 'bed',
    'property': 'home',
    'experience': 'calendar',
    'tours': 'map',
    'activities': 'calendar',
    'local_expertise': 'users',
    'hosting': 'users',
    'services': 'wrench',
    'cleaning': 'wrench',
    'maintenance': 'wrench',
    'hospitality': 'users',
    'solar': 'sun',
    'rooftop': 'sun',
    'energy': 'zap',
    'renewable_energy': 'zap',
    'library': 'book',
    'community': 'users',
    'books': 'book',
    'ev_charging': 'battery-charging',
    'charging': 'battery-charging',
    'electric_vehicle': 'car',
    'internet': 'wifi',
    'bandwidth': 'wifi',
    'wifi': 'wifi',
    'pool': 'waves',
    'swimming_pool': 'waves',
    'hot_tub': 'waves',
    'parking': 'car',
    'driveway': 'car',
    'garage_parking': 'car',
    'storage': 'package',
    'garage': 'package',
    'basement': 'package',
    'shed': 'package',
    'event_space': 'calendar',
    'creative_space': 'palette',
    'meeting_room': 'users',
    'garden': 'flower',
    'yard': 'trees',
    'home_gym': 'dumbbell',
    'fitness': 'dumbbell',
    'wellness': 'heart',
    'vehicle': 'car',
    'car': 'car',
    'transportation': 'car',
    'home_interior': 'home',
    'general': 'settings'
  };

  return iconMap[assetType.toLowerCase()] || 'settings';
}
