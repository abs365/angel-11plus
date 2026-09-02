import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchQuestionBank, fetchMockEligibleQuestionBank } from "../../../lib/ali/questionBank";

/**
 * CSSE Completion Programme, Phase A, Decision 59 — Mock Content Firewall.
 *
 * AUTHORITATIVE RULE: Mock content may ONLY enter a genuine Mock assessment
 * through an explicitly Mock-governed retrieval path. practice_eligible !=
 * mock_eligible. Practice eligibility must never imply Mock eligibility.
 *
 * A minimal, dependency-free fake Postgrest-style query builder — records
 * every .eq()/.contains() filter applied and evaluates them in-memory
 * against a fixed row set when awaited, so the REAL exported functions
 * (fetchQuestionBank/fetchMockEligibleQuestionBank) are exercised
 * end-to-end, not reimplemented.
 */
function fakeSupabase(rows: Record<string, unknown>[]) {
  return {
    from(_table: string) {
      const filters: Array<(row: Record<string, unknown>) => boolean> = [];
      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: unknown) {
          filters.push((row) => row[col] === val);
          return builder;
        },
        contains(col: string, val: unknown[]) {
          filters.push((row) => {
            const cell = row[col];
            return Array.isArray(cell) && val.every((v) => cell.includes(v));
          });
          return builder;
        },
        then(resolve: (result: { data: Record<string, unknown>[]; error: null }) => void) {
          resolve({ data: rows.filter((row) => filters.every((f) => f(row))), error: null });
        },
      };
      return builder;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const baseRow = {
  skill: "QT-MR-01",
  content_difficulty: "medium",
  question_type: "short-answer",
  estimated_time_seconds: 60,
  prompt: { answer: "1" },
  explanation: null,
  hint: null,
  confidence_weight: 1,
  learning_objective: null,
  revision_priority: 1,
  mastery_threshold: 1,
  usage_count: 0,
  avg_success_rate: null,
  learning_unit_id: "u1",
  addresses_misconception: null,
  transfer_links: null,
  family_id: null,
  provenance: "angel_original",
};

test("1. Practice Eligible alone cannot enter Mock", async () => {
  const rows = [{ ...baseRow, id: "p1", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true }];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result, [], "a practice_eligible row must never be returned by the Mock retrieval path");
});

test("2. Provisional content cannot enter Mock", async () => {
  const rows = [{ ...baseRow, id: "p2", subject: "maths", pathway: ["csse"], eligibility_status: "provisional", active: true }];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result, [], "a provisional row must never be returned by the Mock retrieval path");
});

test("3. Mock retrieval returns only explicitly Mock Eligible content", async () => {
  const rows = [
    { ...baseRow, id: "p3", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true },
    { ...baseRow, id: "p4", subject: "maths", pathway: ["csse"], eligibility_status: "provisional", active: true },
    { ...baseRow, id: "p5", subject: "maths", pathway: ["csse"], eligibility_status: "independently_validated", active: true },
    { ...baseRow, id: "p6", subject: "maths", pathway: ["csse"], eligibility_status: "mock_eligible", active: true },
  ];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result.map((q) => q.id), ["p6"], "only the mock_eligible row may be returned, every other status excluded");
});

test("4. Mock Eligible = 0 produces zero genuine Mock questions", async () => {
  const rows = [
    { ...baseRow, id: "p7", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true },
    { ...baseRow, id: "p8", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true },
  ];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result, [], "with zero mock_eligible rows, the function itself must return an empty array — never synthesise or substitute real-looking content");
});

test("5. No still-client-fetched Mock route can silently fall back to the general question bank (source check)", () => {
  // These routes are unchanged by Programme Increment 008E (out of its
  // named scope — see ANGEL_008V's own Part 13 taxonomy: these are
  // adaptive PRACTICE runners, not the formal Mock Exam entry point 008E
  // targeted) and still retrieve content the pre-008E way, so this
  // decision's original rule still applies to them unmodified.
  //
  // Gate 3 Closure Wave, Defect D (2026-09-02) — app/mocks/adaptive/maths
  // and .../english were RETIRED (each now just redirects to its
  // CSSE-scoped /learning-intelligence/practice/* successor) and no longer
  // fetch content at all, so they no longer belong in this list; a
  // separate test below confirms each redirects. gl and vocabulary are
  // unchanged/fixed-in-place and remain in scope here.
  for (const file of [
    "app/mocks/adaptive/gl/page.tsx",
    "app/mocks/adaptive/vocabulary/page.tsx",
  ]) {
    const src = readFileSync(file, "utf8");
    // Checks the actual import statement, not just any textual mention (this
    // file's own comments legitimately reference "fetchQuestionBank" by name).
    assert.match(
      src,
      /^import\s*\{[^}]*\}\s*from\s*["']@\/lib\/ali\/questionBank["'];?$/m,
      `${file} must import from lib/ali/questionBank`
    );
    const importLine = src.match(/^import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/ali\/questionBank["'];?$/m)![1];
    const importedNames = importLine.split(",").map((n) => n.trim());
    assert.equal(
      importedNames.includes("fetchQuestionBank"),
      false,
      `${file} must never import the general fetchQuestionBank() — it must only ever import fetchMockEligibleQuestionBank()`
    );
    assert.ok(importedNames.includes("fetchMockEligibleQuestionBank"), `${file} must import the firewalled retrieval function`);
  }
});

test("5b. Programme Increment 008E: the canonical Mock Exam entry point no longer touches lib/ali/questionBank at all -- it migrated to the secure 008D/072 RPC engine entirely, a strictly stronger guarantee than the client-side eligibility filter this decision originally required", () => {
  const file = "app/learning-intelligence/mock-exam/page.tsx";
  const src = readFileSync(file, "utf8");
  assert.ok(
    !/from\s*["']@\/lib\/ali\/questionBank["']/.test(src),
    `${file} must not import lib/ali/questionBank at all -- Mock content now flows exclusively through lib/mockAttempt/client.ts's SECURITY DEFINER RPC wrappers`
  );
  assert.match(src, /from\s*["']@\/lib\/mockAttempt\/client["']/, `${file} must source Mock content through the proven secure engine`);
  // Mathematics First Mock Form-Assembly Gate (Decision 161) — the page
  // no longer calls createMockAttempt() for attempt_type "full_mock":
  // migration 085 made mock_create_attempt() unconditionally reject it,
  // so the page now routes through the cycle-aware
  // createMockCycleAttempt() instead (via a discovered-or-started Mock
  // cycle, getOpenMockCycle()/startNewMockCycle()) — a correction onto
  // the existing, already-approved architecture, not a weaker guarantee.
  for (const requiredImport of [
    "getActiveMockForm",
    "getOpenMockCycle",
    "startNewMockCycle",
    "createMockCycleAttempt",
    "startMockAttempt",
    "getMockQuestion",
    "submitMockAnswer",
    "submitMockAttempt",
  ]) {
    assert.ok(new RegExp(`\\b${requiredImport}\\b`).test(src), `${file} must call ${requiredImport} from the secure engine`);
  }
  assert.ok(
    !/\bcreateMockAttempt\b/.test(src),
    `${file} must not call createMockAttempt() for a full_mock attempt -- migration 085 unconditionally rejects that attempt_type; createMockCycleAttempt() is the only correct path`
  );
});

test("6. Future non-zero Practice growth cannot alter Mock supply", async () => {
  const manyPracticeRows = Array.from({ length: 50 }, (_, i) => ({
    ...baseRow,
    id: `growth-${i}`,
    subject: "maths",
    pathway: ["csse"],
    eligibility_status: "practice_eligible",
    active: true,
  }));
  const oneMockRow = { ...baseRow, id: "m1", subject: "maths", pathway: ["csse"], eligibility_status: "mock_eligible", active: true };
  const result = await fetchMockEligibleQuestionBank(fakeSupabase([...manyPracticeRows, oneMockRow]), "maths", "csse");
  assert.deepEqual(result.map((q) => q.id), ["m1"], "adding 50 practice_eligible rows must not change Mock supply by even one row");
});

test("7. Subject filtering cannot bypass Mock eligibility", async () => {
  const rows = [
    { ...baseRow, id: "eng-mock", subject: "english", pathway: ["csse"], eligibility_status: "mock_eligible", active: true },
    { ...baseRow, id: "maths-practice", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true },
  ];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result, [], "a mock_eligible row for a different subject must not leak into another subject's Mock retrieval, and a practice_eligible row must not be returned regardless of subject match");
});

test("8. Mock content selection cannot call the general Practice fetcher indirectly", async () => {
  // fetchMockEligibleQuestionBank must be independently implemented, never
  // delegating to fetchQuestionBank internally (which would reintroduce the
  // exact defect this decision closes). Proven by behavioural contrast: the
  // same fixture returns different results from each function.
  const rows = [{ ...baseRow, id: "contrast", subject: "maths", pathway: ["csse"], eligibility_status: "practice_eligible", active: true }];
  const mockResult = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  const practiceResult = await fetchQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(mockResult, [], "Mock retrieval must reject the practice_eligible row");
  assert.equal(practiceResult.length, 1, "Practice retrieval correctly accepts it -- proving the two functions behave differently, not that one delegates to the other");
});

test("regression: active=false rows never enter Mock even if mock_eligible", async () => {
  const rows = [{ ...baseRow, id: "retired", subject: "maths", pathway: ["csse"], eligibility_status: "mock_eligible", active: false }];
  const result = await fetchMockEligibleQuestionBank(fakeSupabase(rows), "maths", "csse");
  assert.deepEqual(result, [], "a retired (active=false) row must never enter Mock, even if it carries mock_eligible");
});

test("Gate 3 Closure Wave, Defect D — retired maths/english adaptive routes redirect to their CSSE-scoped successors and no longer fetch content", () => {
  const cases: [string, string][] = [
    ["app/mocks/adaptive/maths/page.tsx", "/learning-intelligence/practice/mathematics"],
    ["app/mocks/adaptive/english/page.tsx", "/learning-intelligence/practice/reading-comprehension"],
  ];
  for (const [file, target] of cases) {
    const src = readFileSync(file, "utf8");
    assert.match(
      src,
      new RegExp(`router\\.replace\\(["']${target.replace(/\//g, "\\/")}["']\\)`),
      `${file} must redirect to ${target}`
    );
    assert.ok(
      !/from\s*["']@\/lib\/ali\/questionBank["']/.test(src),
      `${file} is retired and must no longer fetch content from lib/ali/questionBank at all`
    );
  }
});

test("Gate 3 Closure Wave, Defect D — vocabulary route resolves the learner's real pathway and no longer hardcodes 'gl' or silently substitutes synthetic content", () => {
  const file = "app/mocks/adaptive/vocabulary/page.tsx";
  const src = readFileSync(file, "utf8");
  assert.ok(
    !/fetchMockEligibleQuestionBank\(supabase,\s*"vocabulary",\s*"gl"\)/.test(src),
    `${file} must not hardcode pathway "gl"`
  );
  assert.match(src, /getSelectedPathwayId/, `${file} must resolve the learner's real selected pathway`);
  assert.ok(
    !/from\s*["']@\/data\/ali\/vocabularySyntheticFixture["']/.test(src),
    `${file} must no longer import the synthetic fixture it used to silently fall back to`
  );
});
