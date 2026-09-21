import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Returning-user access improvement — /login now offers email/password
 * sign-in as the primary route, with the existing magic-link method
 * demoted to a secondary, clearly-labelled option (never removed). This
 * project has no jsdom/React Testing Library, so this mirrors the
 * established convention for a page component: structural source-text
 * assertions against the real source.
 */

const SOURCE = fs.readFileSync("app/login/page.tsx", "utf8");

test("the secure email link is the DEFAULT sign-in method; password is a secondary option (Create account never asks the parent to choose a password)", () => {
  assert.match(SOURCE, /const \[mode, setMode\] = useState<Mode>\("magic-link"\);/);
  // Switching tabs always returns to the default, never to an unknown password.
  assert.match(SOURCE, /setTab\(next\);\s*\n\s*setMode\("magic-link"\);/);
});

test("password sign-in calls the AuthProvider's own signInWithPassword -- no direct supabase.auth call in this file", () => {
  assert.match(SOURCE, /const \{ user, signInWithMagicLink, signInWithPassword \} = useAuth\(\);/);
  assert.match(SOURCE, /await signInWithPassword\(email\.trim\(\), password\);/);
  assert.doesNotMatch(SOURCE, /supabase\.auth\./);
});

test("a 'Forgot password?' link routes to /reset-password", () => {
  assert.match(SOURCE, /router\.push\("\/reset-password"\)/);
});

test("the existing magic-link method remains fully present and reachable as a secondary option", () => {
  assert.match(SOURCE, /await signInWithMagicLink\(email\.trim\(\), \{ createAccount: tab === "create" \}\);/);
  assert.match(SOURCE, /Email me a sign-in link/);
  assert.match(SOURCE, /Sign in with it instead/);
});

test("no raw Supabase/technical jargon (OTP, JWT, provider, rate limit) is ever shown to the user", () => {
  const userFacingText = SOURCE.match(/>[^<{]*[a-zA-Z][^<{]*</g)?.join(" ") ?? "";
  for (const jargon of ["OTP", "JWT", "provider", "rate limit"]) {
    assert.doesNotMatch(userFacingText, new RegExp(jargon, "i"), `expected no user-facing "${jargon}" text`);
  }
});

test("friendlySignInError never surfaces Supabase's raw 'Invalid login credentials' wording unexplained", () => {
  const fn = SOURCE.match(/function friendlySignInError\([\s\S]*?\n\}/);
  assert.ok(fn);
  assert.match(fn![0], /invalid login credentials/i);
  assert.match(fn![0], /Forgot password/i);
});

test("the existing Gate 3 isPermanentlyAuthenticated redirect predicate is completely unchanged (now in lib/loginRouting.ts)", () => {
  const ROUTING = fs.readFileSync("lib/loginRouting.ts", "utf8");
  assert.match(ROUTING, /export function isPermanentlyAuthenticated\(user: \{ is_anonymous\?: boolean \} \| null \| undefined\): boolean \{/);
  assert.match(ROUTING, /return Boolean\(user\) && !user!\.is_anonymous;/);
});

/**
 * LR-03 Family #1 pre-launch defect A — real Founder production evidence:
 * a prominent "Continue without signing in" CTA sitting right next to the
 * sign-in form undermines the controlled beta's approved parent-led entry
 * path (parent/carer controls the account -> learner uses the experience).
 * The underlying anonymous-session capability itself is NOT removed --
 * AuthProvider's own automatic anonymous bootstrap (ensureLearnerSession(),
 * every page load with no session yet) is completely untouched, and remains
 * reachable by any page load regardless of this file -- only this one
 * explicit, on-the-nose invitation to skip sign-in is removed from the
 * sign-in page itself.
 */
test("the login page no longer offers an explicit 'continue without signing in' skip CTA", () => {
  assert.doesNotMatch(SOURCE, /Continue without signing in/);
});

test("router.push to /dashboard is no longer reachable from a button on this page (the skip CTA was its only use)", () => {
  assert.doesNotMatch(SOURCE, /router\.push\("\/dashboard"\)/);
});

test("copy for new users never claims password sign-in auto-creates an account -- only the email-link path does that", () => {
  assert.doesNotMatch(SOURCE, /sign in above[\s\S]{0,40}created automatically/i);
});

/**
 * Family #1 onboarding finding: a real parent could not tell how to
 * register -- the only registration path was a faint "Email me a secure
 * sign-in link" plus small print. Account creation is now a first-class,
 * always-visible journey alongside Sign in.
 */
test("both journeys are always visible as tabs: Create account and Sign in", () => {
  assert.match(SOURCE, /role="tablist"/);
  assert.match(SOURCE, /label: "Create account"/);
  assert.match(SOURCE, /label: "Sign in"/);
  assert.match(SOURCE, /New to Angel 11\+/);
  assert.match(SOURCE, /Already registered/);
});

test("Create account is the email-link flow underneath (same signInWithMagicLink call -- no second auth system, no duplicate accounts)", () => {
  assert.match(SOURCE, /showLinkForm = tab === "create" \|\| mode === "magic-link"/);
  assert.match(SOURCE, /We&apos;ll email you a secure link to confirm your account\./);
});

test("the old small-print registration hint is gone", () => {
  assert.doesNotMatch(SOURCE, /New here\?/);
  assert.doesNotMatch(SOURCE, /to create your account\./);
});

test("a parent who never set a password is told plainly they do not need one, from the password form", () => {
  assert.match(SOURCE, /Never set a password\? You don&apos;t need one\./);
});

/**
 * Returning-parent authentication clarity: Create account never asks the parent to choose a
 * password, so Sign in must not present an unknown password as the expected default. Sign in
 * leads with the email link, distinguishes itself from Create account in wording,
 * and (shouldCreateUser:false) can never silently create an account from a typo.
 */
test("Sign in and Create account are worded differently even though both use the email link underneath", () => {
  assert.match(SOURCE, /creating \? "Create account" : "Email me a sign-in link"/);
  assert.match(SOURCE, /we'll email you a secure link to sign in\. No password needed\./);
  assert.match(SOURCE, /We&apos;ll email you a secure link to confirm your account\./);
});

test("the password path stays available for accounts that have one, and can also be used to SET a first password (via reset)", () => {
  assert.match(SOURCE, /Forgot password, or need to set one\?/);
  assert.match(SOURCE, /await signInWithPassword\(email\.trim\(\), password\);/);
});

test("Sign in never creates an account: only the Create account tab asks for account creation", () => {
  assert.match(SOURCE, /createAccount: tab === "create"/);
  const provider = fs.readFileSync("components/providers/AuthProvider.tsx", "utf8");
  assert.match(provider, /shouldCreateUser: options\?\.createAccount \?\? true/);
});

test("the product name is never shortened to bare 'Angel' in visible login copy", () => {
  const userFacingText = SOURCE.match(/>[^<{]*[a-zA-Z][^<{]*</g)?.join(" ") ?? "";
  assert.doesNotMatch(userFacingText, /\bAngel\b(?!\s*(11\+|&))/);
});
