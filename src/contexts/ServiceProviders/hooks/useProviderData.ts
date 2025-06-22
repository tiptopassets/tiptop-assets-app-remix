
import { useState, useEffect } from 'react';
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
        console.log('🔄 No user found, skipping provider data fetch');
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        console.log('🔄 Fetching service providers for user:', user.email);
        setIsLoading(true);
        setError(null);

        // Use enhanced_service_providers instead of services
        const formattedProviders: ServiceProviderInfo[] = [
          {
            id: 'flexoffers',
            name: 'FlexOffers',
            description: 'Affiliate marketing platform with thousands of advertisers',
            logo: '/lovable-uploads/flexoffers-logo.png',
            url: 'https://www.flexoffers.com',
            loginUrl: 'https://www.flexoffers.com/login',
            assetTypes: ['general'],
            connected: false,
            setupInstructions: 'Sign up for FlexOffers and get your sub-affiliate ID',
            referralLinkTemplate: 'https://www.flexoffers.com/{{subAffiliateId}}/{{destinationUrl}}'
          },
          // Add more mock providers as needed
        ];
        
        setAvailableProviders(formattedProviders);

        // For now, we'll check partner_integration_progress for connected providers
        // This is a placeholder until proper affiliate tables are created
        let hasConnections = false;
        try {
          // This is optional - if the table query fails, we just show no connections
          hasConnections = false; // Simplified for now
        } catch (err) {
          console.warn('⚠️ Could not check connections:', err);
          hasConnections = false;
        }

        // Mark which providers are connected (simplified for now)
        const connected = new Set<string>();
        
        const updatedProviders = formattedProviders.map(provider => ({
          ...provider,
          connected: connected.has(provider.id.toLowerCase())
        }));

        const connectedProvidersList = updatedProviders.filter(p => p.connected);
        
        setAvailableProviders(updatedProviders);
        setConnectedProviders(connectedProvidersList);

        // Set empty earnings for now
        setEarnings([]);

        console.log('✅ Service providers loaded successfully');
      } catch (err) {
        console.error('❌ Critical error fetching service providers:', err);
        setError('Failed to load service providers. This may be due to database connectivity issues.');
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
