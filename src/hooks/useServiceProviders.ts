
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceProvider, AffiliateRegistration, RegisterServiceFormData } from '@/contexts/ServiceProviders/types';
import { useToast } from '@/hooks/use-toast';

export const useServiceProviders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      setAvailableProviders(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Type the data properly
      const typedRegistrations: AffiliateRegistration[] = (data || []).map(reg => ({
        id: reg.id,
        user_id: reg.user_id,
        bundle_selection_id: reg.bundle_selection_id || '',
        provider_id: reg.provider_id,
        affiliate_link: reg.affiliate_link,
        tracking_code: reg.tracking_code,
        registration_status: reg.registration_status as 'pending' | 'completed' | 'failed',
        registration_date: reg.registration_date,
        first_commission_date: reg.first_commission_date,
        total_earnings: reg.total_earnings,
        last_sync_at: reg.last_sync_at
      }));

      setConnectedProviders(typedRegistrations);
      
      // Calculate total earnings by provider
      const earningsByProvider = typedRegistrations.reduce((acc, reg) => {
        acc[reg.provider_id] = (acc[reg.provider_id] || 0) + reg.total_earnings;
        return acc;
      }, {} as Record<string, number>);
      
      setEarnings(earningsByProvider);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register with providers",
        variant: "destructive"
      });
      return;
    }

    try {
      const provider = availableProviders.find(p => p.id === formData.providerId);
      if (!provider) throw new Error('Provider not found');

      // Generate unique tracking code
      const trackingCode = `tiptop_${user.id.slice(0, 8)}_${provider.id.slice(0, 8)}_${Date.now()}`;

      // Create affiliate registration record
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: user.id,
          provider_id: formData.providerId,
          bundle_selection_id: formData.bundleSelectionId,
          tracking_code: trackingCode,
          registration_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Generate affiliate link if template exists
      let affiliateLink = provider.website_url;
      if (provider.referral_link_template) {
        affiliateLink = provider.referral_link_template
          .replace('{user_id}', user.id)
          .replace('{tracking_code}', trackingCode);
      }

      // Update with affiliate link
      if (affiliateLink !== provider.website_url) {
        await supabase
          .from('affiliate_registrations')
          .update({ affiliate_link: affiliateLink })
          .eq('id', data.id);
      }

      toast({
        title: "Registration Started",
        description: `Redirecting to ${provider.name} for registration`,
      });

      // Open provider registration in new tab
      window.open(affiliateLink || provider.website_url, '_blank');

      // Refresh user registrations
      await fetchUserRegistrations();

    } catch (err) {
      console.error('Error registering with provider:', err);
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : 'Failed to register with provider',
        variant: "destructive"
      });
    }
  };

  const connectToProvider = async (providerId: string) => {
    // This is a wrapper for registerWithProvider for backwards compatibility
    await registerWithProvider({
      providerId,
      userEmail: user?.email || '',
      propertyAddress: '',
      assetType: ''
    });
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('affiliate_registrations')
        .delete()
        .eq('user_id', user.id)
        .eq('provider_id', providerId);

      if (error) throw error;

      toast({
        title: "Provider Disconnected",
        description: "Successfully disconnected from provider",
      });

      await fetchUserRegistrations();
    } catch (err) {
      console.error('Error disconnecting provider:', err);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from provider",
        variant: "destructive"
      });
    }
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) return;

    try {
      // Call edge function to sync earnings
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: {
          user_id: user.id,
          provider_id: providerId
        }
      });

      if (error) throw error;

      toast({
        title: "Earnings Synced",
        description: "Successfully synced earnings data",
      });

      await fetchUserRegistrations();
    } catch (err) {
      console.error('Error syncing earnings:', err);
      toast({
        title: "Sync Failed",
        description: "Failed to sync earnings data",
        variant: "destructive"
      });
    }
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    if (!user) return destinationUrl;

    const provider = availableProviders.find(p => p.id === providerId);
    if (!provider?.referral_link_template) return destinationUrl;

    return provider.referral_link_template
      .replace('{user_id}', user.id)
      .replace('{destination_url}', encodeURIComponent(destinationUrl));
  };

  return {
    availableProviders,
    connectedProviders,
    earnings,
    loading,
    error,
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink,
    refetch: fetchUserRegistrations
  };
};
