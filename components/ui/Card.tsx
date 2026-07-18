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
  children: ReactNode;
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

const STAT_COLOR_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  orange: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900 text-orange-500",
  amber: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900 text-amber-500",
  purple: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900 text-purple-500",
  emerald: "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-500",
  indigo: "bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900 text-indigo-500",
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

const MISSION_BORDER: Record<MissionCardProps["priority"], string> = {
  primary: "border-l-rose-400 dark:border-l-rose-600",
  secondary: "border-l-amber-400 dark:border-l-amber-600",
  review: "border-l-emerald-400 dark:border-l-emerald-600",
};

/** Mission card — "here's what to do right now," left-border priority accent, per the existing Session/Mission card convention (Dashboard's Today's Mission, AEI-002). */
export function MissionCard({ priority, children, className }: MissionCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border-l-4",
        MISSION_BORDER[priority],
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
            complete ? "bg-emerald-500" : "bg-purple-500"
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 group-active:scale-[0.98]">
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

const RECOMMENDATION_COLOR: Record<NonNullable<RecommendationCardProps["color"]>, string> = {
  purple: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-300",
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

/** Premium card — the existing Hero card treatment (Dashboard's WelcomeHero gradient), reusable for any future premium/hero moment. */
export function PremiumCard({ children, className }: CardBaseProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-2xl px-6 py-5 shadow-lg text-white",
        className
      )}
    >
      {children}
    </div>
  );
}
