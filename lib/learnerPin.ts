import { getSupabaseClient } from "@/lib/supabase";

/**
 * Thin client wrapper around migration 263's three learner-PIN RPCs
 * (set_learner_pin / verify_learner_pin / learner_pin_status). No PIN is
 * ever read, stored, or logged client-side beyond the single call that
 * sends it. verify_learner_pin's session_token is NOT the PIN -- an opaque
 * server-minted id the database uses to bind subsequent requests to the
 * verified learner (see migration 263's own header comment).
 */

export function friendlyLearnerPinError(message: string): string {
  if (/angel_learner_not_owned/.test(message)) return "This isn't one of your children's profiles.";
  if (/angel_invalid_pin/.test(message)) return "Please enter 4 to 6 numbers.";
  if (/angel_household_requires_account/.test(message)) return "Please create an account or sign in first.";
  if (/angel_not_authenticated/.test(message)) return "Please sign in again.";
  return "Sorry, something went wrong. Please try again.";
}

export async function setLearnerPin(learnerId: string, pin: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: friendlyLearnerPinError("") };
  const { error } = await supabase.rpc("set_learner_pin", { p_learner_id: learnerId, p_pin: pin });
  if (error) return { ok: false, error: friendlyLearnerPinError(error.message) };
  return { ok: true };
}

export interface VerifyLearnerPinResult {
  ok: boolean;
  retryAt: string | null;
  sessionToken: string | null;
  error?: string;
}

export async function verifyLearnerPin(learnerId: string, pin: string): Promise<VerifyLearnerPinResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, retryAt: null, sessionToken: null, error: friendlyLearnerPinError("") };
  const { data, error } = await supabase.rpc("verify_learner_pin", { p_learner_id: learnerId, p_pin: pin });
  if (error) return { ok: false, retryAt: null, sessionToken: null, error: friendlyLearnerPinError(error.message) };
  const row = Array.isArray(data) ? data[0] : data;
  return { ok: Boolean(row?.ok), retryAt: row?.retry_at ?? null, sessionToken: row?.session_token ?? null };
}

export interface LearnerPinStatus {
  hasPin: boolean;
  retryAt: string | null;
}

export async function getLearnerPinStatus(learnerId: string): Promise<LearnerPinStatus | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("learner_pin_status", { p_learner_id: learnerId });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { hasPin: Boolean(row.has_pin), retryAt: row.retry_at ?? null };
}
