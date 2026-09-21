import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Parent authentication UX. /login offers the familiar model:
 *   NEW PARENT        Create account -> email + password + confirm -> confirm by email.
 *   RETURNING PARENT  Sign in        -> email + password.
 * with the secure email link kept as a clearly-labelled secondary option on both, and the reset flow as the way for
 * an existing (email-link) account to choose its first password. This project has no jsdom/React Testing Library,
 * so this mirrors the established convention for a page component: structural source-text assertions against the
 * real source, plus direct tests of the pure logic in lib/authEmailFeedback.ts and lib/loginRouting.ts.
 */

const SOURCE = fs.readFileSync("app/login/page.tsx", "utf8");
const ROUTING = fs.readFileSync("lib/loginRouting.ts", "utf8");
const PROVIDER = fs.readFileSync("components/providers/AuthProvider.tsx", "utf8");

// ------------------------------------------------------------------ the two journeys

test("both journeys are always visible as tabs: Create account and Sign in", () => {
  assert.match(SOURCE, /role="tablist"/);
  assert.match(SOURCE, /label: "Create account"/);
  assert.match(SOURCE, /label: "Sign in"/);
  assert.match(SOURCE, /New to Angel 11\+/);
  assert.match(SOURCE, /Already registered/);
});

test("RETURNING parent: the DEFAULT sign-in method is email + password (the email link is not the default)", () => {
  assert.match(SOURCE, /const \[signinUsesLink, setSigninUsesLink\] = useState\(false\);/);
  assert.match(SOURCE, /Enter your email address and password\./);
  assert.match(SOURCE, /autoComplete|"current-password"/);
  assert.match(SOURCE, /await signInWithPassword\(email\.trim\(\), password\);/);
  // switching tabs always returns to the password default
  assert.match(SOURCE, /setTab\(next\);\s*\n\s*setSigninUsesLink\(false\);\s*\n\s*setCreateUsesLink\(false\);/);
});

test("RETURNING parent: forgot-password, the email-link alternative and Create-an-account are all offered", () => {
  assert.match(SOURCE, /router\.push\("\/reset-password"\)/);
  assert.match(SOURCE, /Forgot password, or need to set one\?/);
  assert.match(SOURCE, /Email me a sign-in link instead/);
  assert.match(SOURCE, /New to Angel 11\+\?/);
  assert.match(SOURCE, /Create an account/);
  assert.match(SOURCE, /Welcome back/);
});

test("NEW parent: Create account is email + password + confirm, and registers through the provider's signUpWithPassword", () => {
  assert.match(SOURCE, /const \[createUsesLink, setCreateUsesLink\] = useState\(false\);/);
  assert.match(SOURCE, /"signup-password"/);
  assert.match(SOURCE, /"signup-confirm"/);
  assert.match(SOURCE, /"new-password"/);
  assert.match(SOURCE, /await signUpWithPassword\(email\.trim\(\), password\);/);
  assert.match(SOURCE, /validateNewPassword\(password, confirm\)/);
  assert.match(SOURCE, /Already registered\?/);
});

test("NEW parent: after registering they are told to check their email (the address must be confirmed) with the shared copy", () => {
  assert.match(SOURCE, /checkEmailCopyForPasswordSignup\(\)/);
  assert.match(SOURCE, /setSignupSent\(true\)/);
});

test("an already-registered address is reported, not silently 'created': the provider flags it and the page shows the friendly message", () => {
  assert.match(SOURCE, /if \(result\.alreadyRegistered\) return failPassword\(friendlySignUpError\("User already registered"\)\);/);
});

// ------------------------------------------------------------------ the secondary, passwordless option

test("the secure email link remains fully present as a SECONDARY option on both journeys", () => {
  assert.match(SOURCE, /await signInWithMagicLink\(email\.trim\(\), \{ createAccount: creating \}\);/);
  assert.match(SOURCE, /Prefer no password\? Create your account with an email link instead/);
  assert.match(SOURCE, /Email me a sign-in link/);
  assert.match(SOURCE, /Sign in with a password instead/);
  assert.match(SOURCE, /Choose a password instead/);
});

test("Sign in never creates an account: password sign-in cannot, and the email-link path asks for account creation ONLY from the Create tab", () => {
  assert.doesNotMatch(SOURCE, /supabase\.auth\./, "no direct Supabase call in the page");
  assert.match(SOURCE, /createAccount: creating/);
  assert.match(SOURCE, /const creating = tab === "create";/);
  assert.match(PROVIDER, /shouldCreateUser: options\?\.createAccount \?\? true/);
});

// ------------------------------------------------------------------ friendly behaviour (unchanged contract)

test("validation is visible: forms opt out of native validation, buttons are never disabled by an empty box", () => {
  assert.equal((SOURCE.match(/noValidate/g) ?? []).length, 3);
  assert.doesNotMatch(SOURCE, /disabled=\{[^}]*!email\.trim\(\)/);
  assert.doesNotMatch(SOURCE, /disabled=\{[^}]*!password/);
});

test("validation, error mapping and success copy come from the shared tested module, never raw service text", () => {
  assert.match(SOURCE, /friendlyPasswordSignInError\(error\)/);
  assert.match(SOURCE, /friendlySignUpError\(result\.error\)/);
  assert.match(SOURCE, /friendlyEmailLinkError\(error, tab\)/);
  assert.doesNotMatch(SOURCE, /setLinkError\(error\)|failPassword\(error\)|failPassword\(result\.error\)/);
});

test("no raw Supabase/technical jargon (OTP, JWT, provider, rate limit) is ever shown to the user", () => {
  const userFacingText = SOURCE.match(/>[^<{]*[a-zA-Z][^<{]*</g)?.join(" ") ?? "";
  for (const jargon of ["OTP", "JWT", "provider", "rate limit", "Supabase"]) {
    assert.doesNotMatch(userFacingText, new RegExp(jargon, "i"), `expected no user-facing "${jargon}" text`);
  }
});

test("a parent who never set a password is told plainly they do not need one", () => {
  assert.match(SOURCE, /Never set a password\? You don&apos;t need one/);
});

// ------------------------------------------------------------------ existing guarantees preserved

test("the existing Gate 3 isPermanentlyAuthenticated redirect predicate is completely unchanged (in lib/loginRouting.ts)", () => {
  assert.match(ROUTING, /export function isPermanentlyAuthenticated\(user: \{ is_anonymous\?: boolean \} \| null \| undefined\): boolean \{/);
  assert.match(ROUTING, /return Boolean\(user\) && !user!\.is_anonymous;/);
  assert.match(SOURCE, /if \(isPermanentlyAuthenticated\(user\)\) \{\s*\n\s*router\.replace\("\/dashboard"\);/);
});

test("the login page never offers a 'continue without signing in' skip CTA, and never routes to /dashboard from a button", () => {
  assert.doesNotMatch(SOURCE, /Continue without signing in/);
  assert.doesNotMatch(SOURCE, /router\.push\("\/dashboard"\)/);
});

test("the product name is never shortened to bare 'Angel' in visible login copy", () => {
  const userFacingText = SOURCE.match(/>[^<{]*[a-zA-Z][^<{]*</g)?.join(" ") ?? "";
  assert.doesNotMatch(userFacingText, /\bAngel\b(?!\s*(11\+|&))/);
});
