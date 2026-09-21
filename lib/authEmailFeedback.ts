/**
 * Plain-language feedback for the /login email-link journeys (Create account
 * and "Email me a sign-in link"). Pure, so the exact decisions are directly
 * tested -- this repository has no DOM harness, and the production defect
 * this replaces lived in exactly these decisions.
 *
 * Production defect (Founder, real /login): "Create account" appeared not to
 * work. Reproduced on the real page: with the email box empty the submit
 * button was `disabled`, so a click did nothing at all and said nothing; a
 * malformed address was intercepted by the browser's own validation bubble
 * (our message never showed); and Supabase errors were shown raw or, for the
 * project-level email limit, as a misleading "wait a minute". Every state
 * below is now explicit and visible.
 */

export type EmailLinkIntent = "create" | "signin";
/** The password form has its own wording: it is not asking for an email link. */
export type EmailFieldIntent = EmailLinkIntent | "password";

// Domains that are reserved for documentation or are well-known disposable services
const BLOCKED_DOMAINS = new Set([
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "test.net",
  "fake.com", "fake.org",
  "mailinator.com", "yopmail.com", "tempmail.com",
  "guerrillamail.com", "10minutemail.com", "trashmail.com",
  "sharklasers.com", "spam4.me", "dispostable.com",
]);

export const EMAIL_INVALID_MESSAGE = "That email address doesn't look right. Please check it and try again.";

/** Returns the message to show, or null if the address is acceptable. Never silent on empty. */
export function validateEmailForAuth(raw: string, intent: EmailFieldIntent): string | null {
  const email = raw.trim();
  if (!email) {
    if (intent === "create") return "Enter your email address to create your account.";
    if (intent === "password") return "Enter your email address to sign in.";
    return "Enter your email address to get your sign-in link.";
  }
  if (/\s/.test(email)) return EMAIL_INVALID_MESSAGE;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return EMAIL_INVALID_MESSAGE;
  const domain = email.slice(email.indexOf("@") + 1).toLowerCase();
  if (BLOCKED_DOMAINS.has(domain)) return EMAIL_INVALID_MESSAGE;
  return null;
}

/** Per-address cooldown ("you can only request this after N seconds"): a short wait is the real remedy. */
export function isPerAddressCooldown(msg: string): boolean {
  return /only request this after|after \d+ seconds?/i.test(msg);
}

/** Project-level email sending limit: waiting a minute does NOT help, so never imply that it does. */
export function isEmailSendingLimit(msg: string): boolean {
  return /email rate limit|over_email_send_rate_limit/i.test(msg) && !isPerAddressCooldown(msg);
}

export interface EmailLinkFailure {
  message: string;
  /** Seconds to lock the button for, only where a short wait genuinely resolves it. */
  cooldownSeconds: number;
}

/**
 * Maps whatever the auth service returned to a message a parent can act on.
 * Never surfaces raw service wording (OTP/JWT/provider/rate limit/signups).
 */
export function friendlyEmailLinkError(msg: string, intent: EmailLinkIntent): EmailLinkFailure {
  if (isPerAddressCooldown(msg)) {
    return { message: "Please wait a minute before requesting another link.", cooldownSeconds: 60 };
  }
  if (isEmailSendingLimit(msg) || /rate.?limit|too many/i.test(msg)) {
    return {
      message:
        "We can't send any more emails for a little while. Please try again in about an hour, or contact us and we'll help you get in.",
      cooldownSeconds: 0,
    };
  }
  if (/signups? not allowed|signup.*disabled/i.test(msg)) {
    return {
      message: "New accounts can't be created at the moment. Please contact us and we'll help you get started.",
      cooldownSeconds: 0,
    };
  }
  if (/invalid|unable to validate email|email address.*not valid/i.test(msg)) {
    return { message: EMAIL_INVALID_MESSAGE, cooldownSeconds: 0 };
  }
  if (/failed to fetch|network|load failed|fetch/i.test(msg)) {
    return { message: "We couldn't reach Angel 11+. Please check your connection and try again.", cooldownSeconds: 0 };
  }
  return {
    message:
      intent === "create"
        ? "We couldn't send your confirmation email just now. Please try again in a moment."
        : "We couldn't send your sign-in link just now. Please try again in a moment.",
    cooldownSeconds: 0,
  };
}

/** Success copy shown after the link has been requested. */
export function checkEmailCopy(intent: EmailLinkIntent): { title: string; lead: string; next: string } {
  return intent === "create"
    ? {
        title: "Check your email",
        lead: "We've sent you a secure link to confirm your Angel 11+ account.",
        next: "Open the email and tap the link to continue setting up your child.",
      }
    : {
        title: "Check your email",
        lead: "We've sent you a secure sign-in link.",
        next: "Open the email and tap the link to sign in.",
      };
}
