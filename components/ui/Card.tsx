import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Card System.
 * Formalises the seven card treatments already documented per-usage
 * (DESIGN_SYSTEM.md §3: Hero/Mission/Subject/Achievement/Insight/Parent
 * cards) into reusable components under the enterprise naming this sprint
 * requires — every visual treatment below is the existing one, none is new.
 * Mapping: Premium → existing Hero card; Mission → existing Mission card;
 * Statistics → existing Achievement/stat card; Information → existing
 * Insight/utility card; School → existing Pathway/Subject card pattern
 * (`PathwayCard`, reused directly, not duplicated); Recommendation → the
 * Insight card's coloured-icon treatment, reused for a recommendation's own
 * "why this" framing; Progress → the existing Parent Hub readiness-bar card.
 */

interface CardBaseProps {
  children?: ReactNode;
  className?: string;
}

export function InfoCard({ children, className }: CardBaseProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4", className)}>
      {children}
    </div>
  );
}

interface StatCardProps extends CardBaseProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: "orange" | "amber" | "purple" | "emerald" | "indigo";
}

/**
 * `color`'s default ("purple") is `StatCard`'s generic, no-specific-meaning
 * fallback (used whenever a caller doesn't name a subject/semantic colour).
 * Final Visual Refinement: moved from the muted-indigo educational accent
 * to the restrained learner blue (sky) — indigo reads close enough to
 * purple to compete with brand rather than stay a calm, distinct
 * "routine interaction" colour. The key names are left as-is to avoid a
 * churny rename across every call site; only the rendered classes change.
 */
const STAT_COLOR_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  orange: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900 text-orange-500",
  amber: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-500",
  purple: "bg-sky-50 dark:bg-sky-950 border-sky-100 dark:border-sky-900 text-sky-600",
  emerald: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-500",
  indigo: "bg-sky-50 dark:bg-sky-950 border-sky-100 dark:border-sky-900 text-sky-600",
};

/** Statistics card — a single number with a label and icon (XP, streak, sessions, accuracy). No CTA, per the existing Achievement/stat card convention. */
export function StatCard({ icon: Icon, value, label, color = "purple", className }: StatCardProps) {
  const c = STAT_COLOR_CLASSES[color];
  return (
    <div className={cn("rounded-2xl border p-4 text-center", c, className)}>
      <Icon size={24} className="mx-auto mb-2" />
      <p className="font-bold text-2xl leading-none text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-[11px] mt-1.5 font-medium opacity-80">{label}</p>
    </div>
  );
}

interface MissionCardProps extends CardBaseProps {
  priority: "primary" | "secondary" | "review";
}

/**
 * Final Visual Refinement (Section 4) — priority must be legible from
 * position, numbering and typography first; colour is now the last,
 * lightest signal, not a competing pill fill. Remapped to the Founder's
 * own five-role palette instead of an arbitrary rose/amber/emerald trio:
 * FOCUS is amber ("attention/developing" — the area that genuinely needs
 * work today), NEXT is the restrained learner blue ("informational/what's
 * next"), MAINTAIN is emerald only because reviewing an already-mastered
 * skill is genuine positive evidence, not a default. Surface and border
 * weight now do most of the differentiation: FOCUS sits on a raised white
 * card with a full-strength accent border; NEXT and MAINTAIN sit on the
 * quieter neutral surface with a thinner, softer border, MAINTAIN quietest
 * of all — so the three cards read as a hierarchy, not three competitors.
 */
const MISSION_STYLE: Record<MissionCardProps["priority"], string> = {
  primary: "bg-white dark:bg-gray-900 border-l-4 border-l-amber-400 dark:border-l-amber-500 shadow-sm",
  secondary: "bg-gray-50 dark:bg-gray-800/60 border-l-4 border-l-sky-300 dark:border-l-sky-700",
  review: "bg-gray-50/70 dark:bg-gray-800/40 border-l-2 border-l-emerald-300 dark:border-l-emerald-800",
};

/** Mission card — "here's what to do right now," left-border priority accent, per the existing Session/Mission card convention (Dashboard's Today's Mission, AEI-002). */
export function MissionCard({ priority, children, className }: MissionCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-xl",
        MISSION_STYLE[priority],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ProgressCardProps extends CardBaseProps {
  title: string;
  /** 0-100. Must be traced to a real Derived State Hierarchy layer by the caller (AXT-003 §12) — this component never invents a value, only renders one it's given. */
  percent: number;
  complete?: boolean;
}

/** Progress card — the existing Parent Hub readiness-bar treatment, reusable wherever a percentage-complete signal needs the same visual language. */
export function ProgressCard({ title, percent, complete = false, children, className }: ProgressCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
        <p className={cn("text-sm font-bold", complete ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400")}>
          {Math.round(percent)}%
        </p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            // Final Visual Refinement — in-progress fill is the restrained
            // learner blue (sky), matching Progress.tsx's ProgressBar (same reasoning).
            complete ? "bg-emerald-500" : "bg-sky-600"
          )}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      {children}
    </div>
  );
}

interface SchoolCardProps {
  href: string;
  name: string;
  description: string;
  badge?: string;
  icon: LucideIcon;
  color: string;
}

/** School (pathway) card — reuses `PathwayCard`'s existing visual treatment directly; kept here as a thin, named re-export so callers reaching for "the card system" find every card type in one place, per this sprint's own consolidation goal, rather than a second implementation. */
export function SchoolCard(props: SchoolCardProps) {
  const { href, name, description, badge, icon: Icon, color } = props;
  return (
    <Link href={href} className="block group">
      {/* AN-108 — hover lift/shadow jump softened (was shadow-lg + -translate-y-0.5,
          already the calmest treatment in the card system; kept as the reference
          "restrained" elevation the other primary cards are checked against). */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-all motion-reduce:transition-none duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-active:scale-[0.98]">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-3 rounded-2xl", color)}>
            <Icon size={22} />
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {badge}
            </span>
          )}
        </div>
        <p className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

interface RecommendationCardProps extends CardBaseProps {
  icon: LucideIcon;
  title: string;
  reason: string;
  color?: "purple" | "emerald" | "blue" | "amber";
}

// Unlike STAT_COLOR_CLASSES/BAR_COLOR/Badge above, this map's "purple" and
// "blue" keys are both live, genuinely distinct entries in the same
// 5-category legend (RecommendationSummary.tsx's CATEGORY_COLOR: Practice
// and Review already use "blue", Consolidation uses "purple") — not a
// generic unlabelled default competing with brand purple. Collapsing both
// to the same sky value would erase a real distinction the legend depends
// on, so "purple" keeps its pre-existing muted-indigo value here rather
// than following the sky migration applied above.
const RECOMMENDATION_COLOR: Record<NonNullable<RecommendationCardProps["color"]>, string> = {
  purple: "bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-300",
  emerald: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300",
  blue: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-300",
  amber: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-300",
};

/**
 * Recommendation card — presents a "why this" reason alongside a
 * recommendation. Per AXT-003 §12/AXT-002 §6: `reason` must be real
 * Explainability output (learner audience only) once connected — this
 * component renders whatever text it's given, it never generates reasoning
 * of its own.
 */
export function RecommendationCard({ icon: Icon, title, reason, color = "purple", className }: RecommendationCardProps) {
  const c = RECOMMENDATION_COLOR[color];
  return (
    <div className={cn("border rounded-2xl p-5 flex gap-4", c, className)}>
      <div className="p-2.5 rounded-xl shrink-0 h-fit bg-white/60 dark:bg-black/20">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-sm leading-relaxed opacity-90">{reason}</p>
      </div>
    </div>
  );
}

/**
 * Premium card — the Hero card treatment, reusable for any premium/hero
 * moment. New Angel Visual System (colour remediation): the previous
 * saturated purple-600/700 gradient, and later the AN-108 solid green-800
 * fill, both made this card read as visually isolated from the rest of the
 * product — a large saturated colour block competing with, rather than
 * belonging to, the surrounding white/neutral surfaces. Per the Founder's
 * explicit "PRIMARY SURFACES: white and restrained warm/light neutral
 * surfaces... communicate value through hierarchy and content, not colour
 * volume" direction: this card is now a light surface with a soft purple
 * accent border, matching the canonical surface/brand-accent roles used
 * everywhere else in the product, rather than a full-bleed colour fill.
 * Callers supply their own text colours (dark-on-light now, not
 * white-on-dark) — see app/dashboard/page.tsx and app/angel-plus/page.tsx.
 */
export function PremiumCard({ children, className }: CardBaseProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 rounded-2xl px-6 py-5 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
