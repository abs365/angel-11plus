"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorState from "@/components/ErrorState";

type MagicLinkState = "idle" | "sending" | "sent" | "error";
type PasswordState = "idle" | "signing-in" | "error";
type Mode = "password" | "magic-link";

// Domains that are reserved for documentation or are well-known disposable services
const BLOCKED_DOMAINS = new Set([
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "test.net",
  "fake.com", "fake.org",
  "mailinator.com", "yopmail.com", "tempmail.com",
  "guerrillamail.com", "10minutemail.com", "trashmail.com",
  "sharklasers.com", "spam4.me", "dispostable.com",
]);

function validateEmail(raw: string): string | null {
  const email = raw.trim();
  if (/\s/.test(email)) return "Please enter a valid email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Please enter a valid email address";
  const domain = email.slice(email.indexOf("@") + 1).toLowerCase();
  if (BLOCKED_DOMAINS.has(domain)) return "Please enter a valid email address";
  return null;
}

function isRateLimitError(msg: string) {
  return /rate.?limit|only request this after/i.test(msg);
}

/**
 * Returning-user access improvement — the exact production defect that
 * prompted this page: a returning learner/parent had no reliable way in
 * to a permanent account beyond repeatedly requesting an email link, with
 * no explanation of why a second request was refused. Never surfaces
 * Supabase's own technical wording (OTP/JWT/rate limit/provider) — every
 * message here is written for a parent or child, in plain English.
 */
function friendlySignInError(msg: string): string {
  if (isRateLimitError(msg)) return "Please wait a minute before requesting another sign-in link.";
  if (/invalid login credentials/i.test(msg)) {
    return "That email and password don't match. Check them, or use “Forgot password?” below.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Please confirm your email address first. Check your inbox for our earlier email.";
  }
  return msg;
}

/**
 * Gate 3 production defect (this session) — extracted as a pure,
 * directly-testable predicate for the same reason
 * lib/learningEngine/practiceInteractionGuard.ts's
 * shouldRenderMisconceptionNote() is: this repository's test suite has
 * no DOM/React rendering harness, but the actual defect found live in
 * production was exactly this decision, not the surrounding JSX.
 *
 * Angel bootstraps a real, genuine Supabase Auth anonymous session
 * automatically the moment any page loads with none yet
 * (components/providers/AuthProvider.tsx, lib/learnerIdentity.ts's
 * ensureLearnerSession()) — a deliberate, desired part of anonymous-
 * first learning. That anonymous session is still a real `user` object
 * (`user.is_anonymous === true`, not null/undefined), so a bare
 * `Boolean(user)` check treats ANY session, anonymous or permanent, as
 * "already signed in" — making this page's own email magic-link form
 * unreachable for exactly the learner it exists for: someone who has
 * been using Angel anonymously and now wants to create their permanent
 * account. Only a genuinely permanent (non-anonymous) session should
 * redirect away from this page; an anonymous session, or no session at
 * all, must still reach the sign-in form.
 */
export function isPermanentlyAuthenticated(user: { is_anonymous?: boolean } | null | undefined): boolean {
  return Boolean(user) && !user!.is_anonymous;
}

const DEBOUNCE_MS = 2_000;

export default function LoginPage() {
  const { user, signInWithMagicLink, signInWithPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [magicLinkState, setMagicLinkState] = useState<MagicLinkState>("idle");
  const [magicLinkError, setMagicLinkError] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastMagicLinkSubmitRef = useRef(0);

  const [passwordState, setPasswordState] = useState<PasswordState>("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!rateLimitUntil) return;

    const id = setInterval(() => {
      const remaining = Math.ceil((rateLimitUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(id);
        setSecondsLeft(0);
        setRateLimitUntil(null);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [rateLimitUntil]);

  if (isPermanentlyAuthenticated(user)) {
    router.replace("/dashboard");
    return null;
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (magicLinkState === "error" && secondsLeft === 0) {
      setMagicLinkState("idle");
      setMagicLinkError("");
    }
    if (passwordState === "error") {
      setPasswordState("idle");
      setPasswordError("");
    }
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (passwordState === "signing-in") return;

    const validationError = validateEmail(email);
    if (validationError) {
      setPasswordState("error");
      setPasswordError(validationError);
      return;
    }
    if (!password) {
      setPasswordState("error");
      setPasswordError("Please enter your password.");
      return;
    }

    setPasswordState("signing-in");
    setPasswordError("");

    const { error } = await signInWithPassword(email.trim(), password);
    if (error) {
      setPasswordState("error");
      setPasswordError(friendlySignInError(error));
    }
    // On success, the auth state change updates `user` and the redirect
    // above takes over on the next render — nothing else to do here.
  }

  async function handleMagicLinkRequest(e: React.FormEvent) {
    e.preventDefault();
    if (secondsLeft > 0) return;

    const validationError = validateEmail(email);
    if (validationError) {
      setMagicLinkState("error");
      setMagicLinkError(validationError);
      return;
    }

    const now = Date.now();
    if (now - lastMagicLinkSubmitRef.current < DEBOUNCE_MS) return;
    lastMagicLinkSubmitRef.current = now;

    setMagicLinkState("sending");
    setMagicLinkError("");

    const { error } = await signInWithMagicLink(email.trim());

    if (error) {
      setMagicLinkState("error");
      if (isRateLimitError(error)) {
        setMagicLinkError("Please wait a minute before requesting another sign-in link.");
        const until = Date.now() + 60_000;
        setRateLimitUntil(until);
        setSecondsLeft(60);
      } else {
        setMagicLinkError(error);
      }
    } else {
      setMagicLinkState("sent");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Angel 11+</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Selective School Preparation</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {mode === "magic-link" && magicLinkState === "sent" ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                <CheckCircle size={26} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                We&apos;ve sent a secure sign-in link to{" "}
                <strong className="text-gray-700 dark:text-gray-300">{email}</strong>.
                Open the email and tap the link to sign in.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                No email? Check your spam folder, or{" "}
                <button
                  onClick={() => setMagicLinkState("idle")}
                  className="text-blue-600 font-medium underline underline-offset-2"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1 text-center">
                Continue your journey
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-8">
                Sign in to save progress across all your devices
              </p>

              {mode === "password" ? (
                <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        required
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordState === "error") { setPasswordState("idle"); setPasswordError(""); }
                        }}
                        placeholder="Your password"
                        autoComplete="current-password"
                        required
                        aria-describedby={passwordState === "error" ? "password-error" : undefined}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {passwordState === "error" && <ErrorState variant="banner" id="password-error" message={passwordError} />}

                  <button
                    type="submit"
                    disabled={passwordState === "signing-in" || !email.trim() || !password}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordState === "signing-in" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <button type="button" onClick={() => router.push("/reset-password")} className="text-blue-600 font-medium hover:underline">
                      Forgot password?
                    </button>
                    <button type="button" onClick={() => setMode("magic-link")} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      Email me a secure sign-in link
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleMagicLinkRequest} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="magic-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        id="magic-email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        required
                        aria-describedby={magicLinkState === "error" ? "magic-link-error" : undefined}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {magicLinkState === "error" && <ErrorState variant="banner" id="magic-link-error" message={magicLinkError} />}

                  <button
                    type="submit"
                    disabled={magicLinkState === "sending" || !email.trim() || secondsLeft > 0}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {magicLinkState === "sending" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending link…
                      </>
                    ) : secondsLeft > 0 ? (
                      `Try again in ${secondsLeft}s`
                    ) : (
                      <>
                        Send sign-in link
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                    No password needed. We&apos;ll email you a secure link.
                  </p>

                  <div className="text-center text-xs mt-1">
                    <button type="button" onClick={() => setMode("password")} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      Sign in with a password instead
                    </button>
                  </div>
                </form>
              )}

              {mode === "password" && (
                <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-6 leading-relaxed">
                  New here? Use &ldquo;Email me a secure sign-in link&rdquo; above to create your account.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
