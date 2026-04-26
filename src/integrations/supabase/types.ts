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
      chat_messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          last_message_at: string
          message_count: number
          mode: string
          notebook_id: string | null
          scope: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          last_message_at?: string
          message_count?: number
          mode?: string
          notebook_id?: string | null
          scope: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          last_message_at?: string
          message_count?: number
          mode?: string
          notebook_id?: string | null
          scope?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      iq_answers: {
        Row: {
          attempt_id: string
          created_at: string | null
          es_correcto: boolean
          id: string
          indice_seleccionado: number
          question_id: string
          tiempo_ms: number | null
        }
        Insert: {
          attempt_id: string
          created_at?: string | null
          es_correcto: boolean
          id?: string
          indice_seleccionado: number
          question_id: string
          tiempo_ms?: number | null
        }
        Update: {
          attempt_id?: string
          created_at?: string | null
          es_correcto?: boolean
          id?: string
          indice_seleccionado?: number
          question_id?: string
          tiempo_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "iq_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "iq_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iq_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "iq_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      iq_attempts: {
        Row: {
          area_scores: Json | null
          completed_at: string | null
          created_at: string | null
          edad: number
          email: string | null
          id: string
          iq_score: number | null
          nombre: string
          percentil: number | null
          respuestas_correctas: number | null
          started_at: string | null
          total_preguntas: number | null
          user_id: string | null
        }
        Insert: {
          area_scores?: Json | null
          completed_at?: string | null
          created_at?: string | null
          edad: number
          email?: string | null
          id?: string
          iq_score?: number | null
          nombre: string
          percentil?: number | null
          respuestas_correctas?: number | null
          started_at?: string | null
          total_preguntas?: number | null
          user_id?: string | null
        }
        Update: {
          area_scores?: Json | null
          completed_at?: string | null
          created_at?: string | null
          edad?: number
          email?: string | null
          id?: string
          iq_score?: number | null
          nombre?: string
          percentil?: number | null
          respuestas_correctas?: number | null
          started_at?: string | null
          total_preguntas?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iq_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      iq_questions: {
        Row: {
          area: string
          created_at: string | null
          dificultad: string
          es_espacial: boolean | null
          explicacion: string | null
          id: string
          indice_correcto: number
          is_active: boolean | null
          opciones: Json
          pregunta: string
        }
        Insert: {
          area: string
          created_at?: string | null
          dificultad: string
          es_espacial?: boolean | null
          explicacion?: string | null
          id?: string
          indice_correcto: number
          is_active?: boolean | null
          opciones: Json
          pregunta: string
        }
        Update: {
          area?: string
          created_at?: string | null
          dificultad?: string
          es_espacial?: boolean | null
          explicacion?: string | null
          id?: string
          indice_correcto?: number
          is_active?: boolean | null
          opciones?: Json
          pregunta?: string
        }
        Relationships: []
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
      notes: {
        Row: {
          content_html: string
          content_json: Json
          cover_color: string | null
          created_at: string
          document_id: string | null
          emoji: string | null
          id: string
          notebook_id: string | null
          template_key: string | null
          title: string
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          content_html?: string
          content_json?: Json
          cover_color?: string | null
          created_at?: string
          document_id?: string | null
          emoji?: string | null
          id?: string
          notebook_id?: string | null
          template_key?: string | null
          title?: string
          updated_at?: string
          user_id: string
          word_count?: number
        }
        Update: {
          content_html?: string
          content_json?: Json
          cover_color?: string | null
          created_at?: string
          document_id?: string | null
          emoji?: string | null
          id?: string
          notebook_id?: string | null
          template_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "notes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
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
          interests: Json | null
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
          interests?: Json | null
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
          interests?: Json | null
          last_activity_date?: string | null
          level?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          created_at: string
          document_id: string | null
          id: string
          max_score: number
          quiz_output_id: string | null
          room_id: string | null
          score: number
          time_total_ms: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          created_at?: string
          document_id?: string | null
          id?: string
          max_score: number
          quiz_output_id?: string | null
          room_id?: string | null
          score: number
          time_total_ms?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          document_id?: string | null
          id?: string
          max_score?: number
          quiz_output_id?: string | null
          room_id?: string | null
          score?: number
          time_total_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_output_id_fkey"
            columns: ["quiz_output_id"]
            isOneToOne: false
            referencedRelation: "document_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "quiz_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_room_participants: {
        Row: {
          answers: Json
          anti_cheat_events: Json
          avatar_emoji: string
          created_at: string
          display_name: string
          id: string
          is_ready: boolean
          joined_at: string
          last_seen_at: string
          rank: number | null
          room_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          anti_cheat_events?: Json
          avatar_emoji?: string
          created_at?: string
          display_name: string
          id?: string
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          rank?: number | null
          room_id: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          anti_cheat_events?: Json
          avatar_emoji?: string
          created_at?: string
          display_name?: string
          id?: string
          is_ready?: boolean
          joined_at?: string
          last_seen_at?: string
          rank?: number | null
          room_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "quiz_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_rooms: {
        Row: {
          anti_cheat_enabled: boolean
          code: string
          created_at: string
          current_question_index: number
          document_id: string | null
          finished_at: string | null
          host_user_id: string
          id: string
          max_participants: number
          notebook_id: string | null
          question_started_at: string | null
          questions: Json
          quiz_output_id: string | null
          quiz_title: string
          seconds_per_question: number
          status: Database["public"]["Enums"]["quiz_room_status"]
          updated_at: string
        }
        Insert: {
          anti_cheat_enabled?: boolean
          code: string
          created_at?: string
          current_question_index?: number
          document_id?: string | null
          finished_at?: string | null
          host_user_id: string
          id?: string
          max_participants?: number
          notebook_id?: string | null
          question_started_at?: string | null
          questions: Json
          quiz_output_id?: string | null
          quiz_title: string
          seconds_per_question?: number
          status?: Database["public"]["Enums"]["quiz_room_status"]
          updated_at?: string
        }
        Update: {
          anti_cheat_enabled?: boolean
          code?: string
          created_at?: string
          current_question_index?: number
          document_id?: string | null
          finished_at?: string | null
          host_user_id?: string
          id?: string
          max_participants?: number
          notebook_id?: string | null
          question_started_at?: string | null
          questions?: Json
          quiz_output_id?: string | null
          quiz_title?: string
          seconds_per_question?: number
          status?: Database["public"]["Enums"]["quiz_room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_rooms_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_rooms_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_rooms_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_rooms_quiz_output_id_fkey"
            columns: ["quiz_output_id"]
            isOneToOne: false
            referencedRelation: "document_outputs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
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
      award_xp: {
        Args: { _amount: number }
        Returns: {
          level: string
          streak_days: number
          xp: number
        }[]
      }
      generate_quiz_room_code: { Args: never; Returns: string }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
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
        | "study_guide"
        | "timeline"
        | "faq"
        | "business_plan"
      quiz_room_status: "lobby" | "active" | "finished"
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
        "study_guide",
        "timeline",
        "faq",
        "business_plan",
      ],
      quiz_room_status: ["lobby", "active", "finished"],
      user_plan: ["free", "pro", "teams"],
    },
  },
} as const
