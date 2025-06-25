
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ServiceProviderInfo, 
  ServiceProviderEarnings
} from '../types';

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
        console.log('🔄 No user found, using mock data');
        setIsLoading(false);
        setError(null);
        
        // Set mock providers
        const mockProviders: ServiceProviderInfo[] = [
          {
            id: 'solar-provider',
            name: 'Solar Provider',
            description: 'Solar panel installation and maintenance',
            logo: '/placeholder.svg',
            url: 'https://example.com',
            loginUrl: 'https://example.com/login',
            assetTypes: ['rooftop'],
            connected: false,
            setupInstructions: 'Contact our team to set up solar panels',
            referralLinkTemplate: undefined
          }
        ];
        
        setAvailableProviders(mockProviders);
        setConnectedProviders([]);
        setEarnings([]);
        return;
      }

      try {
        console.log('🔄 Fetching service providers for user:', user.email);
        setIsLoading(true);
        setError(null);

        // Try to fetch from service_providers table, fallback to mock data
        let servicesData = [];
        try {
          const { data, error: servicesError } = await supabase
            .from('service_providers')
            .select('*');

          if (servicesError) {
            console.warn('⚠️ Service providers table error, using mock data:', servicesError);
            servicesData = [];
          } else {
            servicesData = data || [];
          }
        } catch (servicesErr) {
          console.warn('⚠️ Failed to fetch service providers, using mock data:', servicesErr);
          servicesData = [];
        }

        // Format the service provider data or use mock data
        const formattedProviders: ServiceProviderInfo[] = servicesData.length > 0 
          ? servicesData.map(provider => ({
              id: provider.id,
              name: provider.name,
              description: provider.description || '',
              logo: provider.logo_url || '/placeholder.svg',
              url: provider.website_url || '',
              loginUrl: provider.website_url || '',
              assetTypes: [provider.category],
              connected: false,
              setupInstructions: `Contact ${provider.name} to get started`,
              referralLinkTemplate: undefined
            }))
          : [
              {
                id: 'solar-provider',
                name: 'Solar Provider',
                description: 'Solar panel installation and maintenance',
                logo: '/placeholder.svg',
                url: 'https://example.com',
                loginUrl: 'https://example.com/login',
                assetTypes: ['rooftop'],
                connected: false,
                setupInstructions: 'Contact our team to set up solar panels',
                referralLinkTemplate: undefined
              }
            ];

        setAvailableProviders(formattedProviders);
        setConnectedProviders([]);
        setEarnings([]);

        console.log('✅ Service providers loaded successfully');
      } catch (err) {
        console.error('❌ Critical error fetching service providers:', err);
        setError('Failed to load service providers. Using offline mode.');
        
        // Set fallback mock data
        setAvailableProviders([
          {
            id: 'solar-provider',
            name: 'Solar Provider',
            description: 'Solar panel installation and maintenance',
            logo: '/placeholder.svg',
            url: 'https://example.com',
            loginUrl: 'https://example.com/login',
            assetTypes: ['rooftop'],
            connected: false,
            setupInstructions: 'Contact our team to set up solar panels',
            referralLinkTemplate: undefined
          }
        ]);
        setConnectedProviders([]);
        setEarnings([]);
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
