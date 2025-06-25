
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ServiceProviderContextType, 
  ServiceProvider, 
  AffiliateRegistration,
  RegisterServiceFormData 
} from './types';

const ServiceProviderContext = createContext<ServiceProviderContextType | undefined>(undefined);

export const ServiceProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<AffiliateRegistration[]>([]);
  const [earnings, setEarnings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simplified mock data since affiliate system is disabled
  const mockProviders: ServiceProvider[] = [
    {
      id: 'mock-provider-1',
      name: 'Solar Provider',
      category: 'rooftop',
      description: 'Solar panel installation services',
      logo_url: null,
      website_url: 'https://example.com',
      affiliate_program_url: null,
      referral_link_template: null,
      commission_rate: 5,
      setup_cost: 0,
      avg_monthly_earnings_low: 100,
      avg_monthly_earnings_high: 500,
      conversion_rate: 2.5,
      priority: 1,
      is_active: true
    }
  ];

  const connectToProvider = async (providerId: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }
    
    toast({
      title: "Provider Connection",
      description: "Service provider connections are currently unavailable",
    });
  };

  const registerWithProvider = async (formData: RegisterServiceFormData) => {
    if (!user) {
      setError('Authentication required');
      return;
    }
    
    toast({
      title: "Registration Initiated",
      description: "We'll contact you with next steps for this service provider",
    });
  };

  const disconnectProvider = async (providerId: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }
    
    toast({
      title: "Provider Disconnected",
      description: "Service provider has been disconnected",
    });
  };

  const syncProviderEarnings = async (providerId: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }
    
    toast({
      title: "Sync Complete",
      description: "Earnings data has been synchronized",
    });
  };

  const generateReferralLink = (providerId: string, destinationUrl: string): string => {
    return destinationUrl; // Return original URL since referral system is disabled
  };

  const contextValue: ServiceProviderContextType = {
    availableProviders: mockProviders,
    connectedProviders: [],
    earnings: {},
    isLoading: false,
    error: null,
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
