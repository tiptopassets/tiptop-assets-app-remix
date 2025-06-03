
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ServiceProviderContextType, 
  ServiceProvider, 
  AffiliateRegistration,
  RegisterServiceFormData 
} from './types';
import { useProviderData } from './hooks/useProviderData';
import { useProviderActions } from './hooks/useProviderActions';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const ServiceProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom hooks for data and actions
  const {
    availableProviders: hookAvailableProviders,
    connectedProviders: hookConnectedProviders,
    earnings: hookEarnings,
    isLoading: hookIsLoading,
    error: hookError
  } = useProviderData();

  const {
    connectToProvider: hookConnectToProvider,
    registerWithProvider: hookRegisterWithProvider,
    disconnectProvider: hookDisconnectProvider,
    syncProviderEarnings: hookSyncProviderEarnings,
    generateReferralLink: hookGenerateReferralLink
  } = useProviderActions(
    hookAvailableProviders,
    setAvailableProviders,
    hookConnectedProviders,
    setConnectedProviders
  );

  // Update state when provider data changes - use useEffect with proper dependencies
  useEffect(() => {
    if (hookAvailableProviders && hookAvailableProviders.length > 0) {
      const mappedProviders = hookAvailableProviders.map(p => ({
        id: p.id,
        name: p.name,
        category: p.assetTypes?.[0] || 'general',
        description: p.description,
        logo_url: p.logo,
        website_url: p.url,
        affiliate_program_url: p.loginUrl,
        referral_link_template: p.referralLinkTemplate,
        commission_rate: 5,
        setup_cost: 0,
        avg_monthly_earnings_low: 25,
        avg_monthly_earnings_high: 150,
        conversion_rate: 2.5,
        priority: 1,
        is_active: true
      }));
      setAvailableProviders(mappedProviders);
    }
  }, [hookAvailableProviders]);

  useEffect(() => {
    if (hookConnectedProviders && hookConnectedProviders.length > 0 && user) {
      const mappedConnected = hookConnectedProviders.map(p => ({
        id: p.id,
        user_id: user.id,
        bundle_selection_id: '',
        provider_id: p.id,
        affiliate_link: p.loginUrl,
        tracking_code: '',
        registration_status: 'completed' as const,
        registration_date: new Date().toISOString(),
        first_commission_date: undefined,
        total_earnings: 0,
        last_sync_at: new Date().toISOString()
      }));
      setConnectedProviders(mappedConnected);
    }
  }, [hookConnectedProviders, user]);

  useEffect(() => {
    if (hookEarnings && hookEarnings.length > 0) {
      const earningsRecord: Record<string, number> = {};
      hookEarnings.forEach(earning => {
        earningsRecord[earning.service] = earning.earnings;
      });
      setEarnings(earningsRecord);
    }
  }, [hookEarnings]);

  useEffect(() => {
    setIsLoading(hookIsLoading);
  }, [hookIsLoading]);

  useEffect(() => {
    setError(hookError);
  }, [hookError]);

  // Wrapper functions to handle user ID automatically
  const connectToProvider = async (providerId: string) => {
    if (!user) return;
    await hookConnectToProvider(providerId, user.id);
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) return;
    await hookRegisterWithProvider(formData, user.id);
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) return;
    await hookDisconnectProvider(providerId, user.id);
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) return;
    await hookSyncProviderEarnings(providerId, user.id);
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    return hookGenerateReferralLink(providerId, destinationUrl, user?.id);
  };

  const contextValue: ServiceProviderContextType = {
    availableProviders,
    connectedProviders,
    earnings,
    isLoading,
    error,
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink
  };

  return (
    <ServiceProviderContext.Provider value={contextValue}>
      {children}
    </ServiceProviderContext.Provider>
  );
};

export const useServiceProviders = () => {
  const context = useContext(ServiceProviderContext);
  if (context === undefined) {
    throw new Error('useServiceProviders must be used within a ServiceProviderProvider');
  }
  return context;
};
