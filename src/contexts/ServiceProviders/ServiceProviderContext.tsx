
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const providerData = useProviderData();

  const providerActions = useProviderActions(
    providerData.availableProviders,
    providerData.setAvailableProviders,
    providerData.connectedProviders,
    providerData.setConnectedProviders
  );

  // Memoize the update functions to prevent infinite loops
  const updateProviderStates = useCallback(() => {
    const newAvailableProviders = providerData.availableProviders.map(p => ({
      id: p.id,
      name: p.name,
      category: p.assetTypes[0] || 'general',
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
    
    const newConnectedProviders = providerData.connectedProviders.map(p => ({
      id: p.id,
      user_id: user?.id || '',
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

    const newEarningsRecord: Record<string, number> = {};
    providerData.earnings.forEach(earning => {
      newEarningsRecord[earning.service] = earning.earnings;
    });
    
    // Only update if data has actually changed
    setAvailableProviders(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(newAvailableProviders);
      return hasChanged ? newAvailableProviders : prev;
    });
    
    setConnectedProviders(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(newConnectedProviders);
      return hasChanged ? newConnectedProviders : prev;
    });
    
    setEarnings(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(newEarningsRecord);
      return hasChanged ? newEarningsRecord : prev;
    });
    
    setIsLoading(providerData.isLoading);
    setError(providerData.error);
  }, [providerData, user?.id]);

  // Update state when provider data changes, but only if necessary
  useEffect(() => {
    updateProviderStates();
  }, [updateProviderStates]);

  // Wrapper functions to handle user ID automatically
  const connectToProvider = async (providerId: string) => {
    if (!user) return;
    await providerActions.connectToProvider(providerId, user.id);
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) return;
    await providerActions.registerWithProvider(formData, user.id);
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) return;
    await providerActions.disconnectProvider(providerId, user.id);
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) return;
    await providerActions.syncProviderEarnings(providerId, user.id);
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    return providerActions.generateReferralLink(providerId, destinationUrl, user?.id) as any;
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
