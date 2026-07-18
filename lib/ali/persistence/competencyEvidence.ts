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
    };
  });
}

export async function fetchCompetencyEvidence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCode: string
): Promise<QuestionEvidenceInput[]> {
  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id, mastery_threshold, confidence_weight")
    .eq("skill", competencyCode);

  if (questionsError || !questions || questions.length === 0) {
    if (questionsError) console.warn("[ALI] fetchCompetencyEvidence (question lookup) failed:", questionsError.message);
    return [];
  }

  const questionIds = questions.map((q) => q.id);
  const { data: history, error: historyError } = await supabase
    .from("ali_student_question_history")
    .select("question_id, times_seen, distinct_correct_sessions")
    .eq("profile_id", profileId)
    .in("question_id", questionIds);

  if (historyError) {
    console.warn("[ALI] fetchCompetencyEvidence (history lookup) failed:", historyError.message);
    return [];
  }

  return mergeQuestionsWithHistory(questions, history ?? []);
}
