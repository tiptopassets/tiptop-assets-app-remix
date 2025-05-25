
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ServiceProvider,
  RegisterServiceFormData,
  AffiliateRegistration,
} from '../types';

export const useProviderActions = (
  availableProviders: ServiceProvider[],
  setAvailableProviders: (providers: ServiceProvider[]) => void,
  connectedProviders: AffiliateRegistration[],
  setConnectedProviders: (providers: AffiliateRegistration[]) => void
) => {
  const [actionInProgress, setActionInProgress] = useState(false);
  const { toast } = useToast();

  // Connect to a service provider
  const connectToProvider = async (providerId: string, userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to connect to service providers',
        variant: 'destructive'
      });
      return;
    }
    
    setActionInProgress(true);
    try {
      // Create affiliate registration
      const provider = availableProviders.find(p => p.id === providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }

      // Generate unique tracking code
      const trackingCode = `tiptop_${userId.slice(0, 8)}_${provider.id.slice(0, 8)}_${Date.now()}`;

      const { data, error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: userId,
          provider_id: providerId,
          tracking_code: trackingCode,
          registration_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update connected providers list
      const newRegistration: AffiliateRegistration = {
        id: data.id,
        user_id: userId,
        bundle_selection_id: '',
        provider_id: providerId,
        tracking_code: trackingCode,
        registration_status: 'pending',
        total_earnings: 0,
        last_sync_at: new Date().toISOString()
      };

      setConnectedProviders([...connectedProviders, newRegistration]);

      toast({
        title: 'Connected Successfully',
        description: `Connected to ${provider.name}`,
      });
    } catch (err) {
      console.error('Error connecting to provider:', err);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to service provider',
        variant: 'destructive'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Register with a service provider
  const registerWithProvider = async (formData: RegisterServiceFormData, userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to register with service providers',
        variant: 'destructive'
      });
      return;
    }
    
    setActionInProgress(true);
    try {
      const provider = availableProviders.find(p => p.id === formData.providerId);
      if (!provider) throw new Error('Provider not found');

      // Generate unique tracking code
      const trackingCode = `tiptop_${userId.slice(0, 8)}_${provider.id.slice(0, 8)}_${Date.now()}`;

      // Create affiliate registration record
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: userId,
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
          .replace('{user_id}', userId)
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
        title: 'Registration Started',
        description: `Redirecting to ${provider.name} for registration`,
      });

      // Open provider registration in new tab
      window.open(affiliateLink || provider.website_url, '_blank');

      // Update connected providers list
      const newRegistration: AffiliateRegistration = {
        id: data.id,
        user_id: userId,
        bundle_selection_id: formData.bundleSelectionId || '',
        provider_id: formData.providerId,
        affiliate_link: affiliateLink,
        tracking_code: trackingCode,
        registration_status: 'pending',
        total_earnings: 0,
        last_sync_at: new Date().toISOString()
      };

      setConnectedProviders([...connectedProviders, newRegistration]);
    } catch (err) {
      console.error('Error registering with provider:', err);
      toast({
        title: 'Registration Failed',
        description: 'Failed to register with service provider',
        variant: 'destructive'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Disconnect from a service provider
  const disconnectProvider = async (providerId: string, userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to disconnect from service providers',
        variant: 'destructive'
      });
      return;
    }
    
    setActionInProgress(true);
    try {
      const { error } = await supabase
        .from('affiliate_registrations')
        .delete()
        .eq('user_id', userId)
        .eq('provider_id', providerId);

      if (error) throw error;

      // Update connected providers list
      setConnectedProviders(connectedProviders.filter(p => p.provider_id !== providerId));

      toast({
        title: 'Disconnected Successfully',
        description: 'Provider has been disconnected',
      });
    } catch (err) {
      console.error('Error disconnecting provider:', err);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from service provider',
        variant: 'destructive'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Sync earnings data from a service provider
  const syncProviderEarnings = async (providerId: string, userId: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to sync earnings',
        variant: 'destructive'
      });
      return;
    }
    
    setActionInProgress(true);
    try {
      // Call edge function to sync earnings
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: {
          user_id: userId,
          provider_id: providerId
        }
      });

      if (error) throw error;

      toast({
        title: 'Earnings Synced',
        description: 'Successfully synced earnings data',
      });
    } catch (err) {
      console.error('Error syncing provider earnings:', err);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync earnings from provider',
        variant: 'destructive'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Generate a referral link synchronously
  const generateReferralLink = (providerId: string, destinationUrl: string, userId: string | undefined): string => {
    const provider = availableProviders.find(p => p.id === providerId);
    
    if (provider?.referral_link_template && userId) {
      return provider.referral_link_template
        .replace('{user_id}', userId)
        .replace('{destination_url}', encodeURIComponent(destinationUrl));
    }
    
    // If no template or user is not logged in, return the original URL
    return destinationUrl;
  };

  return {
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink,
    actionInProgress
  };
};
