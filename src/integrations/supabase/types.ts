export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_credentials: {
        Row: {
          account_id: string | null
          api_key: string | null
          created_at: string | null
          id: string
          provider_name: string
          secret_key: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          provider_name: string
          secret_key?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          provider_name?: string
          secret_key?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          earnings_amount: number | null
          id: string
          metadata: Json | null
          provider_name: string
          service_type: string
          status: string | null
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          metadata?: Json | null
          provider_name: string
          service_type: string
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          metadata?: Json | null
          provider_name?: string
          service_type?: string
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      available_services: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          monthly_revenue_high: number | null
          monthly_revenue_low: number | null
          priority_score: number | null
          provider_info: Json | null
          requirements: Json | null
          roi_months: number | null
          service_name: string
          service_type: string
          setup_cost: number | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          monthly_revenue_high?: number | null
          monthly_revenue_low?: number | null
          priority_score?: number | null
          provider_info?: Json | null
          requirements?: Json | null
          roi_months?: number | null
          service_name: string
          service_type: string
          setup_cost?: number | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          monthly_revenue_high?: number | null
          monthly_revenue_low?: number | null
          priority_score?: number | null
          provider_info?: Json | null
          requirements?: Json | null
          roi_months?: number | null
          service_name?: string
          service_type?: string
          setup_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "available_services_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "user_property_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_analytics: {
        Row: {
          address_conversion_rate: number | null
          addresses_entered: number | null
          analyses_completed: number | null
          analysis_conversion_rate: number | null
          auth_conversion_rate: number | null
          auths_completed: number | null
          created_at: string | null
          dashboard_conversion_rate: number | null
          dashboards_accessed: number | null
          date: string
          id: string
          manual_vs_concierge: Json | null
          option_selection_rate: number | null
          options_selected: number | null
          popular_services: Json | null
          returning_visitors: number | null
          service_view_rate: number | null
          services_viewed: number | null
          total_visitors: number | null
          unique_visitors: number | null
        }
        Insert: {
          address_conversion_rate?: number | null
          addresses_entered?: number | null
          analyses_completed?: number | null
          analysis_conversion_rate?: number | null
          auth_conversion_rate?: number | null
          auths_completed?: number | null
          created_at?: string | null
          dashboard_conversion_rate?: number | null
          dashboards_accessed?: number | null
          date?: string
          id?: string
          manual_vs_concierge?: Json | null
          option_selection_rate?: number | null
          options_selected?: number | null
          popular_services?: Json | null
          returning_visitors?: number | null
          service_view_rate?: number | null
          services_viewed?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
        }
        Update: {
          address_conversion_rate?: number | null
          addresses_entered?: number | null
          analyses_completed?: number | null
          analysis_conversion_rate?: number | null
          auth_conversion_rate?: number | null
          auths_completed?: number | null
          created_at?: string | null
          dashboard_conversion_rate?: number | null
          dashboards_accessed?: number | null
          date?: string
          id?: string
          manual_vs_concierge?: Json | null
          option_selection_rate?: number | null
          options_selected?: number | null
          popular_services?: Json | null
          returning_visitors?: number | null
          service_view_rate?: number | null
          services_viewed?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          avg_monthly_earnings_high: number
          avg_monthly_earnings_low: number
          category: string
          commission_rate: number
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          priority: number
          service_areas: Json | null
          setup_cost: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avg_monthly_earnings_high?: number
          avg_monthly_earnings_low?: number
          category: string
          commission_rate?: number
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          priority?: number
          service_areas?: Json | null
          setup_cost?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avg_monthly_earnings_high?: number
          avg_monthly_earnings_low?: number
          category?: string
          commission_rate?: number
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          priority?: number
          service_areas?: Json | null
          setup_cost?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number | null
          category: string
          commission_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          provider_info: Json | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider_info?: Json | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider_info?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solar_api_cache: {
        Row: {
          cached_at: string | null
          coordinates: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          property_address: string
          solar_data: Json
        }
        Insert: {
          cached_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          property_address: string
          solar_data: Json
        }
        Update: {
          cached_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          property_address?: string
          solar_data?: Json
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          coordinates: Json | null
          created_at: string | null
          formatted_address: string | null
          id: string
          is_primary: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          coordinates?: Json | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          coordinates?: Json | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_asset_selections: {
        Row: {
          analysis_id: string
          asset_data: Json
          asset_type: string
          id: string
          monthly_revenue: number | null
          roi_months: number | null
          selected_at: string | null
          setup_cost: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          analysis_id: string
          asset_data: Json
          asset_type: string
          id?: string
          monthly_revenue?: number | null
          roi_months?: number | null
          selected_at?: string | null
          setup_cost?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string
          asset_data?: Json
          asset_type?: string
          id?: string
          monthly_revenue?: number | null
          roi_months?: number | null
          selected_at?: string | null
          setup_cost?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_asset_selections_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "user_property_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dashboard_preferences: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          notification_settings: Json | null
          primary_address_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          primary_address_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          primary_address_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dashboard_preferences_primary_address_id_fkey"
            columns: ["primary_address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_complete: {
        Row: {
          address_entered_at: string | null
          analysis_completed_at: string | null
          analysis_results: Json | null
          auth_completed_at: string | null
          conversion_type: string | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed_at: string | null
          drop_off_step: string | null
          extra_data_filled_at: string | null
          extra_form_data: Json | null
          id: string
          interested_services: Json | null
          ip_address: unknown | null
          is_conversion: boolean | null
          journey_complete_at: string | null
          journey_start_at: string | null
          landing_page: string | null
          options_selected_at: string | null
          property_address: string | null
          property_coordinates: Json | null
          referrer: string | null
          selected_option: string | null
          selected_services: Json | null
          services_viewed_at: string | null
          session_id: string
          site_entered_at: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_results?: Json | null
          auth_completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          drop_off_step?: string | null
          extra_data_filled_at?: string | null
          extra_form_data?: Json | null
          id?: string
          interested_services?: Json | null
          ip_address?: unknown | null
          is_conversion?: boolean | null
          journey_complete_at?: string | null
          journey_start_at?: string | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id: string
          site_entered_at?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_results?: Json | null
          auth_completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          drop_off_step?: string | null
          extra_data_filled_at?: string | null
          extra_form_data?: Json | null
          id?: string
          interested_services?: Json | null
          ip_address?: unknown | null
          is_conversion?: boolean | null
          journey_complete_at?: string | null
          journey_start_at?: string | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id?: string
          site_entered_at?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      user_journey_progress: {
        Row: {
          address_data: Json | null
          address_entered: boolean | null
          analysis_completed: boolean | null
          analysis_id: string | null
          auth_completed: boolean | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed: boolean | null
          extra_data: Json | null
          extra_data_filled: boolean | null
          id: string
          option_selected: string | null
          services_viewed: boolean | null
          session_id: string | null
          step_completed_at: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_data?: Json | null
          address_entered?: boolean | null
          analysis_completed?: boolean | null
          analysis_id?: string | null
          auth_completed?: boolean | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed?: boolean | null
          extra_data?: Json | null
          extra_data_filled?: boolean | null
          id?: string
          option_selected?: string | null
          services_viewed?: boolean | null
          session_id?: string | null
          step_completed_at?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_data?: Json | null
          address_entered?: boolean | null
          analysis_completed?: boolean | null
          analysis_id?: string | null
          auth_completed?: boolean | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed?: boolean | null
          extra_data?: Json | null
          extra_data_filled?: boolean | null
          id?: string
          option_selected?: string | null
          services_viewed?: boolean | null
          session_id?: string | null
          step_completed_at?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "user_property_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      user_login_stats: {
        Row: {
          first_login_at: string | null
          id: string
          last_ip: string | null
          last_login_at: string | null
          last_user_agent: string | null
          login_count: number | null
          user_id: string
        }
        Insert: {
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          user_id: string
        }
        Update: {
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_property_analyses: {
        Row: {
          address_id: string
          analysis_results: Json
          analysis_version: string | null
          coordinates: Json | null
          created_at: string | null
          id: string
          property_type: string | null
          satellite_image_url: string | null
          street_view_image_url: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string
          using_real_solar_data: boolean | null
        }
        Insert: {
          address_id: string
          analysis_results: Json
          analysis_version?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          satellite_image_url?: string | null
          street_view_image_url?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id: string
          using_real_solar_data?: boolean | null
        }
        Update: {
          address_id?: string
          analysis_results?: Json
          analysis_version?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          satellite_image_url?: string | null
          street_view_image_url?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string
          using_real_solar_data?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_property_analyses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_service_selections: {
        Row: {
          available_service_id: string | null
          created_at: string | null
          id: string
          journey_id: string | null
          notes: string | null
          priority: number | null
          selected_at: string | null
          selection_type: string | null
          user_id: string | null
        }
        Insert: {
          available_service_id?: string | null
          created_at?: string | null
          id?: string
          journey_id?: string | null
          notes?: string | null
          priority?: number | null
          selected_at?: string | null
          selection_type?: string | null
          user_id?: string | null
        }
        Update: {
          available_service_id?: string | null
          created_at?: string | null
          id?: string
          journey_id?: string | null
          notes?: string | null
          priority?: number | null
          selected_at?: string | null
          selection_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_service_selections_available_service_id_fkey"
            columns: ["available_service_id"]
            isOneToOne: false
            referencedRelation: "available_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_service_selections_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "user_journey_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          address_entered_at: string | null
          analysis_completed_at: string | null
          analysis_data: Json | null
          auth_completed_at: string | null
          completed_at: string | null
          conversion_type: string | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed_at: string | null
          extra_data: Json | null
          id: string
          ip_address: unknown | null
          journey_data: Json | null
          landing_page: string | null
          options_selected_at: string | null
          property_address: string | null
          referrer: string | null
          selected_option: string | null
          selected_services: Json | null
          services_viewed_at: string | null
          session_id: string
          started_at: string | null
          total_time_seconds: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_data?: Json | null
          auth_completed_at?: string | null
          completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data?: Json | null
          id?: string
          ip_address?: unknown | null
          journey_data?: Json | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id: string
          started_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_data?: Json | null
          auth_completed_at?: string | null
          completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data?: Json | null
          id?: string
          ip_address?: unknown | null
          journey_data?: Json | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id?: string
          started_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dashboard_data: {
        Args: { p_user_id: string }
        Returns: {
          journey_id: string
          property_address: string
          analysis_results: Json
          total_monthly_revenue: number
          total_opportunities: number
          selected_services: Json
          selected_option: string
          journey_progress: Json
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_uuid: string }
        Returns: string
      }
      link_journey_to_user: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: undefined
      }
      sum_login_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_journey_step: {
        Args: { p_session_id: string; p_step: string; p_data?: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      onboarding_option: "manual" | "concierge"
      onboarding_status: "not_started" | "in_progress" | "completed" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      onboarding_option: ["manual", "concierge"],
      onboarding_status: ["not_started", "in_progress", "completed", "paused"],
    },
  },
} as const
