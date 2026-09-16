import { test } from "node:test";
import assert from "node:assert/strict";
import { applyManualMark } from "@/lib/mockAttempt/manualMarkRequest";

/**
 * CSSE Two-Paper Mock P1 Repair, English Full Mock assessment completion —
 * real behavioural coverage for applyManualMark(), mirroring
 * tests/lib/mockAttempt/readingScoringRequest.test.ts's own exact pattern
 * (mocked fetch/session, not source-text regex) for the identical reason:
 * this function's own contract (never discard a non-2xx, never throw,
 * never log/expose the token) is exactly what a real Founder action
 * depends on.
 */

function fakeSupabase(token: string | null) {
  return {
    auth: {
      getSession: async () => ({ data: { session: token ? { access_token: token } : null } }),
    },
  } as unknown as Parameters<typeof applyManualMark>[0];
}

function withMockedFetch<T>(impl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

test("applyManualMark resolves { ok: true } for a genuine HTTP success, and supplies exactly attemptId/questionId/marksAwarded in the body", async () => {
  let capturedBody: unknown;
  let capturedAuth: string | null = null;
  await withMockedFetch(
    (async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null;
      capturedAuth = (init?.headers as Record<string, string>)?.Authorization ?? null;
      return new Response(JSON.stringify({ status: "scoring", requiresManualMarkingCount: 4 }), { status: 200 });
    }) as typeof fetch,
    async () => {
      const outcome = await applyManualMark(fakeSupabase("real-token"), "attempt-1", "eng-inc002-roboticsfinal-q03", 0);
      assert.deepEqual(outcome, { ok: true, status: 200, requiresManualMarkingCount: 4 });
    }
  );
  assert.deepEqual(capturedBody, { attemptId: "attempt-1", questionId: "eng-inc002-roboticsfinal-q03", marksAwarded: 0 });
  assert.equal(capturedAuth, "Bearer real-token");
});

test("applyManualMark never awards a positive mark on its own initiative -- marksAwarded is passed through exactly, never defaulted or inferred", async () => {
  let capturedBody: unknown;
  await withMockedFetch(
    (async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null;
      return new Response(JSON.stringify({ status: "scoring" }), { status: 200 });
    }) as typeof fetch,
    async () => {
      await applyManualMark(fakeSupabase("token"), "attempt-1", "q-1", 0);
    }
  );
  assert.equal((capturedBody as { marksAwarded: number }).marksAwarded, 0);
});

test("applyManualMark surfaces a rejected mark (e.g. already resolved) as a bounded, categorised failure, not a thrown error", async () => {
  await withMockedFetch(
    (async () => new Response(JSON.stringify({ error: "mark_rejected" }), { status: 409 })) as typeof fetch,
    async () => {
      const outcome = await applyManualMark(fakeSupabase("token"), "attempt-1", "q-1", 0);
      assert.deepEqual(outcome, { ok: false, status: 409, reason: "mark_rejected" });
    }
  );
});

test("applyManualMark falls back to a bounded http_<status> reason when the failure body is missing or unparsable", async () => {
  await withMockedFetch(
    (async () => new Response("not json", { status: 502 })) as typeof fetch,
    async () => {
      const outcome = await applyManualMark(fakeSupabase("token"), "attempt-1", "q-1", 0);
      assert.deepEqual(outcome, { ok: false, status: 502, reason: "http_502" });
    }
  );
});

test("applyManualMark resolves a typed network-error outcome (never throws) when fetch itself rejects", async () => {
  await withMockedFetch(
    (async () => {
      throw new Error("offline");
    }) as typeof fetch,
    async () => {
      const outcome = await applyManualMark(fakeSupabase("token"), "attempt-1", "q-1", 0);
      assert.deepEqual(outcome, { ok: false, status: null, reason: "network_error" });
    }
  );
});

test("applyManualMark never calls fetch when no session/token is available -- fails closed, not open", async () => {
  let fetchCalled = false;
  await withMockedFetch(
    (async () => {
      fetchCalled = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch,
    async () => {
      const outcome = await applyManualMark(fakeSupabase(null), "attempt-1", "q-1", 0);
      assert.deepEqual(outcome, { ok: false, status: null, reason: "no_session" });
    }
  );
  assert.equal(fetchCalled, false);
});

test("applyManualMark resolves a typed outcome for a null supabase client, never throws", async () => {
  const outcome = await applyManualMark(null, "attempt-1", "q-1", 0);
  assert.deepEqual(outcome, { ok: false, status: null, reason: "no_client" });
});
