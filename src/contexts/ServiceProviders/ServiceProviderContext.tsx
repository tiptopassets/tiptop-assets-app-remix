
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  ServiceProviderContextType,
  ServiceProviderInfo,
  ServiceProviderEarnings,
  RegisterServiceFormData
} from './types';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const useServiceProviders = () => {
  const context = useContext(ServiceProviderContext);
  if (context === undefined) {
    throw new Error('useServiceProviders must be used within a ServiceProviderProvider');
  }
  return context;
};

interface ServiceProviderProviderProps {
  children: ReactNode;
}

export const ServiceProviderProvider = ({ children }: ServiceProviderProviderProps) => {
  const [availableProviders, setAvailableProviders] = useState<ServiceProviderInfo[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<ServiceProviderInfo[]>([]);
  const [earnings, setEarnings] = useState<ServiceProviderEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load available service providers from the database
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
        const formattedProviders: ServiceProviderInfo[] = (servicesData || []).map(service => ({
          id: service.name.toLowerCase(),
          name: service.name,
          description: `Connect to ${service.name} to monetize your property assets`,
          logo: `/lovable-uploads/${service.name.toLowerCase()}-logo.png`,
          url: service.api_url || `https://${service.name.toLowerCase()}.com`,
          loginUrl: service.login_url || `https://${service.name.toLowerCase()}.com/login`,
          assetTypes: getAssetTypesForService(service.name),
          connected: false,
          setupInstructions: `To connect with ${service.name}, you'll need to create an account or sign in to your existing account.`
        }));

        setAvailableProviders(formattedProviders);

        // Fetch user's connected providers
        const { data: credentialsData, error: credentialsError } = await supabase
          .from('affiliate_credentials')
          .select('*')
          .eq('user_id', user.id);

        if (credentialsError) throw credentialsError;

        // Mark which providers are connected
        const connected = new Set((credentialsData || []).map(cred => cred.service.toLowerCase()));
        
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
            lastSyncStatus: e.last_sync_status as any || 'pending',
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

  // Helper function to determine which asset types a service is applicable for
  const getAssetTypesForService = (serviceName: string): string[] => {
    switch (serviceName.toLowerCase()) {
      case 'swimply':
        return ['pool'];
      case 'honeygain':
        return ['bandwidth', 'internet'];
      case 'neighbor':
        return ['storage', 'parking'];
      case 'yardrental':
      case 'yardyum':
        return ['garden', 'yard'];
      case 'sunrun':
      case 'tesla solar':
        return ['rooftop', 'solar'];
      default:
        return [];
    }
  };

  // Connect to a service provider
  const connectToProvider = async (providerId: string) => {
    // This will be implemented in the next phase
    toast({
      title: 'Coming Soon',
      description: 'Provider connection functionality will be available soon',
    });
  };

  // Register with a service provider
  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    // This will be implemented in the next phase
    toast({
      title: 'Coming Soon',
      description: 'Provider registration functionality will be available soon',
    });
  };

  // Disconnect from a service provider
  const disconnectProvider = async (providerId: string) => {
    // This will be implemented in the next phase
    toast({
      title: 'Coming Soon',
      description: 'Provider disconnection functionality will be available soon',
    });
  };

  // Sync earnings data from a service provider
  const syncProviderEarnings = async (providerId: string) => {
    // This will be implemented in the next phase
    toast({
      title: 'Coming Soon',
      description: 'Provider earnings sync functionality will be available soon',
    });
  };

  const value: ServiceProviderContextType = {
    availableProviders,
    connectedProviders,
    earnings,
    isLoading,
    error,
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings
  };

  return (
    <ServiceProviderContext.Provider value={value}>
      {children}
    </ServiceProviderContext.Provider>
  );
};
