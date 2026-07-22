import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { CompetencyId, QuestionTypeId } from "./types";
import { ALL_QUESTION_TYPE_IDS, QUESTION_TYPE_PRIMARY_COMPETENCY, COMPETENCIES } from "./assessmentBrainMap";

/**
 * Capability 3, Wave 3 — Recent Learning Activity / Progress Timeline.
 *
 * Deliberately NOT a re-implementation of LEARNING_ENGINE_V1.md §3.6
 * (Historical Progress — "a time-ordered record of how a competency's
 * Evidence Signal and Evidence Tier have changed between observed points
 * in time"). That capability requires periodic snapshots of computed
 * state, which no persistence mechanism exists for yet (Wave 1 §10(1),
 * reaffirmed by Wave 2's Recommendation Model comment on why "Review"
 * recommendations are never emitted). Inventing a snapshot mechanism here
 * would be a new educational/data model, which this Wave's mission
 * explicitly forbids.
 *
 * What this module DOES do — list real, already-recorded facts, newest
 * first, with zero new interpretation: which Question Type was attempted,
 * when (`updated_at`, real and already written by lib/ali/history.ts's
 * recordOutcome), and whether the most recent attempt was correct
 * (`last_attempt_correct`, likewise already stored). This is a raw
 * activity log, not a trend — see CAP3_WAVE3_ACCEPTANCE_PACK.md §3/§4 for
 * why "Evidence growth" (a genuine trend claim) is handled differently
 * from "Recent Activity"/"Progress Timeline" (a raw log) for exactly this
 * reason.
 */
export interface RecentActivityItem {
  questionTypeId: QuestionTypeId;
  competencyId: CompetencyId;
  competencyName: string;
  lastAttemptCorrect: boolean | null;
  timesSeen: number;
  updatedAt: string;
}

export async function fetchRecentActivity(
  supabase: SupabaseClient<Database>,
  profileId: string,
  limit = 10,
  /**
   * Sprint 4 (ANGEL-CSSE-002A, Parent Intelligence) — optional lower bound
   * on `updated_at` (ISO timestamp), e.g. for a "this week" report. Omitted
   * by every pre-Sprint-4 caller, so their behaviour is unchanged.
   */
  sinceIso?: string
): Promise<RecentActivityItem[]> {
  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id, skill")
    .in("skill", ALL_QUESTION_TYPE_IDS)
    .contains("pathway", ["csse"]);

  if (questionsError) {
    console.warn("[LearningEngine] fetchRecentActivity (question lookup) failed:", questionsError.message);
    return [];
  }

  const skillByQuestionId = new Map((questions ?? []).map((q) => [q.id, q.skill as QuestionTypeId]));
  const questionIds = (questions ?? []).map((q) => q.id);
  if (questionIds.length === 0) return [];

  let query = supabase
    .from("ali_student_question_history")
    .select("question_id, times_seen, last_attempt_correct, updated_at")
    .eq("profile_id", profileId)
    .in("question_id", questionIds)
    .gt("times_seen", 0);
  if (sinceIso) query = query.gte("updated_at", sinceIso);
  const { data: history, error: historyError } = await query.order("updated_at", { ascending: false }).limit(limit);

  if (historyError) {
    console.warn("[LearningEngine] fetchRecentActivity (history lookup) failed:", historyError.message);
    return [];
  }

  const items: RecentActivityItem[] = [];
  for (const row of history ?? []) {
    const questionTypeId = skillByQuestionId.get(row.question_id);
    if (!questionTypeId) continue;
    const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[questionTypeId];
    items.push({
      questionTypeId,
      competencyId,
      competencyName: COMPETENCIES[competencyId].name,
      lastAttemptCorrect: row.last_attempt_correct,
      timesSeen: row.times_seen,
      updatedAt: row.updated_at,
    });
  }
  return items;
}
