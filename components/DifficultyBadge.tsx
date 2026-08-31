import type { AdaptiveTier } from "@/types/adaptive";

const TIER_STYLES: Record<AdaptiveTier, { bg: string; text: string; label: string }> = {
  foundation: { bg: "bg-gray-100 dark:bg-gray-800",     text: "text-gray-500 dark:text-gray-400",   label: "Foundation" },
  developing: { bg: "bg-blue-100 dark:bg-blue-900",     text: "text-blue-600 dark:text-blue-400",   label: "Developing" },
  advanced:   { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: "Advanced"   },
  challenge:  { bg: "bg-rose-100 dark:bg-rose-900",     text: "text-rose-600 dark:text-rose-400",   label: "Challenge"  },
};

interface DifficultyBadgeProps {
  tier: AdaptiveTier;
  size?: "xs" | "sm";
}

export default function DifficultyBadge({ tier, size = "xs" }: DifficultyBadgeProps) {
  const s = TIER_STYLES[tier];
  const cls =
    size === "sm"
      ? "text-xs px-2.5 py-1 font-semibold"
      : "text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide";

  return (
    <span className={`inline-block rounded-full ${s.bg} ${s.text} ${cls}`}>
      {s.label}
    </span>
  );
}
