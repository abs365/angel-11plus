import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { CompetencyIndicator } from "@/components/ui/Progress";

interface SubjectCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo" | "violet" | "teal" | "cyan" | "rose";
  badge?: string;
  /** Sprint 5 (Practice Experience) — "Competency Focus": the real, already-computed skill this activity strengthens (label + accuracy). Optional and additive — existing callers (Dashboard's Quick Access grid) that don't pass it are unaffected. Never computed here. */
  competency?: { label: string; percent: number };
  /** Sprint 5 — "Progress Through Practice": one line of real, already-computed subject-level progress (e.g. "3 sessions · 72% average"). Presentation only, never a new calculation. */
  progressNote?: string;
}

const colorMap = {
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    strip: "bg-purple-300 dark:bg-purple-700",
    icon: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
    title: "text-purple-900 dark:text-purple-100",
    desc: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-900",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
    badge: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    arrow: "text-purple-300 dark:text-purple-700 group-hover:text-purple-500 dark:group-hover:text-purple-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    strip: "bg-blue-300 dark:bg-blue-700",
    icon: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    title: "text-blue-900 dark:text-blue-100",
    desc: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
    badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    arrow: "text-blue-300 dark:text-blue-700 group-hover:text-blue-500 dark:group-hover:text-blue-400",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    strip: "bg-emerald-300 dark:bg-emerald-700",
    icon: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300",
    title: "text-emerald-900 dark:text-emerald-100",
    desc: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900",
    badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    arrow: "text-emerald-300 dark:text-emerald-700 group-hover:text-emerald-500 dark:group-hover:text-emerald-400",
  },
  orange: {
    bg: "bg-amber-50 dark:bg-amber-950",
    strip: "bg-amber-300 dark:bg-amber-700",
    icon: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
    title: "text-amber-900 dark:text-amber-100",
    desc: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900",
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
    arrow: "text-amber-300 dark:text-amber-700 group-hover:text-amber-500 dark:group-hover:text-amber-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950",
    strip: "bg-pink-300 dark:bg-pink-700",
    icon: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
    title: "text-pink-900 dark:text-pink-100",
    desc: "text-pink-600 dark:text-pink-400",
    border: "border-pink-100 dark:border-pink-900",
    hover: "hover:bg-pink-100 dark:hover:bg-pink-900",
    badge: "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300",
    arrow: "text-pink-300 dark:text-pink-700 group-hover:text-pink-500 dark:group-hover:text-pink-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    strip: "bg-indigo-300 dark:bg-indigo-700",
    icon: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300",
    title: "text-indigo-900 dark:text-indigo-100",
    desc: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-900",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900",
    badge: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300",
    arrow: "text-indigo-300 dark:text-indigo-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950",
    strip: "bg-violet-300 dark:bg-violet-700",
    icon: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300",
    title: "text-violet-900 dark:text-violet-100",
    desc: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-900",
    hover: "hover:bg-violet-100 dark:hover:bg-violet-900",
    badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
    arrow: "text-violet-300 dark:text-violet-700 group-hover:text-violet-500 dark:group-hover:text-violet-400",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950",
    strip: "bg-teal-300 dark:bg-teal-700",
    icon: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300",
    title: "text-teal-900 dark:text-teal-100",
    desc: "text-teal-600 dark:text-teal-400",
    border: "border-teal-100 dark:border-teal-900",
    hover: "hover:bg-teal-100 dark:hover:bg-teal-900",
    badge: "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300",
    arrow: "text-teal-300 dark:text-teal-700 group-hover:text-teal-500 dark:group-hover:text-teal-400",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    strip: "bg-cyan-300 dark:bg-cyan-700",
    icon: "bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300",
    title: "text-cyan-900 dark:text-cyan-100",
    desc: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-100 dark:border-cyan-900",
    hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900",
    badge: "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300",
    arrow: "text-cyan-300 dark:text-cyan-700 group-hover:text-cyan-500 dark:group-hover:text-cyan-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950",
    strip: "bg-rose-300 dark:bg-rose-700",
    icon: "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300",
    title: "text-rose-900 dark:text-rose-100",
    desc: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-900",
    hover: "hover:bg-rose-100 dark:hover:bg-rose-900",
    badge: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300",
    arrow: "text-rose-300 dark:text-rose-700 group-hover:text-rose-500 dark:group-hover:text-rose-400",
  },
};

export default function SubjectCard({
  href,
  title,
  description,
  icon: Icon,
  color,
  badge,
  competency,
  progressNote,
}: SubjectCardProps) {
  const c = colorMap[color];
  return (
    <Link href={href} className="block group">
      <div
        className={`${c.bg} ${c.border} ${c.hover} border shadow-sm rounded-2xl overflow-hidden transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1 group-active:scale-[0.98] cursor-pointer`}
      >
        {/* Colour identity strip */}
        <div className={`h-1.5 ${c.strip}`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className={`${c.icon} p-4 rounded-2xl shrink-0`}>
              <Icon size={24} />
            </div>
            {badge && (
              <span className={`${c.badge} text-xs font-semibold px-2.5 py-1 rounded-full mt-1`}>
                {badge}
              </span>
            )}
          </div>
          <h3 className={`${c.title} font-bold text-base mb-1.5 leading-snug`}>{title}</h3>
          <p className={`${c.desc} text-sm leading-relaxed`}>{description}</p>
          {competency && (
            <div className="mt-4">
              <CompetencyIndicator competencyLabel={competency.label} percent={competency.percent} />
              {progressNote && (
                <p className={`${c.desc} text-xs mt-1.5`}>{progressNote}</p>
              )}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <ChevronRight size={16} className={`${c.arrow} transition-colors`} />
          </div>
        </div>
      </div>
    </Link>
  );
}
