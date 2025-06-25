
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ServiceProviderInfo,
  RegisterServiceFormData,
} from '../types';

export const useProviderActions = (
  availableProviders: ServiceProviderInfo[],
  setAvailableProviders: (providers: ServiceProviderInfo[]) => void,
  connectedProviders: ServiceProviderInfo[],
  setConnectedProviders: (providers: ServiceProviderInfo[]) => void
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
      // For FlexOffers, we'll generate a unique sub-affiliate ID for the user
      if (providerId.toLowerCase() === 'flexoffers') {
        const subAffiliateId = `tiptop_${userId.substring(0, 8)}`;
        
        // Create a placeholder in affiliate_earnings
        const { error: earningsError } = await supabase
          .from('affiliate_earnings')
          .insert({
            user_id: userId,
            service: 'FlexOffers',
            earnings: 0,
            last_sync_status: 'pending'
          });
        
        if (earningsError) throw earningsError;
        
        // Find the FlexOffers provider and update UI
        const flexoffersProvider = availableProviders.find(p => p.id.toLowerCase() === providerId.toLowerCase());
        if (flexoffersProvider) {
          const updatedProvider = {...flexoffersProvider, connected: true};
          setConnectedProviders([...connectedProviders, updatedProvider]);
          setAvailableProviders(
            availableProviders.map(p => 
              p.id.toLowerCase() === providerId.toLowerCase() 
                ? {...p, connected: true} 
                : p
            )
          );
        }
        
        toast({
          title: 'FlexOffers Connected',
          description: 'Successfully connected to FlexOffers',
        });
        
        return;
      }
      
      // For other providers, we'll use the existing flow
      toast({
        title: 'Coming Soon',
        description: 'Provider connection functionality will be available soon',
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
      // For FlexOffers, we'll register the sub-affiliate ID
      if (formData.service?.toLowerCase() === 'flexoffers' && formData.subAffiliateId) {
        // Create a placeholder in affiliate_earnings
        await supabase
          .from('affiliate_earnings')
          .insert({
            user_id: userId,
            service: 'FlexOffers',
            earnings: 0,
            last_sync_status: 'pending'
          });
        
        toast({
          title: 'FlexOffers Registered',
          description: 'Your FlexOffers sub-affiliate ID has been registered.',
        });
        
        // Refresh the providers list
        const provider = availableProviders.find(p => p.id.toLowerCase() === formData.service?.toLowerCase());
        if (provider) {
          setConnectedProviders([...connectedProviders, {...provider, connected: true}]);
          setAvailableProviders(
            availableProviders.map(p => 
              p.id.toLowerCase() === formData.service?.toLowerCase() 
                ? {...p, connected: true} 
                : p
            )
          );
        }
        
        return;
      }
      
      // For other providers, use the default flow
      toast({
        title: 'Coming Soon',
        description: 'Provider registration functionality will be available soon',
      });
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
      // For FlexOffers, remove the earnings record
      if (providerId.toLowerCase() === 'flexoffers') {
        await supabase
          .from('affiliate_earnings')
          .delete()
          .eq('user_id', userId)
          .eq('service', 'FlexOffers');
        
        // Update the UI
        setConnectedProviders(connectedProviders.filter(p => p.id.toLowerCase() !== providerId.toLowerCase()));
        setAvailableProviders(
          availableProviders.map(p => 
            p.id.toLowerCase() === providerId.toLowerCase() 
              ? {...p, connected: false} 
              : p
          )
        );
        
        toast({
          title: 'FlexOffers Disconnected',
          description: 'Successfully disconnected from FlexOffers',
        });
        
        return;
      }
      
      // For other providers, use the default flow
      toast({
        title: 'Coming Soon',
        description: 'Provider disconnection functionality will be available soon',
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
      toast({
        title: 'Coming Soon',
        description: 'Provider earnings sync functionality will be available soon',
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

  // Generate a referral link
  const generateReferralLink = async (providerId: string, destinationUrl: string, userId: string | undefined): Promise<string> => {
    const provider = availableProviders.find(p => p.id.toLowerCase() === providerId.toLowerCase());
    
    if (provider?.referralLinkTemplate && userId) {
      return provider.referralLinkTemplate
        .replace('{{subAffiliateId}}', `tiptop_${userId.substring(0, 8)}`)
        .replace('{{destinationUrl}}', encodeURIComponent(destinationUrl));
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
