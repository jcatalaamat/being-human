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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          goal: number
          id: string
          name: string
          profile_id: string | null
          progress: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal: number
          id?: string
          name: string
          profile_id?: string | null
          progress: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal?: number
          id?: string
          name?: string
          profile_id?: string | null
          progress?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          promo_video_url: string | null
          published_at: string | null
          release_at: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          promo_video_url?: string | null
          published_at?: string | null
          release_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          promo_video_url?: string | null
          published_at?: string | null
          release_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          meeting_url: string | null
          replay_url: string | null
          starts_at: string
          tenant_id: string
          timezone: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          meeting_url?: string | null
          replay_url?: string | null
          starts_at: string
          tenant_id: string
          timezone?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          meeting_url?: string | null
          replay_url?: string | null
          starts_at?: string
          tenant_id?: string
          timezone?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      installs: {
        Row: {
          expo_tokens: string[] | null
          user_id: string
        }
        Insert: {
          expo_tokens?: string[] | null
          user_id: string
        }
        Update: {
          expo_tokens?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      journal_comments: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          entry_id: string
          id: string
          tenant_id: string
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          entry_id: string
          id?: string
          tenant_id: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          entry_id?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_comments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          author_user_id: string
          body: string
          course_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string | null
          status: string
          tenant_id: string
          title: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          author_user_id: string
          body: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          status?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          status?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_read_receipts: {
        Row: {
          entry_id: string
          read_at: string
          staff_user_id: string
          tenant_id: string
        }
        Insert: {
          entry_id: string
          read_at?: string
          staff_user_id: string
          tenant_id: string
        }
        Update: {
          entry_id?: string
          read_at?: string
          staff_user_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_read_receipts_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_read_receipts_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_read_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_prompts: {
        Row: {
          created_at: string
          due_at: string | null
          due_mode: string
          id: string
          lesson_id: string
          prompt_body: string
          required: boolean
          response_schema: Json
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          due_mode?: string
          id?: string
          lesson_id: string
          prompt_body: string
          required?: boolean
          response_schema?: Json
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          due_mode?: string
          id?: string
          lesson_id?: string
          prompt_body?: string
          required?: boolean
          response_schema?: Json
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_prompts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_category:
            | Database["public"]["Enums"]["content_category"]
            | null
          content_text: string | null
          content_url: string | null
          created_at: string
          description: string | null
          duration_sec: number | null
          id: string
          is_published: boolean | null
          lesson_type: string
          meeting_url: string | null
          module_id: string
          order_index: number
          published_at: string | null
          release_at: string | null
          replay_url: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_published?: boolean | null
          lesson_type: string
          meeting_url?: string | null
          module_id: string
          order_index: number
          published_at?: string | null
          release_at?: string | null
          replay_url?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_published?: boolean | null
          lesson_type?: string
          meeting_url?: string | null
          module_id?: string
          order_index?: number
          published_at?: string | null
          release_at?: string | null
          replay_url?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number
          published_at: string | null
          release_at: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          title: string
          unlock_after_days: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index: number
          published_at?: string | null
          release_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          title: string
          unlock_after_days?: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          published_at?: string | null
          release_at?: string | null
          status?: Database["public"]["Enums"]["course_status"] | null
          title?: string
          unlock_after_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          deletion_requested_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          deletion_requested_at?: string | null
          id: string
          name?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          deletion_requested_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          number_of_days: number | null
          paid_project: boolean | null
          profile_id: string | null
          project_type: string | null
          street: string | null
          updated_at: string
          us_zip_code: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          number_of_days?: number | null
          paid_project?: boolean | null
          profile_id?: string | null
          project_type?: string | null
          street?: string | null
          updated_at?: string
          us_zip_code?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          number_of_days?: number | null
          paid_project?: boolean | null
          profile_id?: string | null
          project_type?: string | null
          street?: string | null
          updated_at?: string
          us_zip_code?: string | null
        }
        Relationships: []
      }
      prompt_feedback: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          id: string
          response_id: string
          tenant_id: string
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          response_id: string
          tenant_id: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          response_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_feedback_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_feedback_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "prompt_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_responses: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          response: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          response?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          response?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "lesson_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_responses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string | null
          referrer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          last_lesson_id: string | null
          revoked_at: string | null
          revoked_by: string | null
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          last_lesson_id?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          last_lesson_id?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_last_lesson_id_fkey"
            columns: ["last_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_complete: boolean | null
          last_position_sec: number | null
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          last_position_sec?: number | null
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          last_position_sec?: number | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_unlocks: {
        Row: {
          created_at: string
          id: string
          module_id: string
          notes: string | null
          unlocked_at: string
          unlocked_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          notes?: string | null
          unlocked_at?: string
          unlocked_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          notes?: string | null
          unlocked_at?: string
          unlocked_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_unlocks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          arr: number | null
          created_at: string
          id: string
          mrr: number | null
          profile_id: string | null
          updated_at: string
          weekly_post_views: number | null
        }
        Insert: {
          arr?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          profile_id?: string | null
          updated_at?: string
          weekly_post_views?: number | null
        }
        Update: {
          arr?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          profile_id?: string | null
          updated_at?: string
          weekly_post_views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_course_progress: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: number
      }
      can_admin_tenant: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
      can_manage_tenant_content: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
      can_view_event: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: boolean
      }
      get_effective_start: {
        Args: { p_course_release_at: string; p_enrolled_at: string }
        Returns: string
      }
      get_lesson_tenant_id: { Args: { p_lesson_id: string }; Returns: string }
      get_module_unlock_date: {
        Args: { p_module_id: string; p_user_id: string }
        Returns: string
      }
      get_user_tenant_role: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["tenant_role"]
      }
      is_module_unlocked: {
        Args: { p_module_id: string; p_user_id: string }
        Returns: boolean
      }
      is_tenant_member: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
      is_tenant_owner: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_actor_id: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
          p_tenant_id: string
          p_user_id: string
        }
        Returns: string
      }
      user_has_tenant_role: {
        Args: {
          p_roles: Database["public"]["Enums"]["tenant_role"][]
          p_tenant_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      content_category:
        | "orientation"
        | "transmission"
        | "clarification"
        | "embodiment"
        | "inquiry"
        | "meditation"
        | "assignment"
      course_status: "draft" | "scheduled" | "live"
      tenant_role: "owner" | "admin" | "instructor" | "member"
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
      content_category: [
        "orientation",
        "transmission",
        "clarification",
        "embodiment",
        "inquiry",
        "meditation",
        "assignment",
      ],
      course_status: ["draft", "scheduled", "live"],
      tenant_role: ["owner", "admin", "instructor", "member"],
    },
  },
} as const
