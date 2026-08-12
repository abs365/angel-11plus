# Mathematics Lesson 002 — Verification Report

Mathematics Learning Sequence Expansion (Educational Increment 002).
Production baseline entering this increment: `185699d`.
This increment's commit: `fc9e02d`, pushed to `origin/main` and deployed to
production (`https://angel-11plus.vercel.app`) on 2026-08-12.

This report distinguishes what was actually exercised from what remains
blocked, per the directive's explicit instruction not to fake end-to-end
verification before migration 029 is genuinely live. Nothing below is
inferred or assumed; every PASS reflects an action actually taken and
observed in this session.

## 1. Engineering verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean, 0 errors |
| `node scripts/copy-quality-guard.mjs` | PASS — 0 violations across 221 files (includes Lesson 2's new files) |
| `npm run lint` | 61 problems — identical to the established pre-existing baseline; none in any file this increment touched |
| `npm run build` | Succeeded; `/learning-intelligence/learn/mathematics/percentages` present in route output |

## 2. Local interactive verification (localhost:3000)

- **Learn hub** — loaded cleanly. With a fresh test profile carrying no
  evidence for either competency, both lessons showed the correct resting
  framing ("Not yet started" for Lesson 1, "Most families start with
  Lesson 1" note on Lesson 2). Zero console errors.
- **Lesson 2 (`/learning-intelligence/learn/mathematics/percentages`)** —
  clicking "Start the lesson" produced the honest, designed error state:
  *"We couldn't load this lesson… Migration 029… has not been applied to
  this database yet. Apply it via Supabase Dashboard > SQL Editor, then try
  again."* This confirms Lesson 2's degradation path works correctly; it
  does not confirm Lesson 2's teaching content itself, which cannot be
  exercised until the migration is applied (see §5).
- **Lesson 1 regression (`/learning-intelligence/learn/mathematics/arithmetic`)**
  — run specifically to confirm the `realEvidenceLabel` extraction into
  `lib/learningEngine/progressionLabel.ts` introduced no regression:
  - Loaded the lesson; Concept section rendered correctly, dash-free, byte
    for byte matching the Phase B fixed copy.
  - Guided Attempt: submitted `931` for `652 + 279 = ?` (correct, capable-
    learner path). Result: `Correct: 931` shown, lesson advanced to the
    Independent Check stage (`903 − 468 = ?`).
  - Independent Check: submitted `435` (correct). Result: the page
    re-rendered and the hub-visible progression state genuinely updated
    from the lesson's local "Ready to practise" navigation state to the
    real, evidence-backed **"Developing"** label — proving the refactor
    still correctly threads a real `educationalState` value through to the
    shared label function.
  - Console: zero errors or warnings across the whole sequence.

This is a capable-learner-path regression check specifically targeted at
the refactor. Lesson 1's own struggling-learner path (wrong-answer hint
ladder, worked-resolution fallback) was extensively verified in the prior
Foundation and Copy Gate phases and is unchanged by this increment — this
increment touched only the label-mapping extraction, not the
attempt/remediation logic, so it was not re-run here.

## 3. Production verification (`https://angel-11plus.vercel.app`)

Performed in a separate, freshly created browser tab against the live
production alias after deployment reached Ready status.

- **Learn hub** — loaded correctly. The returning test profile's real,
  previously-recorded evidence surfaced accurately: Lesson 1 showed
  **"Developing"** (matching the state the local regression test had just
  produced against the same underlying Supabase project), and Lesson 2
  showed **"Recommended next"** — the correct non-blocking sequencing note,
  since Lesson 1 now has real evidence and Lesson 2 does not. This is a
  genuine end-to-end confirmation of the Learning Sequence Connection logic
  against live data, not a static assumption.
- **Lesson 2 on production** — clicking "Start the lesson" produced the
  same honest migration-029-required error state as local. Confirms the
  degradation path is live and correct in production, not just in dev.
- **Console** — checked on both pages after a fresh navigation; zero error
  or warning entries on either.

## 4. Mobile viewport check

A 390×844 resize was attempted against the production tab. The window
resize tool did not take effect in this environment (the reported
`window.innerWidth` remained at the browser's existing width rather than
390px), so a true narrow-viewport screenshot could not be captured this
session. This is a disclosed tooling limitation, not a claimed PASS.

In its place: Lesson 2's page (`app/learning-intelligence/learn/mathematics/percentages/page.tsx`)
and the rewritten hub (`app/learning-intelligence/learn/page.tsx`) reuse
`PageLayout`, `InfoCard`, and the same responsive Tailwind classes
(`max-w-2xl`, `px-4 md:px-8`, `flex items-center gap-4`, `min-w-0 flex-1`)
already used verbatim by Lesson 1's page, which was mobile-verified in the
Foundation phase. No new layout primitive, grid, or fixed-width element was
introduced. This gives reasonable code-level confidence but is not a
substitute for an actual rendered mobile check — flagged honestly as
outstanding rather than asserted.

## 5. What remains PENDING — migration 029

Migration 029 (`supabase/migrations/029_mathematics_percentages_lesson_content.sql`)
has not been applied. `ali_question_bank` has no browser-writable RLS
policy, so this requires Founder application via Supabase Dashboard > SQL
Editor, the same as every prior content migration in this project.

Until it is applied, the following cannot be genuinely verified and are
NOT claimed as tested:

- Lesson 2's Concept/Method/Worked Examples render against real question
  data (currently blocked by the error state above).
- The Guided Attempt ladder (hint on first wrong answer, worked resolution
  on second, resolves on third).
- The Independent Check ladder, including the `wrongAnswer=9` known
  misconception diagnostic and the fresh-transfer item
  (`learn-mth-pct-independent-retry`, `30% of 70 = ?`).
- Real evidence being recorded for MR-04 and surfacing correctly as
  "Developing"/"Consistent" on the hub and in the Parent Dashboard.
- The struggling-learner path through Lesson 2 specifically.

This matches the directive's own explicit instruction: do not fake
end-to-end verification before the migration is actually live. It is
reported here as a limitation, not worked around.

## 6. Summary

| Area | Status |
|---|---|
| Engineering (types/lint/build/copy guard) | VERIFIED |
| Learn hub sequencing logic (local + production, real data) | VERIFIED |
| Lesson 1 regression after refactor (capable-learner path) | VERIFIED |
| Lesson 2 error/degradation path (local + production) | VERIFIED |
| Console cleanliness (local + production) | VERIFIED |
| Mobile viewport | NOT VERIFIED — tooling limitation, disclosed |
| Lesson 2 teaching content, guided/independent/transfer flow, misconception feedback, evidence recording | PENDING — blocked on Founder-applied migration 029 |
