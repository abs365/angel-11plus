"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorState from "@/components/ErrorState";
import {
  validateEmailForAuth,
  validateNewPassword,
  friendlyEmailLinkError,
  friendlySignUpError,
  friendlyPasswordSignInError,
  checkEmailCopy,
  checkEmailCopyForPasswordSignup,
  PASSWORD_MIN_LENGTH,
} from "@/lib/authEmailFeedback";
import { resolveLoginTab, isPermanentlyAuthenticated, type LoginTab } from "@/lib/loginRouting";

type LinkState = "idle" | "sending" | "sent" | "error";
type PasswordState = "idle" | "working" | "error";
type Tab = LoginTab;

/**
 * Parent authentication UX. Two journeys, both familiar:
 *   NEW PARENT       Create account -> email + password (+ confirm) -> confirm by email -> signed in.
 *   RETURNING PARENT Sign in        -> email + password.
 * The secure email link is a secondary, passwordless option on both. Every existing account keeps working:
 * accounts made through the email link hold a random temporary password nobody knows, so those parents use
 * "Forgot password?" (Supabase's own reset flow, /reset-password) to CHOOSE a password, or keep using the link.
 * Sign in never creates an account: password sign-in cannot, and the email-link sign-in passes shouldCreateUser:false.
 */

const DEBOUNCE_MS = 2_000;

const INPUT_CLASS =
  "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
const PRIMARY_BUTTON_CLASS =
  "flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const LABEL_CLASS =
  "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2";
const TEXT_LINK_CLASS = "text-blue-600 font-medium underline underline-offset-2";
const SUBTLE_LINK_CLASS =
  "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { user, signInWithMagicLink, signInWithPassword, signUpWithPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(resolveLoginTab(searchParams.get("mode")));
  // Which method each journey is showing. Password is the default for both; the email link is the secondary option.
  const [signinUsesLink, setSigninUsesLink] = useState(false);
  const [createUsesLink, setCreateUsesLink] = useState(false);
  // Which journey the last email was requested from (drives the "Check your email" wording).
  const [sentKind, setSentKind] = useState<"signin-link" | "create-link" | "create-password">("create-password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [linkState, setLinkState] = useState<LinkState>("idle");
  const [linkError, setLinkError] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastLinkSubmitRef = useRef(0);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [passwordState, setPasswordState] = useState<PasswordState>("idle");
  const [passwordError, setPasswordError] = useState("");
  const [signupSent, setSignupSent] = useState(false);

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

  const creating = tab === "create";
  const showLinkForm = creating ? createUsesLink : signinUsesLink;
  const linkSent = showLinkForm && linkState === "sent";

  function resetFeedback() {
    setLinkState("idle");
    setLinkError("");
    setPasswordState("idle");
    setPasswordError("");
    setSignupSent(false);
  }

  function selectTab(next: Tab) {
    setTab(next);
    setSigninUsesLink(false);
    setCreateUsesLink(false);
    resetFeedback();
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (linkState === "error" && secondsLeft === 0) {
      setLinkState("idle");
      setLinkError("");
    }
    if (passwordState === "error") {
      setPasswordState("idle");
      setPasswordError("");
    }
  }

  function clearPasswordError() {
    if (passwordState === "error") {
      setPasswordState("idle");
      setPasswordError("");
    }
  }

  function failPassword(message: string) {
    setPasswordState("error");
    setPasswordError(message);
  }

  // ---- RETURNING PARENT: email + password ----
  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (passwordState === "working") return;

    const emailError = validateEmailForAuth(email, "password");
    if (emailError) return failPassword(emailError);
    if (!password) return failPassword("Please enter your password.");

    setPasswordState("working");
    setPasswordError("");

    const { error } = await signInWithPassword(email.trim(), password);
    if (error) {
      failPassword(friendlyPasswordSignInError(error));
    }
    // On success the auth state change updates `user` and the redirect above takes over.
  }

  // ---- NEW PARENT: email + chosen password (+ confirm) ----
  async function handlePasswordSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (passwordState === "working") return;

    const emailError = validateEmailForAuth(email, "create");
    if (emailError) return failPassword(emailError);
    const passwordProblem = validateNewPassword(password, confirm);
    if (passwordProblem) return failPassword(passwordProblem);

    setPasswordState("working");
    setPasswordError("");

    const result = await signUpWithPassword(email.trim(), password);
    if (result.error) return failPassword(friendlySignUpError(result.error));
    if (result.alreadyRegistered) return failPassword(friendlySignUpError("User already registered"));
    if (result.signedIn) return; // auto-confirmed: the auth state change redirects to the dashboard
    setPasswordState("idle");
    setSentKind("create-password");
    setSignupSent(true);
  }

  // ---- Secondary: secure email link (Create account or Sign in) ----
  async function handleLinkRequest(e: React.FormEvent) {
    e.preventDefault();
    if (secondsLeft > 0) return;

    const validationError = validateEmailForAuth(email, tab);
    if (validationError) {
      setLinkState("error");
      setLinkError(validationError);
      emailInputRef.current?.focus();
      return;
    }

    const now = Date.now();
    if (now - lastLinkSubmitRef.current < DEBOUNCE_MS) return;
    lastLinkSubmitRef.current = now;

    setSentKind(creating ? "create-link" : "signin-link");
    setLinkState("sending");
    setLinkError("");

    const { error } = await signInWithMagicLink(email.trim(), { createAccount: creating });

    if (error) {
      setLinkState("error");
      const failure = friendlyEmailLinkError(error, tab);
      setLinkError(failure.message);
      if (failure.cooldownSeconds > 0) {
        setRateLimitUntil(Date.now() + failure.cooldownSeconds * 1000);
        setSecondsLeft(failure.cooldownSeconds);
      }
    } else {
      setLinkState("sent");
    }
  }

  const sentCopy =
    sentKind === "create-password" ? checkEmailCopyForPasswordSignup() : checkEmailCopy(sentKind === "create-link" ? "create" : "signin");
  const showSent = signupSent || linkSent;

  function emailField(id: string, ref?: React.Ref<HTMLInputElement>) {
    return (
      <div>
        <label htmlFor={id} className={LABEL_CLASS}>
          Email address
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id={id}
            ref={ref}
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
    );
  }

  function passwordField(id: string, label: string, value: string, set: (v: string) => void, autoComplete: string, placeholder: string) {
    return (
      <div>
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id={id}
            type="password"
            value={value}
            onChange={(e) => {
              set(e.target.value);
              clearPasswordError();
            }}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
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
          {showSent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                <CheckCircle size={26} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">{sentCopy.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">{sentCopy.lead}</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-1">
                Sent to <strong>{email}</strong>
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{sentCopy.next}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                No email? Check your spam folder, or{" "}
                <button
                  onClick={() => {
                    setLinkState("idle");
                    setSignupSent(false);
                  }}
                  className={TEXT_LINK_CLASS}
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
                  ? "For parents and carers. Choose a password, then confirm your email address."
                  : showLinkForm
                    ? "Enter your email and we'll email you a secure link to sign in. No password needed."
                    : "Enter your email address and password."}
              </p>

              {showLinkForm ? (
                /* ---------------- Secure email link (secondary, both journeys) ---------------- */
                <form onSubmit={handleLinkRequest} noValidate className="flex flex-col gap-4">
                  {emailField("magic-email", emailInputRef)}

                  {linkState === "error" && <ErrorState variant="banner" id="magic-link-error" message={linkError} />}

                  <button
                    type="submit"
                    disabled={linkState === "sending" || secondsLeft > 0}
                    className={PRIMARY_BUTTON_CLASS}
                  >
                    {linkState === "sending" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending link…
                      </>
                    ) : secondsLeft > 0 ? (
                      `Try again in ${secondsLeft}s`
                    ) : (
                      <>
                        {creating ? "Create account with an email link" : "Email me a sign-in link"}
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
                      Use the same email address you created your account with.
                    </p>
                  )}

                  <div className="text-center text-xs mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetFeedback();
                        if (creating) setCreateUsesLink(false);
                        else setSigninUsesLink(false);
                      }}
                      className={SUBTLE_LINK_CLASS}
                    >
                      {creating ? "Choose a password instead" : "Sign in with a password instead"}
                    </button>
                  </div>
                </form>
              ) : creating ? (
                /* ---------------- NEW PARENT: email + password + confirm ---------------- */
                <form onSubmit={handlePasswordSignUp} noValidate className="flex flex-col gap-4">
                  {emailField("signup-email")}
                  {passwordField("signup-password", "Password", password, setPassword, "new-password", `At least ${PASSWORD_MIN_LENGTH} characters`)}
                  {passwordField("signup-confirm", "Confirm password", confirm, setConfirm, "new-password", "Type it again")}

                  {passwordState === "error" && <ErrorState variant="banner" id="signup-error" message={passwordError} />}

                  <button type="submit" disabled={passwordState === "working"} className={PRIMARY_BUTTON_CLASS}>
                    {passwordState === "working" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetFeedback();
                        setCreateUsesLink(true);
                      }}
                      className={SUBTLE_LINK_CLASS}
                    >
                      Prefer no password? Create your account with an email link instead
                    </button>
                  </div>
                </form>
              ) : (
                /* ---------------- RETURNING PARENT: email + password ---------------- */
                <form onSubmit={handlePasswordSignIn} noValidate className="flex flex-col gap-4">
                  {emailField("email")}
                  {passwordField("password", "Password", password, setPassword, "current-password", "Your password")}

                  {passwordState === "error" && <ErrorState variant="banner" id="password-error" message={passwordError} />}

                  <button type="submit" disabled={passwordState === "working"} className={PRIMARY_BUTTON_CLASS}>
                    {passwordState === "working" ? (
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

                  <div className="flex flex-col items-start gap-2 text-xs mt-1">
                    <button type="button" onClick={() => router.push("/reset-password")} className="text-blue-600 font-medium hover:underline">
                      Forgot password, or need to set one?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetFeedback();
                        setSigninUsesLink(true);
                      }}
                      className={SUBTLE_LINK_CLASS}
                    >
                      Email me a sign-in link instead
                    </button>
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">
                    Never set a password? You don&apos;t need one: use the email link, or choose &ldquo;Forgot password&rdquo; to set one.
                  </p>
                </form>
              )}

              <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-6 leading-relaxed">
                {creating ? (
                  <>
                    Already registered?{" "}
                    <button type="button" onClick={() => selectTab("signin")} className={TEXT_LINK_CLASS}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Angel 11+?{" "}
                    <button type="button" onClick={() => selectTab("create")} className={TEXT_LINK_CLASS}>
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
