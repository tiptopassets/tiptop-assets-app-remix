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
          created_at: string
          encrypted_email: string | null
          encrypted_password: string | null
          encryption_key_id: string | null
          id: string
          service: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_email?: string | null
          encrypted_password?: string | null
          encryption_key_id?: string | null
          id?: string
          service: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_email?: string | null
          encrypted_password?: string | null
          encryption_key_id?: string | null
          id?: string
          service?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          created_at: string
          earnings: number
          id: string
          last_sync_at: string | null
          last_sync_status: string
          service: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earnings?: number
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string
          service: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earnings?: number
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string
          service?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_registrations: {
        Row: {
          affiliate_link: string | null
          bundle_selection_id: string | null
          created_at: string
          first_commission_date: string | null
          id: string
          last_sync_at: string
          provider_id: string
          registration_date: string | null
          registration_status: string
          total_earnings: number
          tracking_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_link?: string | null
          bundle_selection_id?: string | null
          created_at?: string
          first_commission_date?: string | null
          id?: string
          last_sync_at?: string
          provider_id: string
          registration_date?: string | null
          registration_status?: string
          total_earnings?: number
          tracking_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_link?: string | null
          bundle_selection_id?: string | null
          created_at?: string
          first_commission_date?: string | null
          id?: string
          last_sync_at?: string
          provider_id?: string
          registration_date?: string | null
          registration_status?: string
          total_earnings?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_registrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_configurations: {
        Row: {
          asset_requirements: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_providers_per_asset: number
          min_assets: number
          name: string
          total_monthly_earnings_high: number
          total_monthly_earnings_low: number
          total_setup_cost: number
          updated_at: string
        }
        Insert: {
          asset_requirements?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_providers_per_asset?: number
          min_assets?: number
          name: string
          total_monthly_earnings_high?: number
          total_monthly_earnings_low?: number
          total_setup_cost?: number
          updated_at?: string
        }
        Update: {
          asset_requirements?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_providers_per_asset?: number
          min_assets?: number
          name?: string
          total_monthly_earnings_high?: number
          total_monthly_earnings_low?: number
          total_setup_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      enhanced_service_providers: {
        Row: {
          affiliate_base_url: string | null
          api_type: string | null
          avg_earnings_high: number | null
          avg_earnings_low: number | null
          category: string
          commission_rate: number | null
          created_at: string | null
          id: string
          name: string
          priority_score: number | null
          setup_requirements: Json | null
          supported_assets: Json | null
          updated_at: string | null
        }
        Insert: {
          affiliate_base_url?: string | null
          api_type?: string | null
          avg_earnings_high?: number | null
          avg_earnings_low?: number | null
          category: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          name: string
          priority_score?: number | null
          setup_requirements?: Json | null
          supported_assets?: Json | null
          updated_at?: string | null
        }
        Update: {
          affiliate_base_url?: string | null
          api_type?: string | null
          avg_earnings_high?: number | null
          avg_earnings_low?: number | null
          category?: string
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          name?: string
          priority_score?: number | null
          setup_requirements?: Json | null
          supported_assets?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          onboarding_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          onboarding_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          onboarding_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_messages_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "user_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_integration_progress: {
        Row: {
          created_at: string | null
          earnings_data: Json | null
          id: string
          integration_status: string
          next_steps: Json | null
          onboarding_id: string | null
          partner_name: string
          referral_link: string | null
          registration_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          integration_status?: string
          next_steps?: Json | null
          onboarding_id?: string | null
          partner_name: string
          referral_link?: string | null
          registration_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          integration_status?: string
          next_steps?: Json | null
          onboarding_id?: string | null
          partner_name?: string
          referral_link?: string | null
          registration_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_integration_progress_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "user_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_recommendations: {
        Row: {
          asset_type: string
          created_at: string | null
          estimated_monthly_earnings: number | null
          id: string
          onboarding_id: string | null
          partner_name: string
          priority_score: number | null
          recommendation_reason: string | null
          setup_complexity: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          estimated_monthly_earnings?: number | null
          id?: string
          onboarding_id?: string | null
          partner_name: string
          priority_score?: number | null
          recommendation_reason?: string | null
          setup_complexity?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          estimated_monthly_earnings?: number | null
          id?: string
          onboarding_id?: string | null
          partner_name?: string
          priority_score?: number | null
          recommendation_reason?: string | null
          setup_complexity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_recommendations_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "user_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      property_analyses: {
        Row: {
          analysis_results: Json | null
          coordinates: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          property_address: string
          property_type: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          property_address: string
          property_type?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          property_address?: string
          property_type?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          affiliate_program_url: string | null
          avg_monthly_earnings_high: number
          avg_monthly_earnings_low: number
          category: string
          commission_rate: number
          conversion_rate: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          priority: number
          referral_link_template: string | null
          setup_cost: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number
          avg_monthly_earnings_low?: number
          category: string
          commission_rate?: number
          conversion_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          priority?: number
          referral_link_template?: string | null
          setup_cost?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number
          avg_monthly_earnings_low?: number
          category?: string
          commission_rate?: number
          conversion_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          priority?: number
          referral_link_template?: string | null
          setup_cost?: number
          updated_at?: string
          website_url?: string | null
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
      user_onboarding: {
        Row: {
          chat_history: Json | null
          completed_assets: string[] | null
          created_at: string
          current_step: number | null
          id: string
          progress_data: Json | null
          selected_option: Database["public"]["Enums"]["onboarding_option"]
          status: Database["public"]["Enums"]["onboarding_status"]
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_history?: Json | null
          completed_assets?: string[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          progress_data?: Json | null
          selected_option: Database["public"]["Enums"]["onboarding_option"]
          status?: Database["public"]["Enums"]["onboarding_status"]
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_history?: Json | null
          completed_assets?: string[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          progress_data?: Json | null
          selected_option?: Database["public"]["Enums"]["onboarding_option"]
          status?: Database["public"]["Enums"]["onboarding_status"]
          total_steps?: number | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_uuid: string }
        Returns: string
      }
      sum_login_count: {
        Args: Record<PropertyKey, never>
        Returns: number
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
