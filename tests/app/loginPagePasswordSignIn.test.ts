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

test("password sign-in is the default mode", () => {
  assert.match(SOURCE, /const \[mode, setMode\] = useState<Mode>\("password"\);/);
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
  assert.match(SOURCE, /await signInWithMagicLink\(email\.trim\(\)\);/);
  assert.match(SOURCE, /Email me a secure sign-in link/);
  assert.match(SOURCE, /Sign in with a password instead/);
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

test("the existing Gate 3 isPermanentlyAuthenticated redirect predicate is completely unchanged", () => {
  assert.match(SOURCE, /export function isPermanentlyAuthenticated\(user: \{ is_anonymous\?: boolean \} \| null \| undefined\): boolean \{/);
  assert.match(SOURCE, /return Boolean\(user\) && !user!\.is_anonymous;/);
});

test("the 'continue without signing in' skip path remains present, unchanged", () => {
  assert.match(SOURCE, /Continue without signing in/);
  assert.match(SOURCE, /router\.push\("\/dashboard"\)/);
});

test("copy for new users never claims password sign-in auto-creates an account -- only the magic-link path does that", () => {
  assert.doesNotMatch(SOURCE, /sign in above.{0,40}created automatically/is);
  assert.match(SOURCE, /New here\?/);
});
