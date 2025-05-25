
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ServiceProviderContextType,
  RegisterServiceFormData,
} from './types';
import { useProviderData } from './hooks/useProviderData';
import { useProviderActions } from './hooks/useProviderActions';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const useServiceProviders = () => {
  const context = useContext(ServiceProviderContext);
  if (context === undefined) {
    throw new Error('useServiceProviders must be used within a ServiceProviderProvider');
  }
  return context;
};

interface ServiceProviderProviderProps {
  children: ReactNode;
}

export const ServiceProviderProvider = ({ children }: ServiceProviderProviderProps) => {
  const { user } = useAuth();
  
  const {
    availableProviders,
    setAvailableProviders,
    connectedProviders,
    setConnectedProviders,
    earnings,
    isLoading,
    error
  } = useProviderData();

  const {
    connectToProvider,
    registerWithProvider,
    disconnectProvider,
    syncProviderEarnings,
    generateReferralLink,
    actionInProgress
  } = useProviderActions(availableProviders, setAvailableProviders, connectedProviders, setConnectedProviders);

  // Create wrapper functions that pass user ID to the service functions
  const handleConnectToProvider = async (providerId: string) => {
    if (user) {
      await connectToProvider(providerId, user.id);
    }
  };

  const handleRegisterWithProvider = async (formData: RegisterServiceFormData) => {
    if (user) {
      await registerWithProvider(formData, user.id);
    }
  };

  const handleDisconnectProvider = async (providerId: string) => {
    if (user) {
      await disconnectProvider(providerId, user.id);
    }
  };

  const handleSyncProviderEarnings = async (providerId: string) => {
    if (user) {
      await syncProviderEarnings(providerId, user.id);
    }
  };

  const handleGenerateReferralLink = (providerId: string, destinationUrl: string): string => {
    return generateReferralLink(providerId, destinationUrl, user?.id) as any; // Fixed type error
  };

  const value: ServiceProviderContextType = {
    availableProviders,
    connectedProviders,
    earnings,
    isLoading,
    error,
    connectToProvider: handleConnectToProvider,
    registerWithProvider: handleRegisterWithProvider,
    disconnectProvider: handleDisconnectProvider,
    syncProviderEarnings: handleSyncProviderEarnings,
    generateReferralLink: handleGenerateReferralLink
  };

  return (
    <ServiceProviderContext.Provider value={value}>
      {children}
    </ServiceProviderContext.Provider>
  );
};
