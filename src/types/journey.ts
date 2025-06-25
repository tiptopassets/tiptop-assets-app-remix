
export interface VisitorSession {
  id: string;
  session_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  landing_page?: string;
  current_step: string;
  started_at: string;
  completed_at?: string;
  conversion_type?: 'manual' | 'concierge' | 'abandoned';
  total_time_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface UserJourneyProgress {
  id: string;
  session_id: string;
  user_id: string;
  address_entered: boolean;
  address_data?: any;
  analysis_completed: boolean;
  analysis_id?: string;
  services_viewed: boolean;
  extra_data_filled: boolean;
  extra_data: Record<string, any>;
  option_selected?: 'manual' | 'concierge';
  auth_completed: boolean;
  dashboard_accessed: boolean;
  current_step: string;
  step_completed_at: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface AvailableService {
  id: string;
  analysis_id: string;
  service_type: 'rooftop' | 'parking' | 'garden' | 'storage' | 'bandwidth' | 'rental';
  service_name: string;
  monthly_revenue_low: number;
  monthly_revenue_high: number;
  setup_cost: number;
  roi_months?: number;
  requirements: Record<string, any>;
  provider_info: Record<string, any>;
  is_available: boolean;
  priority_score: number;
  created_at: string;
}

export interface UserServiceSelection {
  id: string;
  user_id: string;
  journey_id?: string;
  available_service_id: string;
  selected_at: string;
  selection_type: 'selected' | 'interested' | 'maybe_later';
  notes?: string;
  priority: number;
  created_at: string;
}
