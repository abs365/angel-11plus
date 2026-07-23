# Angel Educational Intelligence Programme — Phase 3.0 Final Report

**Educational Evidence Integration**

**Status: NOT committed.** Reused the verified foundation throughout — no architecture change, no UI redesign, no new educational model. Two genuinely new pieces of wiring were added (both pure composition of already-existing, already-tested functions); everything else is verification of what already existed.

---

## 1. Root cause addressed

Two distinct root causes, addressed separately:

- **WP1 (already fixed, this phase resumes it)**: `/english/[id]`, `/maths`, `/vocabulary`, `/writing` only wrote to `localStorage`/`user_stats`, never to `ali_student_question_history` — closed by the paused `lib/learningEngine/legacyPracticeEvidence.ts` integration (built in a prior turn, unchanged this phase).
- **WP3 (newly found and fixed this phase)**: `recordReadinessSnapshot()` — the Readiness History writer built in Phase 2A — had **never been called by any real code path**, only by its own test script. Educational Audit (mastery/durable-mastery via `processEvidenceForCompetency`) has been live throughout; Readiness History and the "What Changed" data it feeds have been dormant since the day they were built. This is now closed.

## 2. Activities integrated

| Activity | Evidence write (WP1) | Readiness snapshot (WP3, new this phase) |
|---|---|---|
| English | Live (paused, resumed) | **New**: `handleSubmit()` |
| Mathematics | Live (paused, resumed) | **New**: `finishSession()` |
| Vocabulary | Live (paused, resumed) | **New**: session-end branch of `markWord()` |
| Writing | Live (paused, resumed) | **New**: `requestAIFeedback()` success path only (the only point real evidence exists) |
| CSSE Practice Experience (`practice/[area]`) | Already live, unchanged | **New**: `goToNextOrFinish()`, reusing the profile it already fetches — no second fetch |

All five call sites use one new, minimal function: `recordLegacyPracticeSessionCompletion()` (legacy pages) or a direct `recordReadinessSnapshot()` call reusing an already-fetched profile (CSSE page) — both compose only pre-existing functions (`fetchLearnerIntelligenceProfile`, `recordReadinessSnapshot`). No new educational computation was written.

## 3. Evidence flow diagram

```
Legacy page answer/session-end                CSSE Practice Experience
        │                                              │
        ▼                                              ▼
recordLegacyPracticeEvidence()          recordAndAdvance() [unchanged]
        │                                              │
   resolveBankEvidenceContext()  ◄── ali_question_bank.id (canonical identity)
        │  (untagged? → stop here, no fabrication)
        ▼
recordPresentation() / recordOutcome()  ──► ali_student_question_history
        │                                    (Educational History — raw activity log)
        ▼
processEvidenceForCompetency()  ──► ali_educational_audit (mastery/durable-mastery)
        │                            (Educational Audit — LIVE since before this phase)
        ▼
  [session/activity ends]
        │
recordLegacyPracticeSessionCompletion()
        │
fetchLearnerIntelligenceProfile("csse")  ──► computeComponentReadiness() [unchanged]
        │
recordReadinessSnapshot()  ──► ali_educational_audit, conclusion_type='readiness-dimension'
                                (Readiness History — NEWLY LIVE this phase)
        │
fetchReadinessHistory() / computeWhatChanged()  ──► available for "What Changed", not yet
                                                      rendered by any page (see §9)
        │
app/learning-intelligence/parent/readiness-timeline/page.tsx
  → fetchEducationalMilestones() [unchanged] → ReadinessEvidenceTimeline [unchanged,
    already had a 'readiness-dimension' case — built ahead of data existing]
```

## 4. Database verification

**Not performed — genuinely attempted, genuinely blocked, not fabricated.** Two real attempts this phase, both failed for infrastructure reasons, not skipped:
1. Direct connectivity test to the configured Supabase host (prior turn) — no response.
2. `npx supabase start` (local dev stack) this turn — failed: Docker Desktop is not available/running in this sandbox (`"Docker Desktop is a prerequisite for local development"`, real CLI output, not assumed).

What was verified instead: `tsc --noEmit` clean, ESLint clean on every new/changed file, `next build` succeeds (48 routes), and both existing test suites pass in full (see §12) — including a fake in-memory Supabase harness that exercises the exact `recordReadinessSnapshot`/`fetchReadinessHistory` code paths a real database would run.

## 5. Browser verification

**Not performed — blocked by the same lack of a reachable backend** (a browser session against `localhost:3000` would hit the same absent Supabase connection). Not claimed. Exact procedure for a real environment is in §9 of `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md`'s style, extended below:

1. Apply migrations 015 (evidence columns), 016 (Batch 1 identity, 11 rows) in a real Supabase project.
2. Sign in (device-based profile), complete one English lesson (`eng-001`, which now has 4/4 questions identity-registered: `eng-001-q1/q2/q3/q4`).
3. Query `ali_student_question_history` for the answered question ids — confirm real rows.
4. Query `ali_educational_audit where learner_id = <profile>` — confirm a `readiness-dimension` row appears (new, wasn't possible before this phase) alongside any `mastery` rows.
5. Visit `/learning-intelligence/parent/readiness-timeline` — confirm the new readiness-dimension entry renders (generic copy, see §9).
6. Repeat steps 2-5 for Maths, Vocabulary, Writing.

## 6. Educational Audit verification

**Mechanism unchanged and already verified in a prior phase** (`processEvidenceForCompetency` → `recordAuditIfNewlyHigherEvidence`, mastery/durable-mastery conclusion types). Not touched this phase. Re-ran the existing test suite (`test-educational-intelligence-foundation.ts`) to confirm no regression — 27/27 assertions still pass.

## 7. Learning History verification

**The real work this phase.** `recordReadinessSnapshot()` is now called after every legacy-page session and every CSSE Practice Experience session. Verified via the existing (unmodified) test suite:
- First snapshot inserts exactly one record per component.
- An unchanged band does not insert a duplicate (idempotent under repeated calls — directly relevant now that this function is called from real, possibly-repeated user sessions, not just a test script).
- A real band change supersedes the prior record and inserts a new one, preserving full history.

These properties were tested when the function was built (Phase 2A) and are unchanged — re-run this phase to confirm the wiring didn't alter the function's own behaviour (it didn't; only new callers were added).

## 8. Readiness verification

`computeComponentReadiness()` itself is completely unchanged (still the same pure function `lib/learningEngine/profile.ts` already called before this phase). What's new is that its output now gets **persisted** via `recordReadinessSnapshot()` at session end, rather than only ever being computed fresh and discarded. No new readiness logic was written.

## 9. Parent timeline verification

**Data path is real and live as of this phase; presentation is intentionally not upgraded, per "no Parent dashboard redesign."** `app/learning-intelligence/parent/readiness-timeline/page.tsx` already calls `fetchEducationalMilestones()` with no conclusion-type filter, and `components/parent/ReadinessEvidenceTimeline.tsx` **already has an explicit `case "readiness-dimension":`** branch — built in an earlier sprint, ahead of any real data ever reaching it. Once migrations 015/016 are live, this page will render real readiness-dimension entries with zero further code changes.

**Disclosed limitation, left alone deliberately**: that existing case's copy is generic ("An update was recorded for {label}" / "This reflects a change in Angel's evidence for this area.") — it does not yet use `conclusionValue` (the actual band) or `computeWhatChanged()`'s richer "moved from X to Y" text. Wiring that in would mean editing `ReadinessEvidenceTimeline.tsx`'s presentation, which is explicitly out of scope this phase ("Do not build... Parent dashboard redesign"). Flagged, not silently upgraded.

**Second disclosed limitation**: none of the 4 legacy pages ever call `setSelectedPathway("csse")` (verified: zero matches across all 4 files). Evidence recording itself does not depend on this flag — `recordLegacyPracticeEvidence` only checks `ali_question_bank` membership, nothing pathway-related. But every parent-facing page (including `readiness-timeline`) gates its *display* on `getSelectedPathwayId() === "csse"`. A family that has already chosen the CSSE pathway (e.g. via `/pathways`) sees everything described above end-to-end. A family that never explicitly chose a pathway will have real evidence recorded but won't see it on these parent pages until they do. Not fixed here — auto-setting a family's pathway from legacy-page usage would be a real behavioural change, not an evidence-wiring fix.

## 10. Remaining educational activities still not contributing evidence

- **Reasoning subjects** (`/reasoning`, `/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning`): correctly out of scope — CSSE's pathway doesn't test these, confirmed in Phase 2C.
- **Mock exam pages** (`app/mocks/adaptive/*`, `app/learning-intelligence/mock-exam`): already write evidence via `recordOutcome` directly (unchanged, pre-existing), but do **not** yet call `recordReadinessSnapshot()` — Readiness History wiring in this phase was scoped to WP1's explicit four activities plus the CSSE Practice Experience page. This is a real, disclosed gap, not an oversight: extending to the mock pages would mean touching additional routes, which both this phase and the prior Phase 2C directive explicitly said not to do without being asked.
- **~189 items from Phase 2C's identity coverage gap** (Vocabulary flashcards, non-discursive Writing prompts, and all four reasoning subjects) still have no `ali_question_bank` row at all — the same structural gap Phase 2C reported, unchanged by this phase, since WP1 explicitly said "where no canonical Educational Identity exists, record no evidence," not "create identities."

---

## Verified this phase
- `tsc --noEmit`: clean.
- ESLint: clean on every new/changed file (`lib/learningEngine/legacyPracticeEvidence.ts` and the 5 page edits) — all pre-existing errors elsewhere reconfirmed unrelated via `git diff --stat` (additive-only changes) and, for `app/maths/page.tsx` specifically, a direct before/after stash comparison proving the flagged lines predate this phase's edit.
- `next build`: succeeds, 48 routes.
- Both existing test suites re-run in full: `test-educational-intelligence-foundation.ts` (27/27) and `test-educational-identity-registration.ts` (47/47) — zero regressions.

## Not committed, not applied to any database, per explicit instruction.
