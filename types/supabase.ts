export type Subject = "english" | "maths" | "vocabulary" | "writing" | "mock-test";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          device_id: string;
          name: string;
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          name?: string;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          auth_user_id?: string | null;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          id: string;
          profile_id: string;
          total_xp: number;
          streak: number;
          last_activity: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          total_xp?: number;
          streak?: number;
          last_activity?: string;
          updated_at?: string;
        };
        Update: {
          total_xp?: number;
          streak?: number;
          last_activity?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          id: string;
          profile_id: string;
          lesson_id: string;
          subject: Subject;
          score: number;
          xp_gained: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          lesson_id: string;
          subject: Subject;
          score: number;
          xp_gained: number;
          completed_at?: string;
        };
        Update: {
          score?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subject_type: Subject;
    };
    CompositeTypes: Record<string, never>;
  };
}
