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
      streams: {
        Row: {
          archived: boolean
          color: string
          created_at: string
          id: string
          life_domain: Database["public"]["Enums"]["life_domain"] | null
          name: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string
          created_at?: string
          id?: string
          life_domain?: Database["public"]["Enums"]["life_domain"] | null
          name: string
          user_id?: string
        }
        Update: {
          archived?: boolean
          color?: string
          created_at?: string
          id?: string
          life_domain?: Database["public"]["Enums"]["life_domain"] | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          closed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          recurrence: Database["public"]["Enums"]["recurrence_rule"]
          recurrence_anchor_day: number | null
          status: Database["public"]["Enums"]["ticket_status"]
          stream_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          recurrence?: Database["public"]["Enums"]["recurrence_rule"]
          recurrence_anchor_day?: number | null
          status?: Database["public"]["Enums"]["ticket_status"]
          stream_id: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          recurrence?: Database["public"]["Enums"]["recurrence_rule"]
          recurrence_anchor_day?: number | null
          status?: Database["public"]["Enums"]["ticket_status"]
          stream_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_assessment_entries: {
        Row: {
          areas: string[]
          assessment_id: string
          created_at: string
          current_rating: number | null
          desired_rating: number | null
          dimension: Database["public"]["Enums"]["wellness_dimension"]
          focus_state: Database["public"]["Enums"]["wellness_focus_state"]
          id: string
          user_id: string
        }
        Insert: {
          areas?: string[]
          assessment_id: string
          created_at?: string
          current_rating?: number | null
          desired_rating?: number | null
          dimension: Database["public"]["Enums"]["wellness_dimension"]
          focus_state: Database["public"]["Enums"]["wellness_focus_state"]
          id?: string
          user_id?: string
        }
        Update: {
          areas?: string[]
          assessment_id?: string
          created_at?: string
          current_rating?: number | null
          desired_rating?: number | null
          dimension?: Database["public"]["Enums"]["wellness_dimension"]
          focus_state?: Database["public"]["Enums"]["wellness_focus_state"]
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_entry_assessment_owner_fkey"
            columns: ["assessment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "wellness_assessments"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      wellness_assessments: {
        Row: {
          created_at: string
          custom_reminder_days: number | null
          id: string
          reminder: Database["public"]["Enums"]["wellness_reminder"]
          status: Database["public"]["Enums"]["wellness_assessment_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_reminder_days?: number | null
          id?: string
          reminder?: Database["public"]["Enums"]["wellness_reminder"]
          status?: Database["public"]["Enums"]["wellness_assessment_status"]
          user_id?: string
        }
        Update: {
          created_at?: string
          custom_reminder_days?: number | null
          id?: string
          reminder?: Database["public"]["Enums"]["wellness_reminder"]
          status?: Database["public"]["Enums"]["wellness_assessment_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_wellness_assessment: {
        Args: {
          p_custom_reminder_days?: number
          p_entries: Json
          p_reminder: Database["public"]["Enums"]["wellness_reminder"]
        }
        Returns: string
      }
      seed_demo_tickets: { Args: never; Returns: undefined }
      seed_initial_streams: { Args: never; Returns: undefined }
      skip_wellness_assessment: { Args: never; Returns: string }
    }
    Enums: {
      life_domain:
        | "health"
        | "career"
        | "money"
        | "family"
        | "love"
        | "friends"
        | "fun"
        | "spirituality"
      recurrence_rule: "none" | "daily" | "weekly" | "monthly" | "yearly"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "done" | "cancelled"
      wellness_assessment_status: "completed" | "skipped"
      wellness_dimension:
        | "physical"
        | "emotional"
        | "intellectual"
        | "social"
        | "spiritual"
        | "occupational"
        | "environmental"
        | "financial"
      wellness_focus_state: "active_focus" | "background" | "not_tracking"
      wellness_reminder: "never" | "monthly" | "quarterly" | "custom"
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
      life_domain: [
        "health",
        "career",
        "money",
        "family",
        "love",
        "friends",
        "fun",
        "spirituality",
      ],
      recurrence_rule: ["none", "daily", "weekly", "monthly", "yearly"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "done", "cancelled"],
      wellness_assessment_status: ["completed", "skipped"],
      wellness_dimension: [
        "physical",
        "emotional",
        "intellectual",
        "social",
        "spiritual",
        "occupational",
        "environmental",
        "financial",
      ],
      wellness_focus_state: ["active_focus", "background", "not_tracking"],
      wellness_reminder: ["never", "monthly", "quarterly", "custom"],
    },
  },
} as const
