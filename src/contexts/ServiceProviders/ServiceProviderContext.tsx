
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
  const { user, loading: authLoading } = useAuth();
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🏪 ServiceProviderContext state:', {
    authLoading,
    user: user?.email || 'none',
    isInitialized,
    isLoading,
    error
  });

  // Use custom hooks for data and actions
  const providerData = useProviderData();

  const providerActions = useProviderActions(
    providerData.availableProviders,
    providerData.setAvailableProviders,
    providerData.connectedProviders,
    providerData.setConnectedProviders
  );

  // Single effect to handle provider data updates - removed useCallback to prevent dependency loops
  useEffect(() => {
    // Don't initialize until auth is ready
    if (authLoading) {
      console.log('⏳ Waiting for auth to finish loading');
      return;
    }
    
    try {
      console.log('🔄 Updating provider states');
      
      // Transform available providers
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
      
      // Transform connected providers
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

      // Transform earnings
      const newEarningsRecord: Record<string, number> = {};
      providerData.earnings.forEach(earning => {
        newEarningsRecord[earning.service] = earning.earnings;
      });
      
      // Update state directly without comparison checks to prevent loops
      setAvailableProviders(newAvailableProviders);
      setConnectedProviders(newConnectedProviders);
      setEarnings(newEarningsRecord);
      setIsLoading(providerData.isLoading);
      setError(providerData.error);
      
      // Mark as initialized only after auth is ready
      if (!authLoading && !isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      console.error('❌ Error updating provider states:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  }, [
    authLoading,
    providerData.isLoading,
    providerData.error,
    user?.id,
    isInitialized,
    // Remove deep dependencies that cause loops
    providerData.availableProviders.length,
    providerData.connectedProviders.length,
    providerData.earnings.length
  ]);

  // Wrapper functions to handle user ID automatically
  const connectToProvider = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot connect to provider: no user');
      return;
    }
    await providerActions.connectToProvider(providerId, user.id);
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) {
      console.warn('⚠️ Cannot register with provider: no user');
      return;
    }
    await providerActions.registerWithProvider(formData, user.id);
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot disconnect provider: no user');
      return;
    }
    await providerActions.disconnectProvider(providerId, user.id);
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot sync earnings: no user');
      return;
    }
    await providerActions.syncProviderEarnings(providerId, user.id);
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    return providerActions.generateReferralLink(providerId, destinationUrl, user?.id) as any;
  };

  // Simplified loading state - only show while auth is loading
  if (authLoading) {
    console.log('⏳ ServiceProviderContext waiting for auth');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

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

  console.log('✅ ServiceProviderContext ready, rendering children');

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
