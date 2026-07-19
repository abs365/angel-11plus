import type { SubjectAnalytics, SkillAnalytics } from "@/types/analytics";

// ─── Subject strength bars ────────────────────────────────────────────────────

interface SubjectBarProps {
  subject: SubjectAnalytics;
}

const barColor: Record<string, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  pink: "bg-pink-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  rose: "bg-rose-500",
};

const statusColor = {
  strong: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  developing: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  weak: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300",
  "not-started": "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
};

// EEP-004 (Supportive Feedback Experience) — "weak" was independently
// labelled "Needs work" here, in app/parent/page.tsx's own statusLabel(),
// and in WritingFeedback.tsx's scoreConfig(); unified to "Focus area"
// across all three so the same real status reads identically everywhere
// it appears, and reads as forward-looking rather than deficit-framed.
// Colour/position already convey this is the weakest tier — the word
// itself no longer needs to.
const statusLabel = {
  strong: "Strong",
  developing: "Developing",
  weak: "Focus area",
  "not-started": "Not started",
};

export function SubjectBar({ subject: s }: SubjectBarProps) {
  const bar = barColor[s.color];
  const notStarted = s.status === "not-started";

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate">{s.label}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          {notStarted ? "0 sessions" : `${s.attempts} session${s.attempts !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {notStarted ? "–" : `${s.avgScore}% avg`}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[s.status]}`}
          >
            {statusLabel[s.status]}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium w-28 shrink-0 truncate">{s.label}</p>
      <div className="flex-1">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${skillBarColor[s.status]}`}
            style={{ width: `${s.estimatedAccuracy}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
        {s.estimatedAccuracy}%
      </p>
    </div>
  );
}
