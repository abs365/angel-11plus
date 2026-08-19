import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { QuestionTypeExposure, QuestionTypeId } from "./types";
import { ALL_QUESTION_TYPE_IDS } from "./assessmentBrainMap";
import { deriveQuestionTypeOutcome } from "./rollup";

/**
 * Real data-access layer, deliberately following the same shape as the
 * pre-existing lib/ali/persistence/competencyEvidence.ts (two plain
 * single-table queries merged in application code — this codebase's
 * established pattern; see that file's own comment for why no embedded
 * PostgREST join is used).
 *
 * Reuses the real, live `ali_question_bank` / `ali_student_question_history`
 * tables directly — `ali_question_bank.skill` is a plain text column, and
 * the new CSSE Question Type IDs (QT-RC-01 etc.) are simply new values for
 * it, not a schema change. Today this returns contentExists: false for
 * every Question Type in production, because no question has ever been
 * authored/tagged with these IDs — that is an honest reflection of real
 * state, not a bug in this query. See LEARNING_ENGINE_V1.md §10(1) and the
 * CAP-3 Wave 1 evidence package for the full explanation.
 */
export async function fetchAllQuestionTypeExposure(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<Record<QuestionTypeId, QuestionTypeExposure>> {
  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id, skill")
    .in("skill", ALL_QUESTION_TYPE_IDS)
    .contains("pathway", ["csse"]);

  if (questionsError) {
    console.warn("[LearningEngine] fetchAllQuestionTypeExposure (question lookup) failed:", questionsError.message);
  }

  const questionsByType = new Map<QuestionTypeId, string[]>();
  for (const row of questions ?? []) {
    const qt = row.skill as QuestionTypeId;
    const list = questionsByType.get(qt) ?? [];
    list.push(row.id);
    questionsByType.set(qt, list);
  }

  const allQuestionIds = (questions ?? []).map((q) => q.id);
  let historyByQuestionId = new Map<
    string,
    { times_seen: number; times_correct: number; distinct_correct_sessions: number; last_attempt_verified?: boolean | null }
  >();

  if (allQuestionIds.length > 0) {
    // Stage 2 Educational Integrity Correction — select("*") rather than
    // naming last_attempt_verified explicitly, so this query does not fail
    // outright on a database that has not yet applied migration 076; see
    // lib/ali/persistence/educationalStateRuntime.ts's identical fix for
    // the full rationale.
    const { data: history, error: historyError } = await supabase
      .from("ali_student_question_history")
      .select("*")
      .eq("profile_id", profileId)
      .in("question_id", allQuestionIds);

    if (historyError) {
      console.warn("[LearningEngine] fetchAllQuestionTypeExposure (history lookup) failed:", historyError.message);
    } else {
      historyByQuestionId = new Map((history ?? []).map((h) => [h.question_id, h]));
    }
  }

  const result = {} as Record<QuestionTypeId, QuestionTypeExposure>;
  for (const qt of ALL_QUESTION_TYPE_IDS) {
    const questionIds = questionsByType.get(qt) ?? [];
    let timesSeen = 0;
    let timesCorrect = 0;
    let distinctCorrectSessions = 0;
    // Stage 2 Educational Integrity Correction — true the moment ANY
    // contributing question's most recent attempt was automatically
    // verified (undefined/null, pre-migration or never-attempted, counts
    // as verified too — see deriveQuestionTypeOutcome's docstring). Only
    // stays false if every question with real evidence was, at last
    // attempt, purely self-assessed.
    let anyVerified = false;
    let anyEvidence = false;
    for (const qid of questionIds) {
      const h = historyByQuestionId.get(qid);
      if (h) {
        timesSeen += h.times_seen;
        timesCorrect += h.times_correct;
        distinctCorrectSessions += h.distinct_correct_sessions;
        if (h.times_seen > 0) {
          anyEvidence = true;
          if (h.last_attempt_verified ?? true) anyVerified = true;
        }
      }
    }
    result[qt] = {
      questionTypeId: qt,
      contentExists: questionIds.length > 0,
      timesSeen,
      timesCorrect,
      distinctCorrectSessions,
      outcome: deriveQuestionTypeOutcome(timesSeen, timesCorrect, !anyEvidence || anyVerified),
    };
  }
  return result;
}
