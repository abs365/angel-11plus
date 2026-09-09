import { test } from "node:test";
import assert from "node:assert/strict";
import { ingestWritingEvidenceIntoEducationalIntelligence } from "@/lib/mockAttempt/writingEvidenceIntegration";
import type { MockWritingAssessment } from "@/lib/mockAttempt/types";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §10) — Writing → Educational Intelligence evidence adapter tests.
 * Mirrors tests/lib/mockAttempt/evidenceIntegration.test.ts's own
 * established minimal-fake-SupabaseClient convention exactly, so
 * idempotency/no-op/error-path/mastery-quarantine behaviour is provable
 * without a live database connection.
 */

function assessment(overrides: Partial<MockWritingAssessment>): MockWritingAssessment {
  return {
    questionId: "eng-q1-default",
    taskType: "Q1",
    rubricVersion: 1,
    assessmentVersion: 1,
    responseText: "A response.",
    dimensions: [
      { dimension: "ideas", level: "secure", comment: "", confident: true },
      { dimension: "vocabulary", level: "secure", comment: "", confident: true },
      { dimension: "grammar", level: "secure", comment: "", confident: true },
      { dimension: "structure", level: "secure", comment: "", confident: true },
      { dimension: "punctuation", level: "secure", comment: "", confident: true },
    ],
    overallIndicator: 70, // computeOverallScoreFromDimensions(all "secure") = 70, matches the fixture above exactly
    assessmentStatus: "complete",
    reviewRequiredReasons: null,
    automatedModel: "gpt-4o-mini",
    automatedAssessedAt: "2026-01-01T00:00:00Z",
    humanReviewedAt: null,
    humanReviewNotes: null,
    humanReviewDimensions: null,
    ...overrides,
  };
}

/** Minimal fake SupabaseClient — only implements what writingEvidenceIntegration.ts actually calls. */
function makeFakeSupabase(opts: { claim: boolean | { error: true }; masteryThreshold?: number | null }) {
  const calls: { table: string; op: string; payload?: unknown }[] = [];
  const fake = {
    rpc(fn: string, _args: unknown) {
      calls.push({ table: "rpc", op: fn });
      if (fn === "mock_claim_writing_evidence_ingestion") {
        if (opts.claim && typeof opts.claim === "object") return Promise.resolve({ data: null, error: { message: "denied" } });
        return Promise.resolve({ data: opts.claim, error: null });
      }
      if (fn === "record_question_bank_telemetry") return Promise.resolve({ data: null, error: { message: "not implemented in fake" } });
      return Promise.resolve({ data: null, error: { message: `unexpected rpc ${fn}` } });
    },
    from(table: string) {
      calls.push({ table, op: "from" });
      if (table === "ali_student_adaptive_state") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { questions_presented_count: 0 }, error: null }) }) }),
          update: (payload: unknown) => {
            calls.push({ table, op: "update", payload });
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      if (table === "ali_question_bank") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: { mastery_threshold: opts.masteryThreshold ?? 3 }, error: null }) }),
          }),
        };
      }
      if (table === "ali_student_question_history") {
        const chain = {
          eq: () => chain,
          in: () => Promise.resolve({ data: [], error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
        };
        return {
          select: () => chain,
          upsert: (payload: unknown) => {
            calls.push({ table, op: "upsert", payload });
            return Promise.resolve({ error: null });
          },
          update: (payload: unknown) => {
            calls.push({ table, op: "update", payload });
            return chain;
          },
        };
      }
      throw new Error(`fake supabase: unexpected table ${table}`);
    },
  };
  return { fake, calls };
}

test("a denied claim (already-ingested) writes zero evidence rows and returns a safe no-op result", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({}));
  assert.equal(result.ingested, false);
  assert.equal(result.reason, "already-ingested");
  const writeCalls = calls.filter((c) => c.table === "ali_student_question_history" && c.op === "update");
  assert.equal(writeCalls.length, 0, "no evidence write must occur when the claim is denied");
});

test("a claim RPC error is treated the same as denied -- never proceeds to write evidence", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: { error: true } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({}));
  assert.equal(result.ingested, false);
  assert.equal(calls.filter((c) => c.table === "ali_student_question_history" && c.op === "update").length, 0);
});

test("a successful claim writes evidence with supportTier ALWAYS 'supported' -- Decision 60's mastery quarantine, reused not reinvented", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({}));
  assert.equal(result.ingested, true);
  assert.equal(result.competencyId, "WC-01");
  const supportTierWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && (c.payload as Record<string, unknown>).last_attempt_support_tier);
  assert.ok(supportTierWrite, "must write last_attempt_support_tier");
  assert.equal((supportTierWrite!.payload as Record<string, unknown>).last_attempt_support_tier, "supported");
});

test("Q2 resolves to QT-WC-01b -> WC-01, same competency as Q1's QT-WC-01a", async () => {
  const { fake } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({ questionId: "eng-q2-picturenarrative-oldshed", taskType: "Q2" }));
  assert.equal(result.competencyId, "WC-01");
});

test("an overallIndicator at or above the threshold (70) is recorded as correct=true, matching Practice's own WRITING_CORRECTNESS_THRESHOLD", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({ overallIndicator: 70 }));
  const correctnessWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && "last_attempt_correct" in (c.payload as Record<string, unknown>));
  assert.equal((correctnessWrite!.payload as Record<string, unknown>).last_attempt_correct, true);
});

test("an overallIndicator below the threshold is recorded as correct=false, never fabricated as a pass", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({ overallIndicator: 45 }));
  const correctnessWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && "last_attempt_correct" in (c.payload as Record<string, unknown>));
  assert.equal((correctnessWrite!.payload as Record<string, unknown>).last_attempt_correct, false);
});

test("assessment_status='review_required' is recorded as verified=false -- Angel is not yet confident in this automated read", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestWritingEvidenceIntoEducationalIntelligence(
    fake as any,
    "profile-1",
    "attempt-1",
    assessment({ assessmentStatus: "review_required", reviewRequiredReasons: ["too short"] })
  );
  const verifiedWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && "last_attempt_verified" in (c.payload as Record<string, unknown>));
  assert.equal((verifiedWrite!.payload as Record<string, unknown>).last_attempt_verified, false);
});

test("assessment_status='complete' is recorded as verified=true", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", assessment({ assessmentStatus: "complete" }));
  const verifiedWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && "last_attempt_verified" in (c.payload as Record<string, unknown>));
  assert.equal((verifiedWrite!.payload as Record<string, unknown>).last_attempt_verified, true);
});

test("a human review supersedes the automated score for correctness, WITHOUT this adapter ever writing back to the original assessment record", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: true });
  // Automated overallIndicator says "secure" across the board (70, a
  // pass) but a human reviewer downgraded every dimension to
  // "developing" (45, a fail) -- the reviewed interpretation must win
  // for EI purposes.
  const reviewed = assessment({
    overallIndicator: 70,
    humanReviewedAt: "2026-01-02T00:00:00Z",
    humanReviewDimensions: [
      { dimension: "ideas", level: "developing", comment: "", confident: true },
      { dimension: "vocabulary", level: "developing", comment: "", confident: true },
      { dimension: "grammar", level: "developing", comment: "", confident: true },
      { dimension: "structure", level: "developing", comment: "", confident: true },
      { dimension: "punctuation", level: "developing", comment: "", confident: true },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestWritingEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1", reviewed);
  const correctnessWrite = calls.find((c) => c.table === "ali_student_question_history" && c.op === "update" && "last_attempt_correct" in (c.payload as Record<string, unknown>));
  assert.equal((correctnessWrite!.payload as Record<string, unknown>).last_attempt_correct, false, "the human review (developing, 45) must override the automated read (secure, 70)");
  // This adapter itself never touches ali_writing_assessment at all --
  // no such table appears in any call the fake records.
  assert.ok(!calls.some((c) => c.table === "ali_writing_assessment"), "must never write back to the original assessment record");
});
