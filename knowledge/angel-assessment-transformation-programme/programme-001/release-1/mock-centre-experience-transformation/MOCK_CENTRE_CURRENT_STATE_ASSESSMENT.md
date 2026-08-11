# Mock Centre Current State Assessment

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11
**Method:** Direct source read of `app/mocks/page.tsx`, `app/mocks/[pathway]/page.tsx`, `app/learning-intelligence/mock-exam/page.tsx`, `lib/mockMeta.ts`, `lib/mockProgress.ts`, `lib/learningEngine/mockReadiness.ts`, plus a live production fetch of `https://angel-11plus.vercel.app/mocks`. Not assumed from the Founder's screenshot alone.

---

## 1. Page structure, as it exists today

`app/mocks/page.tsx` renders, in this order, for every pathway identically:
1. Header + one-line description.
2. A static disclaimer ("original practice papers... not affiliated with...").
3. A short explainer distinguishing Personalised Practice from Mock Exams.
4. **Personalised Practice** — four cards (GL Verbal Reasoning, Maths Practice, Reading Practice, Vocabulary Practice), each linking to `/mocks/adaptive/{gl,maths,english,vocabulary}`.
5. **Mock Exams** — four cards (GL, CEM, CSSE, ISEB), one per `MockPathwayId`, shown unconditionally regardless of the learner's selected pathway.
6. **Recent Results** — last 3 `MockResult`s, showing pathway name, date, a bare percentage, and a chevron with no destination link.
7. A static "About these mocks" info box.

No pathway branching exists anywhere in this file. `getSelectedPathwayId()` is not called.

## 2. Pathway logic and learner profile data

`components/Navigation.tsx`'s "Mock" nav item is the only primary nav item with no CSSE/non-CSSE branch (confirmed in `NEW_ANGEL_LEGACY_EXPERIENCE_AUDIT.md` §1) — every pathway's "Mock" click lands here. The page itself never reads `getSelectedPathwayId()`, `getPathwayById()`, or any Educational Intelligence profile.

## 3. Existing mock engines

| Engine | Pathway | Content source | Educational Intelligence integration |
|---|---|---|---|
| `/learning-intelligence/mock-exam` | CSSE | `ali_question_bank`, `pathway="csse"` | Full — `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency`, Mock Attempt Ledger, real readiness/recommendation update on completion |
| `/mocks/[pathway]` (gl/cem/iseb) | GL/CEM/ISEB | `data/*.ts` static banks | None — writes only `lib/mockProgress.ts` (`user_stats`-adjacent, localStorage) |
| `/mocks/[pathway]` (csse entry) | CSSE (deprecated) | `data/maths.ts` | None; now excluded from `getMockResults()` (Legacy Audit fix) |
| `/mocks/adaptive/{gl,maths,english,vocabulary}` | GL only (confirmed: all four hardcode `pathway="gl"` in `fetchQuestionBank()`) | `ali_question_bank`, `pathway="gl"` | Partial — writes real evidence rows but is Practice, not a Mock, and is not GL-pathway-gated on this page |

**The CSSE Mock Exam results screen already substantially completes the educational loop** the mandate's §11 asks for: on completion it shows Updated skills profile (`CompetencyProfile`), Updated readiness (`ReadinessSummary`), Recommendations (`RecommendationSummary`), and a primary CTA to the Parent Dashboard — reusing real, unmodified components, not a duplicate intelligence engine. This is a genuine strength to preserve, not rebuild.

**What does not complete the loop:** the Mock Centre's own "Recent Results" list — bare `{r.totalScore}%` with a non-functional chevron, no destination, no next action.

## 4. Mock history

`lib/mockProgress.ts`'s `getMockResults()` is the single shared read path. It already correctly excludes Founder Validation results (`isFounderValidationResult()`) and, as of the Legacy Audit fix earlier this session, legacy CSSE mock results (`isLegacyCsseMockResult()`). `bestScoreForPathway()`/`countForPathway()` are pure, reusable helpers already used by both `/mocks` and `CssePathwayParentContent`'s Mock History section.

## 5. Readiness evidence

`lib/learningEngine/mockReadiness.ts`'s `assessMockReadiness()` is real, already-approved (Sprint 5 WP5C), and already surfaced on the Parent Dashboard (`CssePathwayParentContent.tsx`'s "Are they ready for a mock?" card). It is a pure categorical dispatch over three real inputs (`hasAnyEvidence`, `mockAttemptCount`, `topTriggerReason`) — explicitly, by its own docstring, "not a new calculation," "zero arithmetic," "zero new numeric thresholds." It produces exactly three verdicts: `practice-first`, `first-mock-valuable`, `mock-valuable`. Full detail and mapping to the Founder's proposed five-state model in `MOCK_READINESS_CAPABILITY_ASSESSMENT.md`.

**Not currently reused on `/mocks` itself** — this is the single biggest capability gap between what exists and what the mandate asks for, and it requires zero new educational logic to close: the function and its real inputs already exist, only the presentation is missing from this specific page.

## 6. Recommendations

`RecommendationExplanation`/`RecommendationSummary` (already reused on the Parent Dashboard and the Mock Exam results screen) are pure display components over the real Recommendation Engine's output — no href generation, text-only (confirmed in the Legacy Audit). Reusable here without any new logic.

## 7. Personalised Practice

Real, GL-pathway-only content (confirmed in the Legacy Audit — all four `fetchQuestionBank()` calls hardcode `pathway="gl"`), currently linked from nowhere except this page. This is both an information-architecture problem (mandate §3) and a pathway-isolation gap (Legacy Audit §4) — the same fix resolves both.

## 8. CSSE, GL, CEM, ISEB

- **CSSE**: has a real, evidence-led Mock (`/learning-intelligence/mock-exam`), real readiness evidence, real recommendations — the most-ready pathway, currently the least well-presented on this specific page (buried in an undifferentiated four-card list, `totalMinutes: 0` in `MOCK_CARDS` never actually rendered since the CSSE card hardcodes "Varies by mode").
- **GL/CEM/ISEB**: each has a real, working, unchanged legacy mock runner (`/mocks/[pathway]`) with fixed timing/sections and no Educational Intelligence integration. This is their genuine, current, correct experience — not a deprecated stand-in.

## 9. Responsive behaviour

Live production check (`https://angel-11plus.vercel.app/mocks`) at 958×910 (the environment's real viewport): the page is a single-column `max-w-2xl` stack. With 4 Personalised Practice cards + 4 Mock cards + disclaimer + explainer + history + info box, the page is confirmed long — matching the Founder's screenshot finding of excessive vertical length. No responsive breakpoint currently changes the layout (no grid at wider viewports); it is single-column at every size, unchanged desktop to mobile except browser chrome.

## 10. Database dependencies

`getMockResults()` (`lib/mockProgress.ts`, localStorage-backed `UserProgress.mockResults`), `fetchLearnerIntelligenceProfile()` (not currently called on this page — would be needed for `hasAnyEvidence`/`topTriggerReason`), and `ali_question_bank` (read-only, via the mock-exam page it links to). No new table or migration is required for anything this assessment recommends — see `MOCK_READINESS_CAPABILITY_ASSESSMENT.md`.

---

## Classification: REUSE / STRENGTHEN / MOVE / HIDE / RETIRE

| Element | Action |
|---|---|
| CSSE Mock Exam engine, its results-loop components | REUSE unchanged |
| `assessMockReadiness()`, `mockReadiness.ts` | REUSE — currently unused on this page, now surfaced here |
| `RecommendationExplanation`/`RecommendationSummary` | REUSE — read-only display |
| `bestScoreForPathway`/`countForPathway`/`getMockResults` | REUSE unchanged |
| GL/CEM/ISEB legacy mock runner (`/mocks/[pathway]`) | REUSE unchanged, functionally |
| Mock card visual design (chips, badges, skills-assessed pills) | STRENGTHEN — simplified per mandate §7 |
| Recent Results list | STRENGTHEN — completes the loop per mandate §11-12 |
| Personalised Practice section | MOVE — to `/reasoning` (the real home of GL-pathway Practise) |
| GL/CEM/ISEB card visibility for a CSSE learner | HIDE from the primary flow, offered via a clearly secondary "explore another pathway" mechanism |
| Nothing identified for RETIRE in this pass (the Legacy Audit's own RETIRE candidates — `/mock-test`, the deprecated `/mocks/csse` entry — are pre-existing, separate decisions outside this mandate's scope) | — |
