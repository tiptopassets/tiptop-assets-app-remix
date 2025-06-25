
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '../types';

export const useProviderData = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedProviders: ServiceProvider[] = (data || []).map(provider => ({
        id: provider.id,
        name: provider.name,
        category: provider.category,
        description: provider.description || '',
        logoUrl: provider.logo_url || '',
        websiteUrl: provider.website_url || '',
        avgMonthlyEarnings: {
          low: provider.avg_monthly_earnings_low,
          high: provider.avg_monthly_earnings_high
        },
        setupCost: provider.setup_cost,
        commissionRate: provider.commission_rate,
        priority: provider.priority,
        isActive: provider.is_active,
        serviceAreas: provider.service_areas || [],
        contactInfo: provider.contact_info || {}
      }));

      setProviders(transformedProviders);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('service_providers')
        .select('category')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const categories = [...new Set(data?.map(item => item.category) || [])];
      return categories;
    } catch (err) {
      console.error('Error fetching service categories:', err);
      return [];
    }
  };

  const getProviderById = (id: string): ServiceProvider | undefined => {
    return providers.find(provider => provider.id === id);
  };

  const getProvidersByCategory = (category: string): ServiceProvider[] => {
    return providers.filter(provider => provider.category === category);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    fetchServiceCategories,
    getProviderById,
    getProvidersByCategory,
    refetch: fetchProviders
  };
};
