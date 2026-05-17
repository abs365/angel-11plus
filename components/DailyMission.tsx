"use client";

import { Clock, ArrowRight } from "lucide-react";
import type { DailyMission as DailyMissionData, MissionItem } from "@/types/adaptive";

const priorityBorder = {
  primary: "border-l-rose-400",
  secondary: "border-l-amber-400",
  review: "border-l-emerald-400",
};

const priorityChip = {
  primary: "bg-rose-100 text-rose-600",
  secondary: "bg-amber-100 text-amber-700",
  review: "bg-emerald-100 text-emerald-700",
};

const priorityChipLabel = {
  primary: "Focus",
  secondary: "Next",
  review: "Maintain",
};

const tierChip = {
  foundation: "bg-gray-100 text-gray-500",
  developing: "bg-blue-100 text-blue-600",
  advanced: "bg-purple-100 text-purple-600",
  challenge: "bg-red-100 text-red-600",
};

const tierLabel = {
  foundation: "Foundation",
  developing: "Developing",
  advanced: "Advanced",
  challenge: "Challenge",
};

function MissionRow({ item }: { item: MissionItem }) {
  return (
    <a
      href={item.href}
      className={`flex items-start gap-3 bg-white rounded-xl border border-gray-100 border-l-4 ${priorityBorder[item.priority]} p-4 hover:shadow-sm transition-all group`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${priorityChip[item.priority]}`}
          >
            {priorityChipLabel[item.priority]}
          </span>
          <span className="text-gray-800 font-semibold text-sm">{item.label}</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierChip[item.tier]}`}
          >
            {tierLabel[item.tier]}
          </span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">{item.reason}</p>
        <div className="flex items-center gap-1 mt-2">
          <Clock size={11} className="text-gray-300" />
          <span className="text-gray-300 text-xs">~{item.estimatedMinutes} min</span>
        </div>
      </div>
      <ArrowRight
        size={16}
        className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1"
      />
    </a>
  );
}

interface DailyMissionProps {
  mission: DailyMissionData;
}

export default function DailyMission({ mission }: DailyMissionProps) {
  if (mission.items.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between mb-2.5 gap-2">
        <div className="min-w-0">
          <p className="text-gray-900 text-sm font-bold">{mission.focusArea}</p>
          <p className="text-gray-400 text-xs mt-0.5 leading-snug">{mission.tagline}</p>
        </div>
        <div className="flex items-center gap-1 text-gray-400 shrink-0 mt-0.5">
          <Clock size={12} />
          <span className="text-xs font-medium">~{mission.totalMinutes} min</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {mission.items.map((item) => (
          <MissionRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
