
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

        // Fetch click tracking data from partner_integration_progress
        const { data: clicksData, error: clicksError } = await supabase
          .from('partner_integration_progress')
          .select(`
            *,
            user_id
          `)
          .not('referral_link', 'is', null);

        if (clicksError) {
          console.error('Error fetching clicks:', clicksError);
          throw clicksError;
        }

        console.log('Fetched clicks:', clicksData?.length || 0);

        // Fetch user emails for better identification
        const userIds = [...new Set(clicksData?.map(click => click.user_id).filter(Boolean) || [])];
        const userEmails: Record<string, string> = {};
        
        if (userIds.length > 0) {
          // Fetch user emails from auth.users via admin API
          try {
            const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
            if (authResponse?.users && !authError) {
              authResponse.users.forEach(user => {
                if (user.id && user.email) {
                  userEmails[user.id] = user.email;
                }
              });
            }
          } catch (authError) {
            console.warn('Could not fetch user emails:', authError);
          }
        }

        // Process the data with improved matching logic
        const processedIntegrations: ServiceIntegration[] = (providersData || []).map(provider => {
          // Use case-insensitive matching and trim whitespace
          const providerClicks = clicksData?.filter(click => 
            click.partner_name?.toLowerCase().trim() === provider.name?.toLowerCase().trim()
          ) || [];

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

        // Group clicks by partner for detailed view with user emails
        const groupedClicks: Record<string, PartnerClick[]> = {};
        for (const click of clicksData || []) {
          const partnerName = click.partner_name;
          if (!groupedClicks[partnerName]) {
            groupedClicks[partnerName] = [];
          }
          
          groupedClicks[partnerName].push({
            id: click.id,
            user_id: click.user_id,
            partner_name: click.partner_name,
            referral_link: click.referral_link || '',
            clicked_at: click.created_at || '',
            integration_status: click.integration_status || 'pending',
            user_email: userEmails[click.user_id] || undefined
          });
        }

        console.log('Grouped clicks:', Object.keys(groupedClicks).length, 'partners');
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
    'home_interior': 'home',
    'solar': 'sun',
    'rooftop': 'sun',
    'general': 'settings'
  };

  return iconMap[assetType.toLowerCase()] || 'settings';
}
