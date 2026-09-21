/**
 * Controlled-beta policy (Founder decision, 2026-09-21): a REGISTERED PARENT ACCOUNT is required for the persistent
 * learner experience.
 *
 * Every visitor is silently given a real Supabase ANONYMOUS session (lib/learnerIdentity.ts) -- a technical identity
 * that some internal calls need. It is NOT a registered Angel 11+ parent account, and the interface must never
 * present it as one: no "Viewing: <child>", no account menu, no "Sign out". This module is the single place that
 * says which routes are learner surfaces and who counts as registered.
 *
 * Fail-closed by construction: a route is public only if it is named in PUBLIC_TOP_LEVEL_ROUTES. Anything else --
 * including a learner page added in the future -- is treated as a learner surface. A test enumerates app/ so a new
 * top-level route cannot slip in unclassified.
 */

/** A permanent (non-anonymous) Supabase user. An anonymous technical session is not a registered parent. */
export function hasRegisteredParentAccount(user: { is_anonymous?: boolean } | null | undefined): boolean {
  return Boolean(user) && !user!.is_anonymous;
}

/**
 * Top-level route segments that are intentionally public: informational pages, the sign-in/registration journey,
 * and the support forms. "" is the site root, which only redirects to /dashboard.
 * admin-beta has its own Founder-only gate (components/FounderOnlyGate.tsx) and is not a family surface.
 */
export const PUBLIC_TOP_LEVEL_ROUTES: readonly string[] = [
  "",
  "login",
  "reset-password",
  "getting-started",
  "privacy",
  "terms",
  "contact",
  "feedback",
  "feature-request",
  "report-bug",
  "testimonial",
  "beta",
  "beta-family",
  "angel-plus",
  "admin-beta",
];

/**
 * Top-level route segments that read or write a learner's profile, progress, recommendations, practice, Mock
 * evidence or the Parent Dashboard. Listed only so tests can prove every route in app/ is deliberately classified;
 * the runtime decision below does not depend on this list (unknown routes are gated).
 */
export const LEARNER_TOP_LEVEL_ROUTES: readonly string[] = [
  "add-child",
  "dashboard",
  "english",
  "learn",
  "learning-intelligence",
  "maths",
  "mock-test",
  "mocks",
  "non-verbal-reasoning",
  "numerical-reasoning",
  "pathways",
  "progress",
  "reasoning",
  "spatial-reasoning",
  "verbal-reasoning",
  "vocabulary",
  "writing",
];

function topLevelSegment(pathname: string): string {
  const first = (pathname || "/").split("?")[0].split("#")[0].split("/").filter(Boolean)[0] ?? "";
  return first.toLowerCase();
}

/** True for any page that must not show or record learner data without a registered parent account. */
export function isLearnerSurface(pathname: string): boolean {
  return !PUBLIC_TOP_LEVEL_ROUTES.includes(topLevelSegment(pathname));
}

export type AccessDecision = "allow" | "pending" | "require-account";

/**
 * What a route should render for the current session.
 * - public route            -> allow
 * - session still resolving -> pending (the learner surface is NOT mounted yet, so it makes no reads or writes)
 * - registered parent       -> allow
 * - anonymous / no session  -> require-account (sign-in / create-account panel; the learner surface never mounts)
 */
export function decideAccess(input: {
  pathname: string;
  loading: boolean;
  user: { is_anonymous?: boolean } | null | undefined;
}): AccessDecision {
  if (!isLearnerSurface(input.pathname)) return "allow";
  if (input.loading) return "pending";
  return hasRegisteredParentAccount(input.user) ? "allow" : "require-account";
}
