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
          week_number: number;
          start_date: string;
          end_date: string;
          status: "active" | "archived";
          winner_artwork_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week_number: number;
          start_date: string;
          end_date: string;
          status?: "active" | "archived";
          winner_artwork_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week_number?: number;
          start_date?: string;
          end_date?: string;
          status?: "active" | "archived";
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
          user_identifier: string;
          voted_at: string;
        };
        Insert: {
          id?: string;
          artwork_id: string;
          contest_id: string;
          user_identifier: string;
          voted_at?: string;
        };
        Update: {
          id?: string;
          artwork_id?: string;
          contest_id?: string;
          user_identifier?: string;
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
    };
    Enums: {
      contest_status: "active" | "archived";
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

/**
 * Function return types
 */
export type ActiveContestResult =
  Database["public"]["Functions"]["get_active_contest"]["Returns"][0];

export type LeaderboardEntry =
  Database["public"]["Functions"]["get_contest_leaderboard"]["Returns"][0];
