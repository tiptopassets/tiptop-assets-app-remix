
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAffiliateData } from './affiliate/useAffiliateData';
import { useEarningsSubscription } from './affiliate/useEarningsSubscription';
import { 
  syncServiceEarnings, 
  saveServiceCredentials, 
  checkServiceCredentials 
} from './affiliate/earningsUtils';

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    earnings, 
    services, 
    loading, 
    error, 
    refreshData 
  } = useAffiliateData(user?.id);

  // Setup real-time subscription for earnings updates
  useEarningsSubscription(user?.id, refreshData);

  // Function to sync earnings for a service
  const syncServiceEarningsHandler = useCallback(async (
    service: string, 
    manualEarnings?: number, 
    credentials?: { email: string; password: string }
  ) => {
    return await syncServiceEarnings(service, user?.id, toast, manualEarnings, credentials);
  }, [user?.id, toast]);

  // Function to save credentials
  const saveCredentialsHandler = useCallback(async (
    service: string, 
    email: string, 
    password: string
  ) => {
    return await saveServiceCredentials(service, email, password, user?.id, toast);
  }, [user?.id, toast]);

  // Function to check if credentials exist
  const checkCredentialsHandler = useCallback(async (service: string) => {
    return await checkServiceCredentials(service, user?.id);
  }, [user?.id]);

  return {
    earnings,
    services,
    loading,
    error,
    syncServiceEarnings: syncServiceEarningsHandler,
    saveCredentials: saveCredentialsHandler,
    checkCredentials: checkCredentialsHandler,
    refreshData,
  };
};
