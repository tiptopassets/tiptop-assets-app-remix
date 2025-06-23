
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AffiliateEarning, ServiceWithEarnings } from '../useAffiliateEarnings';
import { combineServicesWithEarnings } from './earningsUtils';

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
      // Load all services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active');

      if (servicesError) throw servicesError;

      // Load user's earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('user_id', userId);

      if (earningsError) throw earningsError;

      // Set earnings data
      setEarnings(earningsData || []);

      // Combine services with earnings data
      const servicesWithEarnings = combineServicesWithEarnings(servicesData, earningsData);
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
