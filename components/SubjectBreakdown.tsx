import type { SubjectAnalytics, SkillAnalytics } from "@/types/analytics";

// ─── Subject strength bars ────────────────────────────────────────────────────

interface SubjectBarProps {
  subject: SubjectAnalytics;
}

const barColor = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  pink: "bg-pink-500",
};

const statusColor = {
  strong: "bg-green-100 text-green-700",
  developing: "bg-amber-100 text-amber-700",
  weak: "bg-red-100 text-red-600",
  "not-started": "bg-gray-100 text-gray-400",
};

const statusLabel = {
  strong: "Strong",
  developing: "Developing",
  weak: "Needs work",
  "not-started": "Not started",
};

export function SubjectBar({ subject: s }: SubjectBarProps) {
  const bar = barColor[s.color];
  const notStarted = s.status === "not-started";

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <p className="text-gray-700 text-sm font-medium truncate">{s.label}</p>
        <p className="text-gray-400 text-xs">
          {notStarted ? "0 sessions" : `${s.attempts} session${s.attempts !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">
            {notStarted ? "–" : `${s.avgScore}% avg`}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[s.status]}`}
          >
            {statusLabel[s.status]}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${notStarted ? "bg-gray-200" : bar}`}
            style={{ width: notStarted ? "0%" : `${s.avgScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Skill accuracy bars ──────────────────────────────────────────────────────

interface SkillBarProps {
  skill: SkillAnalytics;
}

const skillBarColor = {
  strong: "bg-emerald-400",
  developing: "bg-amber-400",
  weak: "bg-red-400",
  "not-started": "bg-gray-200",
};

export function SkillBar({ skill: s }: SkillBarProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-gray-600 text-xs font-medium w-28 shrink-0 truncate">{s.label}</p>
      <div className="flex-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${skillBarColor[s.status]}`}
            style={{ width: `${s.estimatedAccuracy}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 w-8 text-right shrink-0">
        {s.estimatedAccuracy}%
      </p>
    </div>
  );
}
