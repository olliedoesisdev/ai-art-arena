/**
 * Supabase Database Type Definitions
 * Generated types for AI Art Arena database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Main Database interface with public schema
 */
export interface Database {
  public: {
    Tables: {
      contests: {
        Row: {
          id: string;
          title: string;
          week_number: number;
          year: number;
          start_date: string;
          end_date: string;
          status: "draft" | "active" | "ended" | "archived";
          winner_artwork_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          week_number: number;
          year: number;
          start_date: string;
          end_date: string;
          status?: "draft" | "active" | "ended" | "archived";
          winner_artwork_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          week_number?: number;
          year?: number;
          start_date?: string;
          end_date?: string;
          status?: "draft" | "active" | "ended" | "archived";
          winner_artwork_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contests_winner_artwork_id_fkey";
            columns: ["winner_artwork_id"];
            isOneToOne: false;
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          }
        ];
      };
      artworks: {
        Row: {
          id: string;
          contest_id: string;
          title: string;
          description: string | null;
          image_url: string;
          prompt: string | null;
          artist_name: string | null;
          vote_count: number;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          title: string;
          description?: string | null;
          image_url: string;
          prompt?: string | null;
          artist_name?: string | null;
          vote_count?: number;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          contest_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          prompt?: string | null;
          artist_name?: string | null;
          vote_count?: number;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artworks_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "contests";
            referencedColumns: ["id"];
          }
        ];
      };
      votes: {
        Row: {
          id: string;
          artwork_id: string;
          contest_id: string;
          user_id: string | null;
          user_identifier: string;
          ip_hash: string | null;
          user_agent: string | null;
          voted_at: string;
        };
        Insert: {
          id?: string;
          artwork_id: string;
          contest_id: string;
          user_id?: string | null;
          user_identifier: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          voted_at?: string;
        };
        Update: {
          id?: string;
          artwork_id?: string;
          contest_id?: string;
          user_id?: string | null;
          user_identifier?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          voted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_artwork_id_fkey";
            columns: ["artwork_id"];
            isOneToOne: false;
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "contests";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "admin" | "moderator" | "editor";
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: "admin" | "moderator" | "editor";
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: "admin" | "moderator" | "editor";
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          changes: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_user_id_fkey";
            columns: ["admin_user_id"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          icon: string | null;
          post_count: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          post_count?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          post_count?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          post_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          post_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: Json;
          featured_image_url: string | null;
          featured_image_alt: string | null;
          category_id: string | null;
          author_id: string | null;
          contest_id: string | null;
          status: "draft" | "published" | "scheduled" | "archived";
          published_at: string | null;
          scheduled_for: string | null;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          og_title: string | null;
          og_description: string | null;
          has_faq: boolean;
          faq_schema: Json | null;
          view_count: number;
          read_time_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: Json;
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          contest_id?: string | null;
          status?: "draft" | "published" | "scheduled" | "archived";
          published_at?: string | null;
          scheduled_for?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          has_faq?: boolean;
          faq_schema?: Json | null;
          view_count?: number;
          read_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: Json;
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          contest_id?: string | null;
          status?: "draft" | "published" | "scheduled" | "archived";
          published_at?: string | null;
          scheduled_for?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          has_faq?: boolean;
          faq_schema?: Json | null;
          view_count?: number;
          read_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_posts_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "contests";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "blog_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "blog_tags";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_media: {
        Row: {
          id: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          public_url: string;
          mime_type: string;
          file_size: number;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          caption: string | null;
          uploaded_by: string | null;
          folder: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          public_url: string;
          mime_type: string;
          file_size: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by?: string | null;
          folder?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          original_filename?: string;
          storage_path?: string;
          public_url?: string;
          mime_type?: string;
          file_size?: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by?: string | null;
          folder?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_media_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_post_revisions: {
        Row: {
          id: string;
          post_id: string;
          title: string;
          content: Json;
          excerpt: string | null;
          revised_by: string | null;
          revision_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          title: string;
          content: Json;
          excerpt?: string | null;
          revised_by?: string | null;
          revision_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          title?: string;
          content?: Json;
          excerpt?: string | null;
          revised_by?: string | null;
          revision_note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_post_revisions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "blog_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_post_revisions_revised_by_fkey";
            columns: ["revised_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_active_contest: {
        Args: Record<string, never>;
        Returns: {
          contest_id: string;
          week_number: number;
          start_date: string;
          end_date: string;
          time_remaining: string; // PostgreSQL interval type
        }[];
      };
      can_user_vote_today: {
        Args: {
          p_contest_id: string;
          p_user_identifier: string;
        };
        Returns: boolean;
      };
      record_vote: {
        Args: {
          p_artwork_id: string;
          p_contest_id: string;
          p_user_identifier: string;
        };
        Returns: boolean;
      };
      get_contest_leaderboard: {
        Args: {
          p_contest_id: string;
        };
        Returns: {
          artwork_id: string;
          title: string;
          image_url: string;
          vote_count: number;
          position: number;
        }[];
      };
      archive_contest: {
        Args: {
          p_contest_id: string;
        };
        Returns: void;
      };
      can_vote: {
        Args: {
          p_artwork_id: string;
          p_user_id: string;
          p_contest_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      contest_status: "draft" | "active" | "ended" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/**
 * Type helpers for easier access
 */
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;

/**
 * Convenient type aliases for direct table access
 */
export type ContestRow = Database["public"]["Tables"]["contests"]["Row"];
export type ContestInsert = Database["public"]["Tables"]["contests"]["Insert"];
export type ContestUpdate = Database["public"]["Tables"]["contests"]["Update"];

export type ArtworkRow = Database["public"]["Tables"]["artworks"]["Row"];
export type ArtworkInsert = Database["public"]["Tables"]["artworks"]["Insert"];
export type ArtworkUpdate = Database["public"]["Tables"]["artworks"]["Update"];

export type VoteRow = Database["public"]["Tables"]["votes"]["Row"];
export type VoteInsert = Database["public"]["Tables"]["votes"]["Insert"];
export type VoteUpdate = Database["public"]["Tables"]["votes"]["Update"];

export type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
export type AdminUserInsert = Database["public"]["Tables"]["admin_users"]["Insert"];
export type AdminUserUpdate = Database["public"]["Tables"]["admin_users"]["Update"];

export type BlogCategoryRow = Database["public"]["Tables"]["blog_categories"]["Row"];
export type BlogCategoryInsert = Database["public"]["Tables"]["blog_categories"]["Insert"];
export type BlogCategoryUpdate = Database["public"]["Tables"]["blog_categories"]["Update"];

export type BlogTagRow = Database["public"]["Tables"]["blog_tags"]["Row"];
export type BlogTagInsert = Database["public"]["Tables"]["blog_tags"]["Insert"];
export type BlogTagUpdate = Database["public"]["Tables"]["blog_tags"]["Update"];

export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
export type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];
export type BlogPostUpdate = Database["public"]["Tables"]["blog_posts"]["Update"];

export type BlogPostTagRow = Database["public"]["Tables"]["blog_post_tags"]["Row"];
export type BlogPostTagInsert = Database["public"]["Tables"]["blog_post_tags"]["Insert"];

export type BlogMediaRow = Database["public"]["Tables"]["blog_media"]["Row"];
export type BlogMediaInsert = Database["public"]["Tables"]["blog_media"]["Insert"];
export type BlogMediaUpdate = Database["public"]["Tables"]["blog_media"]["Update"];

export type BlogPostRevisionRow = Database["public"]["Tables"]["blog_post_revisions"]["Row"];
export type BlogPostRevisionInsert = Database["public"]["Tables"]["blog_post_revisions"]["Insert"];

/**
 * Function return types
 */
export type ActiveContestResult =
  Database["public"]["Functions"]["get_active_contest"]["Returns"][0];

export type LeaderboardEntry =
  Database["public"]["Functions"]["get_contest_leaderboard"]["Returns"][0];

/**
 * Blog-specific types
 */
export type BlogPostStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogPostWithRelations extends BlogPostRow {
  category?: BlogCategoryRow | null;
  author?: AdminUserRow | null;
  tags?: BlogTagRow[];
  contest?: ContestRow | null;
}
