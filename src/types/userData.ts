
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

export interface UserAddress {
  id: string;
  user_id: string;
  address: string;
  formatted_address?: string;
  coordinates?: any;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPropertyAnalysis {
  id: string;
  user_id: string;
  address_id: string;
  analysis_results: AnalysisResults;
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

export interface UserAssetSelection {
  id: string;
  user_id: string;
  analysis_id: string;
  asset_type: string;
  asset_data: any;
  monthly_revenue: number;
  setup_cost: number;
  roi_months?: number;
  selected_at: string;
  status: string;
}

export interface UserDashboardPreferences {
  id: string;
  user_id: string;
  primary_address_id?: string;
  dashboard_layout: any;
  notification_settings: any;
  created_at: string;
  updated_at: string;
}
