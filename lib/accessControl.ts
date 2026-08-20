/**
 * Shared, pure state resolution for founder/admin-only route gating.
 * Extracted from app/admin-beta/page.tsx's existing checking → not-signed-in
 * → not-admin → admin state machine so it can be reused (FounderOnlyGate)
 * and unit-tested without rendering React. Not a new auth system — this
 * only decides which of the app's existing states applies; the actual
 * security boundary remains Supabase RLS + is_current_user_admin()
 * (migration 008), exactly as documented in app/admin-beta/page.tsx.
 */
export type GateAccess = "checking" | "not-signed-in" | "not-admin" | "admin";

export function resolveGateAccess(
  authLoading: boolean,
  user: unknown,
  isAdmin: boolean | null,
): GateAccess {
  if (authLoading) return "checking";
  if (!user) return "not-signed-in";
  if (isAdmin === null) return "checking";
  return isAdmin ? "admin" : "not-admin";
}
