# ANGEL 11+ — Year 4 / 5 / 6 Coverage Matrix

**Status:** Primary source `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §8 (Preparation-Horizon findings), §21 (architecture proposal), §24.8 (independently re-verified, unchanged by production reconciliation). This pass re-confirmed the negative finding via an independent code search and did not find any contradicting evidence.

---

## 1. The honest headline

**There is no functional Year 4 / Year 5 / Year 6 coverage matrix to populate, because no content in `ali_question_bank` is targeted, gated, or filtered by year group at all.** A literal matrix (rows = competency, columns = Year 4/5/6, cells = question count available at that year) cannot be constructed from the current schema — every cell would have to read "same pool as every other year," which is not a matrix, it is a confirmation of absence. This section states that plainly rather than fabricating a matrix that implies differentiation which does not exist.

## 2. What was checked to confirm this (this pass, independently)

- `ali_question_bank`'s live 30-column schema (confirmed via direct `select *` against production, anon key) has **no `year`, `year_group`, `key_stage`, or equivalent column.**
- `grep -rn "year" lib/ali/assessmentHierarchy.ts` — the module whose name would suggest year-stage logic — **zero matches.**
- The only place "Year 4/5/6" text exists anywhere in `lib/` is `lib/pathways.ts`'s `recommendedYears` field (e.g. `"Year 5–6"`, `"Year 4–5"`) — a **plain descriptive string rendered on the pathway-selector page for parents**, not a value read by any content-selection or eligibility function. Confirmed no shared identifier links `pathways.ts`'s pathway records to `lib/ali/pathwayEligibility.ts` or any query against `ali_question_bank`.

## 3. What DOES exist (and why it still doesn't close this gap) — authoritative, Capacity Audit §8

A genuinely well-built **Preparation Horizon** engine exists: `lib/learningEngine/preparationClock.ts` + `preparationStage.ts` computes a real 7-value stage from time-remaining + evidence + school year, including an explicit Year-4-vs-Year-6 safeguard (`preparationStage.ts:87`). **Its own code comment states it is "deliberately kept to messaging/emphasis only this increment, not wired into which questions get selected"** (`preparationStage.ts:104-106`) — confirmed at both real call sites (`app/dashboard/page.tsx:439-460`, `app/pathways/page.tsx:97-102`): it only changes a dashboard tagline string.

**Concretely proven** (Capacity Audit §8, re-verified unchanged at §24.8): a Year 4 learner and a Year 6 learner with identical practice history are served the **identical** Practice question set and sequence by `generatePersonalisedSession()` → `lib/ali/selection.ts`, which takes no school-year or clock parameter at all. Mock-attempt creation (`app/learning-intelligence/mock-exam/page.tsx`) has exactly one gate — `isMockFormAvailable`, an existence check — with **zero reference to preparation stage, year, or readiness anywhere in that path.** A Year 4 learner with 20 months remaining can start a full Mock exactly as freely as a Year 6 learner with 3 weeks remaining.

## 4. The matrix, honestly rendered

| Competency / Subject | Year 4 | Year 5 | Year 6 | Basis |
|---|---|---|---|---|
| Mathematics (all 6 MR-series competencies) | Same 202-question practice pool | Same 202-question practice pool | Same 202-question practice pool | No year filter exists |
| English Reading (all 9 skill values) | Same 142-question practice pool | Same 142-question practice pool | Same 142-question practice pool | No year filter exists |
| Writing | Same 7-question practice pool | Same 7-question practice pool | Same 7-question practice pool | No year filter exists |
| Mock access | Ungated by year | Ungated by year | Ungated by year | `isMockFormAvailable` only checks existence |
| Difficulty (`content_difficulty`: easy/medium/hard/challenge) | Not mapped to year expectations anywhere in code | (same) | (same) | No mapping function found |

## 5. What this means for the Founder's "late entrant vs long-runway learner" requirement

Per Capacity Audit §21/§24.11 — **this is judged the single biggest verified educational gap in the entire audit**, ranked above the family-depth/teaching gaps, because it is a complete architectural absence (an engine that computes an answer nobody reads) rather than a thin-but-present capability, and because it directly contradicts the Founder's own stated core requirements: a late Year 6 entrant should not be forced through unnecessary foundation work, and a Year 4 long-runway learner should not be able to drill Mocks prematurely. **Neither protection exists in production today.**

## 6. Recommended fix (proposal only, from Capacity Audit §21/§22 — not implemented, no architecture rebuild required)

Wire the existing, already-correct clock into two real decision points: (a) Mock-attempt-creation gating (block/limit Mock access for FOUNDATION-stage learners), (b) fusion with the already-working `weakSkills` override in `lib/ali/selection.ts` so stage and genuine-gap evidence combine into one selection decision. This is a **connection problem, not a build problem** — both engines already exist and are individually correct; they have simply never been wired together. A rapid baseline/placement diagnostic for late entrants (currently entirely absent — no onboarding wizard exists anywhere, `ensureProfile()` sets only `auth_user_id`/`device_id`/`name`) is the one genuinely new, bounded piece of work needed to make the late-entrant half of this work correctly on day one.

---

## Summary table

| Metric | Value | Source |
|---|---|---|
| Year-differentiated content that exists | None | This pass + Capacity Audit §8 |
| `year`/`year_group` column in schema | Does not exist | This pass, direct schema read |
| Preparation Horizon engine | Exists, computes correctly | Capacity Audit §8 |
| Preparation Horizon wired into content/Mock selection | No (0%) | Capacity Audit §8/§24.8 |
| Late-entrant placement diagnostic | Does not exist | Capacity Audit §9/§21 |
| Ranked severity vs. other findings | Biggest verified gap in the whole audit | Capacity Audit §24.11 |
