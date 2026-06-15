import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SubjectCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo" | "violet" | "teal" | "cyan" | "rose";
  badge?: string;
}

const colorMap = {
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    title: "text-purple-900",
    desc: "text-purple-600",
    border: "border-purple-100",
    hover: "hover:bg-purple-100",
    badge: "bg-purple-100 text-purple-700",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    title: "text-blue-900",
    desc: "text-blue-600",
    border: "border-blue-100",
    hover: "hover:bg-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    title: "text-emerald-900",
    desc: "text-emerald-600",
    border: "border-emerald-100",
    hover: "hover:bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
  },
  orange: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    title: "text-amber-900",
    desc: "text-amber-600",
    border: "border-amber-100",
    hover: "hover:bg-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  pink: {
    bg: "bg-pink-50",
    icon: "bg-pink-100 text-pink-600",
    title: "text-pink-900",
    desc: "text-pink-600",
    border: "border-pink-100",
    hover: "hover:bg-pink-100",
    badge: "bg-pink-100 text-pink-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    title: "text-indigo-900",
    desc: "text-indigo-600",
    border: "border-indigo-100",
    hover: "hover:bg-indigo-100",
    badge: "bg-indigo-100 text-indigo-700",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
    title: "text-violet-900",
    desc: "text-violet-600",
    border: "border-violet-100",
    hover: "hover:bg-violet-100",
    badge: "bg-violet-100 text-violet-700",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "bg-teal-100 text-teal-600",
    title: "text-teal-900",
    desc: "text-teal-600",
    border: "border-teal-100",
    hover: "hover:bg-teal-100",
    badge: "bg-teal-100 text-teal-700",
  },
  cyan: {
    bg: "bg-cyan-50",
    icon: "bg-cyan-100 text-cyan-600",
    title: "text-cyan-900",
    desc: "text-cyan-600",
    border: "border-cyan-100",
    hover: "hover:bg-cyan-100",
    badge: "bg-cyan-100 text-cyan-700",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-100 text-rose-600",
    title: "text-rose-900",
    desc: "text-rose-600",
    border: "border-rose-100",
    hover: "hover:bg-rose-100",
    badge: "bg-rose-100 text-rose-700",
  },
};

export default function SubjectCard({
  href,
  title,
  description,
  icon: Icon,
  color,
  badge,
}: SubjectCardProps) {
  const c = colorMap[color];
  return (
    <Link href={href} className="block group">
      <div
        className={`${c.bg} ${c.border} ${c.hover} border rounded-2xl p-5 transition-all duration-200 group-hover:shadow-md group-active:scale-[0.98] cursor-pointer`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`${c.icon} p-3 rounded-xl`}>
            <Icon size={22} />
          </div>
          {badge && (
            <span className={`${c.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className={`${c.title} font-semibold text-base mb-1`}>{title}</h3>
        <p className={`${c.desc} text-sm leading-snug`}>{description}</p>
      </div>
    </Link>
  );
}
