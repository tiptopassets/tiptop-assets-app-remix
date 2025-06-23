
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
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🏪 ServiceProviderContext state:', {
    authLoading,
    user: user?.email || 'none',
    isInitialized,
    isLoading,
    error,
    retryCount
  });

  // Use custom hooks for data and actions
  const providerData = useProviderData();
  const providerActions = useProviderActions(
    providerData.availableProviders,
    providerData.setAvailableProviders,
    providerData.connectedProviders,
    providerData.setConnectedProviders
  );

  // Auto-retry mechanism for failed loads
  const handleRetry = () => {
    console.log('🔄 Retrying provider data load');
    setRetryCount(prev => prev + 1);
    setError(null);
    
    // Trigger a re-fetch by clearing and reloading data
    providerData.setAvailableProviders([]);
    providerData.setConnectedProviders([]);
    providerData.setEarnings([]);
  };

  // Effect to handle provider data updates with improved error handling
  useEffect(() => {
    // Don't initialize until auth is ready
    if (authLoading) {
      console.log('⏳ Waiting for auth to finish loading');
      return;
    }
    
    try {
      console.log('🔄 Updating provider states');
      
      // If there's an error in provider data, propagate it
      if (providerData.error) {
        setError(providerData.error);
        setIsLoading(false);
        
        // Auto-retry after 3 seconds for first 2 failures
        if (retryCount < 2) {
          setTimeout(handleRetry, 3000);
        }
        return;
      }
      
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
      
      // Update state
      setAvailableProviders(newAvailableProviders);
      setConnectedProviders(newConnectedProviders);
      setEarnings(newEarningsRecord);
      setIsLoading(providerData.isLoading);
      setError(null); // Clear error on successful load
      
      // Mark as initialized only after auth is ready and no errors
      if (!authLoading && !isInitialized && !providerData.error) {
        setIsInitialized(true);
        console.log('✅ ServiceProviderContext initialized successfully');
      }
    } catch (err) {
      console.error('❌ Error updating provider states:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      
      // Auto-retry after 3 seconds for first 2 failures
      if (retryCount < 2) {
        setTimeout(handleRetry, 3000);
      }
    }
  }, [
    authLoading,
    providerData.isLoading,
    providerData.error,
    user?.id,
    isInitialized,
    retryCount,
    providerData.availableProviders.length,
    providerData.connectedProviders.length,
    providerData.earnings.length
  ]);

  // Wrapper functions to handle user ID automatically
  const connectToProvider = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot connect to provider: no user');
      setError('Authentication required to connect to providers');
      return;
    }
    try {
      await providerActions.connectToProvider(providerId, user.id);
    } catch (err) {
      console.error('Error connecting to provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to provider');
    }
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) {
      console.warn('⚠️ Cannot register with provider: no user');
      setError('Authentication required to register with providers');
      return;
    }
    try {
      await providerActions.registerWithProvider(formData, user.id);
    } catch (err) {
      console.error('Error registering with provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to register with provider');
    }
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot disconnect provider: no user');
      setError('Authentication required to disconnect providers');
      return;
    }
    try {
      await providerActions.disconnectProvider(providerId, user.id);
    } catch (err) {
      console.error('Error disconnecting provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect provider');
    }
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) {
      console.warn('⚠️ Cannot sync earnings: no user');
      setError('Authentication required to sync earnings');
      return;
    }
    try {
      await providerActions.syncProviderEarnings(providerId, user.id);
    } catch (err) {
      console.error('Error syncing earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync earnings');
    }
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    try {
      return providerActions.generateReferralLink(providerId, destinationUrl, user?.id) as any;
    } catch (err) {
      console.error('Error generating referral link:', err);
      return destinationUrl; // Fallback to original URL
    }
  };

  // Show loading state while auth is loading
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

  // Show error state with retry option
  if (error && retryCount >= 2) {
    console.log('❌ ServiceProviderContext showing error state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900">
        <div className="text-white text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Service Provider Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="bg-tiptop-purple hover:bg-tiptop-purple/90 px-4 py-2 rounded text-white mr-2"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
            >
              Refresh Page
            </button>
          </div>
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
