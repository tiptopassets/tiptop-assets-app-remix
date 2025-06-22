
import { useState } from 'react';
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
      // For now, we'll use the partner_integration_progress table to track connections
      // This is a placeholder until proper affiliate tables are created
      
      // Find the provider and update UI
      const provider = availableProviders.find(p => p.id.toLowerCase() === providerId.toLowerCase());
      if (provider) {
        const updatedProvider = {...provider, connected: true};
        setConnectedProviders([...connectedProviders, updatedProvider]);
        setAvailableProviders(
          availableProviders.map(p => 
            p.id.toLowerCase() === providerId.toLowerCase() 
              ? {...p, connected: true} 
              : p
          )
        );
        
        toast({
          title: 'Provider Connected',
          description: `Successfully connected to ${provider.name}`,
        });
      }
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
      toast({
        title: 'Registration Started',
        description: 'Provider registration functionality will be available soon',
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
        title: 'Provider Disconnected',
        description: 'Successfully disconnected from provider',
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
