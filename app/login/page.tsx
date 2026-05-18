"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

type State = "idle" | "sending" | "sent" | "error";

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
  // Reject spaces anywhere
  if (/\s/.test(email)) return "Please enter a valid email address";
  // Require local@domain.tld with TLD of at least 2 chars
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Please enter a valid email address";
  const domain = email.slice(email.indexOf("@") + 1).toLowerCase();
  if (BLOCKED_DOMAINS.has(domain)) return "Please enter a valid email address";
  return null;
}

function isRateLimitError(msg: string) {
  return /rate.?limit|only request this after/i.test(msg);
}

// Minimum gap between Supabase calls to prevent rapid-fire submissions
const DEBOUNCE_MS = 2_000;

export default function LoginPage() {
  const { user, signInWithMagicLink } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastSubmitRef = useRef(0);

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

  // Already signed in — go to dashboard
  if (user) {
    router.replace("/dashboard");
    return null;
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    // Clear validation / auth errors as the user edits; keep rate-limit countdown running
    if (state === "error" && secondsLeft === 0) {
      setState("idle");
      setErrorMsg("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (secondsLeft > 0) return;

    // Client-side validation — no debounce needed, no API call made
    const validationError = validateEmail(email);
    if (validationError) {
      setState("error");
      setErrorMsg(validationError);
      return;
    }

    // Debounce guard for actual Supabase requests
    const now = Date.now();
    if (now - lastSubmitRef.current < DEBOUNCE_MS) return;
    lastSubmitRef.current = now;

    setState("sending");
    setErrorMsg("");

    const { error } = await signInWithMagicLink(email.trim());

    if (error) {
      setState("error");
      if (isRateLimitError(error)) {
        setErrorMsg("Please wait 60 seconds before requesting another magic link.");
        const until = Date.now() + 60_000;
        setRateLimitUntil(until);
        setSecondsLeft(60);
      } else {
        setErrorMsg(error);
      }
    } else {
      setState("sent");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-200">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-gray-900 font-bold text-2xl">Angel 11+</h1>
          <p className="text-gray-400 text-sm mt-1">Selective School Preparation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {state === "sent" ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
                <CheckCircle size={26} className="text-green-600" />
              </div>
              <h2 className="text-gray-900 font-bold text-xl mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                We sent a magic link to{" "}
                <strong className="text-gray-700">{email}</strong>.
                Click the link in that email to sign in.
              </p>
              <p className="text-gray-400 text-xs">
                No email? Check your spam folder, or{" "}
                <button
                  onClick={() => setState("idle")}
                  className="text-purple-600 font-medium underline underline-offset-2"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-gray-900 font-bold text-xl mb-1 text-center">
                Continue your journey
              </h2>
              <p className="text-gray-400 text-sm text-center mb-8">
                Sign in to save progress across all your devices
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {state === "error" && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === "sending" || !email.trim() || secondsLeft > 0}
                  className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending link…
                    </>
                  ) : secondsLeft > 0 ? (
                    `Try again in ${secondsLeft}s`
                  ) : (
                    <>
                      Send magic link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-gray-400 text-xs text-center mt-6 leading-relaxed">
                No password needed. We&apos;ll email you a secure link.
                <br />
                No account? One will be created automatically.
              </p>
            </>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Continue without signing in →
          </button>
        </div>
      </div>
    </div>
  );
}
