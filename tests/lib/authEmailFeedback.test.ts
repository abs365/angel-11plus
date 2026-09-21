import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  EMAIL_INVALID_MESSAGE,
  checkEmailCopy,
  friendlyEmailLinkError,
  isEmailSendingLimit,
  isPerAddressCooldown,
  validateEmailForAuth,
} from "@/lib/authEmailFeedback";

/**
 * Production defect (Founder, real /login): "Create account" appeared not to
 * work. Reproduced on production: empty email -> the submit button was
 * disabled (click does nothing, says nothing); malformed email -> only the
 * browser's own bubble; server errors -> raw wording or a misleading
 * "wait a minute". These pin every state to a visible, plain-language message.
 */

test("empty email is never silent: create and sign-in each get their own inline instruction", () => {
  assert.equal(validateEmailForAuth("", "create"), "Enter your email address to create your account.");
  assert.equal(validateEmailForAuth("   ", "create"), "Enter your email address to create your account.");
  assert.equal(validateEmailForAuth("", "signin"), "Enter your email address to get your sign-in link.");
});

test("malformed, spaced and throwaway/reserved-domain addresses get the understandable validation message", () => {
  for (const bad of ["not-an-email", "a@b", "a b@c.com", "@x.com", "x@.com", "parent@example.com", "kid@mailinator.com"]) {
    assert.equal(validateEmailForAuth(bad, "create"), EMAIL_INVALID_MESSAGE, `expected rejection: ${bad}`);
  }
});

test("a syntactically valid address (with surrounding spaces and any case) is accepted", () => {
  for (const good of ["parent@gmail.com", "  Parent.Name+angel@outlook.co.uk ", "a@b.io"]) {
    assert.equal(validateEmailForAuth(good, "create"), null, `expected acceptance: ${good}`);
  }
});

test("per-address cooldown is a genuine short wait; the project-level email limit is NOT presented as one", () => {
  const perAddress = "For security purposes, you can only request this after 47 seconds.";
  const projectLevel = "email rate limit exceeded";
  assert.equal(isPerAddressCooldown(perAddress), true);
  assert.equal(isEmailSendingLimit(perAddress), false);
  assert.equal(isEmailSendingLimit(projectLevel), true);

  const a = friendlyEmailLinkError(perAddress, "create");
  assert.equal(a.cooldownSeconds, 60);
  assert.match(a.message, /wait a minute/i);

  const b = friendlyEmailLinkError(projectLevel, "create");
  assert.equal(b.cooldownSeconds, 0, "must not lock the button for 60s when a minute does not help");
  assert.match(b.message, /about an hour|contact us/i);
  assert.doesNotMatch(b.message, /wait a minute/i);
});

test("server errors are translated: sign-ups closed, sending failure, network failure, unknown -- never raw service wording", () => {
  const cases: [string, RegExp][] = [
    ["Signups not allowed for otp", /New accounts can't be created/],
    ["Error sending confirmation email", /couldn't send your confirmation email/],
    ["Failed to fetch", /couldn't reach Angel 11\+/],
    ["Unable to validate email address: invalid format", /doesn't look right/],
    ["some brand new internal error 42", /couldn't send your confirmation email/],
  ];
  for (const [raw, expected] of cases) {
    const out = friendlyEmailLinkError(raw, "create");
    assert.match(out.message, expected, raw);
    assert.doesNotMatch(out.message, /otp|jwt|smtp|supabase|signups|rate.?limit|42/i, `raw wording leaked for: ${raw}`);
  }
  assert.match(friendlyEmailLinkError("boom", "signin").message, /sign-in link/);
});

test("success copy states what happened and what to do next, per journey", () => {
  const create = checkEmailCopy("create");
  assert.equal(create.title, "Check your email");
  assert.equal(create.lead, "We've sent you a secure link to confirm your Angel 11+ account.");
  assert.equal(create.next, "Open the email and tap the link to continue setting up your child.");
  const signin = checkEmailCopy("signin");
  assert.equal(signin.next, "Open the email and tap the link to sign in.");
});

const PAGE = fs.readFileSync("app/login/page.tsx", "utf8");

test("the real /login page: the submit buttons are no longer disabled by an empty box (the silent-dead-button defect)", () => {
  assert.doesNotMatch(PAGE, /disabled=\{[^}]*!email\.trim\(\)/);
  assert.doesNotMatch(PAGE, /disabled=\{[^}]*!password/);
  assert.match(PAGE, /disabled=\{magicLinkState === "sending" \|\| secondsLeft > 0\}/);
});

test("the real /login page: forms opt out of native validation so OUR inline messages always show", () => {
  assert.equal((PAGE.match(/noValidate/g) ?? []).length, 2);
});

test("the real /login page: validation, error mapping and success copy come from the shared tested module", () => {
  assert.match(PAGE, /validateEmailForAuth\(email, tab\)/);
  assert.match(PAGE, /friendlyEmailLinkError\(error, tab\)/);
  assert.match(PAGE, /checkEmailCopy\(linkIntent\)/);
  assert.doesNotMatch(PAGE, /setMagicLinkError\(error\)/, "raw service errors must never be shown");
});

test("Create account still uses the existing email-link mechanism only: no new auth system, no password", () => {
  assert.match(PAGE, /await signInWithMagicLink\(email\.trim\(\)\);/);
  assert.doesNotMatch(PAGE, /supabase\.auth\./);
  assert.doesNotMatch(PAGE, /signUp\(/);
});

test("returning sign-in paths are intact: password submit, forgot password, email-link alternative", () => {
  assert.match(PAGE, /await signInWithPassword\(email\.trim\(\), password\);/);
  assert.match(PAGE, /router\.push\("\/reset-password"\)/);
  assert.match(PAGE, /Email me a sign-in link/);
  assert.match(PAGE, /Please enter your password\./);
});
