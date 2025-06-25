
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceProviderInfo, RegisterServiceFormData } from '../types';

export const useProviderActions = (
  availableProviders: ServiceProviderInfo[],
  setAvailableProviders: (providers: ServiceProviderInfo[]) => void,
  connectedProviders: ServiceProviderInfo[],
  setConnectedProviders: (providers: ServiceProviderInfo[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connectToProvider = async (providerId: string, userId: string) => {
    try {
      setIsLoading(true);
      
      // Create affiliate registration
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: userId,
          provider_id: providerId,
          registration_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const provider = availableProviders.find(p => p.id === providerId);
      if (provider) {
        const connectedProvider = { ...provider, connected: true };
        setConnectedProviders([...connectedProviders, connectedProvider]);
        setAvailableProviders(availableProviders.map(p => 
          p.id === providerId ? connectedProvider : p
        ));
      }

      toast({
        title: "Success",
        description: "Successfully connected to provider"
      });

      return data;
    } catch (error) {
      console.error('Error connecting to provider:', error);
      toast({
        title: "Error",
        description: "Failed to connect to provider",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectProvider = async (providerId: string, userId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('affiliate_registrations')
        .delete()
        .eq('user_id', userId)
        .eq('provider_id', providerId);

      if (error) throw error;

      // Update local state
      setConnectedProviders(connectedProviders.filter(p => p.id !== providerId));
      setAvailableProviders(availableProviders.map(p => 
        p.id === providerId ? { ...p, connected: false } : p
      ));

      toast({
        title: "Success",
        description: "Successfully disconnected from provider"
      });
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect provider",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithProvider = async (formData: RegisterServiceFormData, userId: string) => {
    try {
      setIsLoading(true);
      
      // First create bundle selection if needed
      let bundleSelectionId = formData.bundleSelectionId;
      
      if (!bundleSelectionId) {
        const { data: bundleData, error: bundleError } = await supabase
          .from('user_bundle_selections')
          .insert({
            user_id: userId,
            property_address: formData.propertyAddress,
            selected_assets: [formData.assetType],
            selected_providers: [formData.providerId],
            status: 'pending'
          })
          .select()
          .single();

        if (bundleError) throw bundleError;
        bundleSelectionId = bundleData.id;
      }

      // Create affiliate registration
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .insert({
          user_id: userId,
          bundle_selection_id: bundleSelectionId,
          provider_id: formData.providerId,
          registration_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered with provider"
      });

      return data;
    } catch (error) {
      console.error('Error registering with provider:', error);
      toast({
        title: "Error",
        description: "Failed to register with provider",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncProviderEarnings = async (providerId: string, userId: string) => {
    try {
      setIsLoading(true);
      
      // Call the edge function to sync earnings
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: {
          user_id: userId,
          provider_id: providerId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Earnings synced successfully"
      });

      return data;
    } catch (error) {
      console.error('Error syncing earnings:', error);
      toast({
        title: "Error",
        description: "Failed to sync earnings",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralLink = (providerId: string, destinationUrl: string, userId: string): string => {
    try {
      const provider = availableProviders.find(p => p.id === providerId);
      
      if (provider?.referralLinkTemplate) {
        const subAffiliateId = `tiptop_${userId?.substring(0, 8) || 'guest'}`;
        return provider.referralLinkTemplate
          .replace('{{subAffiliateId}}', subAffiliateId)
          .replace('{{destinationUrl}}', encodeURIComponent(destinationUrl));
      }
      
      return destinationUrl;
    } catch (error) {
      console.error('Error generating referral link:', error);
      return destinationUrl;
    }
  };

  return {
    connectToProvider,
    disconnectProvider,
    registerWithProvider,
    syncProviderEarnings,
    generateReferralLink,
    isLoading
  };
};
