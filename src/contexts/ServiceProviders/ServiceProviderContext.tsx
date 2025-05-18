
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  ServiceProviderContextType,
  ServiceProviderInfo,
  ServiceProviderEarnings,
  RegisterServiceFormData,
  FlexOffersUserMapping,
  HasFlexOffersMappingResponse,
  FlexOffersSubIdResponse
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
          setupInstructions: `To connect with ${service.name}, you'll need to create an account or sign in to your existing account.`,
          // Adding referral link template for FlexOffers
          referralLinkTemplate: service.name === 'FlexOffers' ? 
            'https://www.flexoffers.com/affiliate-link/?sid={{subAffiliateId}}&url={{destinationUrl}}' : 
            undefined
        }));

        setAvailableProviders(formattedProviders);

        // Fetch user's connected providers
        const { data: credentialsData, error: credentialsError } = await supabase
          .from('affiliate_credentials')
          .select('*')
          .eq('user_id', user.id);

        if (credentialsError) throw credentialsError;

        // Check FlexOffers sub-affiliate mappings using RPC function
        const { data: flexoffersMapping, error: mappingError } = await supabase
          .rpc<HasFlexOffersMappingResponse>('has_flexoffers_mapping', { user_id_param: user.id });
        
        if (mappingError) {
          console.error("Error checking FlexOffers mapping:", mappingError);
        }

        // Mark which providers are connected
        const connected = new Set((credentialsData || []).map(cred => cred.service.toLowerCase()));
        
        // Add FlexOffers if mapping exists
        if (flexoffersMapping && flexoffersMapping.has_mapping) {
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
      case 'flexoffers': // Added FlexOffers with multiple asset types
        return ['internet', 'solar', 'pool', 'storage', 'parking'];
      default:
        return [];
    }
  };

  // Connect to a service provider
  const connectToProvider = async (providerId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to connect to service providers',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // For FlexOffers, we'll generate a unique sub-affiliate ID for the user
      if (providerId.toLowerCase() === 'flexoffers') {
        // Generate a unique sub-affiliate ID using user ID and a timestamp
        const subAffiliateId = `tipTop_${user.id.substring(0, 8)}_${Date.now().toString(36)}`;
        
        // Store the mapping using RPC function
        const { error } = await supabase
          .rpc('create_flexoffers_mapping', {
            user_id_param: user.id,
            sub_affiliate_id_param: subAffiliateId
          });
        
        if (error) {
          throw error;
        }
        
        // Create a placeholder in affiliate_earnings
        await supabase
          .from('affiliate_earnings')
          .insert({
            user_id: user.id,
            service: 'FlexOffers',
            earnings: 0,
            last_sync_status: 'pending'
          });
        
        toast({
          title: 'FlexOffers Connected',
          description: 'Your FlexOffers affiliate account is now linked.',
        });
        
        // Refresh the providers list
        const provider = availableProviders.find(p => p.id.toLowerCase() === providerId.toLowerCase());
        if (provider) {
          setConnectedProviders(prev => [...prev, {...provider, connected: true}]);
          setAvailableProviders(prev => 
            prev.map(p => 
              p.id.toLowerCase() === providerId.toLowerCase() 
                ? {...p, connected: true} 
                : p
            )
          );
        }
        
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
    }
  };

  // Register with a service provider
  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to register with service providers',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // For FlexOffers, we'll register the sub-affiliate ID
      if (formData.service.toLowerCase() === 'flexoffers' && formData.subAffiliateId) {
        // Store the mapping using RPC function
        const { error } = await supabase
          .rpc('create_flexoffers_mapping', {
            user_id_param: user.id,
            sub_affiliate_id_param: formData.subAffiliateId
          });
        
        if (error) {
          throw error;
        }
        
        // Create a placeholder in affiliate_earnings
        await supabase
          .from('affiliate_earnings')
          .insert({
            user_id: user.id,
            service: 'FlexOffers',
            earnings: 0,
            last_sync_status: 'pending'
          });
        
        toast({
          title: 'FlexOffers Registered',
          description: 'Your FlexOffers sub-affiliate ID has been registered.',
        });
        
        // Refresh the providers list
        const provider = availableProviders.find(p => p.id.toLowerCase() === formData.service.toLowerCase());
        if (provider) {
          setConnectedProviders(prev => [...prev, {...provider, connected: true}]);
          setAvailableProviders(prev => 
            prev.map(p => 
              p.id.toLowerCase() === formData.service.toLowerCase() 
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
    }
  };

  // Disconnect from a service provider
  const disconnectProvider = async (providerId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to disconnect from service providers',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // For FlexOffers, remove the sub-affiliate mapping
      if (providerId.toLowerCase() === 'flexoffers') {
        const { error } = await supabase
          .rpc('delete_flexoffers_mapping', { user_id_param: user.id });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'FlexOffers Disconnected',
          description: 'Your FlexOffers integration has been removed.',
        });
        
        // Update the UI
        setConnectedProviders(prev => prev.filter(p => p.id.toLowerCase() !== providerId.toLowerCase()));
        setAvailableProviders(prev => 
          prev.map(p => 
            p.id.toLowerCase() === providerId.toLowerCase() 
              ? {...p, connected: false} 
              : p
          )
        );
        
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
    }
  };

  // Sync earnings data from a service provider
  const syncProviderEarnings = async (providerId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to sync earnings',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (providerId.toLowerCase() === 'flexoffers') {
        // Get the user's sub-affiliate ID using RPC function
        const { data, error } = await supabase
          .rpc<FlexOffersSubIdResponse>('get_flexoffers_sub_id', { user_id_param: user.id });
        
        if (error) {
          throw error;
        }
        
        if (!data || !data.sub_affiliate_id) {
          throw new Error('No FlexOffers sub-affiliate ID found');
        }
        
        // Call the sync function with the FlexOffers data
        const { error: syncError } = await supabase.functions.invoke('sync_affiliate_earnings', {
          body: { 
            service: 'FlexOffers',
            user_id: user.id,
            sub_affiliate_id: data.sub_affiliate_id
          }
        });
        
        if (syncError) {
          throw syncError;
        }
        
        toast({
          title: 'Sync Initiated',
          description: 'FlexOffers earnings sync has been initiated.',
        });
        
        return;
      }
      
      // For other providers, use the default flow
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
    }
  };

  // Generate a FlexOffers affiliate link
  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    const provider = availableProviders.find(p => p.id.toLowerCase() === providerId.toLowerCase());
    
    if (provider?.referralLinkTemplate && user) {
      // Find the mapping asynchronously (this just kicks off the request, we'll use a placeholder for now)
      supabase
        .rpc<FlexOffersSubIdResponse>('get_flexoffers_sub_id', { user_id_param: user.id })
        .then(({ data, error }) => {
          if (error || !data || !data.sub_affiliate_id) {
            console.error('Error fetching sub-affiliate ID:', error);
          }
        });
      
      // For immediate UI response, use a placeholder or cached value
      // In a real app, you'd store this in state and update the UI once the query completes
      const placeholderId = `tipTop_${user.id.substring(0, 8)}`;
      
      return provider.referralLinkTemplate
        .replace('{{subAffiliateId}}', placeholderId)
        .replace('{{destinationUrl}}', encodeURIComponent(destinationUrl));
    }
    
    // If no template or user is not logged in, return the original URL
    return destinationUrl;
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
    syncProviderEarnings,
    generateReferralLink
  };

  return (
    <ServiceProviderContext.Provider value={value}>
      {children}
    </ServiceProviderContext.Provider>
  );
};
