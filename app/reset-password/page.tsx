"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorState from "@/components/ErrorState";
import { passwordRecoveryArrival, type PasswordRecoveryArrival } from "@/lib/passwordRecoveryUrl";
import { friendlyPasswordResetError } from "@/lib/authEmailFeedback";

type RequestState = "idle" | "sending" | "sent" | "error";
type UpdateState = "idle" | "saving" | "saved" | "error";

const MIN_PASSWORD_LENGTH = 8;
// Service wording that means "this recovery session is no longer valid" (expired, used, or never established).
const SESSION_LOST = /session|expired|invalid.*token|not authenticated|jwt|claim|unauthori|forbidden|refresh token|token|anonymous/i;

function friendlyUpdatePasswordError(msg: string): string {
  if (SESSION_LOST.test(msg)) {
    return "This reset link has expired or has already been used. Please request a new one.";
  }
  if (/same.*password|different from the old/i.test(msg)) return "Please choose a password you haven't used before.";
  if (/weak|at least|characters|short/i.test(msg)) return `Please choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (/failed to fetch|network|load failed/i.test(msg)) return "We couldn't reach Angel 11+. Please check your connection and try again.";
  return "We couldn't change your password just now. Please try again.";
}

// The link's flags are read from the URL once on the client and latched: Supabase strips the hash after it
// establishes the session, so a later re-read would wrongly look like an ordinary visit.
let latchedArrival: PasswordRecoveryArrival | null = null;
const subscribeNever = () => () => {};
const serverArrival = (): PasswordRecoveryArrival | null => null;
function readArrivalOnce(): PasswordRecoveryArrival {
  if (latchedArrival === null) latchedArrival = passwordRecoveryArrival(window.location.hash, window.location.search);
  return latchedArrival;
}

export default function ResetPasswordPage() {
  const { isPasswordRecovery, sendPasswordResetEmail, updatePassword } = useAuth();
  const router = useRouter();
  // Read the emailed link's own flags once, on mount (client only -- avoids a server/client markup mismatch).
  // Until then nothing is chosen, so the email form can never flash up for a parent who has already done that step.
  const [arrivalOverride, setArrivalOverride] = useState<PasswordRecoveryArrival | null>(null);
  const storedArrival = useSyncExternalStore(subscribeNever, readArrivalOnce, serverArrival);
  const arrival = arrivalOverride ?? storedArrival;
  const arrivedViaRecoveryLink = arrival === "recovery";
  const [wantsNewLink, setWantsNewLink] = useState(false);
  const showNewPasswordForm = (isPasswordRecovery || arrivedViaRecoveryLink) && !wantsNewLink;
  const linkInvalid = !showNewPasswordForm && arrival === "invalid";
  const [showPasswords, setShowPasswords] = useState(false);

  const [email, setEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [requestError, setRequestError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [updateError, setUpdateError] = useState("");
  const [sessionLost, setSessionLost] = useState(false);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requestState === "sending") return;
    const trimmed = email.trim();
    if (!trimmed) {
      setRequestState("error");
      setRequestError("Please enter your email address.");
      return;
    }
    setRequestState("sending");
    setRequestError("");
    const { error } = await sendPasswordResetEmail(trimmed);
    if (error) {
      setRequestState("error");
      setRequestError(friendlyPasswordResetError(error));
      return;
    }
    setRequestState("sent");
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (updateState === "saving") return;
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setUpdateState("error");
      setUpdateError(`Please choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setUpdateState("error");
      setUpdateError("Those passwords don't match. Please check and try again.");
      return;
    }
    setUpdateState("saving");
    setUpdateError("");
    const { error } = await updatePassword(newPassword);
    if (error) {
      setUpdateState("error");
      setUpdateError(friendlyUpdatePasswordError(error));
      if (SESSION_LOST.test(error)) setSessionLost(true);
      return;
    }
    setUpdateState("saved");
  }

  const ptype = showPasswords ? "text" : "password";

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Angel 11+</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          {arrival === null ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm" role="status">Loading…</div>
          ) : showNewPasswordForm && !sessionLost ? (
            updateState === "saved" ? (
              <div className="text-center" role="status">
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">Password changed</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => router.push("/login?mode=signin")}
                  className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1 text-center">Choose a new password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">Enter your new password below.</p>
                <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4" noValidate>
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">New password</label>
                    <input
                      id="new-password"
                      type={ptype}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); if (updateState === "error") { setUpdateState("idle"); setUpdateError(""); } }}
                      placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                      autoComplete="new-password"
                      autoFocus
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Confirm new password</label>
                    <input
                      id="confirm-password"
                      type={ptype}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (updateState === "error") { setUpdateState("idle"); setUpdateError(""); } }}
                      placeholder="Type it again"
                      autoComplete="new-password"
                      required
                      aria-describedby={updateState === "error" ? "update-password-error" : undefined}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} />
                    Show passwords
                  </label>

                  {updateState === "error" && <ErrorState variant="banner" id="update-password-error" message={updateError} />}

                  <button type="submit" disabled={updateState === "saving"} className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {updateState === "saving" ? "Saving…" : "Reset password"}
                  </button>
                </form>
              </>
            )
          ) : linkInvalid || sessionLost ? (
            <div className="text-center">
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">This reset link can&apos;t be used</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                The link has expired or has already been used. Reset links work once, and some email apps open them
                before you do. Please request a new link.
              </p>
              <button
                onClick={() => { window.history.replaceState(null, "", "/reset-password"); setSessionLost(false); setUpdateState("idle"); setWantsNewLink(true); setArrivalOverride("none"); }}
                className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Request a new link
              </button>
            </div>
          ) : requestState === "sent" ? (
            <div className="text-center" role="status">
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                We&apos;ve sent a secure link to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>.
                Open it to choose a new password.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                No email? Check your spam folder, or{" "}
                <button onClick={() => setRequestState("idle")} className="text-blue-600 font-medium underline underline-offset-2">
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1 text-center">Reset your password</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
                We&apos;ll email you a secure link to choose a new one
              </p>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Email address</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (requestState === "error") { setRequestState("idle"); setRequestError(""); } }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    aria-describedby={requestState === "error" ? "reset-request-error" : undefined}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                {requestState === "error" && <ErrorState variant="banner" id="reset-request-error" message={requestError} />}

                <button type="submit" disabled={requestState === "sending" || !email.trim()} className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {requestState === "sending" ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link href="/login?mode=signin" className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
