export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      affiliate_credentials: {
        Row: {
          created_at: string | null
          credentials: Json | null
          id: string
          is_active: boolean | null
          provider_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          provider_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          provider_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          created_at: string | null
          earnings_amount: number | null
          id: string
          provider_name: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          provider_name?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          provider_name?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_registrations: {
        Row: {
          bundle_selection_id: string | null
          created_at: string | null
          id: string
          provider_id: string | null
          provider_name: string
          registration_data: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_selection_id?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          provider_name: string
          registration_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_selection_id?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          provider_name?: string
          registration_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bundle_configurations: {
        Row: {
          asset_requirements: string[] | null
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
          updated_at: string | null
        }
        Insert: {
          asset_requirements?: string[] | null
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
          updated_at?: string | null
        }
        Update: {
          asset_requirements?: string[] | null
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
          updated_at?: string | null
        }
        Relationships: []
      }
      enhanced_service_providers: {
        Row: {
          asset_types: string[] | null
          avg_monthly_earnings_high: number | null
          avg_monthly_earnings_low: number | null
          commission_rate: number | null
          connected: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          login_url: string | null
          logo: string | null
          name: string
          priority: number | null
          referral_link_template: string | null
          setup_instructions: string | null
          setup_requirements: Json | null
          supported_assets: string[] | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          asset_types?: string[] | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          commission_rate?: number | null
          connected?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          logo?: string | null
          name: string
          priority?: number | null
          referral_link_template?: string | null
          setup_instructions?: string | null
          setup_requirements?: Json | null
          supported_assets?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          asset_types?: string[] | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          commission_rate?: number | null
          connected?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          logo?: string | null
          name?: string
          priority?: number | null
          referral_link_template?: string | null
          setup_instructions?: string | null
          setup_requirements?: Json | null
          supported_assets?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      flexoffers_transactions: {
        Row: {
          click_date: string | null
          commission: number
          created_at: string | null
          id: string
          payload: Json | null
          program_name: string
          status: string
          transaction_date: string
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          click_date?: string | null
          commission: number
          created_at?: string | null
          id?: string
          payload?: Json | null
          program_name: string
          status: string
          transaction_date: string
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          click_date?: string | null
          commission?: number
          created_at?: string | null
          id?: string
          payload?: Json | null
          program_name?: string
          status?: string
          transaction_date?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flexoffers_user_mapping: {
        Row: {
          created_at: string | null
          id: string
          sub_affiliate_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          sub_affiliate_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          sub_affiliate_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_integrations: {
        Row: {
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          affiliate_program_url: string | null
          avg_monthly_earnings_high: number | null
          avg_monthly_earnings_low: number | null
          category: string | null
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
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category?: string | null
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
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category?: string | null
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
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string | null
          created_at: string | null
          formatted_address: string | null
          id: string
          latitude: number | null
          longitude: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_bundle_selections: {
        Row: {
          bundle_data: Json | null
          bundle_name: string
          created_at: string | null
          id: string
          property_address: string | null
          selected_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_data?: Json | null
          bundle_name: string
          created_at?: string | null
          id?: string
          property_address?: string | null
          selected_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_data?: Json | null
          bundle_name?: string
          created_at?: string | null
          id?: string
          property_address?: string | null
          selected_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_journey_complete: {
        Row: {
          analysis_id: string | null
          analysis_results: Json | null
          created_at: string | null
          id: string
          property_address: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          property_address?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          property_address?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_login_stats: {
        Row: {
          created_at: string | null
          first_login_at: string | null
          id: string
          last_ip: string | null
          last_login_at: string | null
          last_user_agent: string | null
          login_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_property_analyses: {
        Row: {
          address_id: string | null
          analysis_results: Json | null
          created_at: string | null
          id: string
          property_type: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_id?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_id?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string
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
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
