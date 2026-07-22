import type { ReactNode } from "react";
import { InfoCard } from "@/components/ui/Card";

/**
 * At a Glance — WP4C (Parent Trust), FD-020/Sprint 4 Completion Package.
 *
 * The five questions are the shared user journey (Permanent Principle:
 * "user journeys are shared"); the answers passed in by each caller are
 * pathway-specific real data ("educational intelligence is pathway-
 * specific") — CssePathwayParentContent and LegacyPathwayParentContent each
 * compute their own answers from data they already fetch, nothing new is
 * calculated here, this is a pure presentation layer.
 *
 * "Should I be concerned?" and "What outcome should I expect?" both use a
 * real signal already computed elsewhere on the page (a wellbeing veto /
 * attention-insight count; an existing readiness classification) — never a
 * new score or fabricated confidence, per FD-020's explicit constraint.
 * Where no real concerning signal exists (the common case), the answer is
 * calm and honest ("No signs of concern in recent evidence"), not an
 * overclaiming "All good!".
 */
export interface AtAGlanceAnswers {
  improving: ReactNode;
  thisWeek: ReactNode;
  whyRecommended: ReactNode;
  concern: ReactNode;
  outcome: ReactNode;
}

const QUESTIONS: { key: keyof AtAGlanceAnswers; label: string }[] = [
  { key: "improving", label: "Is my child improving?" },
  { key: "thisWeek", label: "What should we do this week?" },
  { key: "whyRecommended", label: "Why is Angel recommending this?" },
  { key: "concern", label: "Should I be concerned?" },
  { key: "outcome", label: "What outcome should I expect?" },
];

export function AtAGlancePanel({ answers }: { answers: AtAGlanceAnswers }) {
  return (
    <InfoCard>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">At a Glance</p>
      <div className="space-y-3">
        {QUESTIONS.map(({ key, label }) => (
          <div key={key}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{answers[key]}</div>
          </div>
        ))}
      </div>
    </InfoCard>
  );
}
