
import { supabase } from '@/integrations/supabase/client';
import { AffiliateEarning, ServiceWithEarnings } from '../useAffiliateEarnings';
import { useToast } from '@/hooks/use-toast';

// Function to sync earnings for a specific service
export const syncServiceEarnings = async (
  service: string,
  userId: string | undefined,
  toast: ReturnType<typeof useToast>['toast'],
  manualEarnings?: number,
  credentials?: { email: string; password: string }
) => {
  if (!userId) {
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
        user_id: userId,
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
export const saveServiceCredentials = async (
  service: string,
  email: string,
  password: string,
  userId: string | undefined,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (!userId) {
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
        user_id: userId,
        provider_name: service,
        service: service,
        encrypted_email: email, // Should be encrypted
        encrypted_password: password, // Should be encrypted
      }, {
        onConflict: 'user_id,provider_name'
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
export const checkServiceCredentials = async (
  service: string,
  userId: string | undefined
) => {
  if (!userId) return { exists: false };

  try {
    const { data, error } = await supabase
      .from('affiliate_credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return { exists: !!data };
  } catch (err) {
    console.error('Error checking credentials:', err);
    return { exists: false, error: err };
  }
};

// Combine services with earnings data
export const combineServicesWithEarnings = (
  services: any[],
  earningsData: AffiliateEarning[] | null
): ServiceWithEarnings[] => {
  return services.map(service => {
    const earning = earningsData?.find(e => e.service === service.name);
    return {
      ...service,
      earnings: earning?.earnings || 0,
      last_sync_status: earning?.last_sync_status || 'pending',
      updated_at: earning?.updated_at || null,
    };
  });
};
