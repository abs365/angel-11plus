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

interface SurfaceCardProps extends CardBaseProps {
  /** "flat" (default) matches the calm, no-shadow treatment most of the product already uses. "raised" adds a subtle shadow for content the page wants to lift slightly. */
  elevation?: "flat" | "raised";
  /** A left-border accent stripe — the one structural way this primitive communicates priority/category, without a filled colour block or an added icon. */
  accent?: "none" | "primary" | "success" | "warning" | "info";
  /** "none" is for a card acting as an outer shell around internally-padded sections (e.g. a header block plus a divided footer) — a real, existing pattern, not a workaround. */
  padding?: "none" | "compact" | "comfortable" | "spacious";
}

const ELEVATION_CLASSES: Record<NonNullable<SurfaceCardProps["elevation"]>, string> = {
  flat: "",
  raised: "shadow-sm",
};

const ACCENT_CLASSES: Record<NonNullable<SurfaceCardProps["accent"]>, string> = {
  none: "",
  primary: "border-l-4 border-l-blue-400 dark:border-l-blue-600",
  success: "border-l-4 border-l-emerald-400 dark:border-l-emerald-600",
  warning: "border-l-4 border-l-amber-400 dark:border-l-amber-600",
  info: "border-l-4 border-l-sky-300 dark:border-l-sky-700",
};

const PADDING_CLASSES: Record<NonNullable<SurfaceCardProps["padding"]>, string> = {
  none: "",
  compact: "p-4",
  comfortable: "p-5",
  spacious: "p-6",
};

/**
 * Card — the canonical container primitive (Experience Programme, Stage 1,
 * ANGEL_EXPERIENCE_SYSTEM_V1.md Section I). Consolidates the visual
 * language `ProgressCard`/`SchoolCard`/`PremiumCard` and every ad-hoc
 * `bg-white dark:bg-gray-900 rounded-2xl border...` div already used
 * (identical rendered appearance — this is a genuine, zero-visual-
 * regression consolidation, not a redesign) into one primitive with
 * variant props instead of N independently-decided implementations.
 *
 * Per this stage's own explicit, bounded scope: the six named components
 * below are NOT deleted or restructured internally this stage — their
 * real consumers were audited (see ALI_DECISION_LOG.md) and left
 * untouched wherever the consuming page was outside this stage's own two
 * proof surfaces (Dashboard, Progress). This primitive is what those two
 * surfaces' own ad-hoc divs are replaced with; full internal migration of
 * the remaining five named components onto this base is deferred, not
 * silently abandoned.
 *
 * Card governance rule (Section I, restated in code): a card separates a
 * genuinely discrete, self-contained unit of information or action from
 * its neighbours — never a default wrapper for a heading-plus-paragraph
 * that typography and spacing alone would already separate correctly.
 */
export function Card({ elevation = "flat", accent = "none", padding = "comfortable", children, className }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800",
        ELEVATION_CLASSES[elevation],
        ACCENT_CLASSES[accent],
        PADDING_CLASSES[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps extends CardBaseProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: "orange" | "amber" | "neutral" | "emerald";
}

/**
 * Experience Programme, Stage 1 — naming correction (ANGEL_PRODUCT_
 * EXPERIENCE_COMMERCIAL_BENCHMARK_V1.md Part 3, finding 2). This
 * component's own "purple" key previously mapped to sky colours (a
 * generic, no-specific-meaning default) while `RecommendationCard`'s own
 * "purple" key, below, maps to a genuinely distinct, semantically real
 * legend category (Consolidation, matching `RecommendationSummary.tsx`'s
 * own CATEGORY_COLOR) — the same key name meant two different things in
 * two places in this file. Audited before renaming (not assumed): this
 * exported `StatCard` has zero real consumers anywhere in the app today
 * (confirmed by repository-wide search — every `StatCard` reference
 * elsewhere is an unrelated, locally-defined component with the same
 * name), so renaming its key carries no migration risk. "purple"/"indigo"
 * (both previously rendering identical sky classes, a second redundancy)
 * collapse to one honestly-named "neutral" default; the rendered colour
 * is unchanged.
 */
const STAT_COLOR_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  orange: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900 text-orange-500",
  amber: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-500",
  neutral: "bg-sky-50 dark:bg-sky-950 border-sky-100 dark:border-sky-900 text-sky-600",
  emerald: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-500",
};

/** Statistics card — a single number with a label and icon (XP, streak, sessions, accuracy). No CTA, per the existing Achievement/stat card convention. Currently unused in production (see naming-correction note above) — kept, not deleted, pending confirmation it is genuinely obsolete rather than reserved for near-term use. */
export function StatCard({ icon: Icon, value, label, color = "neutral", className }: StatCardProps) {
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
 * Experience Transformation, Stage 1A (Dashboard composition correction) —
 * previously each mission step was its own nested rounded/bordered box
 * inside the outer Mission Card ("rectangles inside a rectangle," the
 * Founder's own explicit Stage 1A finding #5). `MissionCard` has exactly
 * one consumer, `app/dashboard/page.tsx` (confirmed by repository-wide
 * search before this change), so restyling its internals carries no
 * propagation risk to any other surface. Priority is now legible from a
 * left accent bar plus typography/spacing alone — no per-row fill, no
 * per-row radius, no per-row shadow — and adjacent rows are separated by a
 * thin divider supplied by the caller's own `divide-y` list, not by each
 * row drawing its own box. FOCUS keeps the strongest (amber, full-height)
 * accent bar; NEXT is the restrained learner blue; MAINTAIN is emerald and
 * thinnest — the same three-tier priority signal as before, carried by one
 * visual device instead of three (fill + border + shadow).
 */
const MISSION_ACCENT_BAR: Record<MissionCardProps["priority"], string> = {
  primary: "border-l-4 border-l-amber-400 dark:border-l-amber-500",
  secondary: "border-l-4 border-l-sky-300 dark:border-l-sky-700",
  review: "border-l-2 border-l-emerald-300 dark:border-l-emerald-800",
};

/** Mission row — "here's what to do right now," left-border priority accent only, no per-row card surface (Dashboard's Today's Mission, AEI-002; flattened Stage 1A). */
export function MissionCard({ priority, children, className }: MissionCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 py-4 pl-4",
        MISSION_ACCENT_BAR[priority],
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
// to the same value would erase a real distinction the legend depends on.
// Zero-Purple pass (2026-08-31): "purple" now renders slate — distinct from
// the other three live categories (blue/emerald/amber) in this legend,
// consistent with slate's role elsewhere as the calm/neutral replacement
// for indigo-family colours (ANGEL_DESIGN_LANGUAGE.md §0a).
const RECOMMENDATION_COLOR: Record<NonNullable<RecommendationCardProps["color"]>, string> = {
  purple: "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-300",
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
 * saturated blue-600/700 gradient, and later the AN-108 solid green-800
 * fill, both made this card read as visually isolated from the rest of the
 * product — a large saturated colour block competing with, rather than
 * belonging to, the surrounding white/neutral surfaces. Per the Founder's
 * explicit "PRIMARY SURFACES: white and restrained warm/light neutral
 * surfaces... communicate value through hierarchy and content, not colour
 * volume" direction: this card is now a light surface with a soft accent
 * border, matching the canonical surface/brand-accent roles used
 * everywhere else in the product, rather than a full-bleed colour fill.
 * Callers supply their own text colours (dark-on-light now, not
 * white-on-dark) — see app/dashboard/page.tsx and app/angel-plus/page.tsx.
 * Zero-Purple pass (2026-08-31): accent border moved from soft purple to
 * soft blue, matching the new primary brand colour (ANGEL_DESIGN_LANGUAGE.md
 * §0a). This also corrects a stale reference in ANGEL_DESIGN_LANGUAGE.md's
 * own Hero card table row, which still described a gradient fill this
 * component had already moved away from before this pass — doc now matches
 * what actually renders.
 */
export function PremiumCard({ children, className }: CardBaseProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-2xl px-6 py-5 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
