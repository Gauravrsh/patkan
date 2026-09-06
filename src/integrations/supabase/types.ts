export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      extension_events: {
        Row: {
          created_at: string
          event: string
          host: string | null
          id: string
          reason: string | null
          subject_hash: string
          surface: string | null
          value_int: number | null
          version: string | null
        }
        Insert: {
          created_at?: string
          event: string
          host?: string | null
          id?: string
          reason?: string | null
          subject_hash: string
          surface?: string | null
          value_int?: number | null
          version?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          host?: string | null
          id?: string
          reason?: string | null
          subject_hash?: string
          surface?: string | null
          value_int?: number | null
          version?: string | null
        }
        Relationships: []
      }
      page_events: {
        Row: {
          created_at: string
          device: string | null
          event: string
          id: string
          meta: Json
          path: string
          referrer_host: string | null
          section: string | null
          session_id: string
          value_int: number | null
          visitor_hash: string
        }
        Insert: {
          created_at?: string
          device?: string | null
          event: string
          id?: string
          meta?: Json
          path?: string
          referrer_host?: string | null
          section?: string | null
          session_id: string
          value_int?: number | null
          visitor_hash: string
        }
        Update: {
          created_at?: string
          device?: string | null
          event?: string
          id?: string
          meta?: Json
          path?: string
          referrer_host?: string | null
          section?: string | null
          session_id?: string
          value_int?: number | null
          visitor_hash?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          tier: string
          updated_at: string
          zero_data_mode: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          tier?: string
          updated_at?: string
          zero_data_mode?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          tier?: string
          updated_at?: string
          zero_data_mode?: boolean
        }
        Relationships: []
      }
      prompt_cache: {
        Row: {
          created_at: string
          engine: string
          hit_count: number
          id: string
          input_hash: string
          input_text: string
          last_hit_at: string | null
          output_text: string
        }
        Insert: {
          created_at?: string
          engine?: string
          hit_count?: number
          id?: string
          input_hash: string
          input_text: string
          last_hit_at?: string | null
          output_text: string
        }
        Update: {
          created_at?: string
          engine?: string
          hit_count?: number
          id?: string
          input_hash?: string
          input_text?: string
          last_hit_at?: string | null
          output_text?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          system_instruction: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          system_instruction: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          system_instruction?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transform_events: {
        Row: {
          accepted: boolean | null
          cached: boolean
          created_at: string
          dialect: string | null
          engine: string | null
          host: string | null
          id: string
          input_chars: number
          intensity: string | null
          intent: string | null
          latency_ms: number | null
          outcome: string
          output_chars: number
          persona: string | null
          subject_hash: string
          subject_kind: string
          surface: string
          ttfb_ms: number | null
        }
        Insert: {
          accepted?: boolean | null
          cached?: boolean
          created_at?: string
          dialect?: string | null
          engine?: string | null
          host?: string | null
          id?: string
          input_chars?: number
          intensity?: string | null
          intent?: string | null
          latency_ms?: number | null
          outcome?: string
          output_chars?: number
          persona?: string | null
          subject_hash: string
          subject_kind: string
          surface?: string
          ttfb_ms?: number | null
        }
        Update: {
          accepted?: boolean | null
          cached?: boolean
          created_at?: string
          dialect?: string | null
          engine?: string | null
          host?: string | null
          id?: string
          input_chars?: number
          intensity?: string | null
          intent?: string | null
          latency_ms?: number | null
          outcome?: string
          output_chars?: number
          persona?: string | null
          subject_hash?: string
          subject_kind?: string
          surface?: string
          ttfb_ms?: number | null
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          count: number
          day: string
          id: string
          subject_key: string
          updated_at: string
        }
        Insert: {
          count?: number
          day?: string
          id?: string
          subject_key: string
          updated_at?: string
        }
        Update: {
          count?: number
          day?: string
          id?: string
          subject_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      consume_quota: {
        Args: { _day: string; _limit: number; _subject_key: string }
        Returns: {
          allowed: boolean
          used: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_valid_field_value: { Args: { _value: string }; Returns: boolean }
      merge_device_usage: {
        Args: { _day: string; _device_key: string; _user_key: string }
        Returns: number
      }
      normalize_field_value: { Args: { _value: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
