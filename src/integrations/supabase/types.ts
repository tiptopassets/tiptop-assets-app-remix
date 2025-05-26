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
          created_at: string | null
          encrypted_email: string | null
          encrypted_password: string | null
          id: string
          service: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_email?: string | null
          encrypted_password?: string | null
          id?: string
          service?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_email?: string | null
          encrypted_password?: string | null
          id?: string
          service?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_credentials_service_fkey"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["name"]
          },
        ]
      }
      affiliate_earnings: {
        Row: {
          earnings: number | null
          id: string
          last_sync_status: string | null
          service: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          earnings?: number | null
          id?: string
          last_sync_status?: string | null
          service?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          earnings?: number | null
          id?: string
          last_sync_status?: string | null
          service?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_service_fkey"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["name"]
          },
        ]
      }
      affiliate_registrations: {
        Row: {
          affiliate_link: string | null
          bundle_selection_id: string | null
          created_at: string | null
          first_commission_date: string | null
          id: string
          last_sync_at: string | null
          provider_id: string | null
          registration_date: string | null
          registration_status: string | null
          total_earnings: number | null
          tracking_code: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_link?: string | null
          bundle_selection_id?: string | null
          created_at?: string | null
          first_commission_date?: string | null
          id?: string
          last_sync_at?: string | null
          provider_id?: string | null
          registration_date?: string | null
          registration_status?: string | null
          total_earnings?: number | null
          tracking_code?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_link?: string | null
          bundle_selection_id?: string | null
          created_at?: string | null
          first_commission_date?: string | null
          id?: string
          last_sync_at?: string | null
          provider_id?: string | null
          registration_date?: string | null
          registration_status?: string | null
          total_earnings?: number | null
          tracking_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_registrations_bundle_selection_id_fkey"
            columns: ["bundle_selection_id"]
            isOneToOne: false
            referencedRelation: "user_bundle_selections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_registrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_analytics: {
        Row: {
          avg_time_to_first_commission: unknown | null
          bundle_id: string | null
          id: string
          last_updated: string | null
          provider_id: string | null
          successful_registrations: number | null
          total_earnings: number | null
          total_registrations: number | null
        }
        Insert: {
          avg_time_to_first_commission?: unknown | null
          bundle_id?: string | null
          id?: string
          last_updated?: string | null
          provider_id?: string | null
          successful_registrations?: number | null
          total_earnings?: number | null
          total_registrations?: number | null
        }
        Update: {
          avg_time_to_first_commission?: unknown | null
          bundle_id?: string | null
          id?: string
          last_updated?: string | null
          provider_id?: string | null
          successful_registrations?: number | null
          total_earnings?: number | null
          total_registrations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_analytics_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_configurations: {
        Row: {
          asset_requirements: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_providers_per_asset: number | null
          min_assets: number | null
          name: string
          total_monthly_earnings_high: number | null
          total_monthly_earnings_low: number | null
          total_setup_cost: number | null
        }
        Insert: {
          asset_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_providers_per_asset?: number | null
          min_assets?: number | null
          name: string
          total_monthly_earnings_high?: number | null
          total_monthly_earnings_low?: number | null
          total_setup_cost?: number | null
        }
        Update: {
          asset_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_providers_per_asset?: number | null
          min_assets?: number | null
          name?: string
          total_monthly_earnings_high?: number | null
          total_monthly_earnings_low?: number | null
          total_setup_cost?: number | null
        }
        Relationships: []
      }
      property_analyses: {
        Row: {
          analysis_results: Json
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
          analysis_results: Json
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
          analysis_results?: Json
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
      property_submissions: {
        Row: {
          additional_info: string | null
          email: string
          estimated_earnings: number | null
          full_name: string
          has_driveway: boolean
          has_garage: boolean
          has_internet: boolean
          has_pool: boolean
          id: string
          property_address: string
          sent_to_honeygain: boolean | null
          sent_to_neighbor: boolean | null
          sent_to_swimply: boolean | null
          submission_time: string | null
        }
        Insert: {
          additional_info?: string | null
          email: string
          estimated_earnings?: number | null
          full_name: string
          has_driveway?: boolean
          has_garage?: boolean
          has_internet?: boolean
          has_pool?: boolean
          id?: string
          property_address: string
          sent_to_honeygain?: boolean | null
          sent_to_neighbor?: boolean | null
          sent_to_swimply?: boolean | null
          submission_time?: string | null
        }
        Update: {
          additional_info?: string | null
          email?: string
          estimated_earnings?: number | null
          full_name?: string
          has_driveway?: boolean
          has_garage?: boolean
          has_internet?: boolean
          has_pool?: boolean
          id?: string
          property_address?: string
          sent_to_honeygain?: boolean | null
          sent_to_neighbor?: boolean | null
          sent_to_swimply?: boolean | null
          submission_time?: string | null
        }
        Relationships: []
      }
      service_integrations: {
        Row: {
          asset_type: string
          created_at: string | null
          expected_monthly_revenue: number | null
          id: string
          integration_details: Json | null
          integration_status: string | null
          last_updated: string | null
          property_address: string
          service_name: string
          setup_cost: number | null
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          expected_monthly_revenue?: number | null
          id?: string
          integration_details?: Json | null
          integration_status?: string | null
          last_updated?: string | null
          property_address: string
          service_name: string
          setup_cost?: number | null
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          expected_monthly_revenue?: number | null
          id?: string
          integration_details?: Json | null
          integration_status?: string | null
          last_updated?: string | null
          property_address?: string
          service_name?: string
          setup_cost?: number | null
          user_id?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          affiliate_program_url: string | null
          avg_monthly_earnings_high: number | null
          avg_monthly_earnings_low: number | null
          category: string
          commission_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          priority: number | null
          referral_link_template: string | null
          setup_cost: number | null
          website_url: string | null
        }
        Insert: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category: string
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          priority?: number | null
          referral_link_template?: string | null
          setup_cost?: number | null
          website_url?: string | null
        }
        Update: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category?: string
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          priority?: number | null
          referral_link_template?: string | null
          setup_cost?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          api_url: string | null
          created_at: string | null
          integration_type: string | null
          login_url: string | null
          name: string
          status: string | null
        }
        Insert: {
          api_url?: string | null
          created_at?: string | null
          integration_type?: string | null
          login_url?: string | null
          name: string
          status?: string | null
        }
        Update: {
          api_url?: string | null
          created_at?: string | null
          integration_type?: string | null
          login_url?: string | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      user_bundle_selections: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          id: string
          property_address: string
          selected_assets: Json | null
          selected_providers: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          property_address: string
          selected_assets?: Json | null
          selected_providers?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          property_address?: string
          selected_assets?: Json | null
          selected_providers?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bundle_selections_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_stats: {
        Row: {
          first_login_at: string
          id: string
          last_ip: string | null
          last_login_at: string
          last_user_agent: string | null
          login_count: number
          user_id: string
        }
        Insert: {
          first_login_at?: string
          id?: string
          last_ip?: string | null
          last_login_at?: string
          last_user_agent?: string | null
          login_count?: number
          user_id: string
        }
        Update: {
          first_login_at?: string
          id?: string
          last_ip?: string | null
          last_login_at?: string
          last_user_agent?: string | null
          login_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sum_login_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
