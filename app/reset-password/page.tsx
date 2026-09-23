"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorState from "@/components/ErrorState";
import { isPasswordRecoveryUrl } from "@/lib/passwordRecoveryUrl";
import { friendlyPasswordResetError } from "@/lib/authEmailFeedback";

type RequestState = "idle" | "sending" | "sent" | "error";
type UpdateState = "idle" | "saving" | "saved" | "error";

const MIN_PASSWORD_LENGTH = 8;


export default function ResetPasswordPage() {
  const { isPasswordRecovery, sendPasswordResetEmail, updatePassword } = useAuth();
  const router = useRouter();
  const [arrivedViaRecoveryLink] = useState(
    () => typeof window !== "undefined" && isPasswordRecoveryUrl(window.location.hash, window.location.search)
  );
  const showNewPasswordForm = isPasswordRecovery || arrivedViaRecoveryLink;

  const [email, setEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [requestError, setRequestError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [updateError, setUpdateError] = useState("");

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
      setUpdateError(error);
      return;
    }
    setUpdateState("saved");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Angel 11+</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {showNewPasswordForm ? (
            updateState === "saved" ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                  <CheckCircle size={26} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">Password updated</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  For your security, we&apos;ve signed you out. Please sign in again with your new password.
                </p>
                <button
                  onClick={() => router.push("/login?mode=signin")}
                  className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1 text-center">Choose a new password</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-8">
                  You&apos;ll use this to sign in from now on
                </p>
                <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); if (updateState === "error") { setUpdateState("idle"); setUpdateError(""); } }}
                        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                        autoComplete="new-password"
                        autoFocus
                        required
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if (updateState === "error") { setUpdateState("idle"); setUpdateError(""); } }}
                        placeholder="Type it again"
                        autoComplete="new-password"
                        required
                        aria-describedby={updateState === "error" ? "update-password-error" : undefined}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {updateState === "error" && <ErrorState variant="banner" id="update-password-error" message={updateError} />}

                  <button
                    type="submit"
                    disabled={updateState === "saving" || !newPassword || !confirmPassword}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateState === "saving" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        Save new password
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )
          ) : requestState === "sent" ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                <CheckCircle size={26} className="text-green-600 dark:text-green-400" />
              </div>
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
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-8">
                We&apos;ll email you a secure link to choose a new one
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs text-center -mt-6 mb-8 leading-relaxed">
                Never set a password? You can set one here, or you can always sign in with an email link instead.
              </p>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
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
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {requestState === "error" && <ErrorState variant="banner" id="reset-request-error" message={requestError} />}

                <button
                  type="submit"
                  disabled={requestState === "sending" || !email.trim()}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {requestState === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link href="/login?mode=signin" className="text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
