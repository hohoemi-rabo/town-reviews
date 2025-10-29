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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      facility_requests: {
        Row: {
          address: string | null
          admin_note: string | null
          area: string | null
          category: string | null
          created_at: string | null
          facility_name: string
          id: string
          processed_at: string | null
          requester_email: string | null
          requester_name: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          admin_note?: string | null
          area?: string | null
          category?: string | null
          created_at?: string | null
          facility_name: string
          id?: string
          processed_at?: string | null
          requester_email?: string | null
          requester_name?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          admin_note?: string | null
          area?: string | null
          category?: string | null
          created_at?: string | null
          facility_name?: string
          id?: string
          processed_at?: string | null
          requester_email?: string | null
          requester_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      monthly_digests: {
        Row: {
          created_at: string | null
          id: string
          popular_spots: Json | null
          summary: string | null
          trending_tags: string[] | null
          year_month: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          popular_spots?: Json | null
          summary?: string | null
          trending_tags?: string[] | null
          year_month: string
        }
        Update: {
          created_at?: string | null
          id?: string
          popular_spots?: Json | null
          summary?: string | null
          trending_tags?: string[] | null
          year_month?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string | null
          area: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          google_maps_url: string | null
          id: string
          is_verified: boolean | null
          lat: number
          lng: number
          name: string
          phone: string | null
          place_id: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          google_maps_url?: string | null
          id?: string
          is_verified?: boolean | null
          lat: number
          lng: number
          name: string
          phone?: string | null
          place_id: string
        }
        Update: {
          address?: string | null
          area?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          google_maps_url?: string | null
          id?: string
          is_verified?: boolean | null
          lat?: number
          lng?: number
          name?: string
          phone?: string | null
          place_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          recommendation_id: string | null
          user_identifier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          recommendation_id?: string | null
          user_identifier: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          recommendation_id?: string | null
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          author_ip_hash: string | null
          author_name: string | null
          created_at: string | null
          heard_from: string
          heard_from_type: string
          id: string
          images: string[] | null
          is_anonymous: boolean | null
          is_editable_until: string | null
          note_formatted: string | null
          note_raw: string | null
          place_id: string | null
          review_category: string | null
          season: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          author_ip_hash?: string | null
          author_name?: string | null
          created_at?: string | null
          heard_from: string
          heard_from_type: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_editable_until?: string | null
          note_formatted?: string | null
          note_raw?: string | null
          place_id?: string | null
          review_category?: string | null
          season?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          author_ip_hash?: string | null
          author_name?: string | null
          created_at?: string | null
          heard_from?: string
          heard_from_type?: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_editable_until?: string | null
          note_formatted?: string | null
          note_raw?: string | null
          place_id?: string | null
          review_category?: string | null
          season?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
