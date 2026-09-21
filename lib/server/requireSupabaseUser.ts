import { createClient } from "@supabase/supabase-js";

/**
 * Server-side proof that a request comes from a real Supabase session (a permanent account OR the anonymous
 * session every visitor is given), verified against Supabase Auth itself -- never by trusting anything the
 * browser claims.
 *
 * Why this exists: /api/writing-feedback spends money on a third-party model and, unlike the four Mock routes
 * (which each demand and forward the caller's JWT), had no authentication at all, so anyone on the internet
 * could call it. Investigation 2026-09-21 proved this on production (an unauthenticated request reached the
 * route's own validation instead of being refused). It fails CLOSED: no token, a token Supabase rejects, or
 * missing server configuration all refuse the request.
 */

export type RequireUserResult =
  | { ok: true; userId: string; isAnonymous: boolean }
  | { ok: false; status: 401 | 503; error: string };

export type VerifyToken = (
  token: string
) => Promise<{ user: { id: string; is_anonymous?: boolean } | null; error: unknown }>;

function defaultVerifier(): VerifyToken | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !/^https?:\/\//i.test(url)) return null;
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return async (token) => {
    const { data, error } = await client.auth.getUser(token);
    return { user: data?.user ?? null, error };
  };
}

export async function requireSupabaseUser(
  authorization: string | null | undefined,
  verify: VerifyToken | null = defaultVerifier()
): Promise<RequireUserResult> {
  const match = /^Bearer\s+(\S+)$/i.exec((authorization ?? "").trim());
  if (!match) return { ok: false, status: 401, error: "unauthenticated" };
  if (!verify) return { ok: false, status: 503, error: "Smart feedback is temporarily unavailable." };

  try {
    const { user, error } = await verify(match[1]);
    if (error || !user?.id) return { ok: false, status: 401, error: "unauthenticated" };
    return { ok: true, userId: user.id, isAnonymous: Boolean(user.is_anonymous) };
  } catch {
    return { ok: false, status: 401, error: "unauthenticated" };
  }
}
