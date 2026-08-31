import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { areaHasPracticeContent } from "../../../lib/learningEngine/sessionGenerator";

/**
 * Decision 258 (Continuous Writing Practice Delivery Gap) regression coverage.
 *
 * Proven root cause: fetchQuestionBank() (lib/ali/questionBank.ts, corrected
 * Decision 152) admits ONLY eligibility_status = 'practice_eligible' rows.
 * All 7 real Continuous Writing QT-WC-01a prompts (migrations 098/153/167)
 * were inserted at 'authentic_assessment_candidate' and have since only ever
 * been promoted along the separate Mock-governance track (migrations
 * 103/160 move some to 'independently_validated') -- never onto the Practice
 * track. This is a governance/authorisation gap ("no practice_eligible
 * Writing content has ever been authorised"), not a code defect: the code
 * is behaving exactly as Decision 152 intentionally designed it to.
 *
 * areaHasPracticeContent() (lib/learningEngine/sessionGenerator.ts) is the
 * new, generic, live check this decision adds so the Practice area
 * SELECTOR page (one step before a session is ever generated) can present
 * an honest state instead of an apparently-available area that then
 * silently fails on entry -- reusing fetchQuestionBank()'s own real
 * eligibility filter, not a duplicated/parallel one.
 *
 * A minimal, dependency-free fake Postgrest-style query builder, copied
 * from this repo's own established pattern (tests/lib/ali/
 * mockContentFirewall.test.ts) so the REAL exported function is exercised
 * end-to-end against fetchQuestionBank(), not reimplemented.
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

const baseWritingRow = {
  subject: "writing",
  skill: "QT-WC-01a",
  pathway: ["csse"],
  content_difficulty: "hard",
  question_type: "open-response",
  estimated_time_seconds: 1500,
  prompt: { title: "t", prompt: "p", checklist: [], type: "descriptive" },
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
  family_id: "fam-1",
  provenance: "angel_original",
  active: true,
};

test("areaHasPracticeContent: reports false when Writing content exists but is only on the Mock-governance track (today's real production state)", async () => {
  const rows = [
    { ...baseWritingRow, id: "eng-inc003-writing-imaginedplace-01", eligibility_status: "authentic_assessment_candidate" },
    { ...baseWritingRow, id: "mock-writing-newplace-01", eligibility_status: "independently_validated" },
  ];
  const result = await areaHasPracticeContent(fakeSupabase(rows), "continuous-writing");
  assert.equal(result, false, "authentic_assessment_candidate/independently_validated rows must never count as Practice availability");
});

test("areaHasPracticeContent: reports true once real content is actually promoted to practice_eligible", async () => {
  const rows = [{ ...baseWritingRow, id: "eng-inc003-writing-imaginedplace-01", eligibility_status: "practice_eligible" }];
  const result = await areaHasPracticeContent(fakeSupabase(rows), "continuous-writing");
  assert.equal(result, true, "the check must reverse automatically the moment a Founder decision promotes real content onto the Practice track -- no hardcoded area exclusion");
});

test("areaHasPracticeContent: reports false for an area with zero rows at all", async () => {
  const result = await areaHasPracticeContent(fakeSupabase([]), "continuous-writing");
  assert.equal(result, false);
});

test("areaHasPracticeContent: reports false for an unrecognised area id (fails closed on an unknown area, never true)", async () => {
  const rows = [{ ...baseWritingRow, id: "x", eligibility_status: "practice_eligible" }];
  const result = await areaHasPracticeContent(fakeSupabase(rows), "not-a-real-area" as never);
  assert.equal(result, false);
});

test("areaHasPracticeContent: ignores practice_eligible rows that are not QT-tagged (mirrors generatePersonalisedSession's own 'tagged' filter exactly)", async () => {
  const rows = [{ ...baseWritingRow, id: "legacy-untagged", skill: "wrt-001", eligibility_status: "practice_eligible" }];
  const result = await areaHasPracticeContent(fakeSupabase(rows), "continuous-writing");
  assert.equal(result, false, "an untagged row must not be able to make an area falsely report as available");
});

test("areaHasPracticeContent: Reading Comprehension and Mathematics areas are unaffected by Writing's empty state (generic per-area check, not a global flag)", async () => {
  const rows = [
    { ...baseWritingRow, id: "r1", subject: "english", skill: "QT-RC-01", eligibility_status: "practice_eligible" },
  ];
  const readingResult = await areaHasPracticeContent(fakeSupabase(rows), "reading-comprehension");
  const writingResult = await areaHasPracticeContent(fakeSupabase(rows), "continuous-writing");
  assert.equal(readingResult, true);
  assert.equal(writingResult, false);
});

/**
 * This repo has no @testing-library/React-rendering infrastructure
 * (confirmed precedent: tests/components/mockAttempt/DataTableStimulus.test.ts)
 * -- structural source-level proof follows the same established convention
 * for the selector page's fail-closed rendering logic.
 */
const selectorSource = fs.readFileSync("app/learning-intelligence/practice/page.tsx", "utf8");

test("selector page: availability state starts empty, never pre-seeded as available", () => {
  assert.match(selectorSource, /useState<AreaAvailability>\(\{\}\)/);
});

test("selector page: an area only renders as a clickable Link when isAvailable === true; anything else (false OR still-unknown/undefined) renders the non-link 'being prepared'/checking card", () => {
  assert.match(selectorSource, /isAvailable !== true/);
});

test("selector page: the honest unavailable state is driven by the real areaHasPracticeContent() check, not a hardcoded area id", () => {
  assert.match(selectorSource, /areaHasPracticeContent\(supabase, area\.id\)/);
  assert.doesNotMatch(selectorSource, /area\.id === ["']continuous-writing["']/, "must not hardcode Writing specifically -- the fix must be generic per area");
});
