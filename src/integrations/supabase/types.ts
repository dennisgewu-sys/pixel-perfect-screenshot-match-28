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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attended: boolean
          attendee_name: string
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          is_archived: boolean
          notes: string | null
          registration_id: string | null
          updated_at: string
        }
        Insert: {
          attended?: boolean
          attendee_name: string
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          registration_id?: string | null
          updated_at?: string
        }
        Update: {
          attended?: boolean
          attendee_name?: string
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          registration_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      community_feedback: {
        Row: {
          category: string
          community: string
          consent: boolean
          created_at: string
          description: string
          id: string
          internal_notes: string | null
          status: string
          submitter_contact: string | null
          submitter_name: string | null
          updated_at: string
        }
        Insert: {
          category: string
          community: string
          consent?: boolean
          created_at?: string
          description: string
          id?: string
          internal_notes?: string | null
          status?: string
          submitter_contact?: string | null
          submitter_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          community?: string
          consent?: boolean
          created_at?: string
          description?: string
          id?: string
          internal_notes?: string | null
          status?: string
          submitter_contact?: string | null
          submitter_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          admin_notes: string | null
          consent: boolean
          created_at: string
          email: string
          enquiry_type: string
          full_name: string
          id: string
          message: string
          organisation: string | null
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          consent?: boolean
          created_at?: string
          email: string
          enquiry_type?: string
          full_name: string
          id?: string
          message: string
          organisation?: string | null
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          enquiry_type?: string
          full_name?: string
          id?: string
          message?: string
          organisation?: string | null
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donation_date: string
          donor_name: string | null
          id: string
          is_anonymous: boolean
          is_archived: boolean
          notes: string | null
          payment_method: string
          purpose: string | null
          recorded_by: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donation_date?: string
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_archived?: boolean
          notes?: string | null
          payment_method?: string
          purpose?: string | null
          recorded_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donation_date?: string
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_archived?: boolean
          notes?: string | null
          payment_method?: string
          purpose?: string | null
          recorded_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          event_id: string
          full_name: string
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          event_id: string
          full_name: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          is_archived: boolean
          location: string | null
          programme_id: string | null
          registration_status: string
          start_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          is_archived?: boolean
          location?: string | null
          programme_id?: string | null
          registration_status?: string
          start_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          is_archived?: boolean
          location?: string | null
          programme_id?: string | null
          registration_status?: string
          start_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          currency: string
          description: string
          expense_date: string
          id: string
          is_archived: boolean
          notes: string | null
          payee: string | null
          payment_method: string
          recorded_by: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          currency?: string
          description: string
          expense_date?: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          payee?: string | null
          payment_method?: string
          recorded_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          payee?: string | null
          payment_method?: string
          recorded_by?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          admin_notes: string | null
          community: string
          consent: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          interests: string | null
          motivation: string | null
          occupation: string | null
          phone: string
          referred_by_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          community: string
          consent?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          interests?: string | null
          motivation?: string | null
          occupation?: string | null
          phone: string
          referred_by_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          community?: string
          consent?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interests?: string | null
          motivation?: string | null
          occupation?: string | null
          phone?: string
          referred_by_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_name: string | null
          category: string
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          office_address: string | null
          tiktok_url: string | null
          updated_at: string
          whatsapp_url: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          office_address?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          office_address?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      programme_applications: {
        Row: {
          admin_notes: string | null
          community: string | null
          consent: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          institution: string | null
          motivation: string | null
          participant_category: string
          phone: string
          programme_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          community?: string | null
          consent?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          institution?: string | null
          motivation?: string | null
          participant_category: string
          phone: string
          programme_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          community?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          institution?: string | null
          motivation?: string | null
          participant_category?: string
          phone?: string
          programme_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_applications_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          is_flagship: boolean
          registration_status: string
          slug: string
          sort_order: number
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_flagship?: boolean
          registration_status?: string
          slug: string
          sort_order?: number
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_flagship?: boolean
          registration_status?: string
          slug?: string
          sort_order?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_archived: boolean
          location: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          location?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean
          location?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
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
      volunteer_applications: {
        Row: {
          admin_notes: string | null
          areas_of_interest: string[]
          availability: string
          badge_level: number
          community: string
          consent: boolean
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string
          referral_code: string | null
          referral_count: number
          referred_by_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          areas_of_interest?: string[]
          availability: string
          badge_level?: number
          community: string
          consent?: boolean
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone: string
          referral_code?: string | null
          referral_count?: number
          referred_by_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          areas_of_interest?: string[]
          availability?: string
          badge_level?: number
          community?: string
          consent?: boolean
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string
          referral_code?: string | null
          referral_count?: number
          referred_by_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_referrals: {
        Row: {
          created_at: string
          id: string
          referred_email: string
          referred_id: string
          referred_name: string
          referred_type: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_email: string
          referred_id: string
          referred_name: string
          referred_type: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_email?: string
          referred_id?: string
          referred_name?: string
          referred_type?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_referrals_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_rewards: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          is_archived: boolean
          level: number
          notes: string | null
          paid_on: string | null
          payment_method: string | null
          reference: string | null
          status: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          level: number
          notes?: string | null
          paid_on?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          level?: number
          notes?: string | null
          paid_on?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_rewards_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_initial_super_admin: { Args: never; Returns: boolean }
      get_referral_progress: {
        Args: { _code: string }
        Returns: {
          badge_level: number
          first_name: string
          referral_count: number
          rewards_earned: number
          rewards_paid: number
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      super_admin_exists: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "foundation_admin"
        | "programme_manager"
        | "finance_officer"
        | "volunteer_coordinator"
        | "editor"
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
      app_role: [
        "super_admin",
        "foundation_admin",
        "programme_manager",
        "finance_officer",
        "volunteer_coordinator",
        "editor",
      ],
    },
  },
} as const
