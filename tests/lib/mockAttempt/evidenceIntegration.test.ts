import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveQuestionLevelMockEvidence, ingestMockEvidenceIntoEducationalIntelligence } from "@/lib/mockAttempt/evidenceIntegration";
import type { MockQuestionOutcome } from "@/lib/mockAttempt/types";

/**
 * Migration 244 — Mock -> Educational Intelligence Evidence Bridge.
 * Regression coverage per the Founder's own brief §18. deriveQuestionLevel
 * MockEvidenceGathering tests exercise the REAL, unmodified
 * classifyMockEvidence() (imported inside evidenceIntegration.ts, never
 * reimplemented here) at real granularity. Orchestration tests use a
 * minimal fake SupabaseClient — mirroring this codebase's own established
 * injected-client testing pattern (lib/supabaseProgress.ts's
 * ensureProfile()) — so idempotency/no-op/error-path behaviour is
 * provable without a live database connection.
 */

const REAL_QUESTION_TYPE_ID = "QT-RC-01"; // maps to RC-01 per assessmentBrainMap.ts
const UNMAPPED_QUESTION_TYPE_ID = "QT-DOES-NOT-EXIST";

function outcome(overrides: Partial<MockQuestionOutcome>): MockQuestionOutcome {
  return {
    questionId: "q-default",
    status: "correct",
    marksAwarded: 1,
    marksAvailable: 1,
    questionTypeId: REAL_QUESTION_TYPE_ID,
    ...overrides,
  };
}

// CASE 3 — correct/partial/incorrect/unanswered classifications preserve
// the existing adapter's real semantics (only correct/incorrect become
// evidence; nothing is flattened, nothing is fabricated).
test("CASE 3: correct/incorrect become evidence; unanswered/partially_correct/requires_manual_marking do not", () => {
  const outcomes: MockQuestionOutcome[] = [
    outcome({ questionId: "q-correct", status: "correct" }),
    outcome({ questionId: "q-incorrect", status: "incorrect" }),
    outcome({ questionId: "q-unanswered", status: "unanswered" }),
    outcome({ questionId: "q-partial", status: "partially_correct" }),
    outcome({ questionId: "q-manual", status: "requires_manual_marking" }),
  ];
  const result = deriveQuestionLevelMockEvidence(outcomes, "attempt-1", "form-1", "2026-01-01T00:00:00Z");
  const ids = result.map((r) => r.questionId).sort();
  assert.deepEqual(ids, ["q-correct", "q-incorrect"]);
  assert.equal(result.find((r) => r.questionId === "q-correct")!.correct, true);
  assert.equal(result.find((r) => r.questionId === "q-incorrect")!.correct, false);
});

// CASE 4 — an unmappable question type fails/reports safely; no
// fabricated competency is ever produced.
test("CASE 4: unmappable questionTypeId is safely excluded, never given an invented competency", () => {
  const outcomes: MockQuestionOutcome[] = [
    outcome({ questionId: "q-unmapped", status: "correct", questionTypeId: UNMAPPED_QUESTION_TYPE_ID }),
    outcome({ questionId: "q-null-type", status: "correct", questionTypeId: null }),
  ];
  const result = deriveQuestionLevelMockEvidence(outcomes, "attempt-1", "form-1", "2026-01-01T00:00:00Z");
  assert.deepEqual(result, []);
});

test("deriveQuestionLevelMockEvidence preserves the real competencyId mapping (QT-RC-01 -> RC-01), never invents one", () => {
  const outcomes: MockQuestionOutcome[] = [outcome({ questionId: "q1", status: "correct" })];
  const result = deriveQuestionLevelMockEvidence(outcomes, "attempt-1", "form-1", "2026-01-01T00:00:00Z");
  assert.equal(result.length, 1);
  assert.equal(result[0].competencyId, "RC-01");
  assert.equal(result[0].questionId, "q1");
});

test("deriveQuestionLevelMockEvidence returns an empty array for zero outcomes (no fabricated evidence)", () => {
  assert.deepEqual(deriveQuestionLevelMockEvidence([], "attempt-1", "form-1", "2026-01-01T00:00:00Z"), []);
});

/** Minimal fake SupabaseClient — only implements what evidenceIntegration.ts actually calls. */
function makeFakeSupabase(opts: {
  claim: boolean | { error: true };
  report?: { question_outcomes: MockQuestionOutcome[]; report_release_state: string; analysed_at?: string | null; released_at?: string | null };
  formId?: string;
}) {
  const calls: { table: string; op: string; payload?: unknown }[] = [];
  const fake = {
    rpc(fn: string, _args: unknown) {
      calls.push({ table: "rpc", op: fn });
      if (fn === "mock_claim_evidence_ingestion") {
        if (opts.claim && typeof opts.claim === "object") return Promise.resolve({ data: null, error: { message: "denied" } });
        return Promise.resolve({ data: opts.claim, error: null });
      }
      // recordOutcome()'s own pre-existing, unmodified telemetry call
      // (global usage_count/avg_success_rate on ali_question_bank) —
      // legitimate, already-shared behaviour every caller triggers, not a
      // Mock-scoring mutation. Best-effort in the real function (errors
      // swallowed), so returning an error here is safe and realistic.
      if (fn === "record_question_bank_telemetry") return Promise.resolve({ data: null, error: { message: "not implemented in fake" } });
      return Promise.resolve({ data: null, error: { message: `unexpected rpc ${fn}` } });
    },
    from(table: string) {
      calls.push({ table, op: "from" });
      if (table === "ali_mock_attempt_report") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: opts.report
                    ? {
                        attempt_id: "attempt-1",
                        scoring_state: "scored",
                        analysis_state: "complete",
                        report_release_state: opts.report.report_release_state,
                        released_at: opts.report.released_at ?? "2026-01-01T00:00:00Z",
                        marking_version: 1,
                        analysis_version: 1,
                        analysed_at: opts.report.analysed_at ?? "2026-01-01T00:00:00Z",
                        overall: null,
                        subject_breakdown: null,
                        question_outcomes: opts.report.question_outcomes,
                        competency_evidence: null,
                        strengths: null,
                        weaknesses: null,
                        skill_evidence: null,
                        timing_evidence: null,
                        practice_comparison: null,
                        parent_explanation: null,
                      }
                    : null,
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ali_mock_attempt") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: { status: "submitted", attempt_type: "full_mock", form_id: opts.formId ?? "form-1" }, error: null }),
            }),
          }),
        };
      }
      if (table === "ali_student_adaptive_state") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { questions_presented_count: 0 }, error: null }),
            }),
          }),
          update: (payload: unknown) => {
            calls.push({ table, op: "update", payload });
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      if (table === "ali_question_bank") {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: [], error: null }),
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

// CASE 2 — same attempt processed twice -> no duplicate evidence. The
// claim RPC is the single source of truth; a denied claim must short
// circuit before any evidence write is attempted.
test("CASE 2: a denied claim (already-ingested) writes zero evidence rows and returns a safe no-op result", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  assert.equal(result.ingested, false);
  assert.equal(result.reason, "already-ingested");
  assert.equal(result.questionsProcessed, 0);
  const writeCalls = calls.filter((c) => c.op === "upsert" || c.op === "update");
  assert.equal(writeCalls.length, 0, "no evidence write must occur when the claim is denied");
});

test("a claim RPC error is treated the same as denied — never proceeds to write evidence", async () => {
  const { fake, calls } = makeFakeSupabase({ claim: { error: true } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  assert.equal(result.ingested, false);
  assert.equal(calls.filter((c) => c.op === "upsert" || c.op === "update").length, 0);
});

// CASE 1 — a completed/released Mock, evidence adapter invoked, valid
// evidence persisted (via the real recordPresentation/recordOutcome
// primitives — proven by the upsert/update calls those functions issue).
test("CASE 1: a successful claim against a released, scored report writes evidence for definitive outcomes only", async () => {
  const outcomes: MockQuestionOutcome[] = [
    outcome({ questionId: "q-correct", status: "correct" }),
    outcome({ questionId: "q-incorrect", status: "incorrect" }),
    outcome({ questionId: "q-unanswered", status: "unanswered" }),
  ];
  const { fake, calls } = makeFakeSupabase({ claim: true, report: { question_outcomes: outcomes, report_release_state: "released" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  assert.equal(result.ingested, true);
  assert.equal(result.questionsProcessed, 2, "only the 2 definitive (correct/incorrect) outcomes count");
  assert.deepEqual(result.competenciesTouched, ["RC-01"]);
  const presentationUpsert = calls.find((c) => c.op === "upsert");
  assert.ok(presentationUpsert, "recordPresentation must have written to ali_student_question_history");
  const historyUpdates = calls.filter((c) => c.op === "update" && c.table === "ali_student_question_history");
  assert.ok(historyUpdates.length >= 2, "recordOutcome must have written at least one update per definitive outcome");
});

// CASE 7 (structural) — this integration never calls any Mock-scoring or
// report-release mutating RPC. The fake client throws on any unexpected
// table/rpc, so CASE 1's own successful run already proves this — no
// mock_score_attempt/mock_release_report/mock_submit_* call occurred, or
// the fake would have thrown "unexpected rpc" / "unexpected table".
test("CASE 7: ingestion never mutates Mock scoring/release state — only ei_evidence_ingested_at (via the claim RPC) and the shared history table", async () => {
  const outcomes: MockQuestionOutcome[] = [outcome({ questionId: "q1", status: "correct" })];
  const { fake, calls } = makeFakeSupabase({ claim: true, report: { question_outcomes: outcomes, report_release_state: "released" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  const rpcCalls = calls.filter((c) => c.table === "rpc").map((c) => c.op);
  const mockLifecycleRpcCalls = rpcCalls.filter((c) => c.startsWith("mock_") && c !== "mock_claim_evidence_ingestion");
  assert.deepEqual(mockLifecycleRpcCalls, [], "no Mock scoring/release/submission RPC (mock_score_attempt, mock_release_report, mock_submit_*, etc.) is ever called by this integration");
  assert.ok(rpcCalls.includes("mock_claim_evidence_ingestion"), "the idempotency claim must have been called");
  const mutatedTables = new Set(calls.filter((c) => c.op === "upsert" || c.op === "update").map((c) => c.table));
  assert.deepEqual(
    [...mutatedTables].sort(),
    ["ali_student_adaptive_state", "ali_student_question_history"],
    "only the shared history table and its own presentation-counter table are ever written to — never any Mock table"
  );
});

// CASE 5 (structural) — Mock evidence can never leak a Mock-reserved
// question into Practice: this module never inserts into
// ali_question_bank, never changes eligibility_status, and never touches
// any candidate-store/publication table. It only ever reads
// ali_question_bank.mastery_threshold (a select, never a write) and
// writes to ali_student_question_history — a per-learner exposure/
// mastery signal, not a change to which questions Practice's own
// eligibility-gated pool contains.
test("CASE 5: ali_question_bank is only ever read (mastery_threshold lookup), never written", async () => {
  const outcomes: MockQuestionOutcome[] = [outcome({ questionId: "q1", status: "correct" })];
  const { fake, calls } = makeFakeSupabase({ claim: true, report: { question_outcomes: outcomes, report_release_state: "released" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  const bankWrites = calls.filter((c) => c.table === "ali_question_bank" && (c.op === "upsert" || c.op === "update"));
  assert.equal(bankWrites.length, 0);
});

// CASE 6 — Mock-derived evidence is visible to the existing EI consumer:
// proven by writing through the exact same table (ali_student_question_
// history) and exact same source-tagging convention (migration 006's
// open `source` column) that lib/learningEngine/sessionGenerator.ts's
// fetchStudentHistory() already reads unconditionally for every profile,
// with provenance preserved (source="mock", never merged into an
// existing Practice source value).
test("CASE 6: evidence is tagged source=\"mock\" and written to ali_student_question_history — the exact table the real EI consumer (fetchStudentHistory) already reads", async () => {
  const outcomes: MockQuestionOutcome[] = [outcome({ questionId: "q1", status: "correct" })];
  const { fake, calls } = makeFakeSupabase({ claim: true, report: { question_outcomes: outcomes, report_release_state: "released" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  const presentationUpsert = calls.find((c) => c.op === "upsert" && c.table === "ali_student_question_history");
  assert.ok(presentationUpsert);
  const payload = presentationUpsert!.payload as Array<{ source: string; profile_id: string; question_id: string }>;
  assert.equal(payload[0].source, "mock");
  assert.equal(payload[0].profile_id, "profile-1");
  assert.equal(payload[0].question_id, "q1");
});

test("a report that is not released is refused before any evidence write, even if the claim RPC somehow returned true", async () => {
  const outcomes: MockQuestionOutcome[] = [outcome({ questionId: "q1", status: "correct" })];
  const { fake, calls } = makeFakeSupabase({ claim: true, report: { question_outcomes: outcomes, report_release_state: "pending" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await ingestMockEvidenceIntoEducationalIntelligence(fake as any, "profile-1", "attempt-1");
  assert.equal(result.ingested, false);
  assert.equal(result.reason, "not-released");
  assert.equal(calls.filter((c) => c.op === "upsert" || c.op === "update").length, 0);
});
