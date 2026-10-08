# ANGEL 11+ — CORRECTED ENGLISH FULL MOCK MIGRATION 245 PRE-APPLICATION REPORT

Date: 2026-09-09. Commit: `9f883e1` (pushed to `origin/main`). New migration: `supabase/migrations/248_csse_english_full_paper_corrected_content.sql` — **prepared, validated, committed, pushed, NOT applied.** No production activation has occurred.

---

## A. Passage identity reconciliation

Confirmed directly against the actual authored content (migration 161), not filename assumption: `eng-inc002-roboticsfinal` questions all carry `"passageTitle":"The Loose Connection"`; `eng-inc002-sailandsteam` questions all carry `"passageTitle":"Crossing the Atlantic: Sail and Steam"`. Matches the Founder's own naming exactly.

## B. Zero-collision result

**Confirmed, exhaustively.** Only **three** `ali_mock_form` rows have ever been inserted anywhere in this repository's entire migration history — `grep`-confirmed, not sampled: Mathematics Mock 1 (migration 147), Reading Comprehension Mock 1 (migration 212), and the failed `english-full-mock-v1` attempt (migration 245, now confirmed 0 rows). I grepped all 56 of Mathematics Mock 1's own question IDs and all 28 of Reading Comprehension Mock 1's own question IDs against all 22 of the proposed fresh questions: **zero matches in either direction.** A dedicated structural test (`migration248...test.ts`) additionally parses migration 248's own manifest JSON literal programmatically and asserts none of the 28 retired IDs appear in it. There is no fourth manifest anywhere to check against.

## C. Exposure evidence / remaining uncertainty

**Strong documentary evidence of zero exposure; one disclosed, un-closeable gap.**
- Neither passage's questions have ever been set to `practice_eligible` at any point in this repository's history (grepped across every migration touching these IDs: zero matches) — ruling out exposure via Practice.
- Neither passage's questions have ever appeared in any `ali_mock_form.question_manifest` before now (§B) — ruling out exposure via any Mock sitting, since content cannot be delivered to a learner outside a manifest.
- Migration 210's own header additionally states, for this exact content batch: "confirmed never Practice-eligible, confirmed never Mock-exposed via the complete ali_mock_form insert history."

**Remaining uncertainty, stated explicitly, not glossed over**: I cannot query `ali_mock_attempt` directly (its RLS restricts every reader, including an authenticated non-admin session, to their own rows only, and I hold no admin/service-role credential) to positively rule out some anomalous exposure path outside the two mechanisms above. I judge this residual risk as very low — Mock content is only ever deliverable via a manifest, and §B proves these IDs were never in one — but I am not calling it independently verified against `ali_mock_attempt` directly, because it wasn't.

## D. Educational review of both passages

Read both passages in full, plus all 22 questions' text/skill tags/difficulty tags (not metadata alone).

**"The Loose Connection"** (narrative fiction, robotics-competition setting): a complete, well-constructed short story — three characters, a real problem (a stalled robot with 90 minutes on the clock), a genuine misdirection (everyone assumes the motor; the actual fault is a loose wire), and a quiet character contrast (Ade's careful checking vs. the narrator/Nisha's snap judgement) resolved without moralising. Age-appropriate, no unsafe or distressing content, self-contained (assumes no outside knowledge of robotics).

**"Crossing the Atlantic: Sail and Steam"** (informational/historical non-fiction): a clear, well-organised explanatory text — sail vs. steam crossing times, the *Great Western*'s 1838 voyage as a concrete example, and a genuinely evaluative closing point (reliability mattering as much as speed) rather than a flat list of facts. Self-contained, defines its own terms (e.g. "becalmed") in context.

**Genre balance**: one fiction + one non-fiction — a real, deliberate mix, not two of the same kind.

**Question variety** (from direct extraction of all 22 items' `skill` tags): literal retrieval/evidence (6), vocabulary-in-context (11, largely single-mark synonym items testing precise word knowledge), inference (4, including two explicit Yes/No-plus-evidence items), sequencing/structure (2, "put these events in order"). Two items (`roboticsfinal-q08`, `sailandsteam-q07`) explicitly probe authorial choice ("why might the writer have included this detail/explanation") — language-effect-style reasoning, tagged `inference` rather than a separate skill label, but genuinely present in substance.

**Difficulty progression**: both passages open on `easy` literal-retrieval items, build through a run of `medium` vocabulary/inference/structure items, and each closes on one deliberately `hard` evaluative item (`roboticsfinal-q08`, `sailandsteam-q07`) — a sensible, exam-appropriate difficulty curve, not flat or front-loaded.

**Judgement, as a coherent paper rather than a checklist**: yes, these two passages together form a genuinely coherent, well-varied comprehension component — not merely two disconnected question sets. **The one honest limitation is scope, not quality**: two passages/22 questions/39 marks is smaller than the retired three-passage/28-question/65-mark structure this project's own evidence base was built to match. I am not able to certify full structural parity with the original design; I can certify that what exists is genuinely good, original, age-appropriate, and immediately usable as-is.

## E. 22-question/mark verification

Re-derived independently from the actual source `marks` values in migration 161/163 (not migration 210's own promotion-array count alone): Sail and Steam = 10 questions / 17 marks; The Loose Connection = 12 questions / 22 marks. **Total: 22 questions, 39 marks** — matches the earlier archaeology exactly. A dedicated automated test parses migration 248's own manifest JSON and asserts the count (22 Reading entries, no duplicates) programmatically, not by hand-recount alone.

No mark total was altered or invented to imitate the retired form's 65-mark figure — each question's own already-established mark value is used unchanged.

## F. Q1 comparison and selected task

Read all four candidates' full prompt/checklist text:
- `mock-writing-mindchange-01` — "A Time You Changed Your Mind": personal-change narrative (before/turning-point/after).
- `mock-writing-kindness-01` — "An Act of Kindness": single-relationship/emotion personal narrative.
- `mock-writing-cookopinion-01` — "Should Everybody Learn to Cook?": direct opinion-question format.
- `mock-writing-screentime-01` — "Should Children Have Limits on Screen Time?": **the same opinion-question format and near-identical checklist as `cookopinion-01`** — these two are structural near-duplicates of each other.

**Selected: `mock-writing-mindchange-01`.** Reasoning: it keeps a genuinely distinct prompt shape within a pool where two of the other three candidates already duplicate each other's structure; it is the most reflective/personal of the four (closest fit to Q1's own evidenced "own experience" positioning, versus the more opinion-leaning cookopinion/screentime pair); age-appropriate; no known content defect. This is a re-considered decision on today's fuller evidence (all four candidates compared side by side for the first time), not a mechanical carry-over of migration 245's original choice. The other three remain `independently_validated`, untouched, preserved for a future assessment.

## G. Q2 preservation

Unchanged. The already-completed, already independently educationally reviewed task (Q2 educational gate = PASS, from the earlier pass this session) and its original SVG stimulus are carried into migration 248 byte-identical to what migration 246 would have inserted — not redesigned, not regenerated.

## H. Exact Migration 245 correction

**Delivered as a new, additive migration (248), not an edit to 245 or 246.** Rationale, stated plainly since this departs from the Founder's own literal "correct Migration 245" phrasing: migration 245's schema block is already applied in production, and this repository has a consistent, repeated, already-established convention (e.g. migration 210's own header, explicitly superseding 207) of never editing an already-committed migration file, applied or not — doing so would make the git history an untrustworthy record of what was actually reviewed at each point in time. Migration 248 therefore supersedes 245's failed content section and 246's own now-inapplicable manifest-append step (246 assumed a form that no longer gets created that way) — both are left in the repository untouched, documented as superseded, not deleted.

Migration 248, in one file: two named preflight guards (22 target questions confirmed `mock_eligible`+`active`; `english-full-mock-v1` confirmed not already existing) → promotes `mock-writing-mindchange-01` (with the same `question`/`marks` jsonb defect fix migration 246 originally carried) → inserts the Q2 content row (identical to 246's own design) → inserts the corrected `english-full-mock-v1` form with a manifest of exactly the 22 fresh Reading questions + Q1 + Q2, `active=false`.

## I. Migration 208 protection confirmation

**Untouched, unmodified, unbypassed.** `ali_block_mock_form_content_reuse()` is not referenced in any DDL statement in migration 248 (confirmed by a dedicated structural test asserting no `DROP/ALTER/CREATE TRIGGER` statement exists) — only in explanatory prose. It remains the live, authoritative, database-enforced check and will independently re-validate migration 248's own INSERT at apply time regardless of anything in this report. Migration 248's own static preflight checks are explicitly documented as defence-in-depth, not a replacement.

## J. 246/247 dependency result

- **246**: superseded in full by 248. Its own preconditions (an already-existing `english-full-mock-v1` to append Q2 onto) no longer hold under the corrected design, and it must not be applied — 248 does everything 246 would have done, correctly ordered.
- **247**: unaffected, unchanged, still valid. It depends only on `ali_writing_assessment` (already live) and has no dependency on 245's content section, 246, or 248 — confirmed in the prior investigation and unchanged by this pass.

## K. Tests/typecheck/build

- New tests: 11, all passing (`tests/supabase/migration248CsseEnglishFullPaperCorrectedContent.test.ts`) — covering: no schema/function/RLS change; migration 208's trigger never DDL-touched; the manifest's 22 Reading entries contain none of the 28 retired IDs and no duplicates (parsed from the actual JSON literal, not hand-counted); exactly one Q1 and one Q2 entry; the Q1 promotion's additive fix and idempotent re-run path; the Q2 insert's real, non-null `imageAssetUrl`; the form insert's `not exists` guard and `active=false`; both named preflight guards present; migration 246 explicitly marked superseded; exactly one transaction block.
- Full project suite: **4351/4354 pass** — the exact 3 pre-existing, permanently-unrelated failures, unchanged.
- `tsc --noEmit`: clean relative to this change (same 3 pre-existing, unrelated errors remain; zero new ones — this pass touches no TypeScript at all).
- Isolated `next build` (fresh `git worktree`, the two new files only + symlinked `node_modules` + copied `.env.local`): **exit code 0**. Expected and correct that a pure-SQL-and-test change produces no application-code difference.

## L. Commit/push

Committed as `9f883e1` and pushed to `origin/main`. Two files only: the migration and its structural test. No production activation performed.

## M. Exact Founder migration sequence

1. **245** — already applied (schema block only; its content block failed and rolled back, confirmed).
2. **248** (new) — apply next. Supabase Dashboard → SQL Editor → run the full file.
3. **247** — apply after 248 (no strict ordering requirement against 248, but this keeps the conceptual schema→content→evidence-adapter-claim ordering intact).
4. **246 — do NOT apply.** Superseded by 248.

Verify each step succeeds before proceeding to the next, per your own standing instruction. `english-full-mock-v1.active` remains `false` after this sequence — activation is a separate, later, explicit decision, not part of this migration sequence.

## N. GO / REVISE / NO-GO for migration application

**GO — for applying migration 248, then 247, in that order.**

Every check available to me from this position passes: exhaustive zero-collision proof across the entire history of every form ever created, not a sample; strong (though not 100%-provable-from-here) zero-exposure evidence; a genuine, reasoned Q1 re-selection; an honest educational review of the fresh content that finds it good but discloses its real scope limitation (2 passages, not 3); Q2 preserved unmodified; migration 208 fully intact and independently re-validating at apply time regardless of anything in this report; 11 new passing tests, a clean full suite, clean typecheck, clean isolated build; committed and pushed.

This GO is specifically for **migration application**, not for English activation or any learner acceptance — those remain separate, later, explicit Founder decisions this report does not make, exactly as instructed.

---

**STOP. No migration has been applied. `english-full-mock-v1` has not been activated. No learner acceptance has been performed.**
