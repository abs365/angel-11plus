import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AttemptEvidenceFacts, MasteryState, StudentQuestionHistoryRow } from "@/types/ali/history";
import { applyAttemptOutcome } from "./mastery";

type HistoryRow = Database["public"]["Tables"]["ali_student_question_history"]["Row"];

function rowToHistory(row: HistoryRow): StudentQuestionHistoryRow {
  return {
    profileId: row.profile_id,
    questionId: row.question_id,
    source: row.source,
    timesSeen: row.times_seen,
    timesCorrect: row.times_correct,
    distinctCorrectSessions: row.distinct_correct_sessions,
    lastCorrectSessionId: row.last_correct_session_id,
    lastPresentedAt: row.last_presented_at,
    lastPresentedAtSequence: row.last_presented_at_sequence,
    lastAttemptCorrect: row.last_attempt_correct,
    secondLastAttemptCorrect: row.second_last_attempt_correct,
    masteryState: row.mastery_state as MasteryState,
    lastAttemptTimeSeconds: row.last_attempt_time_seconds,
    lastAttemptSkipped: row.last_attempt_skipped,
    lastAttemptAnswerChanged: row.last_attempt_answer_changed,
    lastAttemptFirstAnswer: row.last_attempt_first_answer,
    lastAttemptFinalAnswer: row.last_attempt_final_answer,
    lastAttemptConfidenceRating: row.last_attempt_confidence_rating,
    lastAttemptWorkingShown: row.last_attempt_working_shown,
    firstSource: row.first_source,
    lastAttemptSupportTier: row.last_attempt_support_tier,
    lastAttemptVerified: row.last_attempt_verified ?? null,
  };
}

/** Ensures ali_student_adaptive_state exists for this profile, returns the current counter. */
export async function ensureAdaptiveState(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("ali_student_adaptive_state")
    .select("questions_presented_count")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.warn("[ALI] ensureAdaptiveState select failed:", error.message);
    return 0;
  }
  if (data) return data.questions_presented_count;

  const { error: insertError } = await supabase
    .from("ali_student_adaptive_state")
    .insert({ profile_id: profileId, questions_presented_count: 0 });
  if (insertError) {
    console.warn("[ALI] ensureAdaptiveState insert failed:", insertError.message);
  }
  return 0;
}

/** Fetches all ALI history rows for a profile, keyed by question_id. */
export async function fetchStudentHistory(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<Map<string, StudentQuestionHistoryRow>> {
  const { data, error } = await supabase
    .from("ali_student_question_history")
    .select("*")
    .eq("profile_id", profileId);

  const map = new Map<string, StudentQuestionHistoryRow>();
  if (error || !data) {
    console.warn("[ALI] fetchStudentHistory failed:", error?.message);
    return map;
  }
  for (const row of data) {
    map.set(row.question_id, rowToHistory(row));
  }
  return map;
}

/**
 * Records that `questionIds` were presented to `profileId` in a new mock.
 * Called at mock start (not completion) so an abandoned mock still counts
 * as recently seen for cooldown purposes (ADAPTIVE_ASSESSMENT_ENGINE_
 * IMPLEMENTATION_PLAN.md §2.4). All questions in one mock share a single
 * sequence stamp. Returns the new stamp for use by recordOutcome() calls
 * during this mock (not currently needed there, but returned for callers
 * that want it for logging/testing).
 *
 * `source` defaults to `"adaptive_mock"` — every existing caller's exact
 * prior behaviour is unchanged. Capability 3 Wave 2 (Practice Experience)
 * is the first caller to pass `"practice_experience"`, reusing this
 * function rather than duplicating it, per `ali_student_question_history`'s
 * own design intent (migration 006: `source` is a plain, open string
 * "so new ALI consumers can write here later without a migration").
 */
export async function recordPresentation(
  supabase: SupabaseClient<Database>,
  profileId: string,
  questionIds: string[],
  source: string = "adaptive_mock"
): Promise<number> {
  if (questionIds.length === 0) return ensureAdaptiveState(supabase, profileId);

  const current = await ensureAdaptiveState(supabase, profileId);
  const newStamp = current + questionIds.length;

  const { error: stateError } = await supabase
    .from("ali_student_adaptive_state")
    .update({ questions_presented_count: newStamp })
    .eq("profile_id", profileId);
  if (stateError) {
    console.warn("[ALI] recordPresentation state update failed:", stateError.message);
  }

  const nowIso = new Date().toISOString();
  const { error: historyError } = await supabase.from("ali_student_question_history").upsert(
    questionIds.map((questionId) => ({
      profile_id: profileId,
      question_id: questionId,
      source,
      last_presented_at: nowIso,
      last_presented_at_sequence: newStamp,
    })),
    { onConflict: "profile_id,question_id" }
  );
  if (historyError) {
    console.warn("[ALI] recordPresentation history upsert failed:", historyError.message);
  }

  // Evidence Provenance (migration 024, EVIDENCE_PROVENANCE_REMEDIATION_
  // REPORT.md): write-once first_source, deliberately a separate best-effort
  // call from the upsert above, so a database that has not yet applied
  // migration 024 never blocks the core presentation write every mock/
  // practice/lesson caller depends on.
  await recordFirstSourceIfUnset(supabase, profileId, questionIds, source);

  return newStamp;
}

/**
 * Sets first_source only on rows that don't already have one — the one
 * write-once fact this table did not previously have a place for. A later
 * presentation in a different context (e.g. this Mathematics lesson's
 * dedicated item later drawn into an ordinary Practice session) still
 * correctly overwrites `source` (its designed "most recent context"
 * meaning, migration 006 Decision 8) but can never overwrite `first_source`.
 * Best-effort: a query failure (including migration 024 not yet applied,
 * where the column doesn't exist) is logged and swallowed, never blocking
 * recordPresentation's real, pre-existing evidence write above.
 */
async function recordFirstSourceIfUnset(
  supabase: SupabaseClient<Database>,
  profileId: string,
  questionIds: string[],
  source: string
): Promise<void> {
  const { data, error } = await supabase
    .from("ali_student_question_history")
    .select("question_id, first_source")
    .eq("profile_id", profileId)
    .in("question_id", questionIds);
  if (error || !data) return;

  const unsetIds = data.filter((row) => !row.first_source).map((row) => row.question_id);
  if (unsetIds.length === 0) return;

  const { error: updateError } = await supabase
    .from("ali_student_question_history")
    .update({ first_source: source })
    .eq("profile_id", profileId)
    .in("question_id", unsetIds);
  if (updateError) {
    console.warn("[ALI] recordPresentation first_source write failed:", updateError.message);
  }
}

/**
 * Evidence Capture Layer (migration 015) — pure, no I/O, independently
 * testable. Only includes a DB column key when this call actually
 * supplied that fact, so an omitted fact leaves whatever was previously
 * stored untouched rather than overwriting it with a false null. Never
 * fabricates a value for a fact the caller didn't collect.
 */
export function buildEvidenceUpdateColumns(evidenceFacts?: AttemptEvidenceFacts): Record<string, unknown> {
  const evidenceColumns: Record<string, unknown> = {};
  if (evidenceFacts?.timeTakenSeconds !== undefined) evidenceColumns.last_attempt_time_seconds = evidenceFacts.timeTakenSeconds;
  if (evidenceFacts?.skipped !== undefined) evidenceColumns.last_attempt_skipped = evidenceFacts.skipped;
  if (evidenceFacts?.answerChanged !== undefined) evidenceColumns.last_attempt_answer_changed = evidenceFacts.answerChanged;
  if (evidenceFacts?.firstAnswer !== undefined) evidenceColumns.last_attempt_first_answer = evidenceFacts.firstAnswer;
  if (evidenceFacts?.finalAnswer !== undefined) evidenceColumns.last_attempt_final_answer = evidenceFacts.finalAnswer;
  if (evidenceFacts?.confidenceRating !== undefined) evidenceColumns.last_attempt_confidence_rating = evidenceFacts.confidenceRating;
  if (evidenceFacts?.workingShown !== undefined) evidenceColumns.last_attempt_working_shown = evidenceFacts.workingShown;
  return evidenceColumns;
}

/**
 * Records the outcome of one answered question — updates mastery evidence
 * (lib/ali/mastery.ts) on the student's history row, and the global
 * usage_count/avg_success_rate aggregate on ali_question_bank. Called
 * immediately when a question is answered (matches the existing app's
 * grade-immediately UX pattern, e.g. components/ReasoningSession.tsx).
 *
 * `evidenceFacts` (migration 015, Phase 2B, Evidence Capture Layer) is
 * optional and additive — every existing caller omits it and behaves
 * exactly as before (all six new columns stay null). A caller that does
 * collect any of these directly-observable facts (time taken, skipped,
 * answer changed, first/final answer, confidence rating, working shown)
 * may pass them; only the fields actually supplied are written, so a
 * caller providing one fact never overwrites another with a false null.
 *
 * `supportTier` (migration 024, Mathematics Reference Vertical Remediation
 * Gate) — defaults to "independent", the exact prior behaviour for every
 * existing caller (mocks, ordinary Practice, Founder Validation, Family
 * Choice). A caller implementing a guided-remediation ladder (e.g. the
 * Mathematics lesson's Guided Attempt) may pass "supported" for an outcome
 * reached only after scaffolding/hints beyond the standard first try — see
 * lib/ali/mastery.ts's applyAttemptOutcome() for how this changes mastery
 * accounting, and GUIDED_LEARNING_REMEDIATION_REPORT.md for the full design.
 *
 * `verified` (migration 076, Stage 2 Educational Integrity Correction) —
 * defaults to `true`, the exact prior behaviour for every existing caller.
 * A caller that recorded a learner's own self-assessment of an answer
 * Angel could not automatically grade (English Tier 3/5) must pass
 * `false` — a genuinely different concept from `supportTier` (which stays
 * about educational scaffolding, unchanged by this parameter). See
 * lib/ali/confidence.ts's anyEvidence check for how this is consumed.
 */
export async function recordOutcome(
  supabase: SupabaseClient<Database>,
  profileId: string,
  questionId: string,
  isCorrect: boolean,
  sessionId: string,
  masteryThreshold: number,
  evidenceFacts?: AttemptEvidenceFacts,
  supportTier: "independent" | "supported" = "independent",
  verified: boolean = true
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("ali_student_question_history")
    .select("*")
    .eq("profile_id", profileId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (fetchError) {
    console.warn("[ALI] recordOutcome fetch failed:", fetchError.message);
    return;
  }

  const current = existing
    ? rowToHistory(existing)
    : ({
        timesSeen: 0,
        timesCorrect: 0,
        distinctCorrectSessions: 0,
        lastCorrectSessionId: null,
        lastAttemptCorrect: null,
        secondLastAttemptCorrect: null,
        masteryState: "new" as MasteryState,
        lastAttemptTimeSeconds: null,
        lastAttemptSkipped: null,
        lastAttemptAnswerChanged: null,
        lastAttemptFirstAnswer: null,
        lastAttemptFinalAnswer: null,
        lastAttemptConfidenceRating: null,
        lastAttemptWorkingShown: null,
        firstSource: null,
        lastAttemptSupportTier: null,
        lastAttemptVerified: null,
      } as StudentQuestionHistoryRow);

  const updated = applyAttemptOutcome(current, isCorrect, sessionId, masteryThreshold, supportTier);
  const evidenceColumns = buildEvidenceUpdateColumns(evidenceFacts);

  const { error: updateError } = await supabase
    .from("ali_student_question_history")
    .update({
      times_seen: updated.timesSeen,
      times_correct: updated.timesCorrect,
      distinct_correct_sessions: updated.distinctCorrectSessions,
      last_correct_session_id: updated.lastCorrectSessionId,
      last_attempt_correct: updated.lastAttemptCorrect,
      second_last_attempt_correct: updated.secondLastAttemptCorrect,
      mastery_state: updated.masteryState,
      ...evidenceColumns,
    })
    .eq("profile_id", profileId)
    .eq("question_id", questionId);
  if (updateError) {
    console.warn("[ALI] recordOutcome update failed:", updateError.message);
  }

  // Guided Learning Remediation (migration 024): separate best-effort write,
  // same reasoning as first_source above — never lets a database that has
  // not yet applied migration 024 block the core mastery update this
  // function's every existing caller depends on.
  const { error: supportTierError } = await supabase
    .from("ali_student_question_history")
    .update({ last_attempt_support_tier: supportTier })
    .eq("profile_id", profileId)
    .eq("question_id", questionId);
  if (supportTierError) {
    console.warn("[ALI] recordOutcome support-tier write failed:", supportTierError.message);
  }

  // Verification provenance (migration 076, Stage 2 Educational Integrity
  // Correction): same separate best-effort write, same reasoning as
  // supportTier above — never lets a database that has not yet applied
  // migration 076 block the core mastery update this function's every
  // existing caller depends on.
  const { error: verifiedError } = await supabase
    .from("ali_student_question_history")
    .update({ last_attempt_verified: verified })
    .eq("profile_id", profileId)
    .eq("question_id", questionId);
  if (verifiedError) {
    console.warn("[ALI] recordOutcome verified write failed:", verifiedError.message);
  }

  // Global calibration-drift signal (ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md §3.4)
  // — informational only, not read by any selection logic. Best-effort, never
  // blocks the mock flow.
  //
  // Question Factory Wave 2, Migration Safety Gate correction: this used to
  // be a client-side fetch-then-write (two round trips, a real if
  // low-volume race window, and -- the actual defect -- silently blocked
  // entirely since migration 084's RLS hardening left no UPDATE policy on
  // ali_question_bank at all). Replaced with a single call to the
  // server-authorised RPC (migration 229, corrected) that performs the
  // read-modify-write atomically and validates the caller has a genuine
  // history row for this exact question before touching anything -- no
  // client-supplied numeric value can ever reach usage_count/
  // avg_success_rate directly.
  const { error: bankTelemetryError } = await supabase.rpc("record_question_bank_telemetry", {
    p_question_id: questionId,
    p_is_correct: isCorrect,
  });
  if (bankTelemetryError) {
    console.warn("[ALI] recordOutcome bank telemetry RPC failed:", bankTelemetryError.message);
  }
}
