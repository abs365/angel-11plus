import { test } from "node:test";
import assert from "node:assert/strict";
import { requestReadingScoring, logReadingScoringRequestOutcome, type ReadingScoringRequestOutcome } from "@/lib/mockAttempt/readingScoringRequest";

/**
 * Founder invocation-reliability repair (Programme Completion Increment
 * 016), Part A — real behavioural coverage for requestReadingScoring(),
 * not source-text-only: this is exactly the function the Founder's own
 * investigation found silently discarding every non-network failure, so
 * proving its new contract needs an actual mocked fetch/session, not a
 * regex over the source. No test framework beyond node:test/assert exists
 * in this repository (confirmed via package.json before writing this
 * file) — fetch and console.warn are saved/restored manually per test.
 */

function fakeSupabase(token: string | null) {
  return {
    auth: {
      getSession: async () => ({ data: { session: token ? { access_token: token } : null } }),
    },
  } as unknown as Parameters<typeof requestReadingScoring>[0];
}

function withMockedFetch<T>(impl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

test("requestReadingScoring resolves { ok: true } for a genuine HTTP success, and supplies exactly the attemptId in the body", async () => {
  let capturedBody: unknown;
  let capturedAuth: string | null = null;
  await withMockedFetch(
    (async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null;
      capturedAuth = (init?.headers as Record<string, string>)?.Authorization ?? null;
      return new Response(JSON.stringify({ status: "scored" }), { status: 200 });
    }) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase("real-token"), "attempt-1");
      assert.deepEqual(outcome, { ok: true, status: 200 });
    }
  );
  assert.deepEqual(capturedBody, { attemptId: "attempt-1" });
  assert.equal(capturedAuth, "Bearer real-token");
});

test("requestReadingScoring detects a non-2xx response instead of discarding it, and extracts a bounded reason from the route's own error field", async () => {
  await withMockedFetch(
    (async () => new Response(JSON.stringify({ error: "Attempt is not submitted." }), { status: 409 })) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase("token"), "attempt-2");
      assert.deepEqual(outcome, { ok: false, status: 409, reason: "Attempt is not submitted." });
    }
  );
});

test("requestReadingScoring falls back to a bounded http_<status> reason when the failure body is missing or unparsable", async () => {
  await withMockedFetch(
    (async () => new Response("not json", { status: 502 })) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase("token"), "attempt-3");
      assert.deepEqual(outcome, { ok: false, status: 502, reason: "http_502" });
    }
  );
});

test("requestReadingScoring truncates an oversized error field to the bounded reason length -- never an unbounded server string", async () => {
  const longError = "x".repeat(5000);
  await withMockedFetch(
    (async () => new Response(JSON.stringify({ error: longError }), { status: 500 })) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase("token"), "attempt-4");
      assert.equal(outcome.ok, false);
      assert.ok(!outcome.ok && outcome.reason.length <= 120);
    }
  );
});

test("requestReadingScoring resolves a typed network-error outcome (never throws) when fetch itself rejects", async () => {
  await withMockedFetch(
    (async () => {
      throw new Error("offline");
    }) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase("token"), "attempt-5");
      assert.deepEqual(outcome, { ok: false, status: null, reason: "network_error" });
    }
  );
});

test("requestReadingScoring never calls fetch when no session/token is available -- fails closed, not open", async () => {
  let fetchCalled = false;
  await withMockedFetch(
    (async () => {
      fetchCalled = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch,
    async () => {
      const outcome = await requestReadingScoring(fakeSupabase(null), "attempt-6");
      assert.deepEqual(outcome, { ok: false, status: null, reason: "no_session" });
    }
  );
  assert.equal(fetchCalled, false);
});

test("requestReadingScoring resolves a typed outcome for a null supabase client, never throws", async () => {
  const outcome = await requestReadingScoring(null, "attempt-7");
  assert.deepEqual(outcome, { ok: false, status: null, reason: "no_client" });
});

test("logReadingScoringRequestOutcome warns on failure and stays silent on success, without ever logging the token", () => {
  const original = console.warn;
  const calls: unknown[][] = [];
  console.warn = (...args: unknown[]) => { calls.push(args); };
  try {
    logReadingScoringRequestOutcome({ ok: true, status: 200 });
    assert.equal(calls.length, 0, "must not log anything on success");

    const failure: ReadingScoringRequestOutcome = { ok: false, status: 409, reason: "Attempt is not submitted." };
    logReadingScoringRequestOutcome(failure);
    assert.equal(calls.length, 1);
    const loggedText = calls[0].map((v) => String(v)).join(" ");
    assert.doesNotMatch(loggedText, /Bearer/i);
    assert.doesNotMatch(loggedText, /token/i);
  } finally {
    console.warn = original;
  }
});
