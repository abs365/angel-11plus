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

/** Migration 030 — Content Scale Gate minimum lifecycle fields. Governance model: RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md. Not enforced on Practice (existing 46 rows predate this field and are not retroactively promoted); enforced on Mock (only "mock_eligible" rows are selectable there — see lib/ali/questionBank.ts's fetchMockEligibleQuestionBank). */
export type ContentEligibilityStatus =
  | "provisional"
  | "practice_eligible"
  | "authentic_assessment_candidate"
  | "independently_validated"
  | "mock_eligible";

/** Migration 030 — Content Scale Gate provenance field (ANGEL_CONTENT_SCALE_GATE_V1.md §1). */
export type ContentProvenance =
  | "angel_original"
  | "generated_original"
  | "licensed"
  | "public_domain"
  | "authorised_import"
  | "evidence_only";

/** Migration 010 (WP-16) — the first-ever DB representation of the Evidence Confidence Model (types/ali/confidence.ts, AEP-005 §6). */
export type EvidenceConfidenceTierEnum = "high" | "moderate" | "low" | "insufficient";
/** Migration 010 (WP-16), extended by migration 011 (WP-21A) — matches types/ali/audit.ts's ConclusionType exactly. */
export type ConclusionTypeEnum = "mastery" | "durable-mastery" | "recommendation" | "readiness-dimension" | "wellbeing-veto";
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
          // Active Pathway Context (migration 026) — mirrors lib/progress.ts's
          // client-side selectedPathwayId. Nullable: migration not yet applied,
          // or no pathway chosen yet.
          selected_pathway_id: string | null;
          pathway_selected_at: string | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          name?: string;
          auth_user_id?: string | null;
          created_at?: string;
          selected_pathway_id?: string | null;
          pathway_selected_at?: string | null;
        };
        Update: {
          name?: string;
          auth_user_id?: string | null;
          // is_admin deliberately omitted — migration 008 revokes UPDATE
          // privilege on this column for authenticated/anon roles at the
          // database level, so it is never a valid client-side write.
          selected_pathway_id?: string | null;
          pathway_selected_at?: string | null;
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
          /** Migration 030. Null on every row that predates it — unknown history, not guessed. */
          family_id: string | null;
          /** Migration 030. Null on every row that predates it. */
          provenance: ContentProvenance | null;
          /** Migration 030. Defaults to "provisional" for pre-existing rows — describes their real, already-documented status, not a promotion. */
          eligibility_status: ContentEligibilityStatus;
          content_version: number;
          active: boolean;
          /** Migration 035. Null on any row not yet classified. */
          transfer_class: "ROUTINE" | "NEAR_TRANSFER" | "FAR_TRANSFER" | "MIXED_TRANSFER" | null;
          /** Migration 035. Competency codes supporting (not primary to) this item. */
          supporting_competencies: string[] | null;
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
          family_id?: string | null;
          provenance?: ContentProvenance | null;
          eligibility_status?: ContentEligibilityStatus;
          content_version?: number;
          active?: boolean;
          transfer_class?: "ROUTINE" | "NEAR_TRANSFER" | "FAR_TRANSFER" | "MIXED_TRANSFER" | null;
          supporting_competencies?: string[] | null;
        };
        Update: {
          usage_count?: number;
          avg_success_rate?: number | null;
        };
        Relationships: [];
      };
      // Educational Increment 007E, Part 9 — added so the admin Educational
      // Review interface (app/admin-beta/review) can be properly typed.
      // These tables existed since migrations 034/043 but were never
      // queried from application code before 007E (only from migration
      // scripts, which are not type-checked), so they were never added
      // here. Matches migrations 034/037/043/045/047 exactly.
      ali_family_review: {
        Row: {
          id: string;
          family_id: string;
          reviewer: string;
          review_date: string;
          educational_validity: boolean | null;
          competency_validity: boolean | null;
          wording_quality: boolean | null;
          age_appropriate: boolean | null;
          ambiguity_free: boolean | null;
          difficulty_appropriate: boolean | null;
          misconception_quality: boolean | null;
          explanation_quality: boolean | null;
          variation_boundaries_sound: boolean | null;
          authenticity_confirmed: boolean | null;
          provenance_reference: string | null;
          evidence_reference: string | null;
          decision: "approved" | "approved_with_amendment" | "rejected" | "requires_revalidation" | "pending_independent_review";
          notes: string | null;
          created_at: string;
          /** Migration 047. */
          review_target_type: "question_family" | "passage";
          question_type_alignment: boolean | null;
          answer_correctness_verified: boolean | null;
          transfer_validity: boolean | null;
          teaching_quality: boolean | null;
          exam_strategy_quality: boolean | null;
          validation_behaviour_sound: boolean | null;
          originality_confirmed: boolean | null;
          copyright_risk_clear: boolean | null;
          /** Migration 059, extended migration 060. */
          review_type: "content_review" | "maths_teaching_review" | "english_teaching_review";
          teaching_content_version: string | null;
          teaching_mathematically_correct: boolean | null;
          teaching_model_understandable: boolean | null;
          teaching_model_teaches_method: boolean | null;
          teaching_guided_practice_balanced: boolean | null;
          teaching_support_reduced_appropriately: boolean | null;
          teaching_remediation_useful: boolean | null;
          teaching_language_age_appropriate: boolean | null;
          teaching_relevant_to_skill: boolean | null;
          teaching_example_avoids_answer_leakage: boolean | null;
          teaching_conceptual_explanation_sufficient: boolean | null;
          teaching_independent_expectation_appropriate: boolean | null;
          teaching_clear_and_unambiguous: boolean | null;
        };
        Insert: {
          id?: string;
          family_id: string;
          reviewer: string;
          review_date?: string;
          educational_validity?: boolean | null;
          competency_validity?: boolean | null;
          wording_quality?: boolean | null;
          age_appropriate?: boolean | null;
          ambiguity_free?: boolean | null;
          difficulty_appropriate?: boolean | null;
          misconception_quality?: boolean | null;
          explanation_quality?: boolean | null;
          variation_boundaries_sound?: boolean | null;
          authenticity_confirmed?: boolean | null;
          provenance_reference?: string | null;
          evidence_reference?: string | null;
          decision: "approved" | "approved_with_amendment" | "rejected" | "requires_revalidation" | "pending_independent_review";
          notes?: string | null;
          created_at?: string;
          review_target_type?: "question_family" | "passage";
          question_type_alignment?: boolean | null;
          answer_correctness_verified?: boolean | null;
          transfer_validity?: boolean | null;
          teaching_quality?: boolean | null;
          exam_strategy_quality?: boolean | null;
          validation_behaviour_sound?: boolean | null;
          originality_confirmed?: boolean | null;
          copyright_risk_clear?: boolean | null;
          /** Migration 059, extended migration 060. */
          review_type?: "content_review" | "maths_teaching_review" | "english_teaching_review";
          teaching_content_version?: string | null;
          teaching_mathematically_correct?: boolean | null;
          teaching_model_understandable?: boolean | null;
          teaching_model_teaches_method?: boolean | null;
          teaching_guided_practice_balanced?: boolean | null;
          teaching_support_reduced_appropriately?: boolean | null;
          teaching_remediation_useful?: boolean | null;
          teaching_language_age_appropriate?: boolean | null;
          teaching_relevant_to_skill?: boolean | null;
          teaching_example_avoids_answer_leakage?: boolean | null;
          teaching_conceptual_explanation_sufficient?: boolean | null;
          teaching_independent_expectation_appropriate?: boolean | null;
          teaching_clear_and_unambiguous?: boolean | null;
        };
        Update: {
          decision?: "approved" | "approved_with_amendment" | "rejected" | "requires_revalidation" | "pending_independent_review";
          notes?: string | null;
        };
        Relationships: [];
      };
      ali_passage_bank: {
        Row: {
          id: string;
          title: string;
          original_text: string;
          text_type: string;
          genre: string;
          word_count: number;
          reading_complexity: string;
          provenance: ContentProvenance;
          copyright_status: string;
          pathway: string[];
          content_difficulty: ContentDifficultyEnum;
          content_version: number;
          eligibility_status: ContentEligibilityStatus;
          active: boolean;
          passage_family_id: string | null;
          review_state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          original_text: string;
          text_type: string;
          genre: string;
          word_count: number;
          reading_complexity: string;
          provenance: ContentProvenance;
          copyright_status: string;
          pathway: string[];
          content_difficulty: ContentDifficultyEnum;
          content_version?: number;
          eligibility_status?: ContentEligibilityStatus;
          active?: boolean;
          passage_family_id?: string | null;
          review_state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          eligibility_status?: ContentEligibilityStatus;
          active?: boolean;
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
          // Migration 015 (Phase 2B, Evidence Capture Layer) — directly
          // observable per-attempt facts, most-recent-attempt only, same
          // shape convention as last_attempt_correct. All optional.
          last_attempt_time_seconds: number | null;
          last_attempt_skipped: boolean | null;
          last_attempt_answer_changed: boolean | null;
          last_attempt_first_answer: string | null;
          last_attempt_final_answer: string | null;
          last_attempt_confidence_rating: number | null;
          last_attempt_working_shown: boolean | null;
          // Migration 024 (Mathematics Reference Vertical Remediation Gate)
          first_source: string | null;
          last_attempt_support_tier: string | null;
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
          last_attempt_time_seconds?: number | null;
          last_attempt_skipped?: boolean | null;
          last_attempt_answer_changed?: boolean | null;
          last_attempt_first_answer?: string | null;
          last_attempt_final_answer?: string | null;
          last_attempt_confidence_rating?: number | null;
          last_attempt_working_shown?: boolean | null;
          first_source?: string | null;
          last_attempt_support_tier?: string | null;
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
          last_attempt_time_seconds?: number | null;
          last_attempt_skipped?: boolean | null;
          last_attempt_answer_changed?: boolean | null;
          last_attempt_first_answer?: string | null;
          last_attempt_final_answer?: string | null;
          last_attempt_confidence_rating?: number | null;
          last_attempt_working_shown?: boolean | null;
          first_source?: string | null;
          last_attempt_support_tier?: string | null;
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
      ali_family_focus_selection: {
        Row: {
          profile_id: string;
          competency_code: string;
          source: string;
          active: boolean;
          selected_at: string;
          removed_at: string | null;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          competency_code: string;
          source?: string;
          active?: boolean;
          selected_at?: string;
          removed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          competency_code?: string;
          source?: string;
          active?: boolean;
          selected_at?: string;
          removed_at?: string | null;
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
          // Migration 015 — what was concluded, for conclusion_types (e.g.
          // 'readiness-dimension') where confidence_tier_at_time alone
          // doesn't capture the value reached (e.g. a ReadinessBand).
          conclusion_value: string | null;
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
          conclusion_value?: string | null;
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
      claim_legacy_profile: {
        Args: { p_device_id: string };
        Returns: string | null;
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
