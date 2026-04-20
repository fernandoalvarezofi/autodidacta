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
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          id: string
          page_number: number | null
          user_id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          id?: string
          page_number?: number | null
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          page_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_outputs: {
        Row: {
          content: Json
          created_at: string
          document_id: string
          id: string
          type: Database["public"]["Enums"]["output_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          document_id: string
          id?: string
          type: Database["public"]["Enums"]["output_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          document_id?: string
          id?: string
          type?: Database["public"]["Enums"]["output_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_outputs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_outputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          notebook_id: string
          progress: number
          size_bytes: number | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          notebook_id: string
          progress?: number
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          notebook_id?: string
          progress?: number
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          difficulty: number
          document_id: string | null
          ease_factor: number
          front: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          notebook_id: string
          repetitions: number
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          difficulty?: number
          document_id?: string | null
          ease_factor?: number
          front: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          notebook_id: string
          repetitions?: number
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          difficulty?: number
          document_id?: string | null
          ease_factor?: number
          front?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          notebook_id?: string
          repetitions?: number
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          cover_color: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_activity_date: string | null
          level: string
          plan: Database["public"]["Enums"]["user_plan"]
          streak_days: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_activity_date?: string | null
          level?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          level?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_status:
        | "pending"
        | "processing"
        | "chunked"
        | "generating"
        | "ready"
        | "error"
      document_type:
        | "pdf"
        | "audio"
        | "image"
        | "text"
        | "youtube"
        | "tiktok"
        | "docx"
      output_type:
        | "summary"
        | "mindmap"
        | "flashcards"
        | "quiz"
        | "transcript"
        | "glossary"
      user_plan: "free" | "pro" | "teams"
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
      document_status: [
        "pending",
        "processing",
        "chunked",
        "generating",
        "ready",
        "error",
      ],
      document_type: [
        "pdf",
        "audio",
        "image",
        "text",
        "youtube",
        "tiktok",
        "docx",
      ],
      output_type: [
        "summary",
        "mindmap",
        "flashcards",
        "quiz",
        "transcript",
        "glossary",
      ],
      user_plan: ["free", "pro", "teams"],
    },
  },
} as const
