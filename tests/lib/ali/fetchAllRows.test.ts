import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { fetchAllRows, type PageResult } from "@/lib/ali/fetchAllRows";
import { fetchQuestionBank, fetchMockEligibleQuestionBank } from "@/lib/ali/questionBank";

/**
 * Question-bank reachability: PostgREST returns at most 1,000 rows per response (proven against production). These tests model that
 * server behaviour exactly (inclusive range, hard cap per response, optional exact count) and prove complete, duplicate-free, deterministic
 * retrieval far beyond 1,000 rows, including a 3,500-row inventory (the planned 3,000+ scale).
 */
type Row = { id: string; subject: string; skill: string; pathway: string[]; eligibility_status: string; active: boolean; provenance: string; content_difficulty: string };

function server(rows: Row[], cap: number, calls: { from: number; to: number; first: boolean }[] = []) {
  // A fresh builder (fresh state) per .from() call, like a real client: each page is an independent request.
  const newBuilder = () => {
    const state = { eq: [] as [string, unknown][], contains: [] as [string, unknown[]][], from: 0, to: Number.MAX_SAFE_INTEGER, wantCount: false, ordered: false };
    const b = {
      select: (_c?: string, o?: { count?: string }) => { state.wantCount = o?.count === "exact"; return b; },
      eq: (c: string, v: unknown) => { state.eq.push([c, v]); return b; },
      contains: (c: string, v: unknown[]) => { state.contains.push([c, v]); return b; },
      order: () => { state.ordered = true; return b; },
      range: (f: number, t: number) => { state.from = f; state.to = t; return b; },
      then: (resolve: (v: PageResult<Row>) => void) => {
        let out = rows.filter((r) => state.eq.every(([c, v]) => (r as unknown as Record<string, unknown>)[c] === v) && state.contains.every(([c, v]) => v.every((x) => ((r as unknown as Record<string, unknown>)[c] as unknown[]).includes(x))));
        if (state.ordered) out = [...out].sort((a, z) => (a.id < z.id ? -1 : a.id > z.id ? 1 : 0));
        const total = out.length;
        calls.push({ from: state.from, to: state.to, first: state.wantCount });
        // PostgREST: inclusive range, never more than `cap` rows in one response.
        resolve({ data: out.slice(state.from, Math.min(state.to + 1, state.from + cap)), error: null, count: state.wantCount ? total : null });
      },
    };
    return b;
  };
  return { from: () => newBuilder() } as unknown as SupabaseClient<Database>;
}
const mk = (n: number, over: Partial<Row> = {}): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `q-${String(i).padStart(5, "0")}`, subject: "maths", skill: "QT-MR-01", pathway: ["csse"], eligibility_status: "practice_eligible", active: true, provenance: "angel_original", content_difficulty: "medium", ...over }));

test("DEFECT MODEL: an unpaginated read of a 3,500-row inventory returns only 1,000 rows (what production did)", async () => {
  const rows = mk(3500);
  const naive = await new Promise<PageResult<Row>>((resolve) => (server(rows, 1000) as never as { from: () => { select: () => { then: (r: (v: PageResult<Row>) => void) => void } } }).from().select().then(resolve));
  assert.equal(naive.data!.length, 1000);
});

test("fetchQuestionBank returns the complete 3,500-row inventory, no duplicates, in deterministic id order", async () => {
  const rows = mk(3500);
  const calls: { from: number; to: number; first: boolean }[] = [];
  const out = await fetchQuestionBank(server(rows.slice().reverse(), 1000, calls), "maths", "csse");
  assert.equal(out.length, 3500);
  assert.equal(new Set(out.map((q) => q.id)).size, 3500);
  assert.deepEqual(out.map((q) => q.id), rows.map((r) => r.id), "deterministic id ordering, independent of storage order");
  assert.deepEqual(calls.map((c) => [c.from, c.to]), [[0, 999], [1000, 1999], [2000, 2999], [3000, 3999]]);
  assert.deepEqual(calls.map((c) => c.first), [true, false, false, false], "the exact count is requested on the first page only");
});

test("exact boundary sizes: 999, 1000, 1001, 2000, 3000 rows are all retrieved completely", async () => {
  for (const n of [0, 1, 999, 1000, 1001, 2000, 2001, 3000]) {
    const out = await fetchQuestionBank(server(mk(n), 1000), "maths", "csse");
    assert.equal(out.length, n, `n=${n}`);
  }
});

test("the production inventory shape: 955 Maths + 301 English + 8 Writing; each subject retrieved completely, filters respected", async () => {
  const rows = [...mk(955), ...mk(301, { subject: "english", id: undefined as never }).map((r, i) => ({ ...r, id: `e-${i}` })), ...mk(8, { subject: "writing" }).map((r, i) => ({ ...r, id: `w-${i}` })), ...mk(77).map((r, i) => ({ ...r, id: `m-${i}`, eligibility_status: "mock_eligible" }))];
  assert.equal((await fetchQuestionBank(server(rows, 1000), "maths", "csse")).length, 955, "mock_eligible rows never enter Practice");
  assert.equal((await fetchQuestionBank(server(rows, 1000), "english", "csse")).length, 301);
  assert.equal((await fetchQuestionBank(server(rows, 1000), "writing", "csse")).length, 8);
  assert.equal((await fetchMockEligibleQuestionBank(server(rows, 1000), "maths", "csse")).length, 77);
});

test("a server cap SMALLER than the page size can never make the loop skip rows", async () => {
  const out = await fetchQuestionBank(server(mk(2300), 400), "maths", "csse");
  assert.equal(out.length, 2300);
  assert.equal(new Set(out.map((q) => q.id)).size, 2300);
});

test("fetchAllRows: de-duplicates by key when rows shift between pages, and falls back to a short-page stop without a total", async () => {
  const pages: Row[][] = [mk(3).slice(0, 3), [mk(3)[2], ...mk(6).slice(3, 5)]];
  let i = 0;
  const out = await fetchAllRows<Row>(async () => ({ data: pages[i++] ?? [], error: null, count: null }), { pageSize: 3 });
  assert.deepEqual(out.data!.map((r) => r.id), ["q-00000", "q-00001", "q-00002", "q-00003", "q-00004"]);
});

test("fetchAllRows: any page error returns { data: null } (never a silently partial list)", async () => {
  let i = 0;
  const out = await fetchAllRows<Row>(async () => (i++ === 0 ? { data: mk(1000), error: null, count: 2500 } : { data: null, error: { message: "boom" } }));
  assert.equal(out.data, null);
  assert.equal(out.error!.message, "boom");
});

test("fetchAllRows: maxPages bounds a runaway loop", async () => {
  let calls = 0;
  await fetchAllRows<Row>(async () => ({ data: [{ ...mk(1)[0], id: `x-${calls++}` }], error: null, count: null }), { pageSize: 1, maxPages: 7 });
  assert.equal(calls, 7);
});

test("every unbounded question-bank read is paginated (source guard, so a new bulk read cannot silently reintroduce the 1,000-row ceiling)", () => {
  const files = [
    "lib/ali/questionBank.ts",
    "lib/learningEngine/activity.ts",
    "lib/learningEngine/evidence.ts",
    "lib/learningEngine/educationalIntelligenceService.ts",
    "lib/ali/persistence/competencyEvidence.ts",
    "lib/ali/persistence/educationalStateRuntime.ts",
    "lib/ali/persistence/recommendationRuntime.ts",
    "app/admin-beta/page.tsx",
  ];
  for (const f of files) {
    const s = fs.readFileSync(f, "utf8");
    assert.match(s, /fetchAllRows/, f);
    assert.match(s, /\.order\("id", \{ ascending: true \}\)/, `${f}: deterministic order`);
    assert.match(s, /\.range\(from, to\)/, `${f}: explicit range`);
    assert.match(s, /count: "exact"/, `${f}: exact count`);
  }
});
