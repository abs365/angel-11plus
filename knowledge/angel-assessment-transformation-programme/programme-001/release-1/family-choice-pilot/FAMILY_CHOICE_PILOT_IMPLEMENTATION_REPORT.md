# Family Choice Pilot — Implementation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Code complete, typechecked, linted, built, and browser-verified. One external dependency remains before the feature is fully live end-to-end — see §6.

---

## 1. What this pilot proves

The smallest real, working implementation of "Angel Recommends + Family Chooses + Angel Adapts + Mastery is Protected," for exactly one competency, as directed. Not a design document — real code, a real (additive) schema change, and real browser-verified behaviour.

## 2. Pilot competency: MR-01 (Arithmetic Calculation)

Selected from real repository evidence, not arbitrarily:

- **Real assessment evidence:** 23+ production `ali_question_bank` rows tagged with a Question Type mapped to MR-01 (`QT-MR-01` ×8 in migration 013, ×15 in migration 016), by far the deepest content of any competency in the live pool. Three of the six Founder Validation Assessment items (`fv-mth-001`, `fv-mth-005`, `fv-mth-006`) also map to MR-01, so this competency already has genuine, live-generated learner evidence.
- **Practice content:** live today in the production "Mathematics" Practice area (`app/learning-intelligence/practice/[area]/page.tsx`, `sessionSize: 8`) — no new content authoring required.
- **Educational Intelligence support:** `getQuestionTypesForCompetency("MR-01")` resolves to 5 real Question Types (`QT-MR-01/02/03/09/12`); `computeRealEducationalState`, `computeCompetencyConfidence`, and the recommendation pipeline all already operate on it correctly (verified live in browser testing, §below).
- **Durable mastery support:** the durable mastery evaluation path (`evaluateDurableMastery`, `ali_durable_mastery`) is competency-agnostic and already exercises MR-01 the same as any other competency.
- **No unresolved evidence gate:** unlike AR-01 (Gate 3, deferred) or WC-01/WC-02 (Continuous Writing, explicitly excluded from this pilot by the governing instruction), MR-01 carries no standing evidence restriction.

## 3. The choice-injection point

Exactly one new parameter on exactly one existing function — `lib/learningEngine/sessionGenerator.ts`'s `generatePersonalisedSession(supabase, profileId, areaId, now, familyFocusCompetencyId?)`. Every existing caller (the live Practice pages) omits the fifth argument and the function behaves byte-for-byte as before — verified by browser-testing the production `/learning-intelligence/practice/mathematics` route after this change (§ below).

When a caller does supply a competency, its Question Types are **unioned into the same `weakSkills` set** `selectQuestions()` (`lib/ali/selection.ts`, completely unmodified) already accepts from Angel's own evidence-based `priority` list — the exact "mechanical lever" identified in `ASSESSMENT_TO_LEARNING_CLOSED_LOOP_DESIGN.md`. This never replaces Angel's own recommendation (`result.ordered`/`result.explanations` are computed identically, before the family-focus logic runs at all) and never fabricates a `RecommendationCandidate`.

Two honesty guards, both real and both verified:

1. **Wellbeing-veto-aware.** Before injecting, the function checks `result.vetoedCompetencyCodes` — the real, unmodified Tier 0 output. If the chosen competency is currently vetoed, injection is withheld entirely. No override path exists. See `WELLBEING_INTEGRATION_VERIFICATION.md` for the real, organically-triggered proof of this.
2. **Area-scoped and honestly reported.** The returned `PersonalisedSession.familyFocus` object (`{ competencyId, label, applied, wellbeingPaused }`) always tells the truth about what happened — `applied: false` when the competency had no relevant content in this area, or when wellbeing paused it. Never claims an effect that didn't occur.

## 4. Provenance persistence

New table `ali_family_focus_selection` (migration 022, additive-only) — one row per profile, `{ competency_code, source: 'family-selected', active, selected_at, removed_at }`. RLS follows the authenticated-owner pattern established in migration 020. Read/write via `lib/ali/persistence/familyFocusStore.ts` (`fetchFamilyFocusSelection` / `saveFamilyFocusSelection` / `removeFamilyFocusSelection`), matching `durableMasteryStore.ts`'s established conventions exactly (graceful failure, never throw).

## 5. Controlled UI surface

New isolated route `app/learning-intelligence/founder-validation/family-choice/page.tsx`, matching this project's established isolation convention (mock-exam, founder-validation/csse). Shows Angel's real recommendation (with the real parent-audience explanation text), MR-01's own specific status, a wellbeing-pause banner when relevant, the current chosen-focus state, and choose/remove controls. A real Mathematics practice session runner (recordPresentation/recordOutcome/processEvidenceForCompetency — the exact same evidence pipeline the production Practice page uses) follows, ending on a composition summary that reports `familyFocus.applied`/`wellbeingPaused` honestly.

## 6. What is verified vs. what remains

**Verified, real, in-browser, this session:**
- Angel's own recommendation renders correctly from real evidence.
- A full 8-question Mathematics session runs end-to-end, writing real evidence (`recordOutcome`/`processEvidenceForCompetency`, no console errors).
- The production Practice page (`/learning-intelligence/practice/mathematics`) is provably unaffected — same code path, same behaviour, before and after this change.
- The wellbeing veto is authoritative and cannot be bypassed by a family choice — proven with a real, organically-triggered veto (not simulated), see `WELLBEING_INTEGRATION_VERIFICATION.md`.
- `tsc --noEmit`, `eslint`, and `next build` all pass clean.

**Not yet verified (one external dependency):**
- Migration 022 has not yet been applied to the live Supabase project. Exactly like migration 021 earlier in this programme, this requires elevated DB privileges (`create table`, `enable row level security`, `create policy`) this environment's anon key cannot perform — it must be applied by the Founder via the Supabase Dashboard SQL Editor. Until then, `ali_family_focus_selection` reads/writes fail gracefully (confirmed: `console.warn`, no crash, "No focus chosen" honestly shown) but the choose/remove buttons have no persistent effect across page reloads.
- The choice-injection mechanism itself was independently verified via a temporary, reverted code patch that does not depend on the new table at all (see `FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md` for exactly what was patched, tested, and reverted, with the `git diff` confirming a clean revert).

See `FOUNDER_VALIDATION_INSTRUCTIONS.md` for the exact steps to complete verification once migration 022 is applied.

---

## FAMILY CHOICE PILOT STATUS: READY, PENDING ONE FOUNDER STEP (apply migration 022)

Every part of this pilot within engineering control — the choice-injection mechanism, provenance schema/persistence code, the controlled UI, and all safety guards (wellbeing, evidence-pipeline integrity, no regression) — is implemented and verified. The single remaining step is a Supabase Dashboard SQL Editor action only the Founder can perform, after which the pilot is immediately fully testable end-to-end with no further code changes.
