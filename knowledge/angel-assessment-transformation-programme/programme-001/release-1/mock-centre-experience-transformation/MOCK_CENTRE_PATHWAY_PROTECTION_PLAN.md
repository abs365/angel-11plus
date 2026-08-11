# Mock Centre Pathway Protection Plan

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11

---

## What is shared vs pathway-specific

**Shared (the new shell):** page layout, section order, card visual design, copy tone, the "Explore another pathway" disclosure mechanism, the trimmed history/info sections.

**Pathway-specific (untouched):**
- GL, CEM, ISEB mock runners (`app/mocks/[pathway]/page.tsx`) — zero logic changes. Their sections, timing, question banks (`data/*.ts`), and scoring remain exactly as they are today.
- CSSE mock engine (`/learning-intelligence/mock-exam`) — zero logic changes. Standard/Adaptive mode selector, Educational Intelligence integration, Mock Attempt Ledger writes, all unchanged.
- Readiness evidence — CSSE-only, since it is the only pathway with a real Educational Intelligence evidence model. GL/CEM/ISEB are not given a fabricated readiness signal to make the page look uniform.

## What must not happen

- CSSE architecture assumptions (Educational Intelligence, competency evidence, `ali_question_bank`) must not be introduced into the GL/CEM/ISEB card rendering path. Their cards read only `MockPathwayId`, `bestScoreForPathway()`, and static `data/*.ts`-derived metadata — the same real, existing data they already use.
- The new pathway-prioritisation logic (which single card is "primary") must degrade safely to the current all-four-cards-equal behaviour when `getSelectedPathwayId()` is null — never assume a pathway that hasn't been chosen.
- The relocated Personalised Practice section on `/reasoning` must not be pathway-widened — it remains GL-only, exactly as its underlying `fetchQuestionBank(..., "gl")` calls already are; it is not linked from anywhere a CSSE learner would reach it.

## Regression coverage required (see `MOCK_CENTRE_PRODUCTION_VERIFICATION_REPORT.md`)

Each of the four pathways' own mock-taking flow (card → runner → results → history) must be exercised on production after implementation, not assumed safe because the runners weren't touched. `/reasoning` must be verified to gain the relocated Personalised Practice section without disturbing its existing four reasoning-subject cards.

## Why the shell can be shared safely

The shared shell only ever branches on `MockPathwayId` (a value already used identically across the whole codebase — `MOCK_CARDS`, `bestScoreForPathway`, `MOCK_SUGGESTED_PREPARATION` all already key off it) and `getSelectedPathwayId()` (already the single source of truth `Navigation.tsx` itself uses for CSSE/non-CSSE branching). No new pathway concept, enum, or eligibility rule is introduced.
