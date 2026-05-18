import type { AdaptiveTier } from "@/types/adaptive";

const TIER_STYLES: Record<AdaptiveTier, { bg: string; text: string; label: string }> = {
  foundation: { bg: "bg-gray-100",   text: "text-gray-500",   label: "Foundation" },
  developing: { bg: "bg-blue-100",   text: "text-blue-600",   label: "Developing" },
  advanced:   { bg: "bg-purple-100", text: "text-purple-700", label: "Advanced"   },
  challenge:  { bg: "bg-rose-100",   text: "text-rose-600",   label: "Challenge"  },
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
