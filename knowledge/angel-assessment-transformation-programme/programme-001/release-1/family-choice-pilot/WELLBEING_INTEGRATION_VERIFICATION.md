# Wellbeing Integration Verification

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11

---

## 1. The requirement

Per the governing instruction: prove that the existing wellbeing veto remains authoritative and cannot be bypassed by a family selection, and that no override mechanism exists.

## 2. Why this is architecturally sound before any test is run

The choice-injection point (`lib/learningEngine/sessionGenerator.ts`) has exactly one integration surface with wellbeing, and it is a read-only check against output that was already computed before the family-focus logic ever runs:

```ts
const vetoed = result.vetoedCompetencyCodes.includes(familyFocusCompetencyId);
...
const applied = !vetoed && relevantToThisArea;
if (applied) {
  for (const qt of focusSkillCodes) weakSkills.add(qt);
}
```

`result` (and therefore `result.vetoedCompetencyCodes`) comes from `getRecommendations()` → `computeRealRecommendationOrchestration()` → `orchestrateRecommendations()`, none of which were modified by this pilot. `lib/ali/wellbeing.ts`'s `computeWellbeingSignal()` — the actual veto logic — was not touched at all. There is no code path in this pilot that can set `vetoed = false` when the real computation says otherwise, no flag to disable the check, and no alternate injection route that skips it. The only way to reach `weakSkills.add()` for the chosen competency is through this one `if (applied)` branch, which is itself gated by `!vetoed`.

## 3. Real, organic proof (not simulated)

Rather than constructing an artificial test harness, this was proven with genuine data: during real browser-testing of the Family Choice Pilot (see `FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md` for full detail), MR-01 questions were deliberately answered incorrectly across two real practice sessions. This produced ≥3 genuine consecutive incorrect attempts in MR-01, which — with no special-casing, no test-mode flag — satisfied `lib/ali/wellbeing.ts`'s real Condition A (Compounding Failure) exactly as it would for any real learner.

On the next session, with the pilot's focus mechanism forced on (a temporary, reverted patch used only to bypass the still-pending migration 022 dependency — see below), the system:

1. Correctly computed `vetoedCompetencyCodes` to include `"MR-01"`.
2. Correctly refused to add MR-01's Question Types to `weakSkills`.
3. Correctly reported this back to the caller: `familyFocus = { applied: false, wellbeingPaused: true, ... }`.
4. Correctly surfaced this to the family, in plain language, before the session started: *"Your chosen focus (Arithmetic Calculation) is currently paused by wellbeing pacing — this session follows Angel's own selection only."*
5. Correctly removed MR-01 from Angel's own top recommendation too (Tier 0 applies before ranking, unmodified) — both halves of the UI (Angel Recommends panel, session composition debug line) agreed.

## 4. What was and wasn't touched to run this proof

The only code change during this verification was a one-line, clearly-commented temporary substitution in the pilot's own isolated page (`app/learning-intelligence/founder-validation/family-choice/page.tsx`), replacing a DB-fetched value with a hardcoded one, made necessary only because migration 022 (the table that remembers a family's choice across visits) has not yet been applied by the Founder. This patch did not touch `lib/ali/wellbeing.ts`, `lib/ali/recommendationOrchestration.ts`, `lib/ali/persistence/recommendationRuntime.ts`, or `lib/learningEngine/sessionGenerator.ts`'s wellbeing-check logic in any way — it only supplied the *input* the real, unmodified veto logic was then evaluated against. The patch was reverted immediately after the test, confirmed via a clean `tsc --noEmit` + `eslint` pass and a `git diff` showing only the pilot's intended, permanent code.

## 5. No override mechanism exists, by construction

There is no parameter, flag, environment variable, or UI control anywhere in this pilot that can force `applied = true` when `vetoed = true`. The only two ways `applied` can differ from `!vetoed` are: (a) the competency has no relevant content in the practice area (`relevantToThisArea === false`), which narrows behaviour further, never widens it past the wellbeing check; or (b) a future engineering change would have to deliberately remove the `!vetoed &&` clause — a change this report would need to flag, not one reachable through any input this pilot exposes.

---

## WELLBEING INTEGRATION STATUS: VERIFIED

The wellbeing veto is authoritative over family choice, with no override path, proven via a real, organically-triggered veto rather than a simulated one.
