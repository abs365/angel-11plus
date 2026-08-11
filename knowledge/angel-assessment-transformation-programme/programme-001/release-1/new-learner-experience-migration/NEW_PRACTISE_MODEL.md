# New Practise Model (CSSE Pathway)

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Status:** Design + placement change only. The underlying Practise engine mostly already exists and is not being rebuilt — see §1.

---

## 1. What already exists (reuse, not rebuild)

Nearly everything the governing instruction asks Practise to support is real, already-built, and already verified this programme:

| Requirement (governing instruction §8) | Existing implementation |
|---|---|
| Recommended practice | `generatePersonalisedSession()` (`lib/learningEngine/sessionGenerator.ts`), driven by `getRecommendations()` |
| Chosen-focus practice | Family Choice Pilot's `familyFocusCompetencyId` parameter (same function, additive) |
| Weak-area practice | `weakSkills`-driven selection in `lib/ali/selection.ts`, unmodified |
| Maintenance practice | Review-due scheduling inside `generatePersonalisedSession()`, reserved ahead of general selection |
| Subject / competency-focused practice | `PRACTICE_AREAS` (`lib/learningEngine/practiceContent.ts`) — reading-comprehension / mathematics / continuous-writing |
| Progressive challenge | Cooldown/mastery-resurface logic in `lib/ali/selection.ts` |
| Explanations after attempts | `generateExplanation()` (`lib/ali/explainability.ts`), already wired into session results |
| Evidence collection | `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency` — the same pipeline used everywhere else |
| Wellbeing protection | `computeWellbeingSignal()`, Tier 0 veto — unmodified, already proven authoritative in the Family Choice Pilot |

The route (`app/learning-intelligence/practice`, `app/learning-intelligence/practice/[area]`) already exists and is functionally correct.

## 2. What changes this release

**Only reachability, not content or logic:** the CSSE-pathway top nav's "Practise" item points directly at `/learning-intelligence/practice` instead of the old `/reasoning` hub (see `NEW_ANGEL_INFORMATION_ARCHITECTURE.md`). This is the single concrete change — making an already-real, already-evidence-driven experience actually reachable as a primary destination for CSSE families, rather than requiring several clicks through the Parent Dashboard or Revision Planner to find it (confirmed via investigation: today it has no top-level nav entry at all).

## 3. Answering the learner's three questions (governing instruction §8)

All three are already substantially answered by existing, real mechanisms — no new computation needed:
- **What am I practising?** — `PersonalisedSession.activities[].explanation`, already generated per-question via `generateExplanation()`.
- **Why?** — `PersonalisedSession.summary`, the parent-audience explanation already surfaced at session start.
- **How am I improving / what next?** — the results-mode components already wired into `practice/[area]/page.tsx` (`CompetencyProfile`, `EvidenceProfile`, `DiagnosticOverview`, `ReadinessSummary`, `RecommendationSummary`).

## 4. Continuous Writing as a selectable practice focus

Per governing instruction §8 ("must eventually exist as a selectable practice focus, but do not implement unsupported scoring"): Continuous Writing is already one of the three `PRACTICE_AREAS`, and the writing-feedback compliance fix (previous increment) already removed the unsupported CSSE-scoring claim from its feedback endpoint. No further change is proposed or made here — this requirement is already satisfied by existing, corrected work.

## 5. Explicitly out of scope this release

- No change to `selectQuestions()`, `generatePersonalisedSession()`, or any evidence-pipeline logic.
- No new Continuous Writing scoring model.
- No change to the non-CSSE `/reasoning` practice experience.
