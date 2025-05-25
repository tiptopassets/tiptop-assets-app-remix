
export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  affiliate_program_url?: string;
  referral_link_template?: string;
  commission_rate: number;
  setup_cost: number;
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
  conversion_rate: number;
  priority: number;
  is_active: boolean;
}

export interface BundleConfiguration {
  id: string;
  name: string;
  description: string;
  asset_requirements: string[];
  min_assets: number;
  max_providers_per_asset: number;
  total_setup_cost: number;
  total_monthly_earnings_low: number;
  total_monthly_earnings_high: number;
  is_active: boolean;
}

export interface UserBundleSelection {
  id: string;
  user_id: string;
  bundle_id: string;
  property_address: string;
  selected_assets: string[];
  selected_providers: string[];
  status: 'pending' | 'registered' | 'active';
  created_at: string;
}

export interface AffiliateRegistration {
  id: string;
  user_id: string;
  bundle_selection_id: string;
  provider_id: string;
  affiliate_link?: string;
  tracking_code: string;
  registration_status: 'pending' | 'completed' | 'failed';
  registration_date?: string;
  first_commission_date?: string;
  total_earnings: number;
  last_sync_at: string;
}

export interface BundleRecommendation {
  bundle: BundleConfiguration;
  providers: ServiceProvider[];
  totalEarnings: { low: number; high: number };
  matchingAssets: string[];
  setupCost: number;
}

export interface RegisterServiceFormData {
  providerId: string;
  userEmail: string;
  propertyAddress: string;
  assetType: string;
  bundleSelectionId?: string;
}

export interface ServiceProviderContextType {
  availableProviders: ServiceProvider[];
  connectedProviders: AffiliateRegistration[];
  earnings: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  connectToProvider: (providerId: string) => Promise<void>;
  registerWithProvider: (formData: RegisterServiceFormData) => Promise<void>;
  disconnectProvider: (providerId: string) => Promise<void>;
  syncProviderEarnings: (providerId: string) => Promise<void>;
  generateReferralLink: (providerId: string, destinationUrl: string) => string;
}
