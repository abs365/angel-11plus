"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getSupabaseClient } from "./supabase";

/**
 * Learner Identity Service — ARCH-001 minimum foundation / ED-001
 * permanent correction (2026-07-23).
 *
 * Single reusable entry point for "who is the current learner, as a real,
 * verifiable Supabase Auth identity." Replaces device_id as the security
 * ownership mechanism (device_id is client-supplied data RLS can never
 * verify — see ARCH-001). Every other module that needs an authenticated
 * user id (`lib/supabaseProgress.ts`'s `ensureProfile()`,
 * `components/providers/AuthProvider.tsx`) calls this — auth calls are not
 * scattered across pages.
 *
 * Uses Supabase's real `signInAnonymously()` — this creates a genuine row
 * in `auth.users` and issues a real, signed JWT with `role: authenticated`
 * and `is_anonymous: true`. RLS policies can verify this via `auth.uid()`;
 * they could never verify a client-supplied `device_id`.
 *
 * Requires "Allow anonymous sign-ins" to be enabled for this Supabase
 * project (Authentication > Sign In / Providers) — confirmed OFF in
 * production as of this correction. Enabling it is a separate,
 * project-configuration change, not something this code can do, and must
 * happen before this function will succeed against production.
 */

let inFlightSignIn: Promise<string | null> | null = null;

/**
 * Returns the current authenticated user's id, signing in anonymously if
 * no session exists yet. Concurrent callers (e.g. several components
 * mounting at once) share a single in-flight sign-in attempt rather than
 * each triggering their own — Supabase does not deduplicate concurrent
 * `signInAnonymously()` calls itself, so this guard is required to avoid
 * creating more than one anonymous `auth.users` row per page load.
 *
 * Returns null (never throws) if Supabase isn't configured or sign-in
 * fails — callers must treat null as "no identity available right now"
 * and must not fabricate a profile without it (ED-001 Work Package 2).
 *
 * `injectedClient` is test-support only — every real call site omits it
 * and gets the real singleton via getSupabaseClient(). Exists so this
 * function's actual decision logic (call signInAnonymously() only when no
 * session exists; dedupe concurrent attempts) can be tested directly
 * against a fake client, rather than left untestable behind the module
 * singleton the way several earlier lib/ali/* functions were.
 */
export async function ensureLearnerSession(
  injectedClient?: SupabaseClient<Database>
): Promise<string | null> {
  const supabase = injectedClient ?? getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  if (inFlightSignIn) return inFlightSignIn;

  inFlightSignIn = (async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn("[LearnerIdentity] signInAnonymously failed:", error.message);
        return null;
      }
      return data.user?.id ?? null;
    } finally {
      inFlightSignIn = null;
    }
  })();

  return inFlightSignIn;
}
