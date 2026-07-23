"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { getDeviceId, ensureProfile } from "@/lib/supabaseProgress";
import { ensureLearnerSession } from "@/lib/learnerIdentity";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: false,
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * After a user signs in (anonymously or via magic link), link their auth
 * user ID to an existing unowned device profile. Preserves all XP, scores
 * and completed lessons accumulated before real auth existed.
 *
 * ED-001 correction (2026-07-23): this now calls `claim_legacy_profile()`,
 * a narrowly-scoped SECURITY DEFINER function (migration 019), instead of
 * a raw client-side `.update()`. The previous approach relied entirely on
 * RLS to enforce "never claim an already-owned row" — under the new
 * `auth.uid() = auth_user_id` ownership policy, that raw update could
 * never succeed at all (an unowned row has `auth_user_id IS NULL`, and
 * `auth.uid() = NULL` is never true), which is exactly why the claim path
 * needs its own explicit, narrowly-scoped mechanism rather than being
 * expressible as a normal ownership policy. `ensureProfile()` also calls
 * the same RPC directly — this is best-effort duplicate coverage for the
 * auth-state-change path, not a second, different claim mechanism.
 */
async function linkAuthToDeviceProfile(authUserId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (existing) return; // Already linked — nothing to do

  const deviceId = getDeviceId();
  if (!deviceId) return;

  const { error } = await supabase.rpc("claim_legacy_profile", { p_device_id: deviceId });
  if (error) {
    console.warn("[Auth] claim_legacy_profile failed:", error.message);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Supabase not configured — app works fully anonymously
      setLoading(false);
      return;
    }

    // Load existing session on mount. If none exists, bootstrap a real,
    // verifiable anonymous Supabase Auth identity (ED-001 correction) —
    // this is the one place that decision gets made; every other module
    // that needs a learner id calls ensureLearnerSession()/ensureProfile()
    // rather than deciding this for itself.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (data.session?.user) {
        // Ensure profile exists and is linked — fire and forget
        ensureProfile().catch(() => {});
        linkAuthToDeviceProfile(data.session.user.id).catch(() => {});
      } else {
        ensureLearnerSession().catch(() => {});
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (newSession?.user) {
        ensureProfile().catch(() => {});
        linkAuthToDeviceProfile(newSession.user.id).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: "Supabase is not configured." };

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/dashboard`
              : undefined,
        },
      });

      if (error) return { error: error.message };
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithMagicLink, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
