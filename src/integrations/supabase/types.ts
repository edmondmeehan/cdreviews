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
      ad_events: {
        Row: {
          ad_id: string
          created_at: string
          id: number
          kind: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: never
          kind: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: never
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_events_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          active: boolean
          advertiser: string
          body: string
          created_at: string
          cta: string
          ends_at: string | null
          headline: string
          id: string
          image_url: string | null
          link_url: string
          name: string
          placement: string
          starts_at: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          advertiser?: string
          body?: string
          created_at?: string
          cta?: string
          ends_at?: string | null
          headline?: string
          id?: string
          image_url?: string | null
          link_url: string
          name: string
          placement: string
          starts_at?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          advertiser?: string
          body?: string
          created_at?: string
          cta?: string
          ends_at?: string | null
          headline?: string
          id?: string
          image_url?: string | null
          link_url?: string
          name?: string
          placement?: string
          starts_at?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      contributors: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          body: Json
          byline: string
          created_at: string
          dek: string | null
          hero: string | null
          id: string
          kicker: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json
          byline?: string
          created_at?: string
          dek?: string | null
          hero?: string | null
          id?: string
          kicker?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json
          byline?: string
          created_at?: string
          dek?: string | null
          hero?: string | null
          id?: string
          kicker?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lists: {
        Row: {
          created_at: string
          dek: string | null
          id: string
          items: Json
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dek?: string | null
          id?: string
          items?: Json
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dek?: string | null
          id?: string
          items?: Json
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          archive_url: string | null
          art: string
          art_url: string | null
          artist: string
          body: Json
          byline: string
          contact: string | null
          created_at: string
          created_by: string | null
          date: string
          decade: string
          format: string
          genre: string
          id: string
          kind: string
          label: string
          label_address: string | null
          period: string | null
          preview_token: string | null
          publish_at: string | null
          read_mins: number
          score: number
          slug: string
          spotify_album_id: string | null
          spotify_artist_id: string | null
          spotify_url: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          archive_url?: string | null
          art?: string
          art_url?: string | null
          artist: string
          body?: Json
          byline?: string
          contact?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          decade: string
          format?: string
          genre?: string
          id?: string
          kind?: string
          label?: string
          label_address?: string | null
          period?: string | null
          preview_token?: string | null
          publish_at?: string | null
          read_mins?: number
          score?: number
          slug: string
          spotify_album_id?: string | null
          spotify_artist_id?: string | null
          spotify_url?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          archive_url?: string | null
          art?: string
          art_url?: string | null
          artist?: string
          body?: Json
          byline?: string
          contact?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          decade?: string
          format?: string
          genre?: string
          id?: string
          kind?: string
          label?: string
          label_address?: string | null
          period?: string | null
          preview_token?: string | null
          publish_at?: string | null
          read_mins?: number
          score?: number
          slug?: string
          spotify_album_id?: string | null
          spotify_artist_id?: string | null
          spotify_url?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          maintenance_message: string | null
          maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          maintenance_message?: string | null
          maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          maintenance_message?: string | null
          maintenance_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: string
          signed_up: string
        }
        Insert: {
          email: string
          id?: string
          signed_up?: string
        }
        Update: {
          email?: string
          id?: string
          signed_up?: string
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
      ad_stats: {
        Args: never
        Returns: {
          ad_id: string
          clicks: number
          views: number
        }[]
      }
      can_publish: { Args: { _user_id: string }; Returns: boolean }
      get_review_preview: {
        Args: { _token: string }
        Returns: {
          archive_url: string | null
          art: string
          art_url: string | null
          artist: string
          body: Json
          byline: string
          contact: string | null
          created_at: string
          created_by: string | null
          date: string
          decade: string
          format: string
          genre: string
          id: string
          kind: string
          label: string
          label_address: string | null
          period: string | null
          preview_token: string | null
          publish_at: string | null
          read_mins: number
          score: number
          slug: string
          spotify_album_id: string | null
          spotify_artist_id: string | null
          spotify_url: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "reviews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_writer: { Args: { _user_id: string }; Returns: boolean }
      record_ad_event: {
        Args: { _ad_id: string; _kind: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "contributor"
        | "senior_writer"
        | "writer"
        | "super_admin"
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
        "admin",
        "editor",
        "contributor",
        "senior_writer",
        "writer",
        "super_admin",
      ],
    },
  },
} as const
