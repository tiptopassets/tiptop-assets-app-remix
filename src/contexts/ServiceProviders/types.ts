
export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description?: string;
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
  created_at: string;
  updated_at: string;
}

export interface BundleConfiguration {
  id: string;
  name: string;
  description?: string;
  asset_requirements: string[] | any; // Handle both JSON and string[] types
  min_assets: number;
  max_providers_per_asset: number;
  total_setup_cost: number;
  total_monthly_earnings_low: number;
  total_monthly_earnings_high: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BundleRecommendation {
  bundle: BundleConfiguration;
  providers: ServiceProvider[];
  totalEarnings: {
    low: number;
    high: number;
  };
  matchingAssets: string[];
  setupCost: number;
}

export interface AffiliateRegistration {
  id: string;
  user_id: string;
  bundle_selection_id?: string;
  provider_id: string;
  affiliate_link?: string;
  tracking_code?: string;
  registration_status: 'pending' | 'completed' | 'failed';
  registration_date?: string;
  first_commission_date?: string;
  total_earnings: number;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}
