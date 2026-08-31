import { READINESS_CONFIG } from "@/lib/parentInsights";
import type { ExamReadiness } from "@/types/parent";
import { cn } from "@/lib/cn";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Progress Components.
 * Every visual treatment reuses an existing pattern already in production:
 * the bar fill/track from Dashboard's XP bar and Parent Hub's readiness bar
 * (DESIGN_SYSTEM.md §3/§9), and `READINESS_CONFIG` (`lib/parentInsights.ts`,
 * unmodified) as the single source of truth for readiness bands/colours —
 * this file does not invent a second set of band labels or thresholds.
 */

interface ProgressBarProps {
  /** 0-100. Per AXT-003 §12: the caller must trace this to a real Derived State Hierarchy layer — this component only renders, never computes or invents. */
  percent: number;
  color?: "purple" | "emerald" | "amber" | "blue" | "yellow" | "lime" | "cyan" | "teal" | "rose" | "slate";
  className?: string;
  label?: string;
}

// "purple" is this component's default (unlabelled) fill, used wherever a
// caller doesn't request a specific subject/semantic colour. Final Visual
// Refinement: moved from the muted-indigo educational accent to the
// restrained learner blue (sky) — indigo sits close enough to purple to
// read as a second brand colour rather than the calm, distinct "routine
// interaction" blue the Founder asked for. The prop key is left as
// "purple" to avoid a churny rename across every call site.
//
// Experience Transformation, Stage 3 (2026-08-31) — the palette below was
// extended from 3 colours (purple/emerald/amber) to the full set of
// subject-identity colours (ANGEL_DESIGN_LANGUAGE.md §2), specifically to
// close a documented gap: `components/ReasoningSession.tsx` had its own
// hand-rolled progress-bar markup because this component couldn't express
// lime/cyan/teal/rose (AN-107's own comment recorded this as a known
// constraint, not an oversight). This is additive only — every existing
// caller's colour and rendered output is unchanged; only new colours were
// added so ReasoningSession (and any future subject-specific surface) can
// adopt this one shared component instead of maintaining a parallel copy.
const BAR_COLOR: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  purple: "bg-sky-600",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-600",
  yellow: "bg-yellow-600",
  // lime/cyan/teal/rose match ReasoningSession's THEME.bar values exactly
  // (bg-{colour}-500), so adopting this shared component is a genuine
  // zero-visual-change migration, not a recolour.
  lime: "bg-lime-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  rose: "bg-rose-500",
  slate: "bg-slate-600",
};

export function ProgressBar({ percent, color = "purple", className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700", BAR_COLOR[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/**
 * Competency Indicator — presents one competency-level signal (e.g. an
 * Educational State label already produced by generateExplanation()'s
 * learner audience, per AXT-002 §6) as a small labelled bar. Never computes
 * a competency value itself; `label` must already be learner-safe copy —
 * this component performs no ALI-vocabulary filtering of its own.
 */
interface CompetencyIndicatorProps {
  competencyLabel: string;
  percent: number;
  color?: ProgressBarProps["color"];
}

export function CompetencyIndicator({ competencyLabel, percent, color }: CompetencyIndicatorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{competencyLabel}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{Math.round(percent)}%</span>
      </div>
      <ProgressBar percent={percent} color={color} label={competencyLabel} />
    </div>
  );
}

/**
 * Readiness Indicator — the Parent Hub's exam-readiness band, reusing
 * READINESS_CONFIG directly (unmodified) rather than redefining bands here.
 *
 * Founder Review Gate fix (Quick Win #3): READINESS_CONFIG's `pct` (15/40/
 * 70/100) is a fixed value per band, not a measured score — the BAND itself
 * (not-ready/building/nearly-ready/exam-ready) is real, computed from real
 * evidence (getExamReadiness()'s session/score/mock/confidence thresholds),
 * but the specific number was never a percentage of anything. No longer
 * rendered as text, since a number implies a precision that isn't there;
 * `pct` is still used to size the bar fill as a purely qualitative "which
 * of four stages" indicator, never labelled with a numeral.
 */
interface ReadinessIndicatorProps {
  readiness: ExamReadiness;
}

export function ReadinessIndicator({ readiness }: ReadinessIndicatorProps) {
  const config = READINESS_CONFIG[readiness];
  return (
    <div className={cn("rounded-xl p-4", config.bgColor)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn("text-sm font-semibold", config.textColor)}>{config.label}</span>
      </div>
      <div className="bg-white/60 dark:bg-black/20 rounded-full h-2 overflow-hidden mb-2">
        <div className={cn("h-full rounded-full transition-all duration-700", config.barColor)} style={{ width: `${config.pct}%` }} />
      </div>
      <p className={cn("text-xs leading-relaxed", config.textColor)}>{config.description}</p>
    </div>
  );
}

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

const STATUS_CLASSES: Record<StatusTone, string> = {
  success: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  error: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  info: "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  neutral: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

/** Status Indicator — a small coloured chip naming a state in words, never colour alone (ANGEL_DESIGN_LANGUAGE.md §9's existing accessibility rule, restated here as a structural guarantee: `label` is required, not optional). */
export function StatusIndicator({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", STATUS_CLASSES[tone])}>
      {label}
    </span>
  );
}

/** Badge — the existing earned-badge pill treatment (Dashboard's Achievements section), reusable anywhere a named achievement needs the same visual language. Final Visual Refinement: indigo → restrained learner blue (sky), same reasoning as BAR_COLOR above. */
export function Badge({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-3 py-1.5 rounded-full text-xs font-medium border border-sky-100 dark:border-sky-900">
      {icon}
      {label}
    </span>
  );
}
