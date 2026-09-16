import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isPasswordRecoveryUrl } from "@/app/reset-password/page";

/**
 * Password recovery flow defect (real Founder production test) — proven
 * root cause: Supabase auth-js (installed version, confirmed directly
 * from node_modules/@supabase/auth-js/dist/module/GoTrueClient.js) fires
 * its PASSWORD_RECOVERY notification from inside a `setTimeout(...)`
 * inside `_initialize()`, itself a fire-and-forget promise chain kicked
 * off the moment the shared Supabase client singleton is first
 * constructed -- not synchronised with any specific React effect. A
 * genuine recovery link click was verified in production landing back on
 * the plain request-a-reset-link form, proving AuthProvider's own
 * onAuthStateChange listener can miss this one-time event.
 *
 * isPasswordRecoveryUrl() is the durable fix: a pure function reading the
 * recovery link's own non-secret `type=recovery` mode flag directly from
 * the URL (hash, for Supabase's default implicit flow -- confirmed via
 * the installed auth-js's own DEFAULT_OPTIONS.flowType), independent of
 * any event timing. Real behavioural tests, not source-text-only, since
 * this is a pure, directly-testable function -- same discipline as
 * app/login/page.tsx's own isPermanentlyAuthenticated().
 */

const SOURCE = fs.readFileSync("app/reset-password/page.tsx", "utf8");

test("a genuine implicit-flow recovery link (hash-based, Supabase's default flowType) is detected", () => {
  assert.equal(
    isPasswordRecoveryUrl("#access_token=abc123&refresh_token=def456&expires_in=3600&token_type=bearer&type=recovery", ""),
    true
  );
});

test("a query-string-based type=recovery is also detected (search takes precedence, matching Supabase's own parseParametersFromURL convention)", () => {
  assert.equal(isPasswordRecoveryUrl("", "?type=recovery"), true);
});

test("an ordinary magic-link sign-in callback (type=magiclink, or no type at all) is NOT treated as a recovery arrival", () => {
  assert.equal(isPasswordRecoveryUrl("#access_token=abc123&type=magiclink", ""), false);
  assert.equal(isPasswordRecoveryUrl("#access_token=abc123", ""), false);
});

test("a plain, ordinary visit to /reset-password with no hash or query at all is NOT treated as a recovery arrival", () => {
  assert.equal(isPasswordRecoveryUrl("", ""), false);
});

test("hash and search values are parsed identically whether or not a leading '#'/'?' is present", () => {
  assert.equal(isPasswordRecoveryUrl("type=recovery", ""), true);
  assert.equal(isPasswordRecoveryUrl("", "type=recovery"), true);
});

test("never reads or exposes the access token itself -- only the non-secret type flag is inspected", () => {
  const fn = SOURCE.match(/export function isPasswordRecoveryUrl\([\s\S]*?\n\}/);
  assert.ok(fn);
  assert.doesNotMatch(fn![0], /access_token/);
  assert.doesNotMatch(fn![0], /refresh_token/);
});

test("the durable check runs via a lazy useState initializer -- guaranteed to execute during this page's own first render, strictly before any effect", () => {
  assert.match(
    SOURCE,
    /const \[arrivedViaRecoveryLink\] = useState\(\s*\n\s*\(\) => typeof window !== "undefined" && isPasswordRecoveryUrl\(window\.location\.hash, window\.location\.search\)\s*\n\s*\);/
  );
});

test("AuthProvider's own isPasswordRecovery event-based signal is kept, not replaced -- this is additive reinforcement only", () => {
  assert.match(SOURCE, /const \{ isPasswordRecovery, sendPasswordResetEmail, updatePassword \} = useAuth\(\);/);
  assert.match(SOURCE, /isPasswordRecovery \|\| arrivedViaRecoveryLink/);
});
