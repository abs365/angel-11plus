import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type {
  RecommendationCandidate,
  RecommendationTrigger,
} from "@/types/ali/recommendationOrchestration";
import type { EducationalState } from "@/types/ali/educationalState";
import type { AudienceExplanation } from "@/types/ali/explainability";
import type {
  WellbeingSignalInput,
  WellbeingSignalResult,
  RecentAttemptSignal,
} from "@/types/ali/wellbeing";
import { orchestrateRecommendations } from "@/lib/ali/recommendationOrchestration";
import { generateExplanation } from "@/lib/ali/explainability";
import { computeWellbeingSignal } from "@/lib/ali/wellbeing";
import { recordWellbeingVetoAudit } from "@/lib/ali/persistence/wellbeingAudit";
import { computeRealEducationalState } from "@/lib/ali/persistence/educationalStateRuntime";
import { fetchCompetencyEvidence } from "@/lib/ali/persistence/competencyEvidence";
import { computeCompetencyConfidence } from "@/lib/ali/confidence";

/**
 * Work Package WP-19 (IWP-002) — Recommendation Orchestration Runtime
 * Integration. Wires WP-09 (orchestrateRecommendations), WP-10
 * (generateExplanation), WP-17/WP-18's real evidence runtime and WP-21A's
 * real Wellbeing Signal into one callable, real-data pipeline. Per Programme
 * Decision APD-039 (Persistence as an Adapter): every educational function
 * this module calls — orchestrateRecommendations, generateExplanation,
 * computeRealEducationalState, computeCompetencyConfidence,
 * computeWellbeingSignal, recordWellbeingVetoAudit — is consumed completely
 * unmodified. Nothing in this file is a new educational conclusion; it is
 * the I/O and adaptation boundary that makes six already-approved components
 * operate together against real data.
 *
 * Five judgement calls this work package introduces, each real and each
 * documented rather than silently assumed:
 *
 * 1. Candidate scope — direct-evidence only. RecommendationCandidate also
 *    supports "shared-mechanism"/"sequential-dependency" bases, but those
 *    require AIW-001 §2's queryable Knowledge Graph, which is WP-20's job
 *    (not yet run — IWP-002 §1). Generating them here would mean inventing
 *    graph data this programme has explicitly reserved for a human-judgement
 *    content work package. Deferred, not fabricated.
 *
 * 2. Trigger-reason mapping (`deriveTriggerReason` below) — new, because no
 *    prior work package maps an EducationalState (WP-08) to a
 *    RecommendationTrigger (WP-09). Three of the five trigger values have a
 *    real, direct basis in lib/ali/educationalState.ts's own state
 *    definitions: "exploring" -> never-attempted, "reviewing" -> review-due,
 *    every other non-mastered state -> weak-competency-remediation. The
 *    remaining two ("cooldown-expired", "mastery-event-on-linked-competency")
 *    have no real source yet — the first needs the per-question cooldown
 *    state WP-04's existing selection mechanism tracks internally but never
 *    exposed at competency granularity, the second needs the same Knowledge
 *    Graph as judgement call 1. Never produced by this module; deferred.
 *
 * 3. No candidate for "mastered"/"durably-mastered" — there is no honest
 *    trigger reason for a competency that needs no remediation and has no
 *    review due, so none is fabricated. This also means Wellbeing is never
 *    evaluated for these competencies, since Tier 0 only has meaning against
 *    a candidate that could otherwise be recommended.
 *
 * 4. `learningGainTrend` and `daysUntilExam` are accepted as optional
 *    caller-supplied inputs, not derived here. Both are genuinely
 *    client-local today: LearningGainSnapshot (types/ali/learningGain.ts)
 *    and UserProgress.targetExamDate (lib/progress.ts's getTargetExamDate())
 *    are read from localStorage-backed UserProgress, with no Supabase table
 *    behind either — the same kind of real, stated gap this programme has
 *    surfaced before (e.g. WP-21A's sessionAbandonmentCount). Left undefined
 *    by a caller, both default to the same "fails open" behaviour their own
 *    governing contracts already specify (Condition B never fires; Tier 3
 *    never activates) — never coerced into a false reading.
 *
 * 5. `fetchRecentAttemptSignalsForCompetency` approximates a per-competency,
 *    chronologically-ordered attempt sequence from real data, because no
 *    attempt-level log exists anywhere in this schema (restated limitation,
 *    lib/ali/confidence.ts's HIGH_TIER_SPREAD_MARGIN docstring already notes
 *    the same absence). Each question in a competency contributes at most
 *    its last two recorded outcomes (`last_attempt_correct`,
 *    `second_last_attempt_correct`) ordered by the real, existing global
 *    `last_presented_at_sequence` counter. The "last" attempt's position is
 *    exact; the "second last" is approximated as `sequence - 1`, since its
 *    true global sequence position is not separately stored. This can
 *    misorder attempts across two questions that were interleaved more than
 *    one step apart, but cannot fabricate a real attempt that did not
 *    happen, and Condition A's own compounding-evidence requirement (3
 *    consecutive real incorrect outcomes) means an ordering error would have
 *    to be large and adversarial to produce a false veto.
 */

interface QuestionIdRow {
  id: string;
}

interface RecentAttemptHistoryRow {
  question_id: string;
  times_seen: number;
  last_attempt_correct: boolean | null;
  second_last_attempt_correct: boolean | null;
  last_presented_at_sequence: number;
}

async function fetchRecentAttemptSignalsForCompetency(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCode: string
): Promise<RecentAttemptSignal[]> {
  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id")
    .eq("skill", competencyCode);

  if (questionsError || !questions || questions.length === 0) {
    if (questionsError) {
      console.warn(
        "[ALI] fetchRecentAttemptSignalsForCompetency (question lookup) failed:",
        questionsError.message
      );
    }
    return [];
  }

  const questionIds = (questions as QuestionIdRow[]).map((q) => q.id);
  const { data: history, error: historyError } = await supabase
    .from("ali_student_question_history")
    .select(
      "question_id, times_seen, last_attempt_correct, second_last_attempt_correct, last_presented_at_sequence"
    )
    .eq("profile_id", profileId)
    .in("question_id", questionIds);

  if (historyError || !history) {
    if (historyError) {
      console.warn(
        "[ALI] fetchRecentAttemptSignalsForCompetency (history lookup) failed:",
        historyError.message
      );
    }
    return [];
  }

  const ordered: { sequence: number; correct: boolean }[] = [];
  for (const row of history as RecentAttemptHistoryRow[]) {
    if (row.times_seen >= 1 && row.last_attempt_correct !== null) {
      ordered.push({ sequence: row.last_presented_at_sequence, correct: row.last_attempt_correct });
    }
    if (row.times_seen >= 2 && row.second_last_attempt_correct !== null) {
      // Approximate ordering key — see judgement call 5 above.
      ordered.push({
        sequence: row.last_presented_at_sequence - 1,
        correct: row.second_last_attempt_correct,
      });
    }
  }

  return ordered
    .sort((a, b) => a.sequence - b.sequence)
    .map((s) => ({ competencyCode, correct: s.correct }));
}

/** Judgement call 2 above. Returns null when no honest trigger exists (judgement call 3). */
function deriveTriggerReason(state: EducationalState): RecommendationTrigger | null {
  switch (state) {
    case "exploring":
      return "never-attempted";
    case "reviewing":
      return "review-due";
    case "building-knowledge":
    case "practising":
    case "reinforcing":
    case "rebuilding":
      return "weak-competency-remediation";
    case "mastered":
    case "durably-mastered":
      return null;
  }
}

export interface RecommendationRuntimeResult {
  ordered: RecommendationCandidate[];
  /** Keyed by competencyCode — one entry per audience, generated via WP-10's generateExplanation(), unmodified. */
  explanations: Map<string, AudienceExplanation[]>;
  /** Competencies whose candidate was generated but vetoed by Tier 0 (WP-21A) — each already has a persisted "wellbeing-veto" audit record by the time this resolves. */
  vetoedCompetencyCodes: string[];
}

export async function computeRealRecommendationOrchestration(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCodes: string[],
  now: Date,
  daysUntilExam: number | null = null,
  learningGainTrendByCompetency: Partial<
    Record<string, "positive" | "flat" | "negative">
  > = {}
): Promise<RecommendationRuntimeResult> {
  const candidates: RecommendationCandidate[] = [];
  const wellbeingResults = new Map<string, WellbeingSignalResult>();

  for (const competencyCode of competencyCodes) {
    const educationalState = await computeRealEducationalState(supabase, profileId, competencyCode);
    const triggerReason = deriveTriggerReason(educationalState);
    if (!triggerReason) continue; // Judgement call 3 — mastered/durably-mastered, no honest trigger.

    const evidence = await fetchCompetencyEvidence(supabase, profileId, [competencyCode]);
    const confidenceTier = computeCompetencyConfidence({ competencyCode, questions: evidence });

    const candidate: RecommendationCandidate = {
      competencyCode,
      basis: "direct-evidence",
      educationalState,
      confidenceTier,
      triggerReason,
    };
    candidates.push(candidate);

    const recentAttempts = await fetchRecentAttemptSignalsForCompetency(
      supabase,
      profileId,
      competencyCode
    );
    const wellbeingInput: WellbeingSignalInput = {
      learnerId: profileId,
      competencyCode,
      recentAttempts,
      currentEducationalState: educationalState,
      learningGainTrend: learningGainTrendByCompetency[competencyCode] ?? null,
      sessionAbandonmentCount: undefined,
    };
    wellbeingResults.set(competencyCode, computeWellbeingSignal(wellbeingInput));
  }

  // Tier 0 predicate consumed exactly as WP-09 defined it (sync, per-candidate)
  // — the async audit write happens separately below, never inside this
  // predicate, since orchestrateRecommendations itself remains pure and
  // synchronous, unmodified from its own work package.
  const wellbeingVeto = (candidate: RecommendationCandidate): boolean =>
    wellbeingResults.get(candidate.competencyCode)?.veto ?? false;

  const ordered = orchestrateRecommendations({ candidates, wellbeingVeto, daysUntilExam });

  const vetoedCompetencyCodes: string[] = [];
  for (const [competencyCode, result] of wellbeingResults) {
    if (result.veto) {
      vetoedCompetencyCodes.push(competencyCode);
      await recordWellbeingVetoAudit(supabase, profileId, competencyCode, result, now);
    }
  }

  const explanations = new Map<string, AudienceExplanation[]>();
  for (const candidate of ordered) {
    explanations.set(candidate.competencyCode, [
      generateExplanation(candidate, "learner"),
      generateExplanation(candidate, "parent"),
      generateExplanation(candidate, "engineering-audit"),
    ]);
  }

  return { ordered, explanations, vetoedCompetencyCodes };
}
