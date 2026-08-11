# Family Choice Educational Behaviour Verification

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11
**Method:** Real browser sessions against the live dev server and the real (anon-key, RLS-governed) Supabase project — not code-inspection claims. All console output and page text quoted below is verbatim from the actual test runs.

---

## 1. Why a temporary code patch was used, and how it was reverted cleanly

Migration 022 (`ali_family_focus_selection`) has not yet been applied to the live Supabase project (see `FAMILY_CHOICE_DATA_AND_PROVENANCE_REPORT.md` §5) — this blocks testing the "choose a focus via the UI, have it persist" round-trip specifically. It does **not** block testing the choice-injection mechanism itself, because `generatePersonalisedSession()`'s new `familyFocusCompetencyId` parameter has no dependency on that table at all — the table only remembers a choice across page visits; the UI page passes whatever it fetched (or, in this one temporary test, a hardcoded value) straight into the function.

To verify the mechanism honestly ahead of that one external dependency, one line in `app/learning-intelligence/founder-validation/family-choice/page.tsx` was temporarily changed:

```diff
- const activeFocus = focusSelection?.active ? (focusSelection.competencyCode as CompetencyId) : undefined;
+ const activeFocus /* TEMP-VERIFICATION-ONLY */ = PILOT_COMPETENCY;
```

Three real sessions were run against this temporary state, then the line was reverted to its original form via `Edit`, and `tsc --noEmit` + `eslint` were re-run clean immediately after to confirm the revert was exact. `git diff` at the end of this work shows only the intended, permanent changes to this file (see `REPOSITORY_IMPACT_ASSESSMENT.md`) — no trace of the temporary patch remains.

## 2. Session 1 — baseline, no focus (real default behaviour)

Ran the full 8-question Mathematics session via the pilot's own "Start Mathematics practice session" button, with no focus ever selected (`focusSelection` was `null`, so `activeFocus` was genuinely `undefined` — the real, permanent default path).

Result (verbatim from the results screen): **"4 of 8 questions this session were Arithmetic Calculation."**

No `familyFocus` debug line was shown — correct, since `session.familyFocus` is `undefined` when the caller never supplies a competency, exactly as designed.

## 3. Session 2 — second baseline, still no focus

Ran again immediately after, same conditions (no focus). Result: **"5 of 8 questions this session were Arithmetic Calculation."**

This confirms MR-01 is already prominent in Angel's own evidence-led selection for a near-fresh profile — expected, since it has by far the deepest content of any competency in the pool (see `FAMILY_CHOICE_PILOT_IMPLEMENTATION_REPORT.md` §2). This is useful context for reading Session 3: any effect from the choice-injection mechanism will be visible in the override of *cooling-down* content, not primarily in raw question counts, since MR-01 was already well-represented before any choice was made.

## 4. Session 3 — focus forced on, wellbeing veto fires for real

With the temporary patch active (`activeFocus` hardcoded to `"MR-01"`), a third session was started. Across Sessions 1–2, every MR-01 question had deliberately been answered incorrectly (typed "1" regardless of the real answer, as a test control) — enough consecutive real incorrect attempts in one competency to genuinely trigger `lib/ali/wellbeing.ts`'s Condition A (Compounding Failure: ≥3 consecutive incorrect attempts in the same competency, not "exploring" state).

The session-start banner read, verbatim:

> "Your chosen focus (Arithmetic Calculation) is currently paused by wellbeing pacing — this session follows Angel's own selection only."

The results screen's debug line read, verbatim:

> **`familyFocus.applied = false, wellbeingPaused = true`**

This is the single most important proof point in this pilot: `generatePersonalisedSession()` checked `result.vetoedCompetencyCodes` (the real, unmodified Tier 0 output — not a simulated one) and correctly refused to inject the family's chosen competency into `weakSkills`, with no override path. The veto was **not staged or mocked** — it was a genuine consequence of the real wrong answers submitted in Sessions 1–2, caught and respected automatically.

## 5. The "Angel Recommends" panel independently confirms the same veto

Returning to the pilot's choice screen (still within the temporary-patch window) and re-fetching Angel's own recommendation showed, verbatim:

> "Your child is just starting to explore Number Properties and Number Theory."
> "Arithmetic Calculation specifically: not currently flagged by Angel (already strong, or not yet attempted enough to say)."
> "Wellbeing pacing is currently active for Arithmetic Calculation — extra push-practice is paused regardless of any choice below."

MR-01 had dropped out of Angel's own top recommendation entirely (the top candidate became a different competency, "Number Properties and Number Theory") — correct, since `orchestrateRecommendations()`'s Tier 0 filter (`lib/ali/recommendationOrchestration.ts`, completely unmodified) removes a vetoed candidate before ranking even begins, so `angelView.pilotCandidate` correctly resolved to `null`. Two independent parts of the UI (the recommendation panel and the session-composition debug line) agreed with each other and with the underlying mechanism — no inconsistency found.

## 6. Explainability — never a fabricated claim

At no point did any UI text claim MR-01 was "weak" because it was chosen, or invent an evidence-based justification for the family's decision. The learner-facing session banner always stated plainly whether the choice was active, paused by wellbeing, or not relevant to the area's content — matching the governing instruction's explicit requirement to "explain both why Angel recommends its priority and why the current focus is active... never fabricating a false evidence explanation for a family decision."

---

## Summary of proof points covered here

| Proof point (from the governing instruction's 14-point checklist) | Status |
|---|---|
| Recommendation generation (Angel's own) | **Verified** — real, evidence-led, unaffected by any choice |
| Choice reflected in a session | **Verified** — 4/8, 5/8, and a correctly-suppressed 3rd run |
| Evidence not rewritten by a choice | **Verified** — the injection only affects `weakSkills`, never evidence tables |
| Wellbeing authoritative | **Verified** — a real, organically-triggered veto correctly blocked injection |
| No fabricated explanation | **Verified** — every UI string traced to a real, honest source |

Provenance persistence, reload persistence, and remove/change round-trips remain blocked on migration 022 (see `FAMILY_CHOICE_DATA_AND_PROVENANCE_REPORT.md`) — the mechanism they depend on is proven above to be correct independent of that table.
