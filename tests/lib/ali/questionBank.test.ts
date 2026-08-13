import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchQuestionBank, fetchMockEligibleQuestionBank } from "@/lib/ali/questionBank";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Categories E (Practice eligibility) and F (Mock firewall). Exercises the
 * real, exported fetch functions — not a re-implementation of their
 * predicate — against a minimal fluent stub that genuinely applies .eq()/
 * .contains() filters to an in-memory row set, so both the Postgrest query
 * shape and the JS-side eligibility filtering in questionBank.ts are
 * covered together.
 */

type BankRow = Database["public"]["Tables"]["ali_question_bank"]["Row"];

function row(overrides: Partial<BankRow>): BankRow {
  return {
    id: "row-1",
    subject: "maths",
    skill: "QT-MR-01",
    pathway: ["csse"],
    content_difficulty: "medium",
    question_type: "short-answer",
    estimated_time_seconds: 60,
    prompt: {},
    explanation: "",
    hint: null,
    confidence_weight: 1,
    learning_objective: null,
    revision_priority: "standard",
    mastery_threshold: 1,
    usage_count: 0,
    avg_success_rate: 0,
    learning_unit_id: null,
    addresses_misconception: null,
    transfer_links: null,
    family_id: null,
    provenance: "angel_original",
    eligibility_status: "practice_eligible",
    active: true,
    ...overrides,
  } as unknown as BankRow;
}

/** Minimal fluent stub mimicking exactly the chain calls questionBank.ts issues, genuinely applying filters to `rows` rather than returning them unconditionally. */
function stubClient(rows: BankRow[]): SupabaseClient<Database> {
  function builder(filtered: BankRow[]) {
    const b = {
      select: () => b,
      eq: (col: string, val: unknown) => builder(filtered.filter((r) => (r as unknown as Record<string, unknown>)[col] === val)),
      contains: (col: string, val: unknown[]) =>
        builder(
          filtered.filter((r) => {
            const field = (r as unknown as Record<string, unknown>)[col];
            return Array.isArray(field) && val.every((v) => field.includes(v));
          })
        ),
      then: (resolve: (v: { data: BankRow[]; error: null }) => void) => resolve({ data: filtered, error: null }),
    };
    return b;
  }
  return { from: () => builder(rows) } as unknown as SupabaseClient<Database>;
}

// --- Category E: PRACTICE ELIGIBILITY -----------------------------------

test("E: provisional is excluded from Practice", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "provisional" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("E: practice_eligible is admitted to Practice", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.deepEqual(out.map((q) => q.id), ["p1"]);
});

test("E: inactive (active=false) is excluded even if otherwise eligible", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible", active: false })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("E: evidence_only provenance is excluded even if otherwise eligible", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible", provenance: "evidence_only" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("E: a row with no eligibility_status at all is treated as not yet eligible, not silently admitted", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: null as unknown as BankRow["eligibility_status"] })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("E: mock_eligible content is still admitted to Practice (Practice Eligible is a floor, not exclusive)", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "mock_eligible" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.deepEqual(out.map((q) => q.id), ["p1"]);
});

test("E: a row for a different pathway is excluded", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible", pathway: ["gl"] })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

// --- Category F: MOCK FIREWALL -------------------------------------------

test("F: Practice Eligible does not become Mock Eligible", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible" })]);
  const out = await fetchMockEligibleQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0, "practice_eligible content must never surface from the Mock-eligible fetch");
});

test("F: provisional does not enter Mock", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "provisional" })]);
  const out = await fetchMockEligibleQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("F: explicit mock_eligible + active is required and sufficient", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "mock_eligible", active: true })]);
  const out = await fetchMockEligibleQuestionBank(client, "maths", "csse");
  assert.deepEqual(out.map((q) => q.id), ["p1"]);
});

test("F: mock_eligible but inactive is excluded", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "mock_eligible", active: false })]);
  const out = await fetchMockEligibleQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

test("F: an empty Mock-eligible result for the current bank state (no row is mock_eligible yet)", async () => {
  const client = stubClient([
    row({ id: "p1", eligibility_status: "practice_eligible" }),
    row({ id: "p2", eligibility_status: "provisional" }),
  ]);
  const out = await fetchMockEligibleQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0, "matches the disclosed production state: zero rows are mock_eligible as of this migration");
});

// --- English-specific firewall coverage (Educational Increment 007A) -----
// fetchQuestionBank/fetchMockEligibleQuestionBank are already subject-
// agnostic (same code path as Mathematics); these confirm that holds for
// English specifically, including the passage-provenance distinction this
// increment introduces (EVIDENCE_ONLY / ANGEL_ORIGINAL / LEGALLY_REPRODUCIBLE).

test("Practice firewall (English): provisional Reading Comprehension content is excluded", async () => {
  const client = stubClient([
    row({ id: "rc1", subject: "english", skill: "QT-RC-01", eligibility_status: "provisional", learning_unit_id: "passageA" }),
  ]);
  const out = await fetchQuestionBank(client, "english", "csse");
  assert.equal(out.length, 0);
});

test("Practice firewall (English): practice_eligible Reading Comprehension content is admitted", async () => {
  const client = stubClient([
    row({ id: "rc1", subject: "english", skill: "QT-RC-01", eligibility_status: "practice_eligible", learning_unit_id: "passageA" }),
  ]);
  const out = await fetchQuestionBank(client, "english", "csse");
  assert.deepEqual(out.map((q) => q.id), ["rc1"]);
});

test("evidence_only provenance firewall: a passage/question tagged evidence_only never enters Practice, even if marked practice_eligible", async () => {
  const client = stubClient([
    row({
      id: "rc1", subject: "english", skill: "QT-RC-01",
      eligibility_status: "practice_eligible", provenance: "evidence_only", learning_unit_id: "passageA",
    }),
  ]);
  const out = await fetchQuestionBank(client, "english", "csse");
  assert.equal(out.length, 0, "a CSSE-source-derived (evidence_only) row must fail closed from Practice regardless of eligibility_status");
});

test("evidence_only provenance firewall: does not affect a sibling question from the same passage with real provenance", async () => {
  const client = stubClient([
    row({ id: "rc1", subject: "english", eligibility_status: "practice_eligible", provenance: "evidence_only", learning_unit_id: "passageA" }),
    row({ id: "rc2", subject: "english", eligibility_status: "practice_eligible", provenance: "angel_original", learning_unit_id: "passageA" }),
  ]);
  const out = await fetchQuestionBank(client, "english", "csse");
  assert.deepEqual(out.map((q) => q.id), ["rc2"], "provenance is enforced per-row, not silently inherited or shared across a passage");
});

test("Mock firewall (English): Practice Eligible Reading Comprehension does not become Mock Eligible", async () => {
  const client = stubClient([
    row({ id: "rc1", subject: "english", eligibility_status: "practice_eligible", learning_unit_id: "passageA" }),
  ]);
  const out = await fetchMockEligibleQuestionBank(client, "english", "csse");
  assert.equal(out.length, 0);
});
