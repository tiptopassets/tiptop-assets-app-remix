
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceProvider, AffiliateRegistration } from '@/contexts/ServiceProviders/types';

// Temporary type for database row until Supabase types are updated
interface ServiceProviderRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  commission_rate: number;
  setup_cost: number;
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
  priority: number;
  is_active: boolean;
  conversion_rate?: number | null;
  referral_link_template?: string | null;
  affiliate_program_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useServiceProviders = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    if (user) {
      fetchConnectedProviders();
    }
  }, [user]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match ServiceProvider interface
      const transformedProviders: ServiceProvider[] = (data as ServiceProviderRow[]).map(provider => ({
        id: provider.id,
        name: provider.name,
        category: provider.category,
        description: provider.description || '',
        logo_url: provider.logo_url,
        website_url: provider.website_url,
        affiliate_program_url: provider.affiliate_program_url || '',
        referral_link_template: provider.referral_link_template || '',
        commission_rate: provider.commission_rate,
        setup_cost: provider.setup_cost,
        avg_monthly_earnings_low: provider.avg_monthly_earnings_low,
        avg_monthly_earnings_high: provider.avg_monthly_earnings_high,
        conversion_rate: provider.conversion_rate || 2.5,
        priority: provider.priority,
        is_active: provider.is_active
      }));
      
      setProviders(transformedProviders);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnectedProviders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        registration_status: item.registration_status as 'pending' | 'completed' | 'failed'
      }));
      
      setConnectedProviders(typedData);
    } catch (err) {
      console.error('Error fetching connected providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connected providers');
    }
  };

  return {
    providers,
    connectedProviders,
    isLoading,
    error,
    refetch: fetchProviders,
    refetchConnected: fetchConnectedProviders
  };
};
