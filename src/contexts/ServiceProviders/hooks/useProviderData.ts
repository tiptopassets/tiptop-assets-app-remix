
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ServiceProvider, 
  ServiceProviderEarnings,
  AffiliateRegistration
} from '../types';

export const useProviderData = () => {
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<ServiceProviderEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchServiceProviders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all available service providers from the new table
        const { data: providersData, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });

        if (providersError) throw providersError;

        setAvailableProviders(providersData || []);

        // Fetch user's affiliate registrations
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('affiliate_registrations')
          .select('*')
          .eq('user_id', user.id);

        if (registrationsError) throw registrationsError;

        // Type the registrations data properly
        const typedRegistrations: AffiliateRegistration[] = (registrationsData || []).map(reg => ({
          id: reg.id,
          user_id: reg.user_id!,
          bundle_selection_id: reg.bundle_selection_id || '',
          provider_id: reg.provider_id!,
          affiliate_link: reg.affiliate_link,
          tracking_code: reg.tracking_code!,
          registration_status: reg.registration_status as 'pending' | 'completed' | 'failed',
          registration_date: reg.registration_date,
          first_commission_date: reg.first_commission_date,
          total_earnings: Number(reg.total_earnings || 0),
          last_sync_at: reg.last_sync_at!
        }));

        setConnectedProviders(typedRegistrations);

        // Fetch earnings data from affiliate_earnings table
        const { data: earningsData, error: earningsError } = await supabase
          .from('affiliate_earnings')
          .select('*')
          .eq('user_id', user.id);

        if (earningsError) throw earningsError;

        setEarnings((earningsData || []).map(e => ({
          id: e.id,
          service: e.service!,
          earnings: e.earnings || 0,
          lastSyncStatus: (e.last_sync_status as any) || 'pending',
          updatedAt: new Date(e.updated_at!)
        })));

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
