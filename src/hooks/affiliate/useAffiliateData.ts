
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AffiliateEarning, ServiceWithEarnings } from '../useAffiliateEarnings';
import { combineServicesWithEarnings } from './earningsUtils';
import { supabase } from '@/integrations/supabase/client';

export const useAffiliateData = (userId: string | undefined) => {
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [services, setServices] = useState<ServiceWithEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to load both services and earnings
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch actual services data from service_providers table
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Fetch actual earnings data from affiliate_earnings table
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('user_id', userId);

      if (earningsError) throw earningsError;

      // Transform earnings data to match expected format
      const formattedEarnings: AffiliateEarning[] = (earningsData || []).map(item => ({
        id: item.id,
        service: item.service,
        earnings: Number(item.earnings),
        updated_at: item.updated_at,
        last_sync_status: item.last_sync_status
      }));

      // Set earnings data
      setEarnings(formattedEarnings);

      // Transform services data to match expected format
      const formattedServices = (servicesData || []).map(service => ({
        name: service.name,
        integration_type: service.category,
        api_url: service.website_url,
        login_url: service.website_url,
        status: service.is_active ? 'active' : 'inactive'
      }));

      // Combine services with earnings data
      const servicesWithEarnings = combineServicesWithEarnings(formattedServices, formattedEarnings);
      setServices(servicesWithEarnings);

    } catch (err) {
      console.error('Error loading affiliate data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load affiliate data'));
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load affiliate services and earnings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  return {
    earnings,
    services,
    loading,
    error,
    refreshData: loadData,
    setEarnings,
    setServices
  };
};
