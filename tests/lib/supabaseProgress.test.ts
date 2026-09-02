import { test } from "node:test";
import assert from "node:assert/strict";
import { ensureProfile } from "@/lib/supabaseProgress";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Gate 3 production defect (this session): a brand-new authenticated
 * learner on a browser/device already bound to a DIFFERENT learner's
 * profile could not receive their own clean profile — the INSERT
 * collided on profiles_device_id_key (device_id UNIQUE, migration 001, a
 * relic of the pre-auth "one row per device" model that migration 019
 * never carried its own device_id-is-no-longer-ownership demotion
 * through to the schema). Confirmed from a real production console
 * error: "duplicate key value violates unique constraint
 * profiles_device_id_key".
 *
 * These tests exercise ensureProfile()'s own decision logic directly
 * against a fake Supabase client (the same injectedClient pattern
 * lib/learnerIdentity.ts's ensureLearnerSession() already established,
 * extended here for the same reason: this fix needs a real regression
 * test, not just a live-incident confirmation). They do NOT exercise the
 * database layer — claim_legacy_profile()'s own SQL decision logic
 * (including "safely claimable empty legacy profile" and "evidence-
 * bearing legacy profile refused") is covered separately by
 * scripts/verify-188-claim-legacy-profile-safety.sql (rollback-wrapped,
 * direct Postgres execution); RLS enforcement and live two-account
 * browser behaviour remain separate, not proven here.
 *
 * The claim_legacy_profile() RPC branch itself is not directly exercised
 * below either, for a narrower reason: getDeviceId() (lib/supabaseProgress.ts)
 * checks `typeof window === "undefined"` and returns "" outside a real
 * browser, which this Node test runner is — so `if (deviceId) { ...claim... }`
 * is always skipped here regardless of any configured claimResult. The
 * "evidence-bearing legacy profile refused → new clean profile" test
 * below still exercises the exact code shape that branch falls through
 * to either way (claimedId null/no error → proceed to INSERT), which is
 * the behaviour this fix actually changes.
 */

interface InsertResult {
  data: { id: string } | null;
  error: { code?: string; message: string } | null;
}

interface StubConfig {
  sessionUserId: string | null;
  existingProfileId?: string | null;
  claimResult?: { data: string | null; error: { message: string } | null };
  insertResults: InsertResult[];
}

function makeStubClient(cfg: StubConfig): { client: SupabaseClient<Database>; insertCallCount: () => number } {
  let insertCallIndex = 0;
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: cfg.sessionUserId ? { user: { id: cfg.sessionUserId } } : null },
      }),
      signInAnonymously: async () => ({
        data: { user: null },
        error: { message: "not exercised in this test — a real session is always supplied" },
      }),
    },
    rpc: async (fn: string) => {
      if (fn !== "claim_legacy_profile") throw new Error(`unexpected rpc: ${fn}`);
      return cfg.claimResult ?? { data: null, error: null };
    },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(`unexpected table: ${table}`);
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: cfg.existingProfileId ? { id: cfg.existingProfileId } : null,
              error: null,
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => {
              const result = cfg.insertResults[insertCallIndex] ?? {
                data: null,
                error: { message: "test misconfiguration: no insert result queued for this call" },
              };
              insertCallIndex += 1;
              return result;
            },
          }),
        }),
      };
    },
  } as unknown as SupabaseClient<Database>;
  return { client, insertCallCount: () => insertCallIndex };
}

test("ensureProfile: an existing owned profile resolves directly, no claim or insert attempted", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: "user-a",
    existingProfileId: "profile-a",
    insertResults: [],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, "profile-a");
  assert.equal(insertCallCount(), 0);
});

test("ensureProfile: an evidence-bearing legacy profile refused (migration 188) falls through to creating a new clean profile", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: "user-c",
    existingProfileId: null,
    claimResult: { data: null, error: null }, // migration 188's refusal shape: no error, just no match
    insertResults: [{ data: { id: "new-clean-profile" }, error: null }],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, "new-clean-profile");
  assert.equal(insertCallCount(), 1);
});

test("Gate 3 fix: a device_id collision on the first insert (same device, different learner's profile) retries once with a fresh device_id and succeeds", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: "user-d",
    existingProfileId: null,
    claimResult: { data: null, error: null },
    insertResults: [
      {
        data: null,
        error: { code: "23505", message: 'duplicate key value violates unique constraint "profiles_device_id_key"' },
      },
      { data: { id: "profile-on-retry" }, error: null },
    ],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, "profile-on-retry", "the second learner on this device must still receive their own clean profile, not null");
  assert.equal(insertCallCount(), 2, "exactly one retry, not a loop");
});

test("ensureProfile: a collision on auth_user_id (not device_id) is NOT retried — that is a different, unconfirmed scenario, not silently papered over", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: "user-e",
    existingProfileId: null,
    claimResult: { data: null, error: null },
    insertResults: [
      {
        data: null,
        error: { code: "23505", message: 'duplicate key value violates unique constraint "profiles_auth_user_id_key"' },
      },
    ],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, null);
  assert.equal(insertCallCount(), 1, "must not retry for a constraint this fix was never proven to address");
});

test("ensureProfile: a non-unique-violation insert error is not retried and returns null", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: "user-f",
    existingProfileId: null,
    claimResult: { data: null, error: null },
    insertResults: [{ data: null, error: { code: "42501", message: "permission denied for table profiles" } }],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, null);
  assert.equal(insertCallCount(), 1);
});

test("ensureProfile: no session at all (client misconfigured / signInAnonymously fails) returns null without attempting any profile lookup", async () => {
  const { client, insertCallCount } = makeStubClient({
    sessionUserId: null,
    insertResults: [],
  });
  const result = await ensureProfile("Angel", client);
  assert.equal(result, null);
  assert.equal(insertCallCount(), 0);
});
