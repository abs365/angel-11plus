# Mock Centre Implementation Report

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11

---

## What changed

| File | Change |
|---|---|
| `app/mocks/page.tsx` | Full redesign per `MOCK_CENTRE_EXPERIENCE_BLUEPRINT.md`/`_INFORMATION_ARCHITECTURE.md` |
| `lib/learningEngine/mockReadiness.ts` | Added `computeCsseMockReadiness()` — a fetch-and-compute wrapper around the existing, unmodified `assessMockReadiness()`, `fetchLearnerIntelligenceProfile()`, `getRecommendations()`, `getMockResults()`. No new educational logic. |
| `app/reasoning/page.tsx` | Added the relocated Personalised Practice section (4 cards, unchanged routes) |

Plus, ahead of this implementation (`NEW_ANGEL_LEGACY_EXPERIENCE_AUDIT.md`): `app/dashboard/page.tsx`, `lib/adaptiveEngine.ts`, `app/mocks/[pathway]/page.tsx`, `lib/mockProgress.ts`, `types/mock.ts`.

## Capabilities reused (unmodified)

- `assessMockReadiness()` — three real verdicts, zero new logic.
- `fetchLearnerIntelligenceProfile()`, `getRecommendations()` — real Educational Intelligence/Recommendation Engine reads.
- `getMockResults()`, `bestScoreForPathway()`, `countForPathway()` — the single shared mock-history read path, now correctly excluding both Founder Validation and legacy-CSSE-mock results.
- The CSSE Mock Exam engine (`/learning-intelligence/mock-exam`) and its results-loop (skills profile, readiness, recommendations, primary CTA) — entirely untouched.
- The GL/CEM/ISEB legacy mock runner (`/mocks/[pathway]`) — entirely untouched, functionally.
- `MOCK_SUGGESTED_PREPARATION` (`lib/mockMeta.ts`) — reused for GL/CEM/ISEB cards; the CSSE entry (already known-stale for the current CSSE mock, per the prior programme's own comment) is not read for the new CSSE card, which has its own honest, current copy.

## Capabilities moved

- The four "Personalised Practice" cards (GL-only content, confirmed) — from `app/mocks/page.tsx` to `app/reasoning/page.tsx`. Same routes, same components, same underlying `fetchQuestionBank(..., "gl")` calls. Zero content change.

## Capabilities hidden (not deleted)

- For a CSSE learner: GL/CEM/ISEB cards, behind "Explore another pathway" (one click, not removed).
- For a GL/CEM/ISEB learner: the other three pathways' cards, same mechanism.
- Mathematics Mock, English Mock, Continuous Writing, Focused Assessment: named as "Coming later," not rendered as clickable cards, since no real experience exists behind them yet.

## Deliberately not activated, and why

- **"Nearly ready" / "Mock due" readiness states** — no real evidence signal exists for either today (`MOCK_READINESS_CAPABILITY_ASSESSMENT.md`). Not fabricated.
- **Mathematics Mock / English Mock / Continuous Writing / Focused Assessment as real, clickable experiences** — none exist yet; naming them honestly as "coming later" satisfies the mandate's §5 category framework without activating anything unready.
- **Wellbeing-gated mock readiness** — no existing approved rule ties the wellbeing veto signal to mock-readiness verdicts; adding one would be a new educational algorithm, outside this mandate's authorisation.
- **A Mathematics-only or English-only CSSE mock** — the current CSSE Mock Exam engine is one combined experience (Standard/Adaptive); splitting it into per-subject mocks would be new product surface area, not a presentation change.

## Narrow defects found and fixed during implementation

- The initial redesign's no-pathway-selected fallback lost the CSSE option (only GL/CEM/ISEB remained in the equal-weight list). Found during production verification, fixed by extracting a shared `SimpleMockCard` component so all four pathways render with equal weight again in that specific case.

## Regression protection

No change to: Assessment Brain V1, Learning Engine V1, Educational Intelligence Engine V1, competency evidence, durable mastery, maintenance review, wellbeing protection, Family Choice, explainability, Mock Attempt Ledger, or any pathway's scoring logic. `app/mocks/[pathway]/page.tsx`'s only change (from the preceding Legacy Audit) is a 5-line additive tag on the CSSE entry's result object — GL/CEM/ISEB completions are unaffected, confirmed by direct source read (the tag is added only inside a `pathwayId === "csse"` conditional).
