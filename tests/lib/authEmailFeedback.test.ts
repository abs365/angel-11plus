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
  assert.equal(validateEmailForAuth("", "password"), "Enter your email address to sign in.");
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

test("Sign in with an unknown address says no account was found and points to Create account (it never creates one)", () => {
  const out = friendlyEmailLinkError("Signups not allowed for otp", "signin");
  assert.match(out.message, /couldn't find an Angel 11\+ account/);
  assert.match(out.message, /create an account/i);
  assert.doesNotMatch(out.message, /otp|signups/i);
});

test("success copy states what happened and what to do next, per journey", () => {
  const create = checkEmailCopy("create");
  assert.equal(create.title, "Check your email");
  assert.equal(create.lead, "We've sent you a secure link to confirm your Angel 11+ account.");
  assert.equal(create.next, "Open the email and tap the link to continue setting up your child.");
  const signin = checkEmailCopy("signin");
  assert.equal(signin.next, "Open the email and tap the link to sign in.");
});


// ---------------------------------------------------------------------------------------------------------------
// Password registration and password sign-in.
// ---------------------------------------------------------------------------------------------------------------

import {
  ALREADY_REGISTERED_MESSAGE,
  PASSWORD_MIN_LENGTH,
  checkEmailCopyForPasswordSignup,
  friendlyPasswordSignInError,
  friendlySignUpError,
  validateNewPassword,
} from "@/lib/authEmailFeedback";

test("a NEW password must be chosen, long enough, and confirmed (same minimum as the reset page)", () => {
  assert.equal(PASSWORD_MIN_LENGTH, 8);
  assert.equal(validateNewPassword("", ""), "Choose a password for your account.");
  assert.match(validateNewPassword("short", "short")!, /at least 8 characters/);
  assert.equal(validateNewPassword("long-enough-1", "long-enough-2"), "Those passwords don't match. Please check and try again.");
  assert.equal(validateNewPassword("long-enough-1", "long-enough-1"), null);
  assert.equal(fs.readFileSync("app/reset-password/page.tsx", "utf8").match(/MIN_PASSWORD_LENGTH = (\d+)/)?.[1], "8", "one rule everywhere");
});

test("registering with an address that already has an account tells the parent so, with the two routes in (never a raw error)", () => {
  assert.equal(friendlySignUpError("User already registered"), ALREADY_REGISTERED_MESSAGE);
  assert.equal(friendlySignUpError("A user with this email address has already been registered"), ALREADY_REGISTERED_MESSAGE);
  assert.match(ALREADY_REGISTERED_MESSAGE, /Sign in instead/);
  assert.match(ALREADY_REGISTERED_MESSAGE, /Forgot password/);
});

test("password registration errors are translated: weak password, limits, closed sign-ups, network, unknown -- never raw service wording", () => {
  const cases: [string, RegExp][] = [
    ["Password should be at least 6 characters", /too easy to guess/],
    ["Password is known to be weak and easy to guess", /too easy to guess/],
    ["email rate limit exceeded", /about an hour/],
    ["For security purposes, you can only request this after 30 seconds", /wait a minute/],
    ["Signups not allowed for this instance", /can't be created at the moment/],
    ["Failed to fetch", /couldn't reach Angel 11\+/],
    ["Unable to validate email address: invalid format", /doesn't look right/],
    ["some new internal error 5xx", /couldn't create your account just now/],
  ];
  for (const [raw, expected] of cases) {
    const msg = friendlySignUpError(raw);
    assert.match(msg, expected, raw);
    assert.doesNotMatch(msg, /supabase|jwt|otp|smtp|5xx|signups/i, `raw wording leaked for: ${raw}`);
  }
});

test("WRONG PASSWORD gives a friendly message that also covers the email-link parent who never set one", () => {
  const msg = friendlyPasswordSignInError("Invalid login credentials");
  assert.match(msg, /email and password don't match/);
  assert.match(msg, /signed up with an email link/);
  assert.match(msg, /Forgot password/);
  assert.match(msg, /sign-in link/);
  assert.doesNotMatch(msg, /Invalid login credentials/);
});

test("password sign-in errors: unconfirmed email, limits, network and unknown are all plain language", () => {
  assert.match(friendlyPasswordSignInError("Email not confirmed"), /confirm your email address first/);
  assert.match(friendlyPasswordSignInError("email rate limit exceeded"), /about an hour/);
  assert.match(friendlyPasswordSignInError("Failed to fetch"), /couldn't reach Angel 11\+/);
  assert.match(friendlyPasswordSignInError("kaboom"), /couldn't sign you in just now/);
});

test("password-registration success copy: check your email, confirm the account, then set up the child", () => {
  const c = checkEmailCopyForPasswordSignup();
  assert.equal(c.title, "Check your email");
  assert.equal(c.lead, "We've sent you a secure link to confirm your Angel 11+ account.");
  assert.match(c.next, /tap the link to finish creating your account/);
  assert.match(c.next, /set up your child/);
});

test("the email-link sign-in never creates an account (still shouldCreateUser:false via createAccount:false)", () => {
  const provider = fs.readFileSync("components/providers/AuthProvider.tsx", "utf8");
  assert.match(provider, /shouldCreateUser: options\?\.createAccount \?\? true/);
  assert.match(fs.readFileSync("app/login/page.tsx", "utf8"), /createAccount: creating/);
});
