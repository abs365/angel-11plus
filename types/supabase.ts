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
          /** Migration 093. NULL (every existing row) means a standalone, atomic numbered question. See ali_question_bank.question_group_id's own column comment. */
          question_group_id: string | null;
          /** Migration 093. 1-based position within a question_group_id group. NULL for a standalone item. */
          group_order: number | null;
          /** Migration 093. Free-text label (e.g. "(a)", "6(b)-i"). NULL for a standalone item. */
          subpart_label: string | null;
          /** Migration 093. "deterministic" | "structured_acceptable_response" | "criterion_rubric". NULL is a deliberate non-claim, not "deterministic". */
          marking_mode: "deterministic" | "structured_acceptable_response" | "criterion_rubric" | null;
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
          question_group_id?: string | null;
          group_order?: number | null;
          subpart_label?: string | null;
          marking_mode?: "deterministic" | "structured_acceptable_response" | "criterion_rubric" | null;
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
          review_target_type: "question_family" | "passage" | "writing_prompt";
          question_type_alignment: boolean | null;
          answer_correctness_verified: boolean | null;
          transfer_validity: boolean | null;
          teaching_quality: boolean | null;
          exam_strategy_quality: boolean | null;
          validation_behaviour_sound: boolean | null;
          originality_confirmed: boolean | null;
          copyright_risk_clear: boolean | null;
          /** Migration 059, extended migration 060/061/087. */
          review_type: "content_review" | "maths_teaching_review" | "english_teaching_review" | "writing_teaching_review" | "mock_maths_independent_review" | "mock_english_passage_independent_review" | "mock_writing_prompt_independent_review";
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
          review_target_type?: "question_family" | "passage" | "writing_prompt";
          question_type_alignment?: boolean | null;
          answer_correctness_verified?: boolean | null;
          transfer_validity?: boolean | null;
          teaching_quality?: boolean | null;
          exam_strategy_quality?: boolean | null;
          validation_behaviour_sound?: boolean | null;
          originality_confirmed?: boolean | null;
          copyright_risk_clear?: boolean | null;
          /** Migration 059, extended migration 060. */
          review_type?: "content_review" | "maths_teaching_review" | "english_teaching_review" | "writing_teaching_review" | "mock_maths_independent_review" | "mock_english_passage_independent_review" | "mock_writing_prompt_independent_review";
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
          // Migration 076 (Stage 2 Educational Integrity Correction)
          last_attempt_verified: boolean | null;
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
          last_attempt_verified?: boolean | null;
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
          last_attempt_verified?: boolean | null;
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
      // Decision 220 (Mathematics Mock 1 report-release and
      // discoverability increment) — supabase/migrations/070_mock_
      // attempt_engine.sql's own table, declared here for the first time
      // so lib/mockAttempt/client.ts's new getSubmittedMockAttempts() can
      // read it directly via `.from()`, matching ali_mock_attempt_
      // answer's own established precedent exactly: an attempt's own id/
      // form_id/status/submitted_at is not sensitive/protected content
      // (question_manifest/assigned_question_ids are never selected by
      // that function), and the existing ali_mock_attempt_select_own RLS
      // policy (migration 070) already scopes every read to the caller's
      // own attempts regardless of status — no new RPC or policy is
      // required. No Insert/Update declared here — every real write
      // already goes exclusively through mock_create_attempt()/
      // mock_create_cycle_attempt()/mock_start_attempt()/
      // mock_submit_attempt() (migrations 070/085), never a direct
      // client write.
      ali_mock_attempt: {
        Row: {
          id: string;
          profile_id: string;
          form_id: string;
          attempt_type: string;
          status: string;
          assigned_question_ids: string[];
          current_section: string | null;
          started_at: string | null;
          submitted_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      // Programme Increment 008E/008F — supabase/migrations/072_mock_
      // lifecycle_and_reporting_foundation.sql (table) and 074_mock_
      // scoring_and_report_release.sql (marking_version/released_at
      // columns). Not yet applied to production; declared here so
      // lib/mockAttempt/client.ts can read a released report via a
      // direct, RLS-gated `.from()` select — deliberately, not through a
      // new SECURITY DEFINER function, since migration 072's own RLS
      // policy (report_release_state = 'released' AND real ownership)
      // already implements exactly the right gate; a redundant function
      // would only add a second place that same gate could be
      // implemented incorrectly. No Insert/Update — every row is created
      // by migration 072's own trigger and mutated only by
      // mock_score_attempt()/mock_release_report() (074), never a
      // direct client write.
      ali_mock_attempt_report: {
        Row: {
          attempt_id: string;
          scoring_state: string;
          analysis_state: string;
          report_release_state: string;
          marking_version: number | null;
          released_at: string | null;
          // Decision 223 (Mathematics Mock 1 Deterministic Mock Analysis
          // Engine, migration 151) — additive, nullable, mirroring
          // marking_version/released_at's own existing pattern exactly.
          analysis_version: number | null;
          analysed_at: string | null;
          skill_evidence: Record<string, unknown> | null;
          overall: Record<string, unknown> | null;
          subject_breakdown: unknown[] | null;
          question_outcomes: unknown[] | null;
          competency_evidence: unknown[] | null;
          strengths: unknown[] | null;
          weaknesses: unknown[] | null;
          timing_evidence: Record<string, unknown> | null;
          practice_comparison: unknown | null;
          parent_explanation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      // Decision 217 (Mathematics Mock 1 attempt-resume remediation) —
      // supabase/migrations/070_mock_attempt_engine.sql's own table,
      // declared here for the first time so lib/mockAttempt/client.ts's
      // new getMockAttemptAnswers() can read it directly via `.from()`,
      // matching ali_mock_attempt_report's own established precedent: a
      // learner's own submitted response text is not sensitive/protected
      // content the way ali_question_bank's answer/explanation fields
      // are (it is literally the learner's own input), and the existing
      // ali_mock_attempt_answer_select_own RLS policy (migration 070)
      // already scopes every read to the caller's own attempts — no new
      // RPC or policy is required. No Insert/Update declared here — every
      // real write already goes exclusively through mock_submit_answer()
      // (migration 070), never a direct client write.
      ali_mock_attempt_answer: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          response: Record<string, unknown>;
          answered_at: string;
        };
        Insert: Record<string, never>;
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
      // Programme Increment 008D — supabase/migrations/070_mock_attempt_engine.sql.
      // Not yet applied to production; declared here so lib/mockAttempt/client.ts
      // can call these through the typed supabase.rpc() the same way every
      // other RPC in this codebase already does.
      mock_create_attempt: {
        Args: { p_form_id: string; p_attempt_type: string };
        Returns: string;
      };
      mock_start_attempt: {
        Args: { p_attempt_id: string; p_duration_minutes?: number };
        Returns: { status: string; started_at: string; expires_at: string }[];
      };
      mock_get_question: {
        Args: { p_attempt_id: string; p_question_id: string };
        Returns: Record<string, unknown>;
      };
      mock_submit_answer: {
        Args: { p_attempt_id: string; p_question_id: string; p_response: Record<string, unknown> };
        Returns: undefined;
      };
      mock_submit_attempt: {
        Args: { p_attempt_id: string };
        Returns: { status: string; submitted_at: string }[];
      };
      // Programme Increment 008E — supabase/migrations/072_mock_lifecycle_
      // and_reporting_foundation.sql. Not yet applied to production;
      // declared here so lib/mockAttempt/client.ts can call these through
      // the typed supabase.rpc() the same way every other RPC already does.
      mock_get_active_form: {
        Args: { p_attempt_type: string };
        Returns: { form_id: string; attempt_type: string }[];
      };
      mock_get_attempt_manifest: {
        Args: { p_attempt_id: string };
        Returns: string[];
      };
      mock_set_flag: {
        Args: { p_attempt_id: string; p_question_id: string; p_flagged: boolean };
        Returns: undefined;
      };
      // Programme Increment 008F — supabase/migrations/074_mock_scoring_
      // and_report_release.sql. Not yet applied to production.
      // mock_score_attempt is declared here for completeness/typechecking
      // against the real schema only — after the Founder pre-application
      // architecture review, it has NO execute grant to authenticated or
      // anon at all (only its own owning role, via the report-init
      // trigger's own internal call), so no lib/mockAttempt/client.ts
      // wrapper calls it; a client-side call would always fail. Declared
      // here, not removed, because the function genuinely exists in the
      // schema.
      mock_score_attempt: {
        Args: { p_attempt_id: string };
        Returns: undefined;
      };
      // mock_release_report, unlike the above, IS meant to be called by
      // client code (an admin session) — declared here so lib/
      // mockAttempt/client.ts can call it through the typed
      // supabase.rpc() the same way every other RPC already does.
      mock_release_report: {
        Args: { p_attempt_id: string };
        Returns: undefined;
      };
      // Mock Governance Architecture Increment 001 (Decision 135) —
      // supabase/migrations/085_mock_cycle_governance_architecture.sql,
      // corrected by migration 086 (Decision 136). Applied to production
      // and Founder-verified (Decision 137).
      mock_start_new_cycle: {
        Args: Record<string, never>;
        Returns: string;
      };
      mock_authorise_extra_cycle: {
        Args: Record<string, never>;
        Returns: string;
      };
      mock_create_cycle_attempt: {
        Args: { p_form_id: string; p_cycle_id: string };
        Returns: string;
      };
      // Mathematics First Mock Form-Assembly Gate (Decision 161) —
      // supabase/migrations/106_mock_mathematics_grouped_question_
      // learner_rendering.sql and 107_mock_full_mock_cycle_attempt_
      // learner_compatibility.sql. Not yet applied to production;
      // declared here so lib/mockAttempt/client.ts can call these
      // through the typed supabase.rpc() the same way every other RPC
      // already does.
      mock_get_attempt_grouping: {
        Args: { p_attempt_id: string };
        Returns: { questionId: string; questionGroupId: string | null; groupOrder: number | null; subpartLabel: string | null }[];
      };
      mock_get_open_cycle: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      // Decision 217 (Mathematics Mock 1 attempt-resume remediation) —
      // supabase/migrations/149_mock_attempt_resume_lookup.sql. Not yet
      // applied to production; declared here so lib/mockAttempt/client.ts
      // can call it through the typed supabase.rpc() the same way every
      // other RPC already does.
      mock_get_resumable_attempt: {
        Args: { p_form_id: string };
        Returns: { attempt_id: string; status: string; started_at: string | null; expires_at: string | null; is_expired: boolean }[];
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
