import { LEARNER_HEADER } from "./learnerContext";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server API routes act for the caller by forwarding the caller's own JWT
 * into an anon-key Supabase client. With several learners per account the
 * caller's ACTIVE learner must travel with it, so the database resolves the
 * same child the browser is showing. The value is only a hint: it is
 * shape-checked here and then ownership-VALIDATED by
 * public.current_learner_id() -- a forged or foreign id makes the RPC
 * refuse; it can never select someone else's learner.
 */
export function forwardedLearnerHeaders(request: { headers: { get(name: string): string | null } }): Record<string, string> {
  const raw = request.headers.get(LEARNER_HEADER);
  return raw && UUID.test(raw.trim()) ? { [LEARNER_HEADER]: raw.trim() } : {};
}
