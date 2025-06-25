
// Database types - matching actual Supabase schema
export interface UserPropertyAnalysisRow {
  id: string;
  user_id: string;
  address_id: string;
  analysis_results: any;
  analysis_version: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type?: string;
  coordinates?: any;
  using_real_solar_data: boolean;
  satellite_image_url?: string;
  street_view_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAddressRow {
  id: string;
  user_id: string;
  address: string;
  formatted_address?: string;
  coordinates?: any;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderRow {
  id: string;
  name: string;
  category: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  commission_rate: number;
  setup_cost: number;
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
