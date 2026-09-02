import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchPracticeEligibleBankRow } from "@/lib/learningEngine/legacyPracticeEvidence";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Programme Completion Increment 004 (Founder-authorised integrity
 * correction) — regression tests for the eligibility-status gate added to
 * recordLegacyPracticeEvidence()'s own bank lookup, via the newly-extracted
 * fetchPracticeEligibleBankRow(). Uses a minimal stub Supabase client
 * (same pattern established in tests/lib/ali/recommendationOrchestrationRuntime.test.ts,
 * Gate 5) that simulates realistic Postgres/RLS filtering: a row is
 * returned by .maybeSingle() only if BOTH the id AND
 * eligibility_status = 'practice_eligible' filters match — exactly what
 * the real query construction in fetchPracticeEligibleBankRow requires.
 *
 * Directly proves the four scenarios the Founder's directive named:
 *   1. practice_eligible item  -> row IS returned (evidence recording may proceed)
 *   2. provisional item       -> row is NOT returned (no durable evidence)
 *   3. authentic_assessment_candidate item -> row is NOT returned
 *   4. unknown/nonexistent item -> row is NOT returned
 */

interface FixtureRow {
  id: string;
  skill: string;
  mastery_threshold: number;
  eligibility_status: string;
}

const FIXTURE_ROWS: FixtureRow[] = [
  { id: "fixture-practice-eligible", skill: "QT-RC-01", mastery_threshold: 2, eligibility_status: "practice_eligible" },
  { id: "fixture-provisional", skill: "QT-RC-01", mastery_threshold: 2, eligibility_status: "provisional" },
  { id: "fixture-candidate", skill: "QT-RC-01", mastery_threshold: 2, eligibility_status: "authentic_assessment_candidate" },
  // "fixture-unknown" deliberately has no row at all.
];

function makeStubClient(): SupabaseClient<Database> {
  return {
    from: (table: string) => {
      if (table !== "ali_question_bank") throw new Error(`unexpected table in stub: ${table}`);
      const filters: Record<string, string> = {};
      const builder = {
        select: () => builder,
        eq: (column: string, value: string) => {
          filters[column] = value;
          return builder;
        },
        maybeSingle: async () => {
          // Simulates the real WHERE clause: every applied .eq() filter
          // must match for a row to be returned -- exactly what Postgres
          // (and the RLS policy underneath it) would enforce.
          const match = FIXTURE_ROWS.find((row) =>
            Object.entries(filters).every(([col, val]) => (row as unknown as Record<string, string>)[col] === val)
          );
          if (!match) return { data: null, error: null };
          const { id, skill, mastery_threshold } = match;
          return { data: { id, skill, mastery_threshold }, error: null };
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
}

test("Scenario 1 -- a practice_eligible item is returned, so evidence recording may proceed", async () => {
  const client = makeStubClient();
  const result = await fetchPracticeEligibleBankRow(client, "fixture-practice-eligible");
  assert.equal(result.error, null);
  assert.ok(result.data, "expected the practice_eligible row to be returned");
  assert.equal(result.data!.id, "fixture-practice-eligible");
});

test("Scenario 2 -- a provisional item is NOT returned, so no durable evidence can be recorded for it", async () => {
  const client = makeStubClient();
  const result = await fetchPracticeEligibleBankRow(client, "fixture-provisional");
  assert.equal(result.error, null);
  assert.equal(result.data, null, "a provisional row must never be returned by the eligibility-gated lookup");
});

test("Scenario 3 -- an authentic_assessment_candidate item is NOT returned, so no durable evidence can be recorded for it", async () => {
  const client = makeStubClient();
  const result = await fetchPracticeEligibleBankRow(client, "fixture-candidate");
  assert.equal(result.error, null);
  assert.equal(result.data, null, "a candidate row must never be returned by the eligibility-gated lookup");
});

test("Scenario 4 -- an unknown/nonexistent item is NOT returned, so no durable evidence can be recorded for it", async () => {
  const client = makeStubClient();
  const result = await fetchPracticeEligibleBankRow(client, "fixture-unknown");
  assert.equal(result.error, null);
  assert.equal(result.data, null);
});

test("a null client (no-client state) returns null data without throwing, matching recordLegacyPracticeEvidence's own pre-check", async () => {
  const result = await fetchPracticeEligibleBankRow(null, "fixture-practice-eligible");
  assert.equal(result.data, null);
  assert.equal(result.error, null);
});

test("real production ids: wrt-003 is provisional in its own source migration, so it must NOT be returned by this gate even though its id genuinely exists in the bank", async () => {
  // Regression proof tied directly to this increment's own historical-impact
  // finding: migration 013 inserts wrt-003 with no eligibility_status set
  // (table default 'provisional'), and no later migration promotes it.
  const rowsIncludingWrt003 = [...FIXTURE_ROWS, { id: "wrt-003", skill: "QT-WC-01a", mastery_threshold: 3, eligibility_status: "provisional" }];
  const client = {
    from: (table: string) => {
      if (table !== "ali_question_bank") throw new Error(`unexpected table: ${table}`);
      const filters: Record<string, string> = {};
      const builder = {
        select: () => builder,
        eq: (column: string, value: string) => {
          filters[column] = value;
          return builder;
        },
        maybeSingle: async () => {
          const match = rowsIncludingWrt003.find((row) =>
            Object.entries(filters).every(([col, val]) => (row as unknown as Record<string, string>)[col] === val)
          );
          if (!match) return { data: null, error: null };
          const { id, skill, mastery_threshold } = match;
          return { data: { id, skill, mastery_threshold }, error: null };
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
  const result = await fetchPracticeEligibleBankRow(client, "wrt-003");
  assert.equal(result.data, null, "wrt-003, being provisional, must not be returned even though it genuinely exists in ali_question_bank");
});
