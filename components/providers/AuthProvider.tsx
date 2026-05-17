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
 * After a user signs in, link their auth user ID to the existing device profile.
 * This preserves all XP, scores and completed lessons accumulated anonymously.
 */
async function linkAuthToDeviceProfile(authUserId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const deviceId = getDeviceId();
  if (!deviceId) return;

  // Check if there's already a profile for this auth user
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) return; // Already linked — nothing to do

  // Find the device profile and link auth user to it
  const { error } = await supabase
    .from("profiles")
    .update({ auth_user_id: authUserId })
    .eq("device_id", deviceId)
    .is("auth_user_id", null);

  if (error) {
    console.warn("[Auth] Failed to link auth user to device profile:", error.message);
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

    // Load existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (data.session?.user) {
        // Ensure profile exists and is linked — fire and forget
        ensureProfile().catch(() => {});
        linkAuthToDeviceProfile(data.session.user.id).catch(() => {});
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
