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

export const useServiceIntegrations = () => {
  const [integrations, setIntegrations] = useState<ServiceIntegration[]>([]);
  const [partnerClicks, setPartnerClicks] = useState<Record<string, PartnerClick[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

        // Fetch partner click events for admin dashboard
        console.log('🔄 Fetching partner click events...');
        const { data: clicksData, error: clicksError } = await supabase
          .from('partner_integration_progress')
          .select('*')
          .order('created_at', { ascending: false });

        if (clicksError) {
          console.error('❌ Error fetching clicks:', clicksError);
          // Don't throw here, just log and continue without click data
        }

        console.log('✅ Fetched click events:', clicksData?.length || 0);

        // Group clicks by partner name
        const clicksByPartner: Record<string, PartnerClick[]> = {};
        (clicksData || []).forEach(click => {
          const partnerName = click.partner_name;
          if (!clicksByPartner[partnerName]) {
            clicksByPartner[partnerName] = [];
          }
          clicksByPartner[partnerName].push({
            id: click.id,
            user_id: click.user_id,
            partner_name: click.partner_name,
            referral_link: click.referral_link || '',
            clicked_at: click.created_at,
            integration_status: click.integration_status,
            user_email: (click.registration_data as any)?.user_email || undefined
          });
        });
        
        // Process integrations with click stats
        const processedIntegrations: ServiceIntegration[] = (providersData || []).map(provider => {
          const partnerClicks = clicksByPartner[provider.name] || [];
          const totalClicks = partnerClicks.length;
          const completedClicks = partnerClicks.filter(click => 
            click.integration_status === 'completed' || 
            click.integration_status === 'active'
          ).length;
          const conversionRate = totalClicks > 0 ? Math.round((completedClicks / totalClicks) * 100) : 0;

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
            conversion_rate: conversionRate,
            logo_url: provider.logo
          };
        });

        setIntegrations(processedIntegrations);
        setPartnerClicks(clicksByPartner);
        console.log('✅ Integration data processing complete');
        
      } catch (err) {
        console.error('❌ Error fetching integrations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      console.log('🔄 Setting up realtime subscription for partner clicks...');
      
      const channel = supabase
        .channel('partner-integration-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'partner_integration_progress'
          },
          (payload) => {
            console.log('📡 Realtime update received:', payload.eventType, payload.new);
            
            // Refetch integrations to update click counts and conversion rates
            fetchIntegrations();
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime subscription status:', status);
        });

      return () => {
        console.log('🔌 Cleaning up realtime subscription...');
        supabase.removeChannel(channel);
      };
    };

    fetchIntegrations();
    const cleanup = setupRealtimeSubscription();

    return cleanup;
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
    'solar': 'sun',
    'rooftop': 'sun',
    'energy': 'zap',
    'ev_charging': 'battery-charging',
    'internet': 'wifi',
    'bandwidth': 'wifi',
    'pool': 'waves',
    'parking': 'car',
    'storage': 'package',
    'event_space': 'calendar',
    'garden': 'flower',
    'fitness': 'dumbbell',
    'vehicle': 'car',
    'general': 'settings'
  };

  return iconMap[assetType.toLowerCase()] || 'settings';
}