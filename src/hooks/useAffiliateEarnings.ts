
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type AffiliateEarning = {
  id: string;
  service: string;
  earnings: number;
  updated_at: string;
  last_sync_status: string;
};

export type ServiceWithEarnings = {
  name: string;
  integration_type: string;
  api_url: string | null;
  login_url: string | null;
  status: string;
  earnings?: number;
  last_sync_status?: string;
  updated_at?: string;
};

export const useAffiliateEarnings = () => {
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [services, setServices] = useState<ServiceWithEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Function to load both services and earnings
  const loadData = useCallback(async () => {
    if (!user) {
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
        .eq('user_id', user.id);

      if (earningsError) throw earningsError;

      // Set earnings data
      setEarnings(earningsData || []);

      // Combine services with earnings data
      const servicesWithEarnings: ServiceWithEarnings[] = servicesData.map(service => {
        const earning = earningsData?.find(e => e.service === service.name);
        return {
          ...service,
          earnings: earning?.earnings || 0,
          last_sync_status: earning?.last_sync_status || 'pending',
          updated_at: earning?.updated_at || null,
        };
      });

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
  }, [user]);

  // Setup real-time subscription for earnings updates
  useEffect(() => {
    if (!user) return;

    loadData();

    // Set up subscription to affiliate_earnings table changes
    const channel = supabase
      .channel('affiliate-earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'affiliate_earnings',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh data when changes occur
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  // Function to sync earnings for a service
  const syncServiceEarnings = async (
    service: string, 
    manualEarnings?: number, 
    credentials?: { email: string; password: string }
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to sync earnings.',
        variant: 'destructive',
      });
      return { success: false, error: new Error('Authentication required') };
    }

    try {
      // Call the edge function to sync earnings
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: {
          user_id: user.id,
          service,
          earnings: manualEarnings,
          credentials,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Sync Successful',
          description: `Updated ${service} earnings to $${data.earnings.toFixed(2)}`,
        });
        
        // Refresh data after successful sync
        loadData();
        
        return { 
          success: true, 
          earnings: data.earnings,
          timestamp: data.timestamp
        };
      } else {
        throw new Error(data.error || 'Unknown error during sync');
      }
    } catch (err) {
      console.error(`Error syncing ${service} earnings:`, err);
      
      toast({
        title: 'Sync Failed',
        description: `Failed to sync ${service} earnings. Please try again.`,
        variant: 'destructive',
      });
      
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to sync earnings') 
      };
    }
  };

  // Function to save credentials
  const saveCredentials = async (service: string, email: string, password: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to save credentials.',
        variant: 'destructive',
      });
      return { success: false };
    }

    try {
      // In a real app, you would encrypt these credentials
      const { error } = await supabase
        .from('affiliate_credentials')
        .upsert({
          user_id: user.id,
          service,
          encrypted_email: email, // Should be encrypted
          encrypted_password: password, // Should be encrypted
        }, {
          onConflict: 'user_id,service'
        });

      if (error) throw error;

      toast({
        title: 'Credentials Saved',
        description: `Your ${service} account credentials have been saved.`,
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error saving credentials:', err);
      
      toast({
        title: 'Error Saving Credentials',
        description: 'Failed to save your account credentials.',
        variant: 'destructive',
      });
      
      return { success: false, error: err };
    }
  };

  // Function to check if credentials exist
  const checkCredentials = async (service: string) => {
    if (!user) return { exists: false };

    try {
      const { data, error } = await supabase
        .from('affiliate_credentials')
        .select('id')
        .eq('user_id', user.id)
        .eq('service', service)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return { exists: !!data };
    } catch (err) {
      console.error('Error checking credentials:', err);
      return { exists: false, error: err };
    }
  };

  return {
    earnings,
    services,
    loading,
    error,
    syncServiceEarnings,
    saveCredentials,
    checkCredentials,
    refreshData: loadData,
  };
};
