import { getSupabaseClient } from "@/lib/supabase";

/**
 * Thin client wrapper around migration 262's three household-PIN RPCs
 * (set_household_pin / verify_household_pin / household_pin_status). No PIN
 * is ever read, stored, or logged client-side beyond the single call that
 * sends it -- the database is the only place it is ever compared, and only
 * as a salted hash (see the migration's own header comment).
 */

export function friendlyPinError(message: string): string {
  if (/angel_household_requires_account/.test(message)) return "Please create an account or sign in first.";
  if (/angel_invalid_pin/.test(message)) return "Please enter 4 to 6 numbers.";
  if (/angel_not_authenticated/.test(message)) return "Please sign in again.";
  return "Sorry, something went wrong. Please try again.";
}

export async function setHouseholdPin(pin: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: friendlyPinError("") };
  const { error } = await supabase.rpc("set_household_pin", { p_pin: pin });
  if (error) return { ok: false, error: friendlyPinError(error.message) };
  return { ok: true };
}

export interface VerifyPinResult {
  ok: boolean;
  retryAt: string | null;
  error?: string;
}

export async function verifyHouseholdPin(pin: string): Promise<VerifyPinResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, retryAt: null, error: friendlyPinError("") };
  const { data, error } = await supabase.rpc("verify_household_pin", { p_pin: pin });
  if (error) return { ok: false, retryAt: null, error: friendlyPinError(error.message) };
  const row = Array.isArray(data) ? data[0] : data;
  return { ok: Boolean(row?.ok), retryAt: row?.retry_at ?? null };
}

export interface PinStatus {
  hasPin: boolean;
  retryAt: string | null;
}

export async function getHouseholdPinStatus(): Promise<PinStatus | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("household_pin_status");
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { hasPin: Boolean(row.has_pin), retryAt: row.retry_at ?? null };
}
