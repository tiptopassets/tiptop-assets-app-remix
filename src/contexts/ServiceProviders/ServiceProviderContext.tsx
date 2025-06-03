
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ServiceProviderContextType, ServiceProvider, BundleRecommendation } from './types';
import { useProviderData } from './hooks/useProviderData';
import { useProviderActions } from './hooks/useProviderActions';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const ServiceProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loadProviders, loadBundles } = useProviderData();
  const { registerWithProvider, createBundle } = useProviderActions();

  // Memoize the load functions to prevent infinite loops
  const memoizedLoadProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const providerData = await loadProviders();
      setProviders(providerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
      console.error('Error loading providers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadProviders]);

  const memoizedLoadBundles = useCallback(async () => {
    try {
      const bundleData = await loadBundles();
      setBundles(bundleData);
    } catch (err) {
      console.error('Error loading bundles:', err);
    }
  }, [loadBundles]);

  // Load data on mount only
  useEffect(() => {
    memoizedLoadProviders();
    memoizedLoadBundles();
  }, []); // Empty dependency array to run only on mount

  const value: ServiceProviderContextType = {
    providers,
    bundles,
    isLoading,
    error,
    registerWithProvider,
    createBundle,
    refreshProviders: memoizedLoadProviders,
    refreshBundles: memoizedLoadBundles,
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
