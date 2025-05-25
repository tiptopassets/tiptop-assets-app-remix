
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
    fetchProviders, 
    fetchConnectedProviders, 
    fetchEarnings 
  } = useProviderData({
    setAvailableProviders,
    setConnectedProviders,
    setEarnings,
    setIsLoading,
    setError
  });

  const {
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink
  } = useProviderActions({
    setIsLoading,
    setError,
    refreshData: () => {
      if (user) {
        fetchConnectedProviders(user.id);
        fetchEarnings(user.id);
      }
    }
  });

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchProviders();
      fetchConnectedProviders(user.id);
      fetchEarnings(user.id);
    } else {
      // Reset state when user logs out
      setAvailableProviders([]);
      setConnectedProviders([]);
      setEarnings({});
    }
  }, [user]);

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
