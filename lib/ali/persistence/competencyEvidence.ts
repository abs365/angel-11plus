import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { QuestionEvidenceInput } from "@/types/ali/confidence";

/**
 * Work Package WP-17 (IWP-002) — the real aggregation query feeding
 * computeCompetencyConfidence() (WP-05) and validateCompetencyMastery()
 * (WP-06) from real ali_question_bank + ali_student_question_history data.
 * Neither pure function is changed by this module — this is purely the I/O
 * boundary that turns two real tables into the QuestionEvidenceInput[]
 * shape those functions already expect.
 *
 * Deliberately two plain single-table queries joined in application code,
 * not a PostgREST embedded-resource join — this codebase has no existing
 * precedent for embedded joins (every other ALI read path,
 * lib/ali/questionBank.ts's fetchQuestionBank() included, is a plain
 * `.select("*")` against one table), and the generated Database type here
 * does not model foreign-table Relationships. Two simple queries merged in
 * JS is easier to verify correct and consistent with this codebase's own
 * established pattern, at the cost of one extra round-trip.
 *
 * Defect correction (Sprint 1, ANGEL-CSSE-002A Educational Intelligence
 * Engine V1 integration): this module originally queried
 * `ali_question_bank` with `.eq("skill", competencyCode)`, correct for the
 * older ALI system where a question's `skill` column is itself the
 * competency (e.g. `"vr.analogies"`). For the CSSE/Assessment Brain V1
 * system, `skill` stores a Question Type ID (e.g. `"QT-MR-04"`), and a
 * competency maps to *multiple* Question Type IDs
 * (assessmentBrainMap.ts's QUESTION_TYPE_PRIMARY_COMPETENCY) — a single
 * `.eq()` on the competency code would silently match zero rows for every
 * CSSE competency. Corrected by accepting the caller-resolved list of
 * skill values to match, never assuming skill === competency. No real
 * caller existed anywhere in the app before this correction (confirmed by
 * repo-wide search), so this is a zero-regression-risk fix, not a redesign
 * of working behaviour.
 */
interface QuestionMeta {
  id: string;
  mastery_threshold: number;
  confidence_weight: number;
}
interface HistoryRow {
  question_id: string;
  times_seen: number;
  distinct_correct_sessions: number;
  last_attempt_verified?: boolean | null;
}

/**
 * Pure merge logic, factored out so it is independently testable without a
 * real or simulated Supabase client — the only part of this module with
 * genuine mapping risk. Every question in the competency is represented,
 * even ones the learner has never attempted (timesSeen: 0,
 * distinctCorrectSessions: 0) — this matters for
 * computeCompetencyConfidence()'s "insufficient" check, which looks for
 * *any* evidence across the whole competency, not just questions that
 * happen to have a history row.
 */
export function mergeQuestionsWithHistory(
  questions: QuestionMeta[],
  history: HistoryRow[]
): QuestionEvidenceInput[] {
  const historyByQuestionId = new Map(history.map((h) => [h.question_id, h]));

  return questions.map((q) => {
    const row = historyByQuestionId.get(q.id);
    return {
      questionId: q.id,
      timesSeen: row?.times_seen ?? 0,
      distinctCorrectSessions: row?.distinct_correct_sessions ?? 0,
      masteryThreshold: q.mastery_threshold,
      confidenceWeight: q.confidence_weight,
      // Stage 2 Educational Integrity Correction (migration 076) — see
      // lib/ali/persistence/educationalStateRuntime.ts's identical mapping
      // for the full rationale; both functions read the same table and
      // must apply the same conservative undefined/null -> true default.
      verified: row?.last_attempt_verified ?? true,
    };
  });
}

export async function fetchCompetencyEvidence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  skillCodes: string[]
): Promise<QuestionEvidenceInput[]> {
  if (skillCodes.length === 0) return [];

  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id, mastery_threshold, confidence_weight")
    .in("skill", skillCodes);

  if (questionsError || !questions || questions.length === 0) {
    if (questionsError) console.warn("[ALI] fetchCompetencyEvidence (question lookup) failed:", questionsError.message);
    return [];
  }

  const questionIds = questions.map((q) => q.id);
  // Stage 2 Educational Integrity Correction — select("*") rather than
  // naming last_attempt_verified explicitly, so this query does not fail
  // outright on a database that has not yet applied migration 076; see
  // educationalStateRuntime.ts's identical fix for the full rationale.
  const { data: history, error: historyError } = await supabase
    .from("ali_student_question_history")
    .select("*")
    .eq("profile_id", profileId)
    .in("question_id", questionIds);

  if (historyError) {
    console.warn("[ALI] fetchCompetencyEvidence (history lookup) failed:", historyError.message);
    return [];
  }

  return mergeQuestionsWithHistory(questions, history ?? []);
}
