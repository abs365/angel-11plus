"use client";

import { useEffect, useState } from "react";
import ErrorState from "@/components/ErrorState";
import { setHouseholdPin, verifyHouseholdPin } from "@/lib/householdPin";

type Mode = "set" | "verify";

/**
 * PRIVATE LEARNER SPACE -- the one modal that both sets the household's
 * Parent PIN for the first time (before Learner Mode can ever be entered)
 * and verifies it (the controlled route back from Learner Mode to Parent
 * Mode). Same component, two modes, so the copy/behaviour never drifts
 * between the two real call sites. No PIN value is ever stored or logged
 * client-side beyond the single RPC call each submit makes.
 */
export default function ParentPinModal({
  mode,
  onCancel,
  onSuccess,
}: {
  mode: Mode;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (mode === "set") {
      if (!/^[0-9]{4,6}$/.test(pin)) {
        setError("Please enter 4 to 6 numbers.");
        return;
      }
      if (pin !== confirmPin) {
        setError("Those numbers don't match. Please check and try again.");
        return;
      }
      setBusy(true);
      const result = await setHouseholdPin(pin);
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
      return;
    }

    setBusy(true);
    const result = await verifyHouseholdPin(pin);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (!result.ok) {
      if (result.retryAt) {
        const minutes = Math.max(1, Math.ceil((new Date(result.retryAt).getTime() - Date.now()) / 60000));
        setError(`Too many attempts. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`);
      } else {
        setError("That PIN doesn't match. Please try again.");
      }
      setPin("");
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-black/40" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="parent-pin-title"
        className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-5 w-full max-w-sm"
      >
        <h2 id="parent-pin-title" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
          {mode === "set" ? "Set a Parent PIN" : "Enter your Parent PIN"}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {mode === "set"
            ? "This keeps the Parent Dashboard and account settings just for you. Choose 4 to 6 numbers you'll remember."
            : "This keeps your child's learner space private. Enter your Parent PIN to return to the Parent Dashboard."}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="parent-pin-input" className="sr-only">
            Parent PIN
          </label>
          <input
            id="parent-pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Parent PIN"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {mode === "set" && (
            <>
              <label htmlFor="parent-pin-confirm" className="sr-only">
                Confirm Parent PIN
              </label>
              <input
                id="parent-pin-confirm"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Confirm PIN"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </>
          )}
          {error && <ErrorState variant="banner" message={error} />}
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !pin}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-colors"
            >
              {busy ? "Please wait…" : mode === "set" ? "Save PIN" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
