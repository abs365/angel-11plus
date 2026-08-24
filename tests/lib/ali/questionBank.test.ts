import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
 *
 * Decision 152 correction: Category E previously contained a test
 * ("mock_eligible content is still admitted to Practice") that asserted,
 * and its own docstring defended as intentional, the exact defect Decision
 * 152 closes — `fetchQuestionBank()` admitting Mock-governance-track
 * content into Practice. That test is corrected below to assert the
 * opposite, and new tests are added proving `authentic_assessment_
 * candidate` and `independently_validated` are excluded too, plus a
 * combined mixed-pool regression (Category E2) proving only
 * `practice_eligible` content survives when all five real statuses are
 * present in the same candidate pool at once.
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

test("E: mock_eligible content is EXCLUDED from Practice (Decision 152 — corrects a test that previously asserted the opposite as intentional)", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "mock_eligible" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0, "mock_eligible is a Mock-governance-track status, never a Practice-track one, regardless of how far along the Mock track it is");
});

test("E: authentic_assessment_candidate content is excluded from Practice (Decision 152)", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "authentic_assessment_candidate" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0, "unreviewed Mock candidate content must never be served to a real Practice learner");
});

test("E: independently_validated content is excluded from Practice (Decision 152)", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "independently_validated" })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0, "independent Mock review does not grant Practice eligibility -- these are separate, non-nested tracks");
});

test("E: a row for a different pathway is excluded", async () => {
  const client = stubClient([row({ id: "p1", eligibility_status: "practice_eligible", pathway: ["gl"] })]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.equal(out.length, 0);
});

// --- Category E2: MIXED-POOL REGRESSION (Decision 152) -------------------
// The exact failure mode the Founder's directive asked to be proven
// directly: a single candidate pool containing all five real
// eligibility_status values, run through the REAL fetchQuestionBank(),
// proving only practice_eligible survives. This is the same boundary
// lib/learningEngine/sessionGenerator.ts's generatePersonalisedSession()
// calls directly and unmodified (line ~277: `fetchQuestionBank(supabase,
// area.subject, "csse")`), so this is the real session-generation
// boundary, not a reimplemented helper. This test fails against the
// pre-Decision-152 PRACTICE_ELIGIBLE_STATUSES set (which would have
// returned 3 rows: practice_eligible, authentic_assessment_candidate,
// independently_validated) and passes against the corrected single-value
// allow-list.

test("E2: mixed pool of all 5 eligibility_status values -> only practice_eligible is returned", async () => {
  const client = stubClient([
    row({ id: "prov", eligibility_status: "provisional" }),
    row({ id: "prac", eligibility_status: "practice_eligible" }),
    row({ id: "cand", eligibility_status: "authentic_assessment_candidate" }),
    row({ id: "valid", eligibility_status: "independently_validated" }),
    row({ id: "mock", eligibility_status: "mock_eligible" }),
  ]);
  const out = await fetchQuestionBank(client, "maths", "csse");
  assert.deepEqual(out.map((q) => q.id), ["prac"], "the real learner-facing Practice candidate pool must contain exactly the practice_eligible row and nothing else");
});

test("E2: mixed pool, English subject -- same boundary, same result", async () => {
  const client = stubClient([
    row({ id: "prov", subject: "english", eligibility_status: "provisional" }),
    row({ id: "prac", subject: "english", eligibility_status: "practice_eligible" }),
    row({ id: "cand", subject: "english", eligibility_status: "authentic_assessment_candidate" }),
    row({ id: "valid", subject: "english", eligibility_status: "independently_validated" }),
    row({ id: "mock", subject: "english", eligibility_status: "mock_eligible" }),
  ]);
  const out = await fetchQuestionBank(client, "english", "csse");
  assert.deepEqual(out.map((q) => q.id), ["prac"]);
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

// --- Source-check: every real learner-facing Practice route funnels
// through this file's own fetchQuestionBank(), so Decision 152's
// correction actually protects them, rather than a caller bypassing it
// with its own direct ali_question_bank query (Decision 152, Part 2 item
// 6 -- "trace the actual learner journey," not just the helper).

test("source check: the real Practice session generator calls fetchQuestionBank(), not a bypass", () => {
  const src = readFileSync("lib/learningEngine/sessionGenerator.ts", "utf8");
  assert.match(src, /import\s*\{[^}]*\bfetchQuestionBank\b[^}]*\}\s*from\s*["']@\/lib\/ali\/questionBank["']/, "sessionGenerator.ts must import fetchQuestionBank from lib/ali/questionBank");
  assert.match(src, /\bfetchQuestionBank\(/, "sessionGenerator.ts must actually call fetchQuestionBank()");
});

test("source check: the Learn lesson pages call fetchQuestionBank(), not a direct ali_question_bank query", () => {
  for (const file of [
    "app/learning-intelligence/learn/mathematics/percentages/page.tsx",
    "app/learning-intelligence/learn/mathematics/arithmetic/page.tsx",
  ]) {
    const src = readFileSync(file, "utf8");
    assert.match(src, /import\s*\{[^}]*\bfetchQuestionBank\b[^}]*\}\s*from\s*["']@\/lib\/ali\/questionBank["']/, `${file} must import fetchQuestionBank from lib/ali/questionBank`);
    assert.doesNotMatch(src, /from\(\s*["']ali_question_bank["']\s*\)/, `${file} must not query ali_question_bank directly, bypassing the corrected fetch function`);
  }
});
