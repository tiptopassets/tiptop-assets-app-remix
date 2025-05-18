
export interface ServiceProviderCredentials {
  id: string;
  userId: string;
  service: string;
  encryptedEmail?: string;
  encryptedPassword?: string;
  connected: boolean;
  lastSyncedAt?: Date;
  subAffiliateId?: string; // Added for FlexOffers integration
}

export interface ServiceProviderInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  url: string;
  loginUrl: string;
  assetTypes: string[];
  connected: boolean;
  setupInstructions: string;
  referralLinkTemplate?: string; // Added for FlexOffers integration
}

export interface ServiceProviderEarnings {
  id: string;
  service: string;
  earnings: number;
  lastSyncStatus: 'success' | 'failed' | 'pending';
  updatedAt: Date;
}

export interface RegisterServiceFormData {
  service: string;
  email: string;
  password: string;
  additionalFields?: Record<string, string>;
  subAffiliateId?: string; // Added for FlexOffers integration
}

export interface ServiceProviderContextType {
  availableProviders: ServiceProviderInfo[];
  connectedProviders: ServiceProviderInfo[];
  earnings: ServiceProviderEarnings[];
  isLoading: boolean;
  error: string | null;
  
  connectToProvider: (providerId: string) => Promise<void>;
  registerWithProvider: (formData: RegisterServiceFormData) => Promise<void>;
  disconnectProvider: (providerId: string) => Promise<void>;
  syncProviderEarnings: (providerId: string) => Promise<void>;
  generateReferralLink?: (providerId: string, destinationUrl: string) => string; // Added for FlexOffers integration
}
