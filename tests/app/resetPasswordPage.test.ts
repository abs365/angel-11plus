import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Returning-user access improvement — /reset-password, the smallest safe
 * implementation of Supabase Auth's own governed password-recovery flow.
 * This project has no jsdom/React Testing Library, so this mirrors the
 * established convention for a page component: structural source-text
 * assertions against the real source.
 */

const SOURCE = fs.readFileSync("app/reset-password/page.tsx", "utf8");

test("the page branches on AuthProvider's own isPasswordRecovery signal, durably reinforced by a direct URL check -- never a locally-invented replacement", () => {
  assert.match(SOURCE, /const \{ isPasswordRecovery, sendPasswordResetEmail, updatePassword \} = useAuth\(\);/);
  assert.match(SOURCE, /const showNewPasswordForm = \(isPasswordRecovery \|\| arrivedViaRecoveryLink\) && !wantsNewLink;/);
  assert.match(SOURCE, /showNewPasswordForm && !sessionLost \?/);
});

test("the request-a-reset-link form calls the AuthProvider's own sendPasswordResetEmail -- no direct supabase.auth call in this file", () => {
  assert.match(SOURCE, /await sendPasswordResetEmail\(trimmed\);/);
  assert.doesNotMatch(SOURCE, /supabase\.auth\./);
});

test("the choose-a-new-password form calls updatePassword, requires a minimum length, and requires the two fields to match", () => {
  assert.match(SOURCE, /await updatePassword\(newPassword\);/);
  assert.match(SOURCE, /newPassword\.length < MIN_PASSWORD_LENGTH/);
  assert.match(SOURCE, /newPassword !== confirmPassword/);
});

test("both password inputs use type=password and new-password autocomplete -- never rendered as plain text, never suggesting an existing password", () => {
  const typeMatches = SOURCE.match(/type=\{ptype\}/g) ?? [];
  assert.match(SOURCE, /const ptype = showPasswords \? "text" : "password";/, "masked by default, with an explicit show toggle");
  const autoCompleteMatches = SOURCE.match(/autoComplete="new-password"/g) ?? [];
  assert.equal(typeMatches.length, 2, "expected exactly 2 password-typed inputs (new + confirm)");
  assert.equal(autoCompleteMatches.length, 2, "expected exactly 2 autoComplete=\"new-password\" inputs");
});

test("a successful password update shows a confirmation and sends the parent to sign in fresh -- never straight into the account on the old recovery session", () => {
  assert.match(SOURCE, /updateState === "saved"/);
  assert.match(SOURCE, /router\.push\("\/login\?mode=signin"\)/);
  assert.doesNotMatch(SOURCE, /router\.push\("\/dashboard"\)/, "a successful password update must never route straight into the account -- the recovery session must end and the parent must sign in again");
});

test("no raw Supabase/technical jargon is ever shown to the user", () => {
  const userFacingText = SOURCE.match(/>[^<{]*[a-zA-Z][^<{]*</g)?.join(" ") ?? "";
  for (const jargon of ["OTP", "JWT", "provider", "rate limit", "Supabase"]) {
    assert.doesNotMatch(userFacingText, new RegExp(jargon, "i"), `expected no user-facing "${jargon}" text`);
  }
});

test("a link back to /login is always present", () => {
  assert.match(SOURCE, /href="\/login(\?mode=signin)?"/);
});

test("the recovery destination is a dedicated screen: exact copy, no email field, and the email form can never flash first", () => {
  assert.match(SOURCE, /Choose a new password/);
  assert.match(SOURCE, /Enter your new password below\./);
  assert.match(SOURCE, /New password/);
  assert.match(SOURCE, /Confirm new password/);
  assert.match(SOURCE, />\s*Reset password\s*<|"Reset password"/);
  assert.match(SOURCE, /arrival === null \?/, "nothing is chosen until the link has been read");
  const formStart = SOURCE.indexOf("Choose a new password");
  const formEnd = SOURCE.indexOf("This reset link can");
  assert.doesNotMatch(SOURCE.slice(formStart, formEnd), /reset-email|type="email"/);
});

test("success shows 'Password changed' with the exact message and a Sign in button", () => {
  assert.match(SOURCE, /Password changed/);
  assert.match(SOURCE, /Your password has been updated\. You can now sign in with your new password\./);
});

test("submission is disabled while saving; empty fields get a clear message rather than a silent block", () => {
  assert.match(SOURCE, /disabled=\{updateState === "saving"\}/);
  assert.match(SOURCE, /if \(updateState === "saving"\) return;/);
});

test("an expired/used link, or a lost recovery session, shows a safe message with a route to request another link", () => {
  assert.match(SOURCE, /This reset link can&apos;t be used/);
  assert.match(SOURCE, /Request a new link/);
  assert.match(SOURCE, /friendlyUpdatePasswordError\(error\)/);
  assert.doesNotMatch(SOURCE, /setUpdateError\(error\)/, "raw service wording must never reach the parent");
});

test("passwords are never logged or placed in a URL", () => {
  assert.doesNotMatch(SOURCE, /console\./);
  assert.doesNotMatch(SOURCE, /router\.(push|replace)\([^)]*(newPassword|confirmPassword)/);
});
