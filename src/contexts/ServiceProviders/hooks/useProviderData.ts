
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
        console.log('🔄 No user found, skipping provider data fetch');
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        console.log('🔄 Fetching service providers for user:', user.email);
        setIsLoading(true);
        setError(null);

        // Fetch service providers from service_providers table instead of services
        let servicesData;
        try {
          const { data, error: servicesError } = await supabase
            .from('service_providers')
            .select('*')
            .eq('is_active', true);

          if (servicesError) {
            console.warn('⚠️ Service providers table error:', servicesError);
            servicesData = [];
          } else {
            servicesData = data || [];
          }
        } catch (servicesErr) {
          console.warn('⚠️ Failed to fetch service providers, using empty array:', servicesErr);
          servicesData = [];
        }

        // Format the service provider data
        const formattedProviders: ServiceProviderInfo[] = servicesData.map(formatProviderInfo);
        setAvailableProviders(formattedProviders);

        // Fetch user's connected providers with error handling
        let credentialsData;
        try {
          const { data, error: credentialsError } = await supabase
            .from('affiliate_credentials')
            .select('*')
            .eq('user_id', user.id);

          if (credentialsError) {
            console.warn('⚠️ Affiliate credentials error:', credentialsError);
            credentialsData = [];
          } else {
            credentialsData = data || [];
          }
        } catch (credentialsErr) {
          console.warn('⚠️ Failed to fetch credentials, using empty array:', credentialsErr);
          credentialsData = [];
        }

        // Check FlexOffers sub-affiliate mappings with error handling
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
          // No FlexOffers mapping found or table doesn't exist
          hasFlexOffersMapping = false;
        }

        // Mark which providers are connected
        const connected = new Set((credentialsData || []).map(cred => cred.service?.toLowerCase()));
        
        // Add FlexOffers if mapping exists
        if (hasFlexOffersMapping) {
          connected.add('flexoffers');
        }
        
        const updatedProviders = formattedProviders.map(provider => ({
          ...provider,
          connected: connected.has(provider.id.toLowerCase())
        }));

        const connectedProvidersList = updatedProviders.filter(p => p.connected);
        
        setAvailableProviders(updatedProviders);
        setConnectedProviders(connectedProvidersList);

        // Fetch earnings data with error handling
        if (connectedProvidersList.length > 0) {
          try {
            const { data: earningsData, error: earningsError } = await supabase
              .from('affiliate_earnings')
              .select('*')
              .eq('user_id', user.id);

            if (earningsError) {
              console.warn('⚠️ Earnings data error:', earningsError);
              setEarnings([]);
            } else {
              setEarnings((earningsData || []).map(e => ({
                id: e.id,
                service: e.service,
                earnings: e.earnings || 0,
                lastSyncStatus: (e.last_sync_status as 'pending' | 'completed' | 'failed') || 'pending',
                updatedAt: new Date(e.updated_at)
              })));
            }
          } catch (earningsErr) {
            console.warn('⚠️ Failed to fetch earnings:', earningsErr);
            setEarnings([]);
          }
        } else {
          setEarnings([]);
        }

        console.log('✅ Service providers loaded successfully');
      } catch (err) {
        console.error('❌ Critical error fetching service providers:', err);
        setError('Failed to load service providers. This may be due to database connectivity issues.');
        
        // Don't show toast for database connectivity issues
        // The error will be handled by the parent component
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
