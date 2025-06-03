
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ServiceProviderContextType, ServiceProvider, BundleRecommendation } from './types';
import { useProviderData } from './hooks/useProviderData';
import { useProviderActions } from './hooks/useProviderActions';
import { useAuth } from '@/contexts/AuthContext';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const ServiceProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);

  const {
    availableProviders,
    setAvailableProviders,
    connectedProviders,
    setConnectedProviders,
    earnings,
    setEarnings,
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
  } = useProviderActions(
    availableProviders,
    setAvailableProviders,
    connectedProviders,
    setConnectedProviders
  );

  // Mock functions for bundles - these can be implemented later
  const loadBundles = useCallback(async (): Promise<BundleRecommendation[]> => {
    // Mock implementation - replace with actual API call
    return [];
  }, []);

  const createBundle = useCallback(async (bundleData: any): Promise<void> => {
    // Mock implementation - replace with actual API call
    console.log('Creating bundle:', bundleData);
  }, []);

  // Refresh functions
  const refreshProviders = useCallback(async () => {
    // The useProviderData hook already handles loading providers
    // This is just a placeholder for the interface
  }, []);

  const refreshBundles = useCallback(async () => {
    try {
      const bundleData = await loadBundles();
      setBundles(bundleData);
    } catch (err) {
      console.error('Error loading bundles:', err);
    }
  }, [loadBundles]);

  // Wrapper for registerWithProvider to match expected signature
  const wrappedRegisterWithProvider = useCallback(async (formData: any) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return registerWithProvider(formData, user.id);
  }, [registerWithProvider, user?.id]);

  const value: ServiceProviderContextType = {
    providers: availableProviders,
    bundles,
    isLoading,
    error,
    registerWithProvider: wrappedRegisterWithProvider,
    createBundle,
    refreshProviders,
    refreshBundles,
  };

  return (
    <ServiceProviderContext.Provider value={value}>
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
