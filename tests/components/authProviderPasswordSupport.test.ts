import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Returning-user access improvement — email/password sign-in added
 * alongside the existing magic-link method (never replacing it), using
 * only Supabase Auth's own governed mechanisms
 * (signInWithPassword/resetPasswordForEmail/updateUser). This project has
 * no jsdom/React Testing Library, so this mirrors the established
 * convention for a provider/page file: structural source-text assertions
 * against the real source.
 */

const SOURCE = fs.readFileSync("components/providers/AuthProvider.tsx", "utf8");

test("signInWithPassword calls Supabase's own signInWithPassword -- never a custom password check", () => {
  assert.match(SOURCE, /supabase\.auth\.signInWithPassword\(\{ email, password \}\)/);
});

test("sendPasswordResetEmail calls Supabase's own resetPasswordForEmail, redirecting back to /reset-password", () => {
  assert.match(SOURCE, /supabase\.auth\.resetPasswordForEmail\(email, \{/);
  assert.match(SOURCE, /\$\{window\.location\.origin\}\/reset-password/);
});

test("updatePassword calls Supabase's own updateUser -- never a custom password store, never plaintext storage", () => {
  assert.match(SOURCE, /supabase\.auth\.updateUser\(\{ password: newPassword \}\)/);
  assert.doesNotMatch(SOURCE, /\.from\(["']profiles["']\)[\s\S]{0,80}password/i, "password must never be written to the profiles table or any application table");
});

test("updatePassword ends the recovery session on success -- it must never silently continue on as the ongoing authenticated session", () => {
  const block = SOURCE.slice(SOURCE.indexOf("const updatePassword"), SOURCE.indexOf("const signOut ="));
  assert.match(block, /await supabase\.auth\.signOut\(\);/);
  assert.match(block, /clearLearnerContext\(\);/);
  // The signOut must happen after the update succeeds (below the error check), not before it.
  const errorCheckIndex = block.indexOf("if (error) return");
  const signOutIndex = block.indexOf("supabase.auth.signOut()");
  assert.ok(errorCheckIndex > -1 && signOutIndex > errorCheckIndex, "signOut must run only after a successful password update, not before the error check");
});

test("isPasswordRecovery is derived only from the real PASSWORD_RECOVERY auth event, never a client-guessed flag", () => {
  assert.match(SOURCE, /setIsPasswordRecovery\(event === "PASSWORD_RECOVERY"\)/);
});

test("the existing magic-link sign-in method is completely unchanged by this addition", () => {
  assert.match(SOURCE, /supabase\.auth\.signInWithOtp\(\{/);
  assert.match(SOURCE, /emailRedirectTo:\s*\n\s*typeof window !== "undefined"\s*\n\s*\? `\$\{window\.location\.origin\}\/dashboard`/);
});

test("the existing profile-linking/anonymous-bootstrap logic is untouched -- no new branch added to it for password sign-in", () => {
  assert.match(SOURCE, /linkAuthToDeviceProfile\(newSession\.user\.id\)\.catch\(\(\) => \{\}\);/);
  assert.match(SOURCE, /ensureLearnerSession\(\)\.catch\(\(\) => \{\}\);/);
});

test("no new Supabase client, service-role key, or admin API is introduced -- every new method uses the same getSupabaseClient() singleton", () => {
  const newMethodsBlock = SOURCE.slice(SOURCE.indexOf("const signInWithPassword"), SOURCE.indexOf("const signOut ="));
  const clientCalls = newMethodsBlock.match(/getSupabaseClient\(\)/g) ?? [];
  assert.equal(clientCalls.length, 4, "expected exactly one getSupabaseClient() call per new method (signInWithPassword, signUpWithPassword, sendPasswordResetEmail, updatePassword)");
  assert.doesNotMatch(newMethodsBlock, /service_role|SUPABASE_SERVICE/i);
});

test("the context value exposes every new method and flag", () => {
  assert.match(SOURCE, /signInWithPassword,\s*\n\s*signUpWithPassword,\s*\n\s*sendPasswordResetEmail,\s*\n\s*updatePassword,\s*\n\s*isPasswordRecovery,/);
});

test("signUpWithPassword uses Supabase's own signUp() with an email-confirmation redirect to /dashboard; it never stores or logs the password", () => {
  const block = SOURCE.slice(SOURCE.indexOf("const signUpWithPassword"), SOURCE.indexOf("const sendPasswordResetEmail"));
  assert.match(block, /supabase\.auth\.signUp\(\{/);
  assert.match(block, /emailRedirectTo: typeof window !== "undefined" \? `\$\{window\.location\.origin\}\/dashboard` : undefined/);
  assert.doesNotMatch(block, /localStorage|sessionStorage|console\./, "the password must never be stored or logged");
  assert.doesNotMatch(block, /service_role|admin\./i);
});

test("an already-registered address is detected (Supabase returns a user with no identities, not an error): nothing is created and the parent is told", () => {
  const block = SOURCE.slice(SOURCE.indexOf("const signUpWithPassword"), SOURCE.indexOf("const sendPasswordResetEmail"));
  assert.match(block, /identities\.length === 0/);
});
