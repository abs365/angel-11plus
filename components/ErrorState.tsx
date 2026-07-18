import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  /** Falsy renders nothing — callers may pass an unconditional errors.field value directly. */
  message?: string;
  /** Pairs with the reporting input's aria-describedby. */
  id?: string;
  /** "field" — inline validation message below one input (the existing, most common pattern). "banner" — a form-level submission error (the existing /login pattern). */
  variant?: "field" | "banner";
}

/**
 * Work Package AEI-001 (Consistency Foundation) — the single error-state
 * component this wave introduces, per AXT-003_ANGEL_DESIGN_SYSTEM_V2.md §18's
 * own named gap. Both variants below are the exact existing visual patterns
 * already in production (byte-identical class names) across /login (banner)
 * and /beta-family, /feedback, /report-bug, /feature-request, /testimonial
 * (field) — this component consolidates their presentation, it does not
 * introduce a new visual language. The one real addition is accessibility:
 * `role="alert"` announces the message to assistive technology the moment it
 * appears, and `id` lets the reporting input associate itself via
 * `aria-describedby` — neither existed on any of these six forms before.
 */
export default function ErrorState({ message, id, variant = "field" }: ErrorStateProps) {
  if (!message) return null;

  if (variant === "banner") {
    return (
      <div
        id={id}
        role="alert"
        className="flex items-start gap-2 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl px-4 py-3"
      >
        <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
        <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <p id={id} role="alert" className="text-xs text-red-500 mt-1">
      {message}
    </p>
  );
}
