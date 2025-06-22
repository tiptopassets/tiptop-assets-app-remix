
import { useState, useCallback } from 'react';
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
      // Mock services data since the 'services' table doesn't exist
      const mockServicesData = [
        {
          name: 'FlexOffers',
          integration_type: 'affiliate',
          api_url: 'https://api.flexoffers.com',
          login_url: 'https://www.flexoffers.com/login',
          status: 'active'
        },
        {
          name: 'Honeygain',
          integration_type: 'passive',
          api_url: null,
          login_url: 'https://dashboard.honeygain.com',
          status: 'active'
        }
      ];

      // Mock earnings data since the 'affiliate_earnings' table doesn't exist
      const mockEarningsData: AffiliateEarning[] = [
        {
          id: '1',
          service: 'FlexOffers',
          earnings: 25.50,
          updated_at: new Date().toISOString(),
          last_sync_status: 'completed'
        },
        {
          id: '2',
          service: 'Honeygain',
          earnings: 12.75,
          updated_at: new Date().toISOString(),
          last_sync_status: 'completed'
        }
      ];

      // Set earnings data
      setEarnings(mockEarningsData);

      // Combine services with earnings data
      const servicesWithEarnings = combineServicesWithEarnings(mockServicesData, mockEarningsData);
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
