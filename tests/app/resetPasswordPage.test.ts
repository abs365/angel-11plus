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
  assert.match(SOURCE, /const showNewPasswordForm = isPasswordRecovery \|\| arrivedViaRecoveryLink;/);
  assert.match(SOURCE, /\{showNewPasswordForm \?/);
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
  const typeMatches = SOURCE.match(/type="password"/g) ?? [];
  const autoCompleteMatches = SOURCE.match(/autoComplete="new-password"/g) ?? [];
  assert.equal(typeMatches.length, 2, "expected exactly 2 type=\"password\" inputs (new + confirm)");
  assert.equal(autoCompleteMatches.length, 2, "expected exactly 2 autoComplete=\"new-password\" inputs");
});

test("a successful password update offers a path back into the app, never an automatic silent redirect that could hide the confirmation", () => {
  assert.match(SOURCE, /updateState === "saved"/);
  assert.match(SOURCE, /router\.push\("\/dashboard"\)/);
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
