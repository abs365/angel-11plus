"use client";

import { useEffect, useState } from "react";
import ErrorState from "@/components/ErrorState";
import Button from "@/components/ui/Button";
import { setLearnerPin, verifyLearnerPin } from "@/lib/learnerPin";

type Mode = "set" | "verify";

/**
 * PRIVATE LEARNER SPACE, Part 2 -- the learner-specific PIN (distinct from
 * the household's own Parent PIN, ParentPinModal.tsx) that protects entry
 * into ONE learner's own space. "set" both creates/resets a learner's PIN
 * and, on success, immediately verifies it with the same value (still in
 * memory) to mint the session token -- the parent does not have to type it
 * a third time to actually enter after establishing it.
 *
 * ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md: this is a new surface built
 * this increment, so it uses the Brand Foundation tokens and the shared
 * Button component directly, unlike the pre-existing ParentPinModal.
 */
export default function LearnerPinModal({
  mode,
  learnerId,
  learnerName,
  onCancel,
  onSuccess,
}: {
  mode: Mode;
  learnerId: string;
  learnerName: string;
  onCancel: () => void;
  onSuccess: (sessionToken: string) => void;
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
      const result = await setLearnerPin(learnerId, pin);
      if (!result.ok) {
        setBusy(false);
        setError(result.error);
        return;
      }
      const verified = await verifyLearnerPin(learnerId, pin);
      setBusy(false);
      if (!verified.ok || !verified.sessionToken) {
        setError("Your PIN is saved. Please enter it to continue.");
        return;
      }
      onSuccess(verified.sessionToken);
      return;
    }

    setBusy(true);
    const result = await verifyLearnerPin(learnerId, pin);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (!result.ok || !result.sessionToken) {
      if (result.retryAt) {
        const minutes = Math.max(1, Math.ceil((new Date(result.retryAt).getTime() - Date.now()) / 60000));
        setError(`Too many attempts. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`);
      } else {
        setError("That PIN doesn't match. Please try again.");
      }
      setPin("");
      return;
    }
    onSuccess(result.sessionToken);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-black/40" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="learner-pin-title"
        className="relative bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] shadow-xl p-5 w-full max-w-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--angel-blue)] mb-1">
          {mode === "set" ? "Learner PIN" : `${learnerName}'s Learner PIN`}
        </p>
        <h2 id="learner-pin-title" className="text-base font-bold text-[var(--angel-navy)] mb-2">
          {mode === "set" ? `Create ${learnerName}'s learner PIN` : `Enter ${learnerName}'s PIN`}
        </h2>
        <p className="text-sm text-[var(--angel-ink)] opacity-80 leading-relaxed mb-4">
          {mode === "set"
            ? `This PIN lets ${learnerName} open their own learning space. It is different from your own Parent PIN.`
            : `${learnerName}, enter your own PIN to open your learning space.`}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="learner-pin-input" className="sr-only">
            {learnerName}&rsquo;s PIN
          </label>
          <input
            id="learner-pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Learner PIN"
            className="w-full bg-[var(--angel-ivory)] border border-[var(--angel-border)] rounded-lg px-4 py-3 text-center text-lg tracking-[0.5em] text-[var(--angel-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--angel-blue)]"
          />
          {mode === "set" && (
            <>
              <label htmlFor="learner-pin-confirm" className="sr-only">
                Confirm {learnerName}&rsquo;s PIN
              </label>
              <input
                id="learner-pin-confirm"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Confirm PIN"
                className="w-full bg-[var(--angel-ivory)] border border-[var(--angel-border)] rounded-lg px-4 py-3 text-center text-lg tracking-[0.5em] text-[var(--angel-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--angel-blue)]"
              />
            </>
          )}
          {error && <ErrorState variant="banner" message={error} />}
          <div className="flex items-center justify-end gap-2 mt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={busy} disabled={!pin}>
              {mode === "set" ? "Save PIN" : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
