/**
 * Login routing decisions, moved verbatim out of app/login/page.tsx (a Next.js
 * page file may only export the page; extra exports fail route type
 * validation under `next build --webpack`). No logic changed.
 */

export type LoginTab = "create" | "signin";

/**
 * Family #1 onboarding finding: a real parent sent to /login could not tell
 * how to register -- account creation was hidden behind a faint "Email me a
 * secure sign-in link" and a line of small print. The page now leads with
 * the two journeys a visitor actually has. Anyone arriving from a "Sign in"
 * link (?mode=signin) lands on the sign-in tab; everyone else, including
 * the beta invitation's bare /login, lands on Create account. Both journeys
 * use the same Supabase Auth calls as before -- Create account is the
 * existing email-link flow (which creates the account when the email is new
 * and signs in when it already exists, so it can never create a duplicate).
 */
export function resolveLoginTab(modeParam: string | null | undefined): LoginTab {
  return modeParam === "signin" ? "signin" : "create";
}

/**
 * Gate 3 production defect (this session) — extracted as a pure,
 * directly-testable predicate for the same reason
 * lib/learningEngine/practiceInteractionGuard.ts's
 * shouldRenderMisconceptionNote() is: this repository's test suite has
 * no DOM/React rendering harness, but the actual defect found live in
 * production was exactly this decision, not the surrounding JSX.
 *
 * Angel bootstraps a real, genuine Supabase Auth anonymous session
 * automatically the moment any page loads with none yet
 * (components/providers/AuthProvider.tsx, lib/learnerIdentity.ts's
 * ensureLearnerSession()) — a deliberate, desired part of anonymous-
 * first learning. That anonymous session is still a real `user` object
 * (`user.is_anonymous === true`, not null/undefined), so a bare
 * `Boolean(user)` check treats ANY session, anonymous or permanent, as
 * "already signed in" — making this page's own email magic-link form
 * unreachable for exactly the learner it exists for: someone who has
 * been using Angel anonymously and now wants to create their permanent
 * account. Only a genuinely permanent (non-anonymous) session should
 * redirect away from this page; an anonymous session, or no session at
 * all, must still reach the sign-in form.
 */
export function isPermanentlyAuthenticated(user: { is_anonymous?: boolean } | null | undefined): boolean {
  return Boolean(user) && !user!.is_anonymous;
}
