# AEP-001 — Academic Integrity Correction — Evidence Package

**Angel 11+, Version 3.0 Academic Excellence Programme**
**Status:** Implemented. Corrective scope only, per the AEP-001 authorisation's stop condition.

---

## 1. Engineering Summary

Corrected the two critical academic-integrity defects identified in `AXP-001_ACADEMIC_ASSESSMENT_REPORT.md` §6.1 and §6.2:

1. **CSSE mock content sourcing** — the CSSE mock's "Mathematics" section now draws from the real `data/maths.ts` bank (20 real questions) instead of the Numerical Reasoning bank. The "English & Language" section, which has too little real content (10 questions across 3 passages, requiring a passage UI the mock engine doesn't have) to honestly fill a 15-question section, is now marked "Coming soon" with an explicit reason shown to the learner, rather than being filled with Verbal Reasoning content mislabelled as English.
2. **"Personalised Practice" disclosure** — all four adaptive routes (GL Verbal Reasoning, Maths, Reading, Vocabulary) run on synthetic dev fixtures 100% of the time in current production (confirmed, not assumed — see §3). Marketing and intro-screen copy that claimed "no two sessions are identical" and "your weak spots come back around intelligently" — claims that are actually false under this always-synthetic behaviour, since fixture sessions never persist history between attempts — has been replaced with accurate copy, and an honest "small sample set" disclosure now appears on the Mock Centre cards and each route's intro screen, before the learner starts, not only after.

Two integrity guards (Phase 4) were added: a subject-authorisation assertion reused from the existing `pathwayEligibility.ts` map, and an empty-bank guard that fails loudly at build/module-load time instead of silently rendering a blank screen.

## 2. Critical Defects Confirmed

Both AXP-001 §6.1 and §6.2 findings were independently re-verified against live source before any code change (Phase 1), not taken on trust:

- Confirmed `app/mocks/[pathway]/page.tsx`'s `MOCK_CONFIGS.csse` sourced "English & Language" from the `vr` (Verbal Reasoning) bank and "Mathematics" from the `nr` (Numerical Reasoning) bank.
- Confirmed all four `data/ali/*SyntheticFixture.ts` files are the sole content source for `/mocks/adaptive/{gl,maths,english,vocabulary}` whenever `fetchQuestionBank()` returns empty rows — and, since ALI migrations 004–007 are still unapplied to production (per this project's own prior sessions), this is not an edge case but the current, universal, unconditional production behaviour for all four routes.
- **One correction to AXP-001 itself, surfaced during verification:** the report states "nothing in the live UI discloses this to a learner or parent." That's an overstatement — a disclosure banner *did* already exist, but only mid-session (after "Start Practice" was clicked), using soft wording ("more questions coming soon") that undersells that the content is fully synthetic placeholder data, not a partial real bank. The defect is better described as *inadequate and late* disclosure, not *absent* disclosure. This distinction shaped the fix: strengthen and move the disclosure earlier, rather than build one from scratch.
- **One data correction found during implementation:** AXP-001 states the real Maths bank has "20 (10 reasoning + 10 quick-arithmetic)" questions. `data/maths.ts` exports two separate arrays — `mathsQuestions` (10) and `quickArithmetic` (10) — which a first-pass read of the file missed (only `mathsQuestions` was initially wired in). Caught by the pure-function verification script (§11), which asserted "≥15 real questions available" and failed with only `mathsQuestions` wired in. Both arrays are now combined for the CSSE Mathematics section, giving the true 20-question pool AXP-001 described.

## 3. Root Cause Analysis

- **CSSE mismatch:** architectural — the mock engine's `BANKS` map only ever had keys for the four reasoning banks (`vr`/`nvr`/`sr`/`nr`); no key existed for English, Maths or Vocabulary content, so CSSE (and GL/CEM/ISEB) could only ever be built from reasoning content, regardless of what each pathway's real exam actually tests.
- **Synthetic-fixture disclosure:** the fixtures were authored as a deliberate, reasonable engineering decision (ALI_DECISION_LOG.md) to unblock adaptive-engine code development ahead of the real hand-tagging pass. They were never swapped for real content because the hand-tagging pass — explicitly a human task per this project's own "do not automate metadata generation" precedent — was never done, and the Supabase migrations that would carry real content were never applied to production. The mid-session banner correctly flagged this but the intro screen and Mock Centre marketing copy were written assuming the adaptive path would normally be live, with fixture as a rare fallback — not, as turned out, the constant reality.

## 4. Files Updated

- `app/mocks/[pathway]/page.tsx` — CSSE section correction, `ComingSoonSectionConfig` type, Maths bank adapter, two integrity guards.
- `app/mocks/page.tsx` — Mock Centre card copy (CSSE + all 4 Personalised Practice cards).
- `app/mocks/adaptive/gl/page.tsx`, `.../maths/page.tsx`, `.../english/page.tsx`, `.../vocabulary/page.tsx` — intro-screen copy, upfront sample-content disclosure, strengthened mid-session banner wording.
- `lib/ali/pathwayEligibility.ts` — added `assertSubjectAuthorisedForPathway()`.
- `lib/mockMeta.ts` — CSSE preparation/relevance copy corrected to match the new section state.

## 5. Routes Corrected

- `/mocks/csse` — Mathematics now real; English & Language honestly marked "Coming soon."
- `/mocks/adaptive/gl`, `/mocks/adaptive/maths`, `/mocks/adaptive/english`, `/mocks/adaptive/vocabulary` — disclosure and wording corrected.
- `/mocks` (Mock Centre) — CSSE card and all 4 Personalised Practice cards corrected.

**Not touched (explicitly out of scope, per the AEP-001 mission's two named defects):** `/mocks/gl`, `/mocks/cem`, `/mocks/iseb` static mock section sourcing. AXP-001 §6.2 documents real, lesser-severity mismatches there too (e.g. GL's "Vocabulary Challenge" section actually draws from the Verbal Reasoning bank). These are left for a future, separately-authorised corrective pass — see §16.

## 6. Synthetic or Fixture Content Removed From Production

None removed. The fixtures remain as the (now honestly and visibly disclosed) fallback for when the real ALI question bank is empty — removing them outright would replace a disclosed placeholder with a broken route whenever Supabase is unreachable or unseeded, which is worse for learners, not better. This matches AEP-001's own Phase 2 priority order (real bank → disable/hide → honest unavailable state) — a genuine "real bank" swap wasn't possible without the still-outstanding human hand-tagging pass, so the corrective action taken is the explicitly sanctioned "at minimum" bar from AXP-001's own Priority Ranking #1: honest disclosure.

## 7. CSSE Mock Mapping Before and After

| Section | Before | After |
|---|---|---|
| "English & Language" | `vr` (Verbal Reasoning) bank, labelled as English | Marked `comingSoon`, not played, reason shown to learner |
| "Mathematics" | `nr` (Numerical Reasoning) bank, labelled as Maths | Real `data/maths.ts` bank (`mathsQuestions` + `quickArithmetic`, 20 questions), 15 selected |
| Mock total time | 40 min (both sections) | 20 min (only the real, playable section) |

## 8. User-Facing Claims Corrected

- Mock Centre + 4 adaptive intro screens: removed "no two sessions are identical" / "your weak spots come back around intelligently" (false under current always-synthetic behaviour) → replaced with "matched to your practice level" (true — tier selection is real, driven by genuine cross-app confidence data) plus an explicit "small sample set" disclosure shown before starting.
- CSSE Mock Centre card + intro description + `lib/mockMeta.ts` preparation/relevance copy: no longer imply English & Language is currently tested.
- Mid-session synthetic-fixture banners (all 4 routes): "more questions coming soon" → "not yet your full personalised set" (clearer that today's content is a fixed sample, not a partial real bank).

## 9. Integrity Guards Introduced

- `assertSubjectAuthorisedForPathway(pathwayId, subject)` in `lib/ali/pathwayEligibility.ts` — reuses the existing `PATHWAY_SUBJECT_KEYS` map (no new taxonomy). Called for CSSE's new Maths wiring; throws at module load if ever miswired. Deliberately **not** retroactively applied to GL/CEM/ISEB's existing, out-of-scope sections — see the in-code comment and §16.
- Empty-bank guard in `app/mocks/[pathway]/page.tsx` — iterates every pathway's available sections at module load and throws if any points at an empty bank, converting a would-be silent blank screen into a build-time failure.
- `ComingSoonSectionConfig` type — a type-level guarantee (not just a convention) that the quiz-flow (timer, question count, results) can never include a section with no real content behind it.

## 10. Protected Engine Verification

No files under `lib/ali/*`, `lib/adaptiveMockBuilder.ts`, `lib/adaptiveEngine.ts`, `lib/parentInsights.ts`, `lib/analytics.ts`, `lib/adaptiveDifficulty.ts`, or `lib/gamification.ts` were modified. `lib/ali/pathwayEligibility.ts` gained one new exported function (additive) but its existing `getEligibleSubjectKeys()`/`PATHWAY_SUBJECT_KEYS` were read, not changed. Confirmed via `git diff --stat` showing only the 8 files listed in §4.

## 11. Tests Added or Updated

No test framework exists in this repo (established precedent, not a gap introduced here). A throwaway pure-function verification script (`npx tsx`, deleted before commit) checked: the new guard accepts CSSE/maths and correctly rejects CSSE/verbal-reasoning; CSSE's eligible-subjects set matches its real exam; the combined real Maths bank has ≥15 questions with non-empty answers and no duplicate IDs. 7/7 passed on the second run (1 genuine failure on the first run — see §2 — caught and fixed before proceeding, not smoothed over).

## 12. Accessibility Verification

**Not completed.** The Chrome browser extension used for interactive verification in this environment was not connected this session (a known, previously-documented limitation on this project — prior phases record the same gap). No new interactive elements, ARIA roles, or focus-management patterns were introduced; all changes reuse existing component structures (badges, info boxes) already present elsewhere in this codebase. This is an honest gap, not a claim of completion.

## 13. Responsive Verification

**Not completed**, same reason as §12. All copy/layout changes reuse existing responsive classes (`max-w-2xl mx-auto`, existing card/badge patterns) already proven responsive elsewhere on these exact pages — no new layout primitives were introduced — but this was not independently re-confirmed in a browser this session.

## 14. TypeScript Verification

`npx tsc --noEmit` — clean, no errors, run twice (before and after the Maths-bank correction in §2).

## 15. Build Verification

`npm run build` — clean, run twice. All 38 routes registered correctly, including `/mocks/[pathway]` (dynamic), confirming the new module-load-time integrity guards (§9) did not throw for any real pathway/bank combination actually shipped.

Additional route-level check performed (curl against a local dev server, since the Chrome extension was unavailable): all 4 adaptive routes, `/mocks/csse`, `/mocks/gl`, `/mocks/iseb` returned HTTP 200; the CSSE page's server-rendered HTML contains the new "Coming soon" badge and honest reason text; each adaptive route's server-rendered HTML contains the new upfront "small sample set" disclosure; GL and ISEB's static mock section labels are confirmed byte-identical to before (no accidental regression to out-of-scope pathways).

## 16. Honest Limitations

- Interactive/accessibility/responsive verification could not be performed live in a browser this session (Chrome extension unavailable) — confirmed via server-rendered HTML and a pure-function script only, not a real click-through.
- GL, CEM and ISEB mock sections have real, lesser-severity content-sourcing mismatches documented in AXP-001 §6.2 (e.g. GL's "Vocabulary Challenge" section draws from the Verbal Reasoning bank) that remain uncorrected — explicitly out of scope for this pass, which the AEP-001 mission named as CSSE-specific and Personalised-Practice-specific only.
- The "small sample set" disclosure on all 4 adaptive routes is currently unconditional (always shown), because production is unconditionally on the fixture path today. Once real hand-tagged content is seeded and migrations 004–007 are applied, this copy will need to become conditional (or be removed) — flagged so it isn't mistaken for a permanent design choice.
- The underlying gap this correction does not attempt to close — no real, hand-tagged, Supabase-backed content exists yet for any of the 4 ALI-covered subjects in production — remains open, exactly as AEP-001's stop condition intends. This is a disclosure fix, not a content fix.
- CSSE's `xpReward` (90) was left unchanged despite the mock now offering half its previous playable content (20 of 40 minutes) — a minor game-economy inconsistency, noted but not treated as an academic-integrity issue in scope for this pass.

## 17. Git Status

All 8 files listed in §4 are modified and staged for a single commit. No other files (including the pre-existing uncommitted `AEP-*`/`EAW-*`/`ANGEL_PROJECT_CLOSURE_REPORT.md`/etc. planning documents already present in the working tree before this session, or `.gitignore`/`UX_TRANSFORMATION_PLAN.md`) are included in this commit — those were pre-existing working-tree state, not part of this correction, and are left exactly as found.

## 18. Git Commit Hash

See the commit created immediately after this evidence package — hash reported in the completion message. **Not pushed to GitHub, not deployed to Vercel** — this session made no push or deploy action; the change exists only as a local commit until the Founder authorises the next step.
