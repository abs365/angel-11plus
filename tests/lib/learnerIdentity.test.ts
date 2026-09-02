import { test } from "node:test";
import assert from "node:assert/strict";
import { ensureLearnerSession } from "@/lib/learnerIdentity";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Gate 3 Identity / Evidence Isolation Correction — ensureLearnerSession()
 * is the one place this decision ("do we already have a real authenticated
 * identity, or do we need to bootstrap one?") gets made; every other
 * identity-consuming module (ensureProfile(), AuthProvider) calls it rather
 * than deciding for itself. Its own doc comment states this is exactly why
 * it accepts an injectedClient — this file is the test that comment
 * promised existed but did not, until this correction.
 *
 * This does not, and cannot, exercise claim_legacy_profile()'s own
 * database-level ownership decision (that requires a real Postgres
 * connection with RLS — see scripts/verify-188-claim-legacy-profile-
 * safety.sql, and the live two-account browser sequence, for that proof).
 * What this file proves is the narrower, genuinely unit-testable claim:
 * ensureLearnerSession() itself never fabricates or reuses an identity
 * incorrectly at the JS layer — an existing real session's own id is
 * always returned untouched, sign-in is invoked only when no session
 * exists, and concurrent callers never trigger more than one sign-in.
 */

function stubClient(opts: {
  sessionUserId?: string | null;
  signInUserId?: string | null;
  signInError?: string;
}): { client: SupabaseClient<Database>; signInCallCount: () => number } {
  let signInCalls = 0;
  const client = {
    auth: {
      getSession: async () => ({
        data: {
          session: opts.sessionUserId ? { user: { id: opts.sessionUserId } } : null,
        },
      }),
      signInAnonymously: async () => {
        signInCalls += 1;
        if (opts.signInError) {
          return { data: { user: null }, error: { message: opts.signInError } };
        }
        return { data: { user: opts.signInUserId ? { id: opts.signInUserId } : null }, error: null };
      },
    },
  } as unknown as SupabaseClient<Database>;
  return { client, signInCallCount: () => signInCalls };
}

test("ensureLearnerSession: an existing real session's own user id is returned, never a different or fabricated one", async () => {
  const { client, signInCallCount } = stubClient({ sessionUserId: "existing-real-user-id" });
  const result = await ensureLearnerSession(client);
  assert.equal(result, "existing-real-user-id");
  assert.equal(signInCallCount(), 0, "must not sign in anonymously when a real session already exists");
});

test("ensureLearnerSession: no existing session triggers exactly one anonymous sign-in, returning its own new id", async () => {
  const { client, signInCallCount } = stubClient({ sessionUserId: null, signInUserId: "new-anon-user-id" });
  const result = await ensureLearnerSession(client);
  assert.equal(result, "new-anon-user-id");
  assert.equal(signInCallCount(), 1);
});

test("ensureLearnerSession: concurrent callers with no session share one in-flight sign-in, never triggering a second", async () => {
  const { client, signInCallCount } = stubClient({ sessionUserId: null, signInUserId: "shared-anon-id" });
  const [a, b, c] = await Promise.all([
    ensureLearnerSession(client),
    ensureLearnerSession(client),
    ensureLearnerSession(client),
  ]);
  assert.equal(a, "shared-anon-id");
  assert.equal(b, "shared-anon-id");
  assert.equal(c, "shared-anon-id");
  assert.equal(signInCallCount(), 1, "three concurrent callers must dedupe into a single anonymous sign-in, never one auth.users row per caller");
});

test("ensureLearnerSession: a sign-in failure returns null rather than fabricating or reusing a stale identity", async () => {
  const { client } = stubClient({ sessionUserId: null, signInError: "network error" });
  const result = await ensureLearnerSession(client);
  assert.equal(result, null);
});
