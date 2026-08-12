# Active Pathway Context — Architecture

Founder directive: "ANGEL 11+ ACTIVE PATHWAY CONTEXT AND LEARNER FOCUS TRANSFORMATION", approved for implementation. This document records the architecture decided after reconnaissance, before implementation, per Section 25.

## 1. Two concepts, kept separate

- **TARGET PATHWAY** — what examination the family is preparing for. Family-selected. Persistent. Governs routing.
- **LEARNING NEED** — what the learner currently needs help with. Angel-determined from evidence (Educational Intelligence Engine, Recommendation Engine). Unchanged by this increment.

This increment only touches the first concept and how it governs routing. It does not add, remove, or reweight any recommendation logic.

## 2. Supported examination destinations

Real, switchable exam pathways: `gl`, `cem`, `csse`, `iseb`, `independent` (all five already defined in `lib/pathways.ts` / `types/pathway.ts`).

`core-foundation` and `not-sure` remain valid **starting states** for a family who has not yet chosen an exam board — `lib/pathways.ts` already describes them this way ("the best starting point... before a pathway is chosen", "you can update your pathway at any time"). They are excluded from anywhere the product asserts a real exam target: the new top-bar switcher's list of destinations, and any copy that names the active pathway. A new `lib/activePathway.ts` module defines this distinction once, centrally:

```ts
export const REAL_PATHWAY_IDS = ["gl", "cem", "csse", "iseb", "independent"] as const;
export function isRealPathway(id: string | undefined): id is RealPathwayId { ... }
export function getActivePathway(): Pathway | undefined // real pathway only, else undefined
```

`/pathways` (School Intelligence) keeps its existing full onboarding catalogue, including Core Foundation and Not Sure Yet as options — this is the deliberate "family should not need detailed knowledge of examination providers" onboarding path (Section 18), and removing them there would regress that requirement. What changes is that nothing outside `/pathways` treats those two ids as if they were an exam board.

## 3. Canonical pathway-context mechanism

`lib/progress.ts`'s existing `getSelectedPathwayId()` / `setSelectedPathway()` (localStorage-backed) remains the single source of truth for the active pathway, per "do not create a second competing pathway system if a canonical mechanism already exists." No new client-side pathway store is introduced.

Switching pathway calls `setSelectedPathway(id)` and nothing else. It never touches `scores`, `completedLessons`, `mockResults`, `skillScores`, `aliCompetencySignal`, `aliLearningGain`, or `aliLearningProfile` — those fields are keyed by subject/competency/lesson id, not by pathway, so they are preserved automatically, by construction, simply by not being part of the write. This satisfies Section 6 items 1–5 without new merge/versioning logic.

## 4. Root cause of the routing leakage (Section 3)

Reconnaissance found four independent call sites that build a learner-facing href for a subject, each hardcoding the legacy `/${subject}` route with no pathway branch:

1. `lib/adaptiveEngine.ts` `buildItem()` — Daily Mission items.
2. `lib/parentInsights.ts` `buildFocusAreas()` / `SUBJECT_ADVICE` — Parent Dashboard focus areas.
3. `app/dashboard/page.tsx` — the "Continue Learning" quick-access row (Learn/Practise buttons).
4. `app/angel-plus/page.tsx` — `JOURNEY_LINKS` ("Learning Hub"/"Practice" cards).

None of these are isolated typos. The actual root cause: **no shared, canonical function has ever existed to resolve "the correct destination for subject X under the learner's active pathway."** `getEligibleSubjectKeys()` (`lib/ali/pathwayEligibility.ts`) already does the pathway-aware *filtering* half of this problem correctly, and is used by `buildDailyMission()` — but nothing did the pathway-aware *routing* half. Every call site above independently re-derived a legacy href instead of calling one shared resolver, because no such resolver existed to call. `parentInsights.ts` additionally never applied `getEligibleSubjectKeys()` at all, so a CSSE parent could theoretically see focus-area advice for a subject CSSE does not even test.

Fix: one new function, `resolveSubjectHref(subject, pathwayId)`, added to `lib/ali/pathwayEligibility.ts` (the existing canonical home for pathway/subject logic), used by all four call sites. `buildFocusAreas()` additionally gains the same `getEligibleSubjectKeys()` filter `buildDailyMission()` already uses.

```ts
const CSSE_PRACTICE_AREA_BY_SUBJECT: Partial<Record<SubjectKey, PracticeAreaId>> = {
  english: "reading-comprehension",
  maths: "mathematics",
  writing: "continuous-writing",
};
export function resolveSubjectHref(subject: string, pathwayId: string | undefined): string {
  if (pathwayId === "csse") {
    const area = CSSE_PRACTICE_AREA_BY_SUBJECT[subject as SubjectKey];
    return area ? `/learning-intelligence/practice/${area}` : "/learning-intelligence/learn";
  }
  if (subject === "mock-test") return "/mocks";
  return `/${subject}`;
}
```

Vocabulary has no dedicated CSSE practice area (Assessment Brain V1 defines no Vocabulary competency — `lib/learningEngine/practiceContent.ts`'s own documented reason) so it falls back to the Learn hub, matching the existing, already-shipped copy on the Practice area selector page that says the same thing to the learner directly.

## 5. Top-bar pathway context

New component `components/PathwaySwitcher.tsx`, rendered inside the existing `Navigation.tsx` top bar (desktop) and mobile drawer. Reads the active pathway via `getActivePathway()`. Shows the short name ("CSSE") when a real pathway is active, or "Choose target" when none is set or the current selection is `core-foundation`/`not-sure`. Opens a small popover listing only the five real pathways (never Core Foundation or Not Sure).

No permanent sidebar is restored — this sits inside the existing top bar's overflow-safe layout, next to (not replacing) the five primary daily-journey items, matching Section 5's explicit non-goal.

## 6. Switching safety

Selecting a pathway when none is currently set (or the current selection is `core-foundation`/`not-sure`) applies immediately — there is no real target to lose. Selecting a *different real* pathway than the current one opens a confirmation dialog (new `components/PathwaySwitchConfirm.tsx`) naming the current and new pathway and stating that existing progress is kept, before calling `setSelectedPathway()`. No em/en dash in the dialog copy, per the standing Copy Quality Rule.

## 7. Evidence integrity (Section 7) — see `PATHWAY_EVIDENCE_INTEGRITY_ASSESSMENT.md` for the full evidence

Summary: evidence tables (`ali_student_question_history`, `ali_durable_mastery`, `ali_educational_audit`) carry no pathway column, and the active pathway itself currently has **no server-side persistence at all** — it exists only in client localStorage. Building full database-level pathway-tagging into the evidence tables would mean changing the Learning Engine's write path across many call sites, which this increment's own scope discipline (Section 15, Section 16, "prefer the smallest safe implementation") rules out. Instead:

- Evidence is shown to already be safe from cross-pathway contamination **by construction**: the Learning Engine's competency/mastery/durable-mastery layer is only ever invoked for CSSE (`lib/learningEngine/profile.ts`'s `pathwayEligible` gate), and CSSE's competency-code namespace (Assessment Brain V1 IDs) never overlaps with the legacy pathways' `SkillType` namespace, so a `(profile_id, competency_code)` row can never be ambiguous between a CSSE and a non-CSSE reading.
- The one genuine gap is that `selectedPathwayId` has no database row at all, so "verify persistence at database level" (Section 20 G/H) cannot be performed today without new schema.
- A minimal, additive migration (`026_active_pathway_context.sql`) adds `selected_pathway_id text` and `pathway_selected_at timestamptz` to the existing `profiles` table only. It does not touch any evidence table. The app dual-writes to it best-effort (same fire-and-forget pattern `lib/progress.ts` already uses for `syncFullProgress`), with localStorage remaining the authoritative, always-available source. This migration requires Founder action to apply (this session's Supabase access is anon-key/SELECT-only, confirmed earlier this programme); the application works fully without it, degrading safely to localStorage-only pathway persistence exactly as it does today.

## 8. Beta page (Section 11-13) — see `BETA_EXPERIENCE_SIMPLIFICATION.md`

`/beta` currently combines public marketing, a duplicate pathway catalogue, and beta-programme status into one page, reachable from the footer's "About Angel 11+" link on every authenticated page. Smallest safe fix: branch on whether a real pathway is already selected. If yes (existing user), render a compact version — hero, one link to `/pathways` for comparison, a small Beta note — without the six-card catalogue. If no (new prospect), keep today's fuller comparison content, since that is genuine, still-needed onboarding information for someone who has not chosen yet.
