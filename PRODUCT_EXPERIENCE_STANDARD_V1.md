# Product Experience Standard — Version 1.0

**Angel 11+, Version 1.0, Capability 3 Wave 4 — Product Experience & Launch Readiness**
**Status:** FROZEN for Version 1. Canonical reference for all learner-facing and parent-facing screens for the remainder of Angel Version 1.

---

## 1. What this is

A consolidation, not new invention — the same pattern Capability 1.1 used to freeze Assessment Brain V1 from AEP-002/003/004. This document merges the three existing, mutually-agreeing design documents already governing this product (`DESIGN_SYSTEM.md` v2D-A, `ANGEL_DESIGN_LANGUAGE.md` V3, `AXT-003_ANGEL_DESIGN_SYSTEM_V2.md`) into one canonical reference, and layers on top of them the specific corrections this Wave's mission requires. Per those source documents' own stated relationship (`AXT-003` §1: each layer "carries forward the prior one unchanged and only adds new layers"), nothing below contradicts the source docs except where Section 4 explicitly logs a correction — mirroring Assessment Brain V1's own Correction Log discipline, not a silent rewrite.

## 2. Typography (unchanged from `DESIGN_SYSTEM.md` §1)

| Token | Class | Size | Usage |
|---|---|---|---|
| `display` | `text-3xl font-bold` | 30px | Hero section titles |
| `h1` | `text-2xl font-bold` | 24px | Page titles |
| `h2` | `text-xl font-bold` | 20px | Section headings |
| `h3` | `text-base font-bold` | 16px | Card titles |
| `body` | `text-sm` | 14px | Running text |
| `small` | `text-xs` | 12px | Labels, metadata |
| `micro` | `text-[10px] font-bold uppercase tracking-widest` | 10px | Nav labels, category chips |

Rules, unchanged: never below `text-xs` for interactive/important labels; touch targets minimum 44×44px; system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).

**Sentence case, new rule this Wave, refined against a real existing pattern found during this Wave's audit:** the live navigation already treats page/section names as proper nouns and Title-Cases them consistently ("My Admission Journey", "Parent Hub", "Mock Centre", "School Intelligence", "Learning Intelligence") — this is a genuine, established convention, not an oversight, so it is kept: **page titles (h1) and named-feature section headers (h2) that correspond to a specific product feature or capability keep Title Case**, matching this existing pattern. **Body copy, descriptions, buttons, and CTAs use sentence case** ("Practice now", not "Practice Now" or "PRACTICE NOW") — this is where the new rule actually applies, since the app's existing copy was inconsistent here (mixing both). Proper nouns (Angel, CSSE, Assessment Brain V1, competency names like "Word/Phrase Meaning-in-Context Explanation") always keep their own correct capitalisation regardless of context.

## 3. Colour tokens (unchanged from `DESIGN_SYSTEM.md` §2, corrected per `ANGEL_DESIGN_LANGUAGE.md` §2)

Purple (`purple-600`/`purple-400` dark) primary — CTAs, active nav. Indigo (`indigo-600`/`indigo-400` dark) secondary. Support palette: Emerald (success/Vocabulary), Amber (warnings/Writing), Sky (info, reserved), Rose (Numerical Reasoning), Cyan (Non-Verbal Reasoning), Teal (Spatial Reasoning), Violet (Verbal Reasoning), **Blue (Maths — `ANGEL_DESIGN_LANGUAGE.md`'s correction to `DESIGN_SYSTEM.md`, already binding per `AXT-003` §5)**. Neutrals via `--background`/`--surface`/`--surface-raised`/`--border` CSS variables, `dark:` variant on every colour class, colour never used alone (always paired with an icon or text label) — all unchanged, all already how this codebase's real components (`components/ui/Card.tsx`, `components/ui/Progress.tsx`) are written today.

## 4. Corrections this Wave makes — logged explicitly, not silent

Per Assessment Brain V1's own precedent: a correction to a frozen standard must be logged with full reasoning, not quietly applied. Two corrections, both required directly by this Wave's mission brief:

### Correction 1 — Gradients

**Prior standard** (`DESIGN_SYSTEM.md` §3, `ANGEL_DESIGN_LANGUAGE.md` §3): gradients were the deliberate, approved treatment for exactly the Hero/Premium card and the featured Mission card, nowhere else.

**This Wave's mission requirement:** "Remove gradients," stated as its own unqualified line item under Product Experience Standard V1.

**Resolution:** gradients are removed everywhere, including the previously-approved Hero/Premium card and featured Mission card. `components/ui/Card.tsx`'s `PremiumCard` changes from `bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700` to a flat `bg-purple-600 dark:bg-purple-700` fill — same purple token family, same white text, same shadow/radius, no directional gradient. The two non-canonical page-local gradients found during this Wave's audit (`app/vocabulary/page.tsx`, `app/progress/page.tsx` — both already inconsistent with the design system, since they hand-rolled their own gradient instead of reusing `PremiumCard`) are flattened the same way. This is a deliberate simplification for Version 1 launch, not an accidental contradiction of the prior standard — the prior standard is superseded on this one point, nothing else.

### Correction 2 — XP / Level / Streak UI

**Prior direction** (documented in code comments on `app/dashboard/page.tsx`, referencing an "EEP-002/EEP-003" sprint, no standalone doc committed): the explicit prior instruction was "reposition rather than remove" — de-emphasise gamification UI, never delete it.

**This Wave's mission requirement:** "Remove XP, Level and Streak UI," stated as its own unqualified line item.

**Resolution:** the visible XP/Level/Streak UI is removed from every learner-facing and parent-facing screen (Section 5 of the Acceptance Pack has the full, verified list). The **underlying data and computation are explicitly kept** — `progress.xp`/`progress.streak`/`level` still exist in `lib/progress.ts` and still drive internal logic that depends on them (e.g. `lib/adaptiveEngine.ts`'s Daily Mission urgency scoring, `lib/gamification.ts`'s weekly-goal computation) — only the user-visible rendering of these specific numbers is removed. This is consistent with, not a reversal of, this product's own "invisible engine, visible education" principle (`AXT-003` §1) applied to gamification specifically: the engine can keep running: the numbers just stop being shown as numbers. This is the same category of decision as the prior EEP sprint's own direction, taken one step further for Version 1, not a contradiction of the underlying philosophy — only of the specific "never remove" wording.

## 5. Card styling ("premium card styling")

No document defines this phrase separately from the existing `PremiumCard` component (`components/ui/Card.tsx`) — per this Wave's own audit, "premium" already means "the Hero card treatment," reused for any future premium/hero moment. Per Correction 1, this now means: flat purple fill (not gradient), `rounded-2xl`, `shadow-lg`, white text, unchanged otherwise.

## 6. One primary CTA per page

New rule this Wave, additive (no prior document specified a CTA-count rule). Each page should have exactly one visually-dominant call-to-action (solid purple button/card, the loudest interactive element on the page); secondary actions use text links or outline/ghost buttons, never a second competing solid-purple element. Applied to the pages this Wave directly touches (Section 2 of the Acceptance Pack); not independently re-audited on every one of the app's ~40 routes — see Known Limitations.

## 7. Calm educational tone

No document defines this phrase directly; the closest binding precedent is `ANGEL_DESIGN_LANGUAGE.md` §7 (never show "Adaptive/Learning Unit/Competency/Intelligence/Recommendation Engine/Beta" to users; prefer "Practice/Recommended Practice/Today's Session/Your Next Goal") and §8 (empty states name the encouraging next action, never state absence as a flat fact), plus `AXT-003` §22 (respect familiar educational language — never replace "Mock Exam," "Assessment," "Practice," "Exam Readiness" for novelty). These rules are treated as this Wave's definition of "calm educational tone" and are unchanged — reused, not redefined.

## 8. What this document does not do

Per this Wave's own rule ("no new educational models, no new competencies, no new recommendation logic, consume only Assessment Brain V1/Learning Engine V1/Product Experience Standard V1"): nothing here touches educational content, scoring, or recommendation logic. This is a visual/product-experience standard only.
