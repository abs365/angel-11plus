# Mathematics Reference Vertical — Final Refinement Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Founder Visual Review Remediation
**Prepared:** 2026-08-11
**Method:** Real production testing against the Founder's own reported input (`903 - 468 = 556`), direct database verification, both learner paths run live.

---

## Results

| Check | Result |
|---|---|
| Guided learning | READY |
| Independent Check recovery | READY |
| Borrowing-across-zero visual teaching | FOUNDER TEST READY |
| Evidence integrity | SAFE |
| Capable-learner path | PASS |
| Struggling-learner path | PASS |
| Migration 024 | LIVE |
| Mathematics Reference Vertical | FOUNDER FINAL REVIEW READY |
| Educational validation | INDEPENDENT REVIEW REQUIRED |

---

## 1. What was preserved

Nothing from the prior remediation round was regressed. The Guided Attempt's bounded 3-attempt ladder, its targeted/generic feedback split, supported-vs-independent evidence tagging, mastery protection, provenance integrity (`first_source`), Educational Intelligence integration, Family Choice, and wellbeing protection are all unchanged in behaviour and were re-confirmed working during this round's live testing (see §9-10). The Guided Attempt architecture was extended to the Independent Check, not replaced or duplicated.

## 2. Independent Check no longer reveals the answer immediately

This was the Founder's central, specific finding: entering the Founder's own real wrong answer, `556`, for `903 - 468`, previously produced an immediate "Not quite — the answer is 435." Retested live on production with the exact same input: the response is now *"Not quite yet — have another look. Think about which column needs to borrow, and where that borrow can actually come from — try again."* — no answer shown.

The new flow, confirmed live:
1. **Attempt 1 wrong** (`556`, not a recognised pattern): honest diagnostic, no answer revealed, genuine unaided retry offered.
2. **Attempt 2 wrong** (`565`, the classic across-zero misconception): the known-pattern classifier correctly fired — *"It looks like the smaller digit may have been taken away from the larger one in each column..."* — then the full worked resolution for `903 - 468` was shown (every column, `Answer: 435`), since misunderstanding had genuinely persisted.
3. **Fresh opportunity**: a different problem (`604 - 278`, migration 025) that does not repeat the numbers just demonstrated, so a correct answer here is genuine transfer evidence, not a repeat of what was just shown.

Every real attempt is recorded truthfully via `recordOutcome()`, tagged `supportTier: "independent"` throughout — every attempt in this ladder is genuinely unaided; only the worked-resolution *display* is help, and no evidence is written for a display.

## 3. Independent failure is used as educational information, not just a full reset

Confirmed live: after two wrong Independent Check attempts, Angel does not send the learner back to the start of the lesson. It shows the worked resolution for the exact problem attempted, then offers a fresh, different problem testing the same skill — using what it already knows (the learner received the teaching, completed Guided Practice, reached Independent Check, and struggled specifically with borrowing across zero) rather than discarding that context.

## 4. Honest diagnosis preserved

`classifyWrongAnswer()` remains a fixed, hand-verified, two-entry lookup (`565` → the classic across-zero misconception for `903-468`; `474` → the same misconception for `604-278`), not a general classifier. Any wrong answer that doesn't exactly match — including the Founder's own `556` — gets an honest, general prompt, never a fabricated diagnosis. No new evidence column persists a mistake category; the existing deferral in `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11` is unchanged.

## 5. Borrowing across zero is now visual, not prose-dependent

The five-paragraph explanation was replaced with a static, four-step place-value regrouping sequence (Thousands/Hundreds/Tens/Ones grids, the columns that just changed highlighted), directly showing:
- 1 thousand → 10 hundreds
- one hundred → 10 tens (9 hundreds left behind)
- one ten → 10 ones (9 tens left behind), reaching enough ones to subtract 3 from

with a single closing line making value conservation explicit ("every step still adds up to exactly 1000"). No animation was used — every step is a static, already-rendered grid, confirmed live on production. This is engineering-verified for completeness and genuine visual progression, not a claim that it lands with a real struggling child — that judgement remains yours.

## 6. Recovery action is now evidence-specific

The blanket "Let's go through this again" is replaced with "Practise borrowing across zero again," shown only when the learner didn't ultimately demonstrate the skill, routing to the real evidence-driven Practice queue (which now correctly surfaces this competency, per the mastery-accounting fix from the prior remediation round) rather than resetting the fixed two problems. No competency code is exposed; one primary action, one existing secondary link — no added choice overload.

## 7. Both learner paths verified live on production

**Path A (capable learner):** Guided Attempt correct on the first try (`931`) → resolved immediately, no scaffolding shown. Independent Check correct on the first try (`435`) → resolved immediately. "You're ready to practise this properly" shown. Confirmed: Angel does not slow down a learner who doesn't need help.

**Path B (struggling learner):** Guided Attempt wrong (`921`) → targeted feedback → correct on supported retry (`931`). Independent Check wrong with the Founder's own answer (`556`) → no answer revealed → wrong again (`565`, matched known pattern) → full worked resolution → fresh-opportunity item unavailable this run (migration 025 not yet applied — see §11) → gracefully resolved with an honest "not available yet, head to Practice" message rather than a broken or misleading state. "Practise borrowing across zero again" correctly shown as the next action.

## 8. A regression avoided during this round's own implementation

The first implementation made the entire lesson fail to load if migration 025's item was missing — mirroring the existing (accepted) pattern for migrations 023/024, but here it would have broken the *whole* lesson, including paths that don't need the retry item at all, for every learner until the Founder applied it. This was caught before being reported as done: the lesson now loads and fully functions without migration 025, only degrading gracefully at the one stage that actually needs it (confirmed live, §7 Path B). Committed and deployed as a separate, disclosed fix (`a661e67c1a7318cfc58902aebd749b8d48005480`).

## 9. Evidence protection — verified by direct database query after both live runs

- `learn-mth-arith-independent` (the original Independent Check item): `times_seen` incremented on **every** real attempt including the two wrong ones; `last_attempt_correct: false` correctly reflects the last real attempt; `mastery_state: "weak"` correctly reflects two consecutive genuine failures — nothing was hidden or overwritten by the later worked-resolution display.
- `last_attempt_support_tier: "independent"` correctly recorded for the Independent Check item — every attempt in that ladder was genuinely unaided.
- `learn-mth-arith-guided`: `last_attempt_support_tier: "supported"` correctly recorded — the final guided success this run came after remediation.
- `first_source` is now populated on fresh writes for both items (`"learning_guided"` / `"learning_independent"` respectively) — migration 024 is live and its write-once provenance fact is working, confirmed by a real, fresh write this session (not just schema presence).
- `ali_durable_mastery` for MR-01: `validated: true` (carried over, truthfully, from this same test profile's earlier genuine independent success in a prior test round — not newly or falsely earned by this round's two wrong attempts, which contributed zero new correct evidence); `durable: false` — no premature durable-mastery claim.
- Family Choice, recommendations, and wellbeing: unmodified by this round's code changes (no file under those surfaces was touched); Family Choice and Founder Validation routes confirmed 200 on production after deployment.
- Parent Dashboard: unmodified directly; inherits the corrected evidence automatically through the same unmodified `getEducationalIntelligence()` read path already proven in the prior round.

## 10. Regression

`/dashboard`, `/mocks`, `/learning-intelligence/practice/mathematics`, `/learning-intelligence/parent`, and `/learning-intelligence/founder-validation/family-choice` all return 200 on production after both deployments. No console errors were observed across either live test run.

## 11. Migration 024 — LIVE

Verified directly: `ali_student_question_history.first_source` and `.last_attempt_support_tier` now exist and are being populated correctly by fresh writes (confirmed above). The complete provenance model described in the prior remediation round's report is genuinely production-active, not merely schema-present.

## Migration 025 — NOT YET LIVE

`supabase/migrations/025_mathematics_independent_check_retry_item.sql` (the Independent Check's "fresh opportunity" item, `604 - 278 = 326`) has **not** been applied yet — confirmed by direct query returning zero rows. This does not block the rest of the lesson (see §8) but does mean the fresh-transfer-evidence step of the Independent Check ladder currently shows a graceful "not available yet" message instead of a real second problem. **Founder action required:** apply via Supabase Dashboard → SQL Editor, same as every prior migration — it cannot be applied from application code or the anon key.

---

## Remaining educational limitations, disclosed honestly

- The fresh-opportunity item (`604 - 278`) has not yet been exercised end-to-end on production, since migration 025 isn't live — its wiring is engineering-verified (code path, evidence tagging, misconception classifier for `474`) but not yet observed running for real.
- Whether the visual place-value sequence and the Independent Check's remediation flow genuinely help a struggling child understand — versus just mathematically satisfying the Founder's structural checklist — remains, as before, a judgement for the Founder and subsequent independent educational review, not for this engineering pass to claim.
- The Independent Check ladder is bounded at exactly one fresh-opportunity attempt; a learner who also gets that wrong proceeds to the honest "not quite, here's the answer, that's alright" outcome and the evidence-specific Practice recommendation — there is no third remediation cycle within this single lesson visit, by design (no infinite loop).

---

## Production delivery

**Production commit:** `a661e67c1a7318cfc58902aebd749b8d48005480` (code, deployed) — on top of `57ca0bb78c3ab84e3a82cf89ccc05697eb2ad5da` (the main Independent Check/visual/next-action implementation, same deployment).
**Production URL:** `https://angel-11plus.vercel.app/learning-intelligence/learn/mathematics/arithmetic`

---

Per the governing instruction: stopping here. Not requesting external review, not scaling this pattern, not beginning another lesson, English, or Continuous Writing. Awaiting the Founder's personal review of this revised production experience.
