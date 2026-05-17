import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let _client: SupabaseClient<Database> | null = null;

/**
 * Extracts the Supabase project URL from a JWT anon key.
 * The JWT payload contains a `ref` field — the project reference slug.
 * Returns null if the JWT cannot be decoded or `ref` is missing.
 */
function urlFromJwt(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as Record<string, unknown>;
    const ref = decoded["ref"];
    if (typeof ref === "string" && ref.length > 0) {
      return `https://${ref}.supabase.co`;
    }
  } catch {
    // Malformed JWT — ignore
  }
  return null;
}

/**
 * Resolves the Supabase project URL from environment variables.
 * Accepts the standard https:// URL directly.
 * Falls back to deriving the URL from the anon key JWT if the URL field
 * contains a publishable key (sb_publishable_...) rather than a URL.
 */
function resolveProjectUrl(rawUrl: string, anonKey: string): string | null {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // URL field has a key value — derive URL from the JWT instead
  return urlFromJwt(anonKey);
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!rawUrl || !key) return null;

  const url = resolveProjectUrl(rawUrl, key);
  if (!url) return null;

  if (!_client) {
    _client = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
