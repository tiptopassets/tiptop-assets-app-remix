
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider, ServiceProviderInfo, ServiceProviderEarnings } from '../types';

export const useProviderData = () => {
  const [availableProviders, setAvailableProviders] = useState<ServiceProviderInfo[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<ServiceProviderInfo[]>([]);
  const [earnings, setEarnings] = useState<ServiceProviderEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch enhanced service providers
      const { data: enhancedProviders, error: enhancedError } = await supabase
        .from('enhanced_service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (enhancedError) throw enhancedError;

      // Transform to ServiceProviderInfo format
      const transformedProviders: ServiceProviderInfo[] = (enhancedProviders || []).map(provider => ({
        id: provider.id,
        name: provider.name,
        description: provider.description || `Connect to ${provider.name} to monetize your property assets`,
        logo: provider.logo || `/lovable-uploads/${provider.name.toLowerCase()}-logo.png`,
        url: provider.url || `https://${provider.name.toLowerCase()}.com`,
        loginUrl: provider.login_url || `https://${provider.name.toLowerCase()}.com/login`,
        assetTypes: provider.asset_types || [],
        connected: provider.connected || false,
        setupInstructions: provider.setup_instructions || `To connect with ${provider.name}, you'll need to create an account or sign in to your existing account.`,
        referralLinkTemplate: provider.referral_link_template
      }));

      setAvailableProviders(transformedProviders);

      // Fetch earnings data
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .order('updated_at', { ascending: false });

      if (earningsError) throw earningsError;

      const transformedEarnings: ServiceProviderEarnings[] = (earningsData || []).map(earning => ({
        id: earning.id,
        service: earning.provider_name,
        earnings: earning.earnings_amount || 0,
        lastSyncStatus: earning.status as 'pending' | 'completed' | 'failed',
        updatedAt: new Date(earning.updated_at)
      }));

      setEarnings(transformedEarnings);

    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('enhanced_service_providers')
        .select('asset_types')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const categories = [...new Set(data?.flatMap(item => item.asset_types || []) || [])];
      return categories;
    } catch (err) {
      console.error('Error fetching service categories:', err);
      return [];
    }
  };

  const getProviderById = (id: string): ServiceProviderInfo | undefined => {
    return availableProviders.find(provider => provider.id === id);
  };

  const getProvidersByCategory = (category: string): ServiceProviderInfo[] => {
    return availableProviders.filter(provider => provider.assetTypes.includes(category));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    availableProviders,
    setAvailableProviders,
    connectedProviders,
    setConnectedProviders,
    earnings,
    setEarnings,
    isLoading,
    error,
    fetchProviders,
    fetchServiceCategories,
    getProviderById,
    getProvidersByCategory,
    refetch: fetchProviders
  };
};
