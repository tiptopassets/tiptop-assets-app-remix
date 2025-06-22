
export interface PropertyAnalysisRow {
  id: string;
  user_id: string;
  address_id: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type: string;
  created_at: string;
  updated_at: string;
  coordinates: any;
  analysis_results: any;
  analysis_version: string;
  using_real_solar_data: boolean;
  satellite_image_url?: string;
  street_view_image_url?: string;
}

// Create alias for consistency - they should be the same
export type PropertyAnalysis = PropertyAnalysisRow;
