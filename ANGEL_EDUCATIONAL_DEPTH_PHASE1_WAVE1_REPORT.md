# ANGEL 11+ — EDUCATIONAL DEPTH & DAILY PREPARATION PROGRAMME, PHASE 1 WAVE 1

Date: 2026-09-17
Commit: `c542bef` (on `f4f21fa`) — committed locally, **not pushed, not deployed**
Scope: production depth baseline, Wave 1 selection, execution, live verification

---

## 1. Current production educational-depth baseline

Read live from `ali_question_bank` (anon/RLS view = the practice-eligible pool a learner can actually be served). Not taken from prior reports.

| Measure | Live value |
|---|---|
| Practice-eligible + active | **900** |
| By subject | maths **587**, english **306**, writing **7** |
| Distinct families | **61** (+27 rows with no `family_id`) |
| Difficulty spread | medium 439, hard 245, easy 181, challenge 35 |
| Distinct English passages | **34**, largest single passage **7.5%** |
| Maths families with Factory structural metadata | **12** of 38 |
| Maths teaching assets | 30 families (now 34) |
| English exam-strategy/worked-example assets | 18 families — **full English coverage** |
| Rows with `transfer_class` | 299 |
| Real learner exposure | 178 total usages across 140 rows |

Three things the raw counts hide, which matter more than the totals:

- **English passage depth is genuinely healthy** — 34 passages, top passage 7.5%. This was not the gap.
- **Representation variation is the systemically weakest axis.** `representationType` has exactly **one** distinct value in 10 of the 12 structurally-deepened Maths families. Reasoning-route and unknown-position variation are real (3–5 and 4–9 per family); representation variation essentially does not exist.
- **Exposure telemetry is too thin to prove anything about exhaustion** (178 usages). No claim about memorisation risk in this report rests on learner telemetry.

## 2. Thin / high-risk families found

- **14 families had no teaching asset at all**, including `mr01-whole-number-computation` — **the largest family in the entire bank at 53 rows**.
- **26 of 38 Maths families have no structural metadata**, all sitting at 3–7 questions.
- **Writing is the starkest imbalance**: 7 practice-eligible rows, as 7 separate one-question families.
- **Picture-led narrative — one of the Founder's two named CSSE writing modes — has zero Practice content and zero teaching content.** It exists only as a Mock task (migration 246); `writingTeachingContent.ts` maps only `writing-reflective-discursive`.

## 3. Wave 1 selected, and why

**MR-01 Arithmetic Foundation** — `mr01-whole-number-computation` (53), `mr01-decimal-computation` (7), `mr01-multistep-order-of-operations` (7), `mr01-fraction-computation` (6) = **73 already-published questions**.

This is the single place where the largest content mass met *zero* teaching — precisely the Founder's stated failure mode, "practising weaknesses without being taught". It is one coherent competency, not a scattering, and it needed no new content to become teachable.

Disclosed honestly: this session is **anon-authenticated** (`is_current_user_admin()` returns `false`), so it **cannot publish new questions** — only teaching-side work was deliverable in full. The evidence independently ranked this the highest-risk area, but that constraint did narrow the field, and I am not claiming otherwise.

## 4. Teaching gaps found

MR-01 *does* have a full lesson. Confirmed live in the browser, it is titled **"Adding and Subtracting Big Numbers"** and teaches only column subtraction with regrouping across zeros. It does not cover long multiplication, division with remainders, missing-operand reverse problems, error identification, decimals, order of operations, or fractions — the actual range of the 73 questions.

## 5. Blueprint / structure expansion completed

None. **No new questions were generated this wave** — deliberately. The 73 questions already existed and already spanned 4 reasoning routes and 9 unknown positions; what they lacked was teaching. Generating more untaught questions would have repeated the failure mode §5 of the directive names.

## 6. Questions generated

**0.** See §5. Publication is admin-gated and unavailable to this session regardless.

## 7. Anti-memorisation / diversity evidence

All four MODEL worked examples were checked against **live** production data:

- No MODEL answer collides with any live answer in its own family (`7824`, `21.05`, `10`, `5/6` — all clear).
- No MODEL scenario text collides with any live question in the whole 900-row bank.
- Each MODEL is a fixed, separate scenario, never the live question's own numbers.

## 8. Teaching assets added

Four `MATHS_FAMILY_TEACHING_CONTENT` entries, each grounded in that family's own real `addresses_misconception` evidence, with misconception categories chosen from the existing taxonomy rather than invented.

**A safety constraint that was not optional.** Measured against live rows: in **every** row of all four families the last stored `workingSteps` entry restates the answer verbatim (49/49, 6/6, 6/6, 5/5), and **36 of the 49** whole-number rows have a single step that *is* the answer. Every family therefore carries an evidence-derived `maxGuidedRevealSteps` (0, 1, 1, 1). Without these caps, adding teaching content would have handed learners the answer before submission on 36 questions.

## 9. Defect found and fixed during execution

`MathsActivity` gated wrong-answer remediation on the row's own `addresses_misconception` text alone. **414 of 587 live Maths rows carry no such text** (overwhelmingly Question Factory-generated rows), and **398 of those sit in families that already had full teaching content**.

So **68% of live Mathematics practice showed a learner nothing at all after a wrong answer** — not even the family's own misconception framing, which was already computed at that call site and discarded.

Fixed via `shouldRenderMathsMisconceptionNote()`. It only ever widens: row-level text remains the preferred, richer signal; English's shared gate is untouched; and a property test proves the widened gate never suppresses a case the original rendered.

## 10. Updated production counts

Unchanged — **900 practice-eligible rows**. This wave changed what the platform *does* with them, not how many there are.

What changed for a learner:

| | Before | After |
|---|---|---|
| MR-01 rows reaching a worked example | 0 of 73 | **73 of 73** |
| Maths rows silent on a wrong answer (15 covered families) | 398 of 472 | **0** |

## 11. Learner-routing verification

`scripts/verify-educational-depth-wave1-learner-routing.mjs`, run against **472 live production rows** using the real imported production functions, never a reimplementation:

- 4/4 Wave 1 families now reach a worked example — **PASS**
- 0 answer leaks across 66 live rows with working steps — **PASS**
- 398 rows moved from silent to real guidance; 0 remain silent — **PASS**
- 0 rows had remediation suppressed by the fix — **PASS**
- Every rendered label is one of the fixed, human-authored category sentences, never a fabricated per-answer diagnosis — **PASS**

**Live browser walkthrough: partially blocked, disclosed.** I confirmed live that Increment 021's teaching redirect works — "Start practice" on Mathematics routed to the real MR-01 lesson — which is also how the lesson's narrow scope was confirmed. I could not reach the in-session teaching surface itself:

1. `.env.local` had `NEXT_PUBLIC_SUPABASE_URL` set to an `sb_publishable_…` **key, not a URL**, so the browser client never reached Supabase and "Start practice" failed silently. I corrected this locally (backup kept) — it is gitignored and not part of the commit.
2. After that fix, the signed-in auth user has **no `profiles` row**, so session generation still cannot start. Creating account data is outside what I should do unprompted, so I stopped rather than work around it.

The deterministic live-production verification above is the substantive proof; the UI render path is verified by source-structure tests, not by eye. Prior sessions have found real defects only a live walkthrough catches, so this remains a genuine gap in assurance, not a formality.

## 12. Remaining highest educational risks

1. **Writing.** 7 practice-eligible rows; **picture-led narrative has no Practice content and no teaching content at all**. Sharpest gap against §8 of the directive.
2. **Representation variation is near-absent** — one representation type in 10 of 12 deepened Maths families. The Family Depth Standard's axis B is effectively unmet platform-wide.
3. **26 Maths families at 3–7 questions** with no structural metadata.
4. **27 rows carry no `family_id`** and sit outside family-based teaching entirely.
5. **591 of 900 rows have no `addresses_misconception`.** The fallback now prevents silence, but generic category framing is weaker than real per-question guidance; the Factory should author this field.

## 13. Tests, build, deployment

- **Tests: 4543 total, 4536 pass, 7 fail.** The baseline at `f4f21fa` was measured directly by stashing this work: 4527 / 4520 / 7, the **same 7 files**. **Zero regressions; +16 new tests, all passing.**
- Correction to the prior wave's record: the Wave 3 report's "3 pre-existing failures" is now stale — there are 7 failing files at baseline (the 4 English/content suites fail too).
- **Build: compiles successfully.** `npm run build` also fails at baseline on two untracked, incomplete Factory files (`candidateStoreMapping.ts`, `mr03CoordinateBlueprints.ts`); with those quarantined the build completes, and they were restored afterwards.
- `tsc --noEmit`: 0 errors in any file this wave touched.
- **Not deployed. Not pushed.**

## 14. Commit

`c542bef` — *feat(learning): MR-01 Arithmetic Foundation teaching depth, and fix Maths remediation silence*

## 15. Wave 1 GO / NO-GO

**GO**, with one disclosed limitation.

Against the §15 success standard, for a learner entering MR-01: appropriate teaching where needed — **yes**, 73 of 73 rows; multiple genuinely different structures — **yes, pre-existing** (4 reasoning routes, 9 unknown positions), not added this wave; difficulty progression — **yes**; guided and independent work — **yes**, with answer-leak safety proven; unfamiliar transfer — **not added this wave**; reduced immediate-repeat risk — **not addressed**; correct EI routing — **verified deterministically against live production**, and partially in the live UI.

The limitation: **no live in-session UI walkthrough** (§11). Everything claimed about the learner's actual screen rests on production-data verification and source-structure tests.

## 16. Exact next educational priority

**Writing depth — picture-led narrative teaching and practice content.**

It is the only area where an entire CSSE-examined mode has *zero* learning content and *zero* teaching, and the Founder's §8 names it explicitly. Every other remaining risk is a thinness problem; this is an absence.

It is also achievable without publication rights: `writingTeachingContent.ts` is application code, and a `writing-picture-narrative` task family plus its planning scaffold and model can be authored and verified the same way this wave's was. Question publication, when an admin session is available, follows.

Before that starts, one thing should be settled by the Founder, because I could not: **the `profiles` gap blocking live UI verification.** Until a walkthrough is possible, every wave will close with the same §11 caveat.
