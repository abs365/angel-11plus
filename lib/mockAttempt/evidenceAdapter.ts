import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { QuestionTypeId } from "@/lib/learningEngine/types";
import type { MockCompetencyEvidenceEntry, MockQuestionOutcome, MockStrengthOrPriorityEntry } from "./types";

/**
 * Programme Increment 008F — the Mock evidence "boundary/adapter" the
 * directive itself names as the correct fallback when the shared
 * Educational Intelligence evidence pipeline cannot yet safely consume a
 * new evidence source. Reconnaissance for this increment found that
 * `ali_student_question_history` (the table `recordOutcome()`/
 * `processEvidenceForCompetency()` read and write) has NO evidence-
 * provenance column — writing Mock outcomes through that same path would
 * make them silently indistinguishable from Practice evidence, exactly
 * the contamination this programme's Core Principle forbids. This file
 * therefore never calls `recordOutcome`, `processEvidenceForCompetency`,
 * or touches `ali_student_question_history`/`ali_durable_mastery`/
 * `ali_educational_audit` — every entry it produces is explicitly tagged
 * `source: "mock"` and is consumed only by Mock-specific reporting, never
 * mastery or readiness, until a future, separately-scoped increment gives
 * the shared pipeline a real provenance dimension and can safely merge
 * this.
 *
 * Reuses the SAME, single QUESTION_TYPE_PRIMARY_COMPETENCY mapping
 * Practice's own evidence pipeline uses (lib/learningEngine/
 * assessmentBrainMap.ts) — not a second, duplicated mapping.
 *
 * DISCLOSED INTEGRATION GAP: this is real, tested, pure logic — proven
 * correct here — but it is NOT wired into an automatic server-side
 * pipeline in this increment. `ali_mock_attempt_report` (migration 072)
 * is sealed until report_release_state = 'released' with no admin
 * bypass in its own RLS policy, and this deployment has no
 * SUPABASE_SERVICE_ROLE_KEY (confirmed, migration 070's own comment) —
 * so nothing outside a SECURITY DEFINER SQL function can read a scored-
 * but-unreleased report to run this classification. Doing that safely
 * would mean either provisioning a service-role credential or
 * duplicating QUESTION_TYPE_PRIMARY_COMPETENCY into a second, SQL-side
 * mapping (a real drift risk) — a deliberate architecture decision for a
 * future increment, not made silently here. Until then,
 * `ali_mock_attempt_report.competency_evidence`/`strengths`/`weaknesses`
 * stay null even after a report is scored and released; the reporting
 * surfaces this file's own callers build must show raw results plainly
 * and say so honestly, not claim analysis that hasn't happened.
 */

/** Only a definitive outcome (correct/incorrect) is evidence of anything — unanswered and manually-pending questions contribute nothing here. */
export function classifyMockEvidence(
  outcomes: MockQuestionOutcome[],
  attemptId: string,
  formId: string,
  scoredAt: string
): MockCompetencyEvidenceEntry[] {
  const entries: MockCompetencyEvidenceEntry[] = [];
  for (const outcome of outcomes) {
    if (outcome.status !== "correct" && outcome.status !== "incorrect") continue;
    if (!outcome.questionTypeId) continue;
    const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[outcome.questionTypeId as QuestionTypeId];
    if (!competencyId) continue;
    entries.push({
      competencyId,
      questionTypeId: outcome.questionTypeId,
      source: "mock",
      correct: outcome.status === "correct",
      attemptId,
      formId,
      scoredAt,
    });
  }
  return entries;
}

const MIN_QUESTIONS_FOR_A_SIGNAL = 2;

/**
 * A report-layer-only signal, deliberately distinct from the Educational
 * Intelligence Engine's own Evidence Tier system (ET-0..4) — this
 * threshold governs only what THIS one Mock attempt's own report may say
 * about itself ("in this Mock, you got every question about X right"),
 * never a durable mastery or confidence claim. One question about a
 * competency is too little to characterise as a strength or a priority
 * even within a single attempt's own report.
 */
export function summariseStrengthsAndPriorities(evidence: MockCompetencyEvidenceEntry[]): {
  strengths: MockStrengthOrPriorityEntry[];
  weaknesses: MockStrengthOrPriorityEntry[];
} {
  const byCompetency = new Map<string, { correct: number; total: number }>();
  for (const entry of evidence) {
    const current = byCompetency.get(entry.competencyId) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (entry.correct) current.correct += 1;
    byCompetency.set(entry.competencyId, current);
  }

  const strengths: MockStrengthOrPriorityEntry[] = [];
  const weaknesses: MockStrengthOrPriorityEntry[] = [];
  for (const [competencyId, { correct, total }] of byCompetency) {
    if (total < MIN_QUESTIONS_FOR_A_SIGNAL) continue;
    const record: MockStrengthOrPriorityEntry = { competencyId, questionCount: total, correctCount: correct };
    if (correct === total) strengths.push(record);
    else if (correct === 0) weaknesses.push(record);
  }
  return { strengths, weaknesses };
}
