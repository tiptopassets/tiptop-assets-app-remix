
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ServiceProviderInfo, 
  ServiceProviderEarnings
} from '../types';
import { formatProviderInfo } from '../utils/providerUtils';

export const useProviderData = () => {
  const [availableProviders, setAvailableProviders] = useState<ServiceProviderInfo[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<ServiceProviderInfo[]>([]);
  const [earnings, setEarnings] = useState<ServiceProviderEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all available service providers
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');

        if (servicesError) throw servicesError;

        // Format the service provider data
        const formattedProviders: ServiceProviderInfo[] = (servicesData || []).map(formatProviderInfo);

        setAvailableProviders(formattedProviders);

        // Fetch user's connected providers
        const { data: credentialsData, error: credentialsError } = await supabase
          .from('affiliate_credentials')
          .select('*')
          .eq('user_id', user.id);

        if (credentialsError) throw credentialsError;

        // Check FlexOffers sub-affiliate mappings - using direct query since RPC doesn't exist
        let hasFlexOffersMapping = false;
        try {
          const { data: flexoffersData } = await supabase
            .from('affiliate_earnings')
            .select('service')
            .eq('user_id', user.id)
            .eq('service', 'FlexOffers')
            .single();
          
          hasFlexOffersMapping = !!flexoffersData;
        } catch (err) {
          // No FlexOffers mapping found
          hasFlexOffersMapping = false;
        }

        // Mark which providers are connected
        const connected = new Set((credentialsData || []).map(cred => cred.service.toLowerCase()));
        
        // Add FlexOffers if mapping exists
        if (hasFlexOffersMapping) {
          connected.add('flexoffers');
        }
        
        const updatedProviders = formattedProviders.map(provider => ({
          ...provider,
          connected: connected.has(provider.id)
        }));

        const connectedProvidersList = updatedProviders.filter(p => p.connected);
        
        setAvailableProviders(updatedProviders);
        setConnectedProviders(connectedProvidersList);

        // Fetch earnings data
        if (connectedProvidersList.length > 0) {
          const { data: earningsData, error: earningsError } = await supabase
            .from('affiliate_earnings')
            .select('*')
            .eq('user_id', user.id);

          if (earningsError) throw earningsError;

          setEarnings((earningsData || []).map(e => ({
            id: e.id,
            service: e.service,
            earnings: e.earnings || 0,
            lastSyncStatus: (e.last_sync_status as 'pending' | 'completed' | 'failed') || 'pending',
            updatedAt: new Date(e.updated_at)
          })));
        }
      } catch (err) {
        console.error('Error fetching service providers:', err);
        setError('Failed to load service providers');
        toast({
          title: 'Error',
          description: 'Failed to load service providers',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceProviders();
  }, [user, toast]);

  return {
    availableProviders,
    setAvailableProviders,
    connectedProviders, 
    setConnectedProviders,
    earnings,
    setEarnings,
    isLoading,
    error
  };
};
