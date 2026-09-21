"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorState from "@/components/ErrorState";
import { resolveLoginTab, isPermanentlyAuthenticated, type LoginTab } from "@/lib/loginRouting";

type MagicLinkState = "idle" | "sending" | "sent" | "error";
type PasswordState = "idle" | "signing-in" | "error";
type Mode = "password" | "magic-link";
type Tab = LoginTab;


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


const DEBOUNCE_MS = 2_000;

const INPUT_CLASS =
  "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
const PRIMARY_BUTTON_CLASS =
  "flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const LABEL_CLASS =
  "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { user, signInWithMagicLink, signInWithPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(resolveLoginTab(searchParams.get("mode")));
  // Within the Sign in tab only: which method is showing.
  const [mode, setMode] = useState<Mode>("password");
  // Which journey the last email link was requested from (drives the
  // "Check your email" wording — confirm an account vs. sign in).
  const [linkIntent, setLinkIntent] = useState<Tab>("create");
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

  function selectTab(next: Tab) {
    setTab(next);
    setMode("password");
    setMagicLinkState("idle");
    setMagicLinkError("");
    setPasswordState("idle");
    setPasswordError("");
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

    setLinkIntent(tab);
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

  const showLinkForm = tab === "create" || mode === "magic-link";
  const creating = tab === "create";

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
          {showLinkForm && magicLinkState === "sent" ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                <CheckCircle size={26} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">Check your email</h2>
              {linkIntent === "create" ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  We&apos;ve sent a link to{" "}
                  <strong className="text-gray-700 dark:text-gray-300">{email}</strong> to confirm your account.
                  Open the email and tap the link. It brings you straight back to Angel 11+ to set up your child.
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  We&apos;ve sent a secure sign-in link to{" "}
                  <strong className="text-gray-700 dark:text-gray-300">{email}</strong>.
                  Open the email and tap the link to sign in.
                </p>
              )}
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
              {/* The two journeys, always visible: new parent vs. returning. */}
              <div role="tablist" aria-label="Create an account or sign in" className="grid grid-cols-2 gap-1 p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {(
                  [
                    { id: "create", eyebrow: "New to Angel 11+", label: "Create account" },
                    { id: "signin", eyebrow: "Already registered", label: "Sign in" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => selectTab(t.id)}
                    className={
                      tab === t.id
                        ? "rounded-xl px-2 py-2.5 bg-white dark:bg-gray-900 shadow-sm text-center"
                        : "rounded-xl px-2 py-2.5 text-center hover:bg-white/60 dark:hover:bg-gray-900/60 transition-colors"
                    }
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      {t.eyebrow}
                    </span>
                    <span
                      className={
                        tab === t.id
                          ? "block text-sm font-bold text-blue-700 dark:text-blue-400"
                          : "block text-sm font-semibold text-gray-600 dark:text-gray-300"
                      }
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1 text-center">
                {creating ? "Create your Angel 11+ account" : "Welcome back"}
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-6 leading-relaxed">
                {creating
                  ? "For parents and carers. No password needed."
                  : "Sign in to pick up where you left off, on any device."}
              </p>

              {showLinkForm ? (
                <form onSubmit={handleMagicLinkRequest} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="magic-email" className={LABEL_CLASS}>
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
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {magicLinkState === "error" && <ErrorState variant="banner" id="magic-link-error" message={magicLinkError} />}

                  <button
                    type="submit"
                    disabled={magicLinkState === "sending" || !email.trim() || secondsLeft > 0}
                    className={PRIMARY_BUTTON_CLASS}
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
                        {creating ? "Create account" : "Send sign-in link"}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {creating ? (
                    <ol className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed space-y-1 list-decimal pl-5 mt-1">
                      <li>Enter your email address.</li>
                      <li>We&apos;ll email you a secure link to confirm your account.</li>
                      <li>Tap the link, then set up your child.</li>
                    </ol>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                      No password needed. We&apos;ll email you a secure link.
                    </p>
                  )}

                  {!creating && (
                    <div className="text-center text-xs mt-1">
                      <button type="button" onClick={() => setMode("password")} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2">
                        Sign in with a password instead
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="email" className={LABEL_CLASS}>
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
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={LABEL_CLASS}>
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
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {passwordState === "error" && <ErrorState variant="banner" id="password-error" message={passwordError} />}

                  <button
                    type="submit"
                    disabled={passwordState === "signing-in" || !email.trim() || !password}
                    className={PRIMARY_BUTTON_CLASS}
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

                  <div className="text-xs mt-1">
                    <button type="button" onClick={() => router.push("/reset-password")} className="text-blue-600 font-medium hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  {/* Accounts made through Create account never ask the parent to
                      choose a password (Supabase stores a random temporary one nobody
                      knows), so this is a first-class path for a returning parent,
                      not a footnote. */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                      Signed up with an email link? You may not have a password.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode("magic-link")}
                      className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Email me a sign-in link
                    </button>
                  </div>
                </form>
              )}

              <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-6 leading-relaxed">
                {creating ? (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => selectTab("signin")} className="text-blue-600 font-medium underline underline-offset-2">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Angel 11+?{" "}
                    <button type="button" onClick={() => selectTab("create")} className="text-blue-600 font-medium underline underline-offset-2">
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
