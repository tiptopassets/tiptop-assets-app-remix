
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
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Load user's earnings - handle both old and new column names
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('user_id', userId);

      if (earningsError) throw earningsError;

      // Transform earnings data to match AffiliateEarning interface
      const transformedEarnings: AffiliateEarning[] = (earningsData || []).map(earning => ({
        id: earning.id,
        user_id: earning.user_id || '',
        service: earning.provider_name || '', // Use provider_name as the service field
        earnings: earning.earnings_amount || 0, // Use earnings_amount as earnings
        last_sync_status: earning.status || 'pending', // Use status as last_sync_status
        updated_at: earning.updated_at,
      }));

      // Set earnings data
      setEarnings(transformedEarnings);

      // Combine services with earnings data
      const servicesWithEarnings = combineServicesWithEarnings(servicesData, transformedEarnings);
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
