import { test } from "node:test";
import assert from "node:assert/strict";
import { getEducationalIntelligence } from "@/lib/learningEngine/educationalIntelligenceService";
import { computeSubjectPreparationSummary, getCompetencyIdsForComponent } from "@/lib/learningEngine/preparationState";
import { getQuestionTypesForCompetency } from "@/lib/learningEngine/assessmentBrainMap";
import { makeStrictFake } from "../support/strictFakeSupabase";

/**
 * Wave 0 multi-learner architecture: EI isolation. Two learners (A1, A2)
 * under ONE parent account. The REAL Educational Intelligence functions run
 * against a strict in-memory client that THROWS on any learner-table read
 * not constrained to a learner id -- so these tests prove both (a) the
 * results are independent and (b) the EI code path can never issue an
 * unscoped, cross-learner query.
 */

const A1 = "a1a1a1a1-0000-4000-8000-000000000001";
const A2 = "a2a2a2a2-0000-4000-8000-000000000002";
const NOW = new Date("2026-09-21T12:00:00Z");

const competency = getCompetencyIdsForComponent("Mathematics")[0];
const skill = getQuestionTypesForCompetency(competency)[0];

function bank(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`, skill, mastery_threshold: 2, confidence_weight: 1,
  }));
}

function history(profileId: string, n: number, opts: { correctSessions: number; timesSeen: number; state: string }) {
  return Array.from({ length: n }, (_, i) => ({
    profile_id: profileId,
    question_id: `q${i}`,
    times_seen: opts.timesSeen,
    distinct_correct_sessions: opts.correctSessions,
    last_attempt_verified: true,
    mastery_state: opts.state,
    last_presented_at: "2026-09-20T12:00:00Z",
    last_presented_at_sequence: i,
  }));
}

const STRONG = { correctSessions: 3, timesSeen: 3, state: "mastered" };
const WEAK = { correctSessions: 0, timesSeen: 4, state: "learning" };

test("A1's strong evidence and A2's weak evidence yield different, independent EI snapshots for the same competency", async () => {
  const { client } = makeStrictFake({
    ali_question_bank: bank(6),
    ali_student_question_history: [...history(A1, 6, STRONG), ...history(A2, 6, WEAK)],
  });
  const s1 = await getEducationalIntelligence(client, A1, competency, NOW);
  const s2 = await getEducationalIntelligence(client, A2, competency, NOW);
  assert.notDeepEqual(s1, s2, "two learners with different evidence must not share an EI result");
  assert.notEqual(s1.confidenceTier, s2.confidenceTier);
});

test("changing A2's evidence (wrong answers, more attempts) has ZERO effect on A1's snapshot (deep-equal before/after)", async () => {
  const tables = {
    ali_question_bank: bank(6),
    ali_student_question_history: [...history(A1, 6, STRONG), ...history(A2, 6, WEAK)],
  };
  const before = await getEducationalIntelligence(makeStrictFake(tables).client, A1, competency, NOW);

  // A2 does a lot more wrong work; A1 does nothing.
  const changed = {
    ali_question_bank: bank(6),
    ali_student_question_history: [
      ...history(A1, 6, STRONG),
      ...history(A2, 6, { correctSessions: 0, timesSeen: 40, state: "learning" }),
    ],
  };
  const after = await getEducationalIntelligence(makeStrictFake(changed).client, A1, competency, NOW);
  assert.deepEqual(after, before);
});

test("changing A1's evidence has ZERO effect on A2's snapshot", async () => {
  const base = {
    ali_question_bank: bank(6),
    ali_student_question_history: [...history(A1, 6, WEAK), ...history(A2, 6, WEAK)],
  };
  const before = await getEducationalIntelligence(makeStrictFake(base).client, A2, competency, NOW);
  const boosted = {
    ali_question_bank: bank(6),
    ali_student_question_history: [...history(A1, 6, STRONG), ...history(A2, 6, WEAK)],
  };
  const after = await getEducationalIntelligence(makeStrictFake(boosted).client, A2, competency, NOW);
  assert.deepEqual(after, before);
});

test("a learner with no evidence sees none, even when a sibling has a lot (no cross-learner fallback)", async () => {
  const { client } = makeStrictFake({
    ali_question_bank: bank(6),
    ali_student_question_history: history(A1, 6, STRONG),
  });
  const s2 = await getEducationalIntelligence(client, A2, competency, NOW);
  assert.equal(s2.validated, false);
  assert.equal(s2.daysSinceLastMasteredEvidence, null);
});

test("whole-subject preparation summary (what Recommended Focus consumes) is per learner and never mixes siblings", async () => {
  const tables = {
    ali_question_bank: bank(6),
    ali_student_question_history: [...history(A1, 6, STRONG), ...history(A2, 6, WEAK)],
  };
  const { client, reads } = makeStrictFake(tables);
  const a1 = await computeSubjectPreparationSummary(client, A1, "Mathematics", NOW);
  const a2 = await computeSubjectPreparationSummary(client, A2, "Mathematics", NOW);
  assert.notDeepEqual(a1, a2);
  // Every learner-table read was constrained to exactly the requested learner.
  for (const r of reads.filter((x) => x.startsWith("ali_student_question_history:"))) {
    assert.match(r, new RegExp(`:(${A1}|${A2})$`));
  }
  assert.ok(reads.some((r) => r.endsWith(`:${A1}`)) && reads.some((r) => r.endsWith(`:${A2}`)));
});

test("strict client self-check: an unscoped learner-table read throws (so the isolation proofs above are meaningful)", async () => {
  const { client } = makeStrictFake({ ali_student_question_history: history(A1, 1, STRONG) });
  await assert.rejects(async () => {
    await client.from("ali_student_question_history").select("*");
  }, /UNSCOPED read/);
});
