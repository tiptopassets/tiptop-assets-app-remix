
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider, AffiliateRegistration } from '@/contexts/ServiceProviders/types';

export const useServiceProviders = () => {
  const { user } = useAuth();
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      // Map database data to ServiceProvider type
      const mappedProviders: ServiceProvider[] = (data || []).map(provider => ({
        ...provider,
        conversion_rate: provider.conversion_rate || 2.5,
        affiliate_program_url: provider.affiliate_program_url || null,
        referral_link_template: provider.referral_link_template || null
      }));

      setAvailableProviders(mappedProviders);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectedProviders = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Map to AffiliateRegistration type
      const mappedRegistrations: AffiliateRegistration[] = (data || []).map(reg => ({
        id: reg.id,
        user_id: reg.user_id,
        bundle_selection_id: reg.bundle_selection_id || undefined,
        provider_id: reg.provider_id || undefined,
        affiliate_link: reg.affiliate_link || undefined,
        tracking_code: reg.tracking_code || undefined,
        registration_status: reg.registration_status as 'pending' | 'completed' | 'failed',
        registration_date: reg.registration_date || undefined,
        first_commission_date: reg.first_commission_date || undefined,
        total_earnings: Number(reg.total_earnings) || 0,
        last_sync_at: reg.last_sync_at || new Date().toISOString(),
        created_at: reg.created_at || new Date().toISOString()
      }));

      setConnectedProviders(mappedRegistrations);
    } catch (err) {
      console.error('Failed to load connected providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connected providers');
    }
  };

  const connectToProvider = async (providerId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: user.id,
          provider_id: providerId,
          registration_status: 'pending'
        });

      if (error) throw error;
      await loadConnectedProviders();
    } catch (err) {
      console.error('Failed to connect to provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to provider');
    }
  };

  const registerWithProvider = async (formData: any) => {
    console.log('Registration functionality is temporarily disabled');
  };

  const disconnectProvider = async (providerId: string) => {
    console.log('Disconnect functionality is temporarily disabled');
  };

  const syncProviderEarnings = async (providerId: string) => {
    console.log('Sync earnings functionality is temporarily disabled');
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    return destinationUrl; // Simplified implementation
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadConnectedProviders();
    }
  }, [user?.id]);

  return {
    availableProviders,
    connectedProviders,
    earnings,
    isLoading,
    error,
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink
  };
};
