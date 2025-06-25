
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceProvider, AffiliateRegistration } from '@/contexts/ServiceProviders/types';

export const useServiceProviders = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
    if (user) {
      fetchConnectedProviders();
    }
  }, [user]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnectedProviders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        registration_status: item.registration_status as 'pending' | 'completed' | 'failed'
      }));
      
      setConnectedProviders(typedData);
    } catch (err) {
      console.error('Error fetching connected providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connected providers');
    }
  };

  return {
    providers,
    connectedProviders,
    isLoading,
    error,
    refetch: fetchProviders,
    refetchConnected: fetchConnectedProviders
  };
};
