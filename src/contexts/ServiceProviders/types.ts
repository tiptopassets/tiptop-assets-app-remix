
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

// Interface to support the FlexOffers user mapping
export interface FlexOffersUserMapping {
  id: string;
  user_id: string;
  sub_affiliate_id: string;
  created_at?: string;
}

// Define RPC function response types
export interface GetFlexOffersUserMappingResponse {
  id: string;
  user_id: string;
  sub_affiliate_id: string;
  created_at: string;
}

export interface HasFlexOffersMappingResponse {
  has_mapping: boolean;
}

export interface FlexOffersSubIdResponse {
  sub_affiliate_id: string;
}

// Declare custom RPC functions to extend Supabase types
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'sum_login_count' | 
          'get_flexoffers_user_mapping' | 
          'has_flexoffers_mapping' | 
          'create_flexoffers_mapping' | 
          'delete_flexoffers_mapping' | 
          'get_flexoffers_sub_id',
      params?: object,
      options?: object
    ): {
      data: T | null;
      error: Error | null;
    }
  }
}
