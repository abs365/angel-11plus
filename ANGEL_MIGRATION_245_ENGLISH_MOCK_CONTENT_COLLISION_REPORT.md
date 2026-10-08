# ANGEL 11+ — MIGRATION 245 ENGLISH MOCK CONTENT COLLISION REPORT

Date: 2026-09-09. Production state: migration 245's schema (table + functions + columns) is applied; migration 245's own content section (Q1 promotion + `english-full-mock-v1` insert) failed and rolled back; migrations 246/247 not applied; English not activated. This is a bounded investigation only — **nothing in this report was implemented, no data was changed, no trigger was touched.**

---

## A. Exact cause of production failure

`ali_block_mock_form_content_reuse()` (migration 208, `before insert or update on ali_mock_form`) blocked the `insert into ali_mock_form (...) values ('english-full-mock-v1', ...)` statement inside migration 245's second transaction block. The trigger's own logic (read in full): for every `question_id` in the **new** row's `question_manifest`, it checks whether **any other** existing `ali_mock_form` row already references that same `question_id` in its own manifest — regardless of that other form's `active` status, and regardless of whether it has ever actually been attempted by a learner. This is a purely structural, declarative rule ("a form must not reuse content another form has already claimed"), not an exposure-history check.

Migration 245's own manifest expression was:
```sql
(select question_manifest from public.ali_mock_form where id = 'reading-comprehension-mock-1')
  || jsonb_build_array(jsonb_build_object('question_id', 'mock-writing-mindchange-01', ...))
```
— i.e. it copied `reading-comprehension-mock-1`'s entire 28-question manifest wholesale into a second form. Every one of those 28 IDs is already claimed by `reading-comprehension-mock-1`'s own manifest, so the trigger fired on all 28 and refused the insert. The `mock-writing-mindchange-01` addition itself is not part of the collision (nothing else has ever referenced it).

## B. All 28 collided questions and owning form

All 28 come from exactly one source, `reading-comprehension-mock-1` (`timed_section`, `subject='english'`, frozen migration 212, activated migration 217 — the exact IDs read directly from migration 212's own frozen manifest constant, not inferred):

| Passage | learning_unit_id | Questions | Marks |
|---|---|---|---|
| How Bees Find Their Way Home | `eng-inc001-bee-navigation` | `eng-inc001-bee-q01`…`q08` (8) | 20 |
| The Boat in the Boathouse | `mock-eng-boathouse` | `mock-eng-boathouse-q01`…`q11`, `q12a`, `q12b` (13) | 30 |
| The Understudy | `eng-inc001-understudy` | `eng-inc001-understudy-q01`…`q07` (7) | 15 |

28 questions, 3 passages, 65 marks total — matches the collision error's own "28 question(s)" exactly.

## C. Exposure status

`reading-comprehension-mock-1` has genuine, **documented, real production learner exposure** — not inferred from IDs. Two separate, already-applied migrations in this project's own committed history independently confirm it:
- Migration 218's own header: "the existing first Reading attempt (or any future one)" — written to fix passage rendering for an attempt that already existed at the time.
- Migration 220's own header names a **specific real attempt UUID** (`f7ac5c70-75fd-4f16-9b09-768365ac0abe`) with "all six genuinely-answered questions resolved to requires_manual_marking," and separately names `eng-inc001-bee-q03` as the one question genuinely requiring manual marking within that sitting.
- Migration 227's own header: "Increment 025 proved the Reading Comprehension Mock 1 scorer works in production... a real attempt reached scoring_state='scoring' with 6 questions at requires_manual_marking" — the same sitting.

This is at least one confirmed real sitting against this exact 28-question manifest. **I cannot obtain an exact attempt count** — `ali_mock_attempt`'s RLS restricts reads to each row's own owner, so even an authenticated (non-admin) session sees nothing beyond itself, and I have no admin/service-role credential. The correct, honest statement is "confirmed non-zero, documented real exposure," not a specific count.

All 28 questions currently carry `mock_eligible` status per migration 217's own live re-verification requirement (which would have refused activation otherwise) and are protected from ever returning to Practice by migration 208's own companion trigger (`ali_block_exposed_content_practice_promotion`).

## D. Why earlier validation missed this

**Confirmed by direct inspection, not speculation.** Two compounding causes:

1. **Standing, project-wide, already-self-disclosed constraint**: this environment has no Docker/local Postgres and no service-role/DB-owner credential — confirmed independently, again, this session (see the blocked-migration-application report from earlier today) and previously self-disclosed inside migration 208's *own* "VERIFICATION" section: *"These triggers could not be executed against a real database this session... Founder SQL-Editor execution is the first real, live test these will receive, same as every other migration in this repository — this is disclosed, not claimed as executed."* "Validated" for every migration in this repository's history, including 245, has only ever meant: TypeScript compiles, structural regex assertions pass against the raw SQL **text** (confirmed by reading `tests/supabase/migration245CsseEnglishFullPaperWritingAssessment.test.ts`'s own header: *"assert against the actual migration text, not a live database this test suite has no connection to"*), and an isolated Next.js build succeeds. None of these can detect a runtime trigger firing against real, pre-existing cross-migration data — that class of defect is structurally invisible to text-only verification, by design of the tooling available, not by oversight in this one migration's own test file specifically.

2. **A real, avoidable authoring gap, not only a tooling limit**: migration 245's own file contains zero references to migration 208 or its trigger, anywhere — confirmed by grep. A static read of `ali_mock_form`'s own trigger history (which any migration inserting into that table should check) would have surfaced this without needing a live database at all. This is worth naming honestly rather than attributing the whole failure to "no live DB."

**Recommendation for future migrations** (per the Founder's own "do not build a large migration framework" instruction, the smallest fix is process, not tooling): before any migration inserts/updates `ali_mock_form.question_manifest`, grep `supabase/migrations/*.sql` for every existing trigger on that table and manually cross-check the new manifest's question IDs against every other form's manifest. No new script, no new test framework.

## E. Existing Reading Comprehension Mock disposition

**Preserved, untouched, and not modified by this investigation.** It remains active, its manifest and historical attempt(s) are completely unaffected by the failed 245 attempt (the trigger blocked the write before it happened) and by anything in this report. Nothing here proposes deleting, renaming, or reclassifying it.

## F. Fresh unused English Mock inventory

From direct migration-history archaeology (migrations 153–165, 210, 211), cross-referenced against what has actually been composed into a manifest (only `reading-comprehension-mock-1`'s 28 questions, confirmed — no other English/Writing content has ever appeared in any `ali_mock_form.question_manifest` anywhere in this repository's history):

**A. Reading/comprehension — two whole, unallocated passages, explicitly reserved by migration 212's own header ("Founder-preserved for a future assessment") and promoted to `mock_eligible` by migration 210 (a standalone migration, separate from 245):**
| Passage | learning_unit_id | Questions | Marks |
|---|---|---|---|
| The Loose Connection | `eng-inc002-roboticsfinal` | `q01, q02b–e, q03, q04, q05, q06, q07a, q07b, q08` (12) | 22 |
| Crossing the Atlantic: Sail and Steam | `eng-inc002-sailandsteam` | `q01–q04, q05b–e, q06, q07` (10) | 17 |

Combined: **22 questions, 2 passages, 39 marks**, never referenced by any `ali_mock_form` manifest — collision-free by construction against migration 208's trigger.

**B. Vocabulary/language:** none identified as a separate, unallocated Mock-eligible pool beyond what's embedded in the two passages above (their own vocabulary-type subparts, e.g. `roboticsfinal-q02b–e`).

**C. Q1 Continuous Writing:** `mock-writing-mindchange-01` (the row 245 attempted to promote — almost certainly still at its pre-245 status, see §K) plus at least `mock-writing-screentime-01` (promoted to `mock_eligible` by the separate, standalone migration 211) and two further `independently_validated` rows (`mock-writing-cookopinion-01`, `mock-writing-kindness-01`) not yet promoted by any migration I can find. None of these has ever appeared in any manifest — all collision-free.

**D. Q2 Continuous Writing:** `eng-q2-picturenarrative-oldshed` (authored by migration 246, not yet applied — the row does not exist in production yet at all). Never referenced anywhere else — collision-free once inserted.

**Important, disclosed limitation on all of the above**: this project's live RLS policy (`ali_question_bank_select_all`, migration **100**, which supersedes 084's looser version and is confirmed live by direct anon-key testing this session) hides every row whose `eligibility_status` is anything other than `practice_eligible` — it does **not** distinguish `mock_eligible` from `independently_validated`/`authentic_assessment_candidate`/`provisional`. I attempted to use row-visibility as a live signal and found it initially promising but ultimately **inconclusive**: it cannot tell me whether migrations 210/211 have actually been applied, or whether these rows are still sitting at their pre-promotion status. Everything in this section is sourced from migration **history** (what was *designed* to be promoted, and by which already-existing, separately-applied migration file) — not independently live-confirmed. §K/§O give the exact queries needed to close this gap.

## G. Fresh complete-paper capacity

**Provisional NO — pending the one verification gap in §F/§K.**

If migrations 210/211 are confirmed applied: Angel has 2 fresh, unexposed passages (22Q/39 marks) plus Q1 plus Q2 available today — real content, but **short of the established 3-passage/28-question/65-mark structure** this project's own evidence base (3/3 real CSSE years sampled) used to build Reading Comprehension Mock 1 in the first place. A 2-passage paper is not nothing, but it is not structural parity with the existing form, and I am not willing to call that a clean YES without the Founder's own explicit acceptance of a smaller Reading component.

If migrations 210/211 are **not** confirmed applied: the deficit is larger still — potentially the entire Reading Comprehension component, with only Q1/Q2 Writing genuinely ready.

I cannot responsibly collapse this into a single unqualified answer without the §K verification. See §H for the deficit under each scenario.

## H. Exact educational content deficit (if NO)

**Scenario 1 — migration 210 confirmed applied (2 fresh passages usable):**
- Deficit: **1 passage**, sized to match the existing three (8–13 questions, ~15–30 marks), to reach genuine 3-passage structural parity with the retired Reading Comprehension Mock 1. Without it, a "Full English Paper" would ship with a visibly thinner Reading component than the form it's meant to supersede.

**Scenario 2 — migration 210 not applied (0 confirmed-usable fresh passages):**
- Deficit: up to **3 passages / ~28 questions / ~65 marks** — i.e., re-derive the entire Reading Comprehension component from scratch, since every other passage in this bank's history (Bee/Boathouse/Understudy) is the retired, exposed set.
- In this scenario, applying migration 210 itself (a small, already-prepared, already-reviewed, standalone migration with its own idempotent guard checks) would immediately resolve back to Scenario 1 — this is very plausibly the cheapest first move, not new content authoring.

Q1/Q2 Writing: **no deficit** — real, reviewed (Q1) and freshly independently reviewed this pass (Q2, see the earlier Q2 educational gate = PASS), collision-free content already exists for both.

The authoritative Comprehension/Writing raw-mark split remains unresolved (per this project's own standing, repeated finding) — no mark allocation is proposed or implied above beyond each component's own internally-consistent, already-established marks.

## I. Q1 collision status

**Collision-free.** `mock-writing-mindchange-01` has never appeared in any `ali_mock_form.question_manifest` anywhere in this repository's migration history (confirmed by grep across every migration that ever touches `question_manifest`) — only `mock-eng-*`/`eng-inc001-*` Reading IDs and Mathematics Mock 1's own `mock-mr*` IDs have ever been composed into a form. The trigger would not have fired on this row; the failure was entirely attributable to the copied Reading manifest.

## J. Q2 collision status

**Not yet applicable, and collision-free by construction once it is.** `eng-q2-picturenarrative-oldshed` does not exist in production (migration 246 unapplied). It is a brand-new ID, referenced nowhere else in this repository's history — the same trigger check that blocked the Reading manifest would find zero conflicting rows for it whenever it is eventually inserted.

The Q2 educational review completed earlier remains valid and is preserved — this content-collision finding gives no reason to discard it.

## K. Migration 245 partial-state verification

**Not independently live-confirmed from my current access — see the disclosed RLS limitation in §F.** What I can state with high confidence from Postgres transaction semantics, not mere assumption: migration 245's content section is a single `begin...commit` block containing, in order, (1) the `update ali_question_bank set eligibility_status = 'mock_eligible' ... where id = 'mock-writing-mindchange-01'` and (2) the `insert into ali_mock_form (...) values ('english-full-mock-v1', ...)` that raised the exception. Postgres transactions are atomic — an unhandled exception anywhere in a `begin...commit` block rolls back **every** statement in that same block, with no partial persistence possible. Barring the Founder having executed statement (1) as a *separate*, already-committed transaction before pasting the rest (worth confirming, since it changes the answer), the correct default expectation is:
- `mock-writing-mindchange-01` remains at its pre-245 status (`independently_validated`), **not** promoted.
- No `english-full-mock-v1` row exists in `ali_mock_form` at all.

**Exact read-only queries to close this out** (please run and share the results, or grant a read-only path I can run myself):
```sql
select id, eligibility_status from ali_question_bank where id = 'mock-writing-mindchange-01';
select id from ali_mock_form where id = 'english-full-mock-v1';
select id, eligibility_status from ali_question_bank
  where id like 'eng-inc002-roboticsfinal-%' or id like 'eng-inc002-sailandsteam-%'
     or id = 'mock-writing-screentime-01' or id = 'mock-writing-cookopinion-01' or id = 'mock-writing-kindness-01'
  order by id;
```
Migration 245's schema block (the earlier, separate `begin...commit`: `ali_writing_assessment` table, the two new functions, the two new `ali_mock_form` columns, the widened `mock_get_active_form`) **is** confirmed live — verified this session via read-only RPC probes (`mock_persist_writing_assessment` exists and runs its real body; `mock_get_active_form` accepts and correctly filters on `p_subject`).

## L. 246/247 dependency status

**Both remain valid in design, neither should be applied yet.**
- **246** depends on 245's schema (satisfied — `ali_writing_assessment`/`mock_persist_writing_assessment` exist) and, critically, on 245's **content** section having succeeded (it did not — see §K). 246's own `UPDATE ... jsonb ||` fix targets `mock-writing-mindchange-01`'s prompt keys assuming it is already `mock_eligible`; its own `UPDATE ali_mock_form ... where id = 'english-full-mock-v1'` manifest-append assumes that row exists. **Neither precondition currently holds.** 246 must not be applied until a corrected English form actually exists.
- **247** depends only on `ali_writing_assessment` existing (satisfied) — it has no dependency on the failed content section and could in principle apply independently of the English-form question. Per the Founder's own §11 instruction, holding it until the corrected sequence passes preflight is still the right call, since applying it in isolation now would create working infrastructure with nothing yet to exercise it against.

## M. Smallest legitimate resolution (design only, not implemented)

Do not touch migration 208. Do not modify 245's already-applied schema block. The smallest correction is a **replacement content section**, delivered as a new, additive migration (next number in sequence) that:
1. Does **not** copy `reading-comprehension-mock-1`'s manifest at all.
2. First runs the exact read-only queries in §K to confirm real current state, and confirms (or itself re-applies, if genuinely still pending) migration 210's promotion of the two unallocated passages.
3. Builds `english-full-mock-v1`'s manifest from **only** collision-free content: the two fresh passages (Loose Connection + Sail and Steam, 22Q/39 marks) plus Q1 (`mock-writing-mindchange-01`) plus Q2 (`eng-q2-picturenarrative-oldshed`, requiring 246's Q2 row to be inserted first, itself corrected to not depend on a form that doesn't yet exist).
4. If the Founder judges 2 passages insufficient for structural parity (§H, Scenario 1), the SMALLEST further step is authoring exactly one more passage of comparable size — not a new content wave.
5. Re-verifies against `ali_block_mock_form_content_reuse()`'s exact predicate (every candidate question ID checked against every existing form's manifest) *before* returning the migration for Founder execution, and states plainly that this check is a manual/static cross-reference (no live DB access to actually execute the trigger pre-emptively), consistent with §D's own disclosed limitation.

This is a design description only, per your explicit instruction not to implement yet.

## N. P0/P1/P2 findings

- **P0/P1: none found.** No integrity or safety defect exists — migration 208's own protection did exactly its job and no assessment-integrity violation occurred (the exposed content never reached `english-full-mock-v1`).
- **P1, process (already fixed by disclosure, not by code):** migration 245's own design and its own test suite never cross-checked against an existing, already-applied content-protection trigger before proposing to reuse another form's manifest — a real authoring/process gap (§D), now named so it doesn't recur.
- **P2:** the true current `mock_eligible` status of the two fresh passages and the three additional Q1 candidates cannot be confirmed from my current access (§F/§K) — this blocks a confident YES/NO in §G until resolved.
- **P2:** the "Reading Comprehension Mock 2" reservation language (migration 210's own comments) implies these two passages were earmarked for a *second, separate* Reading-only Mock, not necessarily for the Full English Paper's own Reading component — worth an explicit Founder decision on repurposing them, not assumed silently by this report.

## O. Exact recommended next action

1. Run the three read-only queries in §K (Supabase Dashboard → SQL Editor, `select` only, zero risk) and share the results, or grant me a read-only path that can see past the `practice_eligible`-only RLS filter (I do not need a full service-role/DDL credential for this — a narrower read grant, or simply running the queries yourself and pasting the output, is enough).
2. Once that's known, I can give a firm YES/NO for §G and, if NO, the exact final deficit (either "author 1 more passage" or "re-run migration 210, then you likely already have enough").
3. Do not apply 246 or 247 yet. Do not touch migration 208. Do not re-run 245 as-is.
4. I will not draft the replacement content migration until you've confirmed the §K results and decided how to treat the "Reading Comprehension Mock 2" reservation question in §N.

---

**STOP. No resolution has been implemented. No production data was changed. No trigger was modified. Awaiting the §K verification results and your decision on §N before drafting anything further.**
