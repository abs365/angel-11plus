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
  /**
   * Returning-user access improvement — email/password sign-in, alongside
   * the existing magic-link method (never replacing it). Supabase Auth's
   * own "Email" provider already supports password sign-in for every
   * existing auth.users row; this calls the SAME account by email,
   * identically to signInWithMagicLink — no new user, no new profile, no
   * change to any existing profile/attempt/evidence ownership. A user who
   * has never set a password (every existing account today) gets the
   * exact governed Supabase error for that case, surfaced by the caller.
   */
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  /**
   * Sends Supabase's own governed password-recovery email. Never invents
   * a custom recovery mechanism — this is supabase.auth.resetPasswordForEmail(),
   * the same authority every other Supabase Auth app uses. The redirect
   * lands back on /reset-password, where a PASSWORD_RECOVERY auth event
   * (see isPasswordRecovery below) reveals the "choose a new password"
   * step.
   */
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  /**
   * Sets a new password on the CURRENT session only — valid only once a
   * genuine Supabase password-recovery session is active (isPasswordRecovery
   * true), exactly Supabase's own supported flow
   * (auth.updateUser({ password })). Never a custom password store, never
   * plaintext, never anywhere but Supabase Auth's own auth.users table.
   */
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  /**
   * True only between a PASSWORD_RECOVERY auth event and the next real
   * sign-in/sign-out — the one signal /reset-password needs to know
   * whether to show "choose a new password" (a real recovery session is
   * active) instead of the ordinary "email me a reset link" request form.
   * Never set by any other page or flow.
   */
  isPasswordRecovery: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: false,
  signInWithMagicLink: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  sendPasswordResetEmail: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  isPasswordRecovery: false,
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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

    // Listen for auth state changes (login, logout, token refresh). A
    // PASSWORD_RECOVERY event fires exactly once, the moment the browser
    // lands on the emailed recovery link's redirect URL with a genuine
    // recovery session already established by Supabase's own JS client
    // (detectSessionInUrl: true, lib/supabase.ts) — the one signal
    // /reset-password needs to show "choose a new password" instead of
    // the ordinary request form. Any later event (e.g. USER_UPDATED once
    // the new password is set) correctly clears it.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      setIsPasswordRecovery(event === "PASSWORD_RECOVERY");

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

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: "Supabase is not configured." };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    },
    []
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: "Supabase is not configured." };

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: "Supabase is not configured." };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
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
      value={{
        user,
        session,
        loading,
        signInWithMagicLink,
        signInWithPassword,
        sendPasswordResetEmail,
        updatePassword,
        isPasswordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
