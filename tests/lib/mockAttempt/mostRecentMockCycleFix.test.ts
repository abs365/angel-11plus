import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getMostRecentMockCycle } from "@/lib/mockAttempt/client";

/**
 * CSSE Two-Paper Mock, final production acceptance — a real, live P1
 * defect found during the real-learner walkthrough: getOpenMockCycle()
 * deliberately returns null once both papers in a cycle are submitted
 * (mock_cycle_is_open(), migration 085, is designed to answer "can a
 * new cycle be started," not "does this learner have a recent sitting
 * worth showing") — so the sitting hub page rendered a genuinely
 * COMPLETE sitting as if nothing had been started at all. Fixed via a
 * direct, RLS-gated read of the caller's own most recent cycle
 * (ali_mock_cycle's own "read-your-own" policy, migration 085,
 * unconditioned on open/closed status), used as a fallback only when no
 * open cycle exists.
 */

function makeFakeSupabase(rows: { id: string; created_at: string }[]) {
  const calls: { table: string; op: string }[] = [];
  const fake = {
    from(table: string) {
      calls.push({ table, op: "from" });
      if (table !== "ali_mock_cycle") throw new Error(`fake supabase: unexpected table ${table}`);
      return {
        select: () => ({
          order: (col: string, opts: { ascending: boolean }) => ({
            limit: (n: number) => ({
              maybeSingle: () => {
                const sorted = [...rows].sort((a, b) =>
                  opts.ascending ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)
                );
                return Promise.resolve({ data: sorted.slice(0, n)[0] ?? null, error: null });
              },
            }),
          }),
        }),
      };
    },
  };
  return { fake, calls };
}

test("returns the most recent cycle id when one or more cycles exist, regardless of open/closed status", async () => {
  const { fake } = makeFakeSupabase([
    { id: "cycle-old", created_at: "2026-01-01T00:00:00Z" },
    { id: "cycle-new", created_at: "2026-02-01T00:00:00Z" },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getMostRecentMockCycle(fake as any);
  assert.equal(result.data, "cycle-new");
  assert.equal(result.error, null);
});

test("returns null (not an error) when the caller has no cycle at all", async () => {
  const { fake } = makeFakeSupabase([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getMostRecentMockCycle(fake as any);
  assert.equal(result.data, null);
  assert.equal(result.error, null);
});

test("the sitting hub page falls back to getMostRecentMockCycle only when getOpenMockCycle finds nothing, never overriding a real open cycle", () => {
  const source = fs.readFileSync("app/learning-intelligence/mock-exam/sitting/page.tsx", "utf8");
  assert.match(source, /import \{ getActiveMockForm, isMockFormAvailable, getOpenMockCycle, getMostRecentMockCycle, getMockCycleAttempts \}/);
  assert.match(source, /const cycleId = openCycle\.data \?\? \(await getMostRecentMockCycle\(supabase\)\)\.data;/);
});
