export type Subject = "english" | "maths" | "vocabulary" | "writing" | "mock-test";

/**
 * Widened subject_type enum after migration 004 (ALI Decision 5). lesson_progress.subject
 * in practice still only ever uses the original 5-value `Subject` subset above — this wider
 * type exists because ali_question_bank.subject can also hold the 4 reasoning values.
 */
export type AliSubjectEnum = Subject
  | "verbal-reasoning"
  | "non-verbal-reasoning"
  | "spatial-reasoning"
  | "numerical-reasoning";

export type ContentDifficultyEnum = "easy" | "medium" | "hard" | "challenge";

/** Migration 010 (WP-16) — the first-ever DB representation of the Evidence Confidence Model (types/ali/confidence.ts, AEP-005 §6). */
export type EvidenceConfidenceTierEnum = "high" | "moderate" | "low" | "insufficient";
/** Migration 010 (WP-16) — matches types/ali/audit.ts's ConclusionType exactly. */
export type ConclusionTypeEnum = "mastery" | "durable-mastery" | "recommendation" | "readiness-dimension";
/** Migration 010 (WP-16) — matches types/ali/audit.ts's SupersedeReason exactly. */
export type SupersedeReasonEnum = "new-evidence" | "defect-correction" | "programme-decision";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          device_id: string;
          name: string;
          auth_user_id: string | null;
          is_admin: boolean;
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
          // is_admin deliberately omitted — migration 008 revokes UPDATE
          // privilege on this column for authenticated/anon roles at the
          // database level, so it is never a valid client-side write.
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
      ali_question_bank: {
        Row: {
          id: string;
          subject: AliSubjectEnum;
          skill: string;
          pathway: string[];
          content_difficulty: ContentDifficultyEnum;
          question_type: string;
          estimated_time_seconds: number;
          prompt: unknown;
          explanation: string;
          hint: string | null;
          confidence_weight: number;
          learning_objective: string | null;
          revision_priority: number;
          mastery_threshold: number;
          usage_count: number;
          avg_success_rate: number | null;
          learning_unit_id: string;
          /** Optional — AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §4. Never NOT NULL by design. */
          addresses_misconception: string | null;
          /** Optional — AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §7. Never NOT NULL by design. */
          transfer_links: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          subject: AliSubjectEnum;
          skill: string;
          pathway: string[];
          content_difficulty: ContentDifficultyEnum;
          question_type?: string;
          estimated_time_seconds?: number;
          prompt: unknown;
          explanation: string;
          hint?: string | null;
          confidence_weight?: number;
          learning_objective?: string | null;
          revision_priority?: number;
          mastery_threshold: number;
          usage_count?: number;
          avg_success_rate?: number | null;
          learning_unit_id: string;
          addresses_misconception?: string | null;
          transfer_links?: string[] | null;
          created_at?: string;
        };
        Update: {
          usage_count?: number;
          avg_success_rate?: number | null;
        };
        Relationships: [];
      };
      ali_mastery_defaults: {
        Row: {
          content_difficulty: ContentDifficultyEnum;
          default_threshold: number;
        };
        Insert: {
          content_difficulty: ContentDifficultyEnum;
          default_threshold: number;
        };
        Update: {
          default_threshold?: number;
        };
        Relationships: [];
      };
      ali_student_adaptive_state: {
        Row: {
          profile_id: string;
          questions_presented_count: number;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          questions_presented_count?: number;
          updated_at?: string;
        };
        Update: {
          questions_presented_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      ali_student_question_history: {
        Row: {
          id: string;
          profile_id: string;
          question_id: string;
          source: string;
          times_seen: number;
          times_correct: number;
          distinct_correct_sessions: number;
          last_correct_session_id: string | null;
          last_presented_at: string;
          last_presented_at_sequence: number;
          last_attempt_correct: boolean | null;
          second_last_attempt_correct: boolean | null;
          mastery_state: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          question_id: string;
          source?: string;
          times_seen?: number;
          times_correct?: number;
          distinct_correct_sessions?: number;
          last_correct_session_id?: string | null;
          last_presented_at?: string;
          last_presented_at_sequence: number;
          last_attempt_correct?: boolean | null;
          second_last_attempt_correct?: boolean | null;
          mastery_state?: string;
          updated_at?: string;
        };
        Update: {
          times_seen?: number;
          times_correct?: number;
          distinct_correct_sessions?: number;
          last_correct_session_id?: string | null;
          last_presented_at?: string;
          last_presented_at_sequence?: number;
          last_attempt_correct?: boolean | null;
          second_last_attempt_correct?: boolean | null;
          mastery_state?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // ─── Migration 010 (WP-16, IWP-002) — Persistence Layer ───────────────
      ali_durable_mastery: {
        Row: {
          profile_id: string;
          competency_code: string;
          validated: boolean;
          maintenance_reviews: unknown; // jsonb — MaintenanceReviewRecord[] (types/ali/durableMastery.ts)
          transfer_corroboration: unknown; // jsonb — TransferCorroboration (types/ali/durableMastery.ts)
          durable: boolean;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          competency_code: string;
          validated?: boolean;
          maintenance_reviews?: unknown;
          transfer_corroboration?: unknown;
          durable?: boolean;
          updated_at?: string;
        };
        Update: {
          validated?: boolean;
          maintenance_reviews?: unknown;
          transfer_corroboration?: unknown;
          durable?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ali_educational_audit: {
        Row: {
          id: string;
          conclusion_type: ConclusionTypeEnum;
          learner_id: string;
          competency_or_dimension: string;
          confidence_tier_at_time: EvidenceConfidenceTierEnum;
          concluded_at: string;
          superseded_by: string | null;
          supersede_reason: SupersedeReasonEnum | null;
        };
        Insert: {
          id?: string;
          conclusion_type: ConclusionTypeEnum;
          learner_id: string;
          competency_or_dimension: string;
          confidence_tier_at_time: EvidenceConfidenceTierEnum;
          concluded_at?: string;
          superseded_by?: string | null;
          supersede_reason?: SupersedeReasonEnum | null;
        };
        Update: {
          // Append-only by convention (APD-029) — the only legitimate update
          // is setting supersededBy/supersede_reason on a record once, never
          // mutating any other field.
          superseded_by?: string | null;
          supersede_reason?: SupersedeReasonEnum | null;
        };
        Relationships: [];
      };
      ali_operational_events: {
        Row: {
          id: string;
          event_type: string;
          learner_id: string;
          competency_code: string;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          learner_id: string;
          competency_code: string;
          occurred_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      ali_operational_event_aggregates: {
        Row: {
          event_type: string;
          competency_code: string;
          time_bucket: string;
          event_count: number;
        };
        Insert: {
          event_type: string;
          competency_code: string;
          time_bucket: string;
          event_count?: number;
        };
        Update: {
          event_count?: number;
        };
        Relationships: [];
      };
      feedback_submissions: {
        Row: {
          id: string;
          profile_id: string | null;
          type: "suggestion" | "positive" | "general";
          subject: string;
          message: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          type: "suggestion" | "positive" | "general";
          subject?: string;
          message: string;
          submitted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      bug_reports: {
        Row: {
          id: string;
          profile_id: string | null;
          page: string;
          issue_type: string;
          description: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          page: string;
          issue_type: string;
          description: string;
          submitted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      feature_requests: {
        Row: {
          id: string;
          profile_id: string | null;
          feature: string;
          why: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          feature: string;
          why: string;
          submitted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      beta_family_applications: {
        Row: {
          id: string;
          profile_id: string | null;
          parent_name: string;
          year_group: string;
          pathway: string;
          email: string;
          contact_permission: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          parent_name: string;
          year_group: string;
          pathway: string;
          email: string;
          contact_permission?: boolean;
          submitted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          profile_id: string | null;
          parent_name: string;
          year_group: string;
          feedback: string;
          publish_permission: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          parent_name: string;
          year_group: string;
          feedback: string;
          publish_permission?: boolean;
          submitted_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_current_user_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      subject_type: AliSubjectEnum;
      content_difficulty: ContentDifficultyEnum;
      evidence_confidence_tier: EvidenceConfidenceTierEnum;
      conclusion_type: ConclusionTypeEnum;
      supersede_reason: SupersedeReasonEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}
