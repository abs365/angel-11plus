/**
 * ED-001 permanent correction / ARCH-001 minimum identity foundation —
 * focused tests for the TypeScript-level orchestration logic.
 *
 * IMPORTANT SCOPE NOTE: several of the required test cases are genuinely
 * database/RLS-level guarantees (e.g. "learner cannot access another
 * profile", "already-owned profile cannot be claimed") that a JS-level
 * fake Supabase client cannot meaningfully prove — a fake does whatever
 * this script tells it to, it cannot enforce real Postgres RLS. Those
 * guarantees are verified live, against the real database, in Work
 * Package 8's production verification, not faked here. This script tests
 * exactly what IS honestly testable at this layer: the orchestration
 * logic in lib/learnerIdentity.ts and lib/supabaseProgress.ts.
 *
 * Run: npx tsx scripts/test-learner-identity.ts
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { ensureLearnerSession } from "@/lib/learnerIdentity";

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`pass: ${message}`);
  }
}

// ─── Minimal fake auth client ───────────────────────────────────────────

function makeFakeAuthClient(opts: {
  existingSession: { user: { id: string } } | null;
  signInDelayMs?: number;
  signInResult?: { userId: string | null; errorMessage?: string };
}) {
  let signInCallCount = 0;
  const client = {
    auth: {
      async getSession() {
        return { data: { session: opts.existingSession } };
      },
      async signInAnonymously() {
        signInCallCount++;
        if (opts.signInDelayMs) await new Promise((r) => setTimeout(r, opts.signInDelayMs));
        if (opts.signInResult?.errorMessage) {
          return { data: { user: null }, error: { message: opts.signInResult.errorMessage } };
        }
        return { data: { user: opts.signInResult?.userId ? { id: opts.signInResult.userId } : null }, error: null };
      },
    },
  };
  return { client: client as unknown as SupabaseClient<Database>, getSignInCallCount: () => signInCallCount };
}

async function run() {
  // 1. No session -> calls signInAnonymously() and returns the new user id.
  {
    const { client, getSignInCallCount } = makeFakeAuthClient({
      existingSession: null,
      signInResult: { userId: "new-anon-user-1" },
    });
    const result = await ensureLearnerSession(client);
    assert(result === "new-anon-user-1", "no session: returns the id signInAnonymously() produced");
    assert(getSignInCallCount() === 1, "no session: signInAnonymously() called exactly once");
  }

  // 2. Existing session -> reused, signInAnonymously() never called.
  {
    const { client, getSignInCallCount } = makeFakeAuthClient({
      existingSession: { user: { id: "existing-user-42" } },
      signInResult: { userId: "should-never-be-used" },
    });
    const result = await ensureLearnerSession(client);
    assert(result === "existing-user-42", "existing session: returns the existing user id");
    assert(getSignInCallCount() === 0, "existing session: signInAnonymously() never called");
  }

  // 3. Concurrent calls with no session -> only one signInAnonymously()
  // attempt, both callers receive the same result (duplicate-prevention).
  {
    const { client, getSignInCallCount } = makeFakeAuthClient({
      existingSession: null,
      signInDelayMs: 20,
      signInResult: { userId: "concurrent-anon-user" },
    });
    const [a, b] = await Promise.all([ensureLearnerSession(client), ensureLearnerSession(client)]);
    assert(a === "concurrent-anon-user" && b === "concurrent-anon-user", "concurrent calls: both resolve to the same identity");
    assert(getSignInCallCount() === 1, "concurrent calls: signInAnonymously() called exactly once, not twice");
  }

  // 4. signInAnonymously() failure -> null, not a thrown error, not a fabricated id.
  {
    const { client } = makeFakeAuthClient({
      existingSession: null,
      signInResult: { userId: null, errorMessage: "anonymous sign-ins are disabled" },
    });
    const result = await ensureLearnerSession(client);
    assert(result === null, "sign-in failure: returns null, never a fabricated identity");
  }

  // 5. No Supabase client configured at all -> null, not a throw.
  {
    const result = await ensureLearnerSession(null as unknown as SupabaseClient<Database> | undefined);
    // Passing `undefined` explicitly would fall through to the real
    // getSupabaseClient() singleton; passing an actual null client value
    // is what we want to exercise here — the `injectedClient ?? real`
    // fallback only triggers on `undefined`, so this directly tests the
    // `if (!supabase) return null;` guard with a "client" that is falsy.
    assert(result === null, "no client available: returns null, never throws");
  }

  console.log(`\n${failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`}`);
  console.log(
    "\nNOTE: RLS-enforced guarantees (a learner cannot read/update another profile; an already-owned legacy " +
      "profile cannot be re-claimed; a genuinely unowned legacy profile CAN be claimed exactly once) are database-" +
      "level behaviour this script cannot fake. These are verified live in Work Package 8 against the real " +
      "Supabase project, not simulated here — see ED-001/ARCH-001's production verification plan."
  );
  process.exit(failures === 0 ? 0 : 1);
}

run();
