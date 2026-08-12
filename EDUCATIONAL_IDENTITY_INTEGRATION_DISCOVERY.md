# Educational Identity Integration — Discovery Report

**Status:** Discovery only. No implementation code. No schema changes. No routes touched.
**Triggered by:** pausing Practice Evidence Integration (Step 2 of the Educational Intelligence Foundation mission, 2026-07-23) to establish one permanent Educational Identity for every educational item before further evidence integration proceeds.
**Scope:** read-only investigation of every content source, id scheme, and identity-adjacent mechanism already in the `angel-11plus` codebase.

---

## Executive summary

There is **one real, live, referentially-enforced identity already in this codebase** — `ali_question_bank.id` (`text primary key`, `supabase/migrations/005_ali_question_bank.sql:51`). Everything downstream (evidence, mastery, durable mastery, educational audit, readiness, recommendations) is already built against it via a hard foreign key (`ali_student_question_history.question_id → ali_question_bank(id)`, migration 006). **The canonical Educational Identity does not need to be invented — it needs to be adopted more widely.**

The real problem is coverage, not design: **218 real educational items exist across 8 legacy content files; only 18 (≈8%) have ever been given a row in `ali_question_bank`**, and the mechanism for assigning that identity to legacy content — reuse the item's own pre-existing id verbatim — is already proven (migration 013 did exactly this for all 18). What's missing is a deliberate, sequenced plan to close the remaining ~200-item gap, and a small number of guardrails (id-uniqueness enforcement, skill-vocabulary hygiene) that today rely on incidental discipline rather than anything the schema actually checks.

---

## 1. How many independent educational content sources currently exist?

**9 real sources**, plus one dev-only layer that must never be confused with them:

| # | Source | Real item count | Currently has an Educational Identity? |
|---|---|---|---|
| 1 | `data/lessons.ts` (English Reading Comprehension) | 3 lessons, 10 questions | 5/10 (migration 013) |
| 2 | `data/maths.ts` (`mathsQuestions` + `quickArithmetic`) | 20 questions | 12/20 (migration 013) |
| 3 | `data/vocabulary.ts` | 12 words | 0/12 |
| 4 | `data/writing.ts` | 4 prompts | 1/4 (migration 013) |
| 5 | `data/verbal-reasoning/*` | 52 questions | 0/52 |
| 6 | `data/non-verbal-reasoning/*` | 40 questions | 0/40 |
| 7 | `data/spatial-reasoning/*` | 39 questions | 0/39 |
| 8 | `data/numerical-reasoning/*` | 41 questions | 0/41 |
| 9 | **`ali_question_bank`** (the canonical bank itself) | 18 rows total | — (this *is* the identity) |
| — | `data/ali/*SyntheticFixture.ts` (English/Maths/Vocabulary/VR) | dev-only | N/A — explicitly prefixed (`synthetic-*`) to never collide with real content; used only when this sandbox has no Supabase reachability, never a production source |

**Totals**: 218 real content items (46 CSSE-relevant across English/Maths/Vocabulary/Writing + 172 Verbal/Non-Verbal/Spatial/Numerical Reasoning, which sit outside the CSSE pathway entirely — CSSE tests none of VR/NVR/SR, per `lib/ali/pathwayEligibility.ts`). Only 18 have ever been inserted into `ali_question_bank` — confirmed by grepping every migration for `insert into public.ali_question_bank`: only migration 013 does so; migration 005 only creates the table.

One factual correction worth carrying forward: `QUESTION_AUTHORING_STANDARD.md` states "119 existing NVR/Spatial/Mathematical Reasoning questions" — the real, grep-verified count is 120 (40+39+41). Minor, but worth fixing wherever that figure is repeated.

---

## 2. Which identifier systems are used?

Three independent, overlapping layers — this is the actual source of confusion, not the raw id strings themselves:

**Layer A — per-item string ids.** Nine different prefix schemes, one per source: `eng-NNN` (lessons) / `eng-NNN-qN` (questions), `mth-NNN` + `qa-NNN` (two sequences in one file), `voc-NNN`, `wrt-NNN`, `vr-NNN`, `nvr-NNN`, `sr-NNN`, `nr-NNN`. `QUESTION_AUTHORING_STANDARD.md:17` already states the intended rule — "Stable, permanent identifier. Never reassigned, never reused... Format: `{subject-prefix}-{number}`" — but this is *convention*, not anything the schema enforces. One live irregularity already exists: `mth-007b` (`data/maths.ts:88`), a letter-suffixed exception that migration 013 had to carry through unchanged.

**Layer B — three incompatible "skill" vocabularies**, all of which end up in the same untyped `ali_question_bank.skill text` column (migration 005, no enum, no FK):
- The legacy coarse `SkillType` union (`types/index.ts`) — 17 values (e.g. `"atmosphere"`, `"word-problem"`, `"verbal-reasoning"`), applied uniformly to an entire subject rather than per-question (every one of the 52 VR questions carries the identical value `"verbal-reasoning"`). Consumed only by the legacy `recordSkillResult()` bridge (`lib/progress.ts`), never by the Educational Intelligence Engine.
- The older ALI dotted codes (e.g. `"vr.analogies"`, `"maths.fractions"`) — defined in `QUESTION_AUTHORING_STANDARD.md` and `lib/ali/labels.ts`, but — importantly — **confirmed to exist only in the dev-only synthetic fixtures, never in a real inserted `ali_question_bank` row.** All 18 real rows use Layer C exclusively.
- The new Assessment Brain `QuestionTypeId`/`CompetencyId` codes (`QT-RC-01`…`QT-MR-14`, `RC-01`…`WC-02`, `lib/learningEngine/types.ts`) — the only vocabulary migration 013 actually used for real rows.

**Layer C — `learning_unit_id`** (migration 007), a *grouping* identity layered on top of Layer A rather than a fourth id space: for atomic content (Maths, Writing) it equals the item's own id; for Reading Comprehension it equals the parent passage/lesson's id, letting several question rows resolve to one schedulable unit (`lib/ali/learningUnit.ts`). Guaranteed non-null for every row that exists today.

**The real risk this discovery surfaces**: nothing currently stops a future authoring pass from inserting a dotted-code row into the same `skill` column real `QT-*` rows already occupy. It hasn't happened yet — but the column has no type-level or constraint-level defense against it.

---

## 3. Which can become the canonical Educational Identity?

**`ali_question_bank.id` already is the canonical Educational Identity, and should remain it — not be replaced, duplicated, or re-designed.** It is the one identifier that is: (a) a real Postgres primary key, (b) the target of a real, enforced foreign key from every evidence table (`ali_student_question_history`, and transitively `ali_durable_mastery`/`ali_educational_audit` via competency/profile joins), and (c) already the join key every existing consumer (adaptive mocks, CSSE Practice Experience, and — pending this pause — the legacy practice pages) uses identically.

The design question isn't "which id system wins" — it's **how new identity gets assigned going forward**, since today's uniqueness is coincidental rather than enforced (see §2, Layer A) and could break under a future subject whose prefix happens to collide with an existing one. The primary-key constraint itself is the actual backstop (a colliding insert will fail loudly, not silently corrupt data) — this is an acceptable, not fragile, safety net, but the discovery flags it explicitly so it's a known property, not an assumed one.

---

## 4. How can legacy content be migrated without breaking existing routes?

**Migration 013 already answered this, and the answer generalises cleanly: reuse the legacy item's own existing id verbatim as the new `ali_question_bank.id` row — never mint a second, parallel id.** This is precisely why closing the identity gap requires **zero changes to any page, route, or `data/*.ts` id field** — the 18 already-tagged items work today, end-to-end, through `/mocks/adaptive/*` and `/learning-intelligence/practice/[area]`, and (pending Founder decision) through the paused legacy-page wiring, with the exact same `data/*.ts` files, ids, and routes that existed before migration 013 was ever written.

Concretely, "migrating legacy content" is **entirely a content-tagging exercise** (an `insert into ali_question_bank` statement per item, following migration 013's exact column shape: `id`, `subject`, `skill`, `pathway`, `content_difficulty`, `question_type`, `estimated_time_seconds`, `prompt`, `explanation`, `mastery_threshold`, `learning_unit_id`) — not a code or routing rewrite. The ~200-item backlog this implies should be sequenced by real value, using migration 013's own disclosed coverage gaps as the starting priority list (e.g. RC-04 Sequential Ordering, QT-WC-01b Picture-Stimulus Narrative, and MR-06/QT-MR-14 currently have zero real content at all).

---

## 5. How can future CSSE papers automatically receive permanent Educational Intelligence identities?

There is currently **no automated identity-minting mechanism at all** — every existing id was assigned by hand, following `QUESTION_AUTHORING_STANDARD.md`'s stated (but unenforced) `{prefix}-{number}` convention. For future CSSE papers to receive a permanent identity automatically, three things need to be true that aren't yet:

1. **Identity must be minted once, at content-authoring time** — i.e. at the "Knowledge Extraction" step of the mission's own stated pipeline (Past Papers → Educational Research → Knowledge Extraction → Knowledge Engine → …), before a question is ever seen by any other engine. Retrofitting identity after the fact (as migration 013 necessarily did for pre-existing content) is the exception, not the intended steady state.
2. **The minting rule needs to be enforced, not just documented** — today's uniqueness (§2/§6) is a coincidence of four content tracks independently maintaining prefix discipline. A real mechanism (even something as simple as a per-subject sequence check at authoring time) would close this before it becomes a real collision, rather than relying on the primary key to catch it after the fact.
3. **The legacy-id-format irregularity (`mth-007b`) is a live example of what happens without that enforcement** — worth using as a concrete test case for whatever authoring tooling is designed next.

This is a process/tooling design question, appropriately deferred — no implementation is proposed here per this discovery's own scope.

---

## 6. How will competency mappings attach to those identities?

**This mechanism already exists, is already live, and should not be redesigned** — only extended in coverage. `ali_question_bank.skill` (a `QuestionTypeId`) resolves to a `CompetencyId` via `QUESTION_TYPE_PRIMARY_COMPETENCY` (`lib/learningEngine/assessmentBrainMap.ts`), a lookup already used identically by the CSSE Practice Experience page and the paused legacy-practice adapter (`resolveBankEvidenceContext()`, which honestly returns `competencyId: undefined` rather than inventing a mapping when a `skill` value has none).

Identity (`id`) and competency mapping (`skill` → `CompetencyId`) are already cleanly separated concerns in the live schema — `id` identifies the item, `skill` maps it into Assessment Brain's taxonomy, and nothing about closing the coverage gap in §4 requires touching this mechanism. The one real risk flagged in §2 (two incompatible vocabularies sharing one untyped column) should be resolved — at minimum by an explicit rule that new real rows may only ever use `QT-*` values — before the ~200-item tagging backlog scales up, since scaling up before that decision is made risks the collision actually happening for the first time.

---

## 7. How will mocks, practice and future assessments all reuse the same Educational Identity?

**They already do, wherever an item has been tagged.** `lib/ali/history.ts`'s `recordPresentation()`/`recordOutcome()` is the single shared write path, keyed on `ali_question_bank.id`, and it is already reused identically by:
- `app/mocks/adaptive/{english,maths,vocabulary,gl}/page.tsx` (mock exams)
- `app/learning-intelligence/practice/[area]/page.tsx` (CSSE Practice Experience)
- `lib/learningEngine/legacyPracticeEvidence.ts` (the paused legacy-page integration — built, verified, uncommitted)

The Educational Identity is exactly the join key that lets all of these surfaces, plus any future Assessment Engine surface, write to and read from one shared evidence trail (`ali_student_question_history`, `ali_durable_mastery`, `ali_educational_audit`) without needing a separate identity scheme per surface. Nothing new needs to be built here — the paused Step 2 work is already a live proof that this reuse pattern holds; what it's currently short on is coverage (rows to reuse), not mechanism.

---

## Cross-cutting finding: this reframes Step 2, it doesn't invalidate it

The paused Practice Evidence Integration's central safety gate — `resolveBankEvidenceContext()` returning `"untagged-question"` and doing nothing further — is exactly the mechanism this Educational Identity work needs to feed. Step 2's code does not need to change as identity coverage grows; it will simply start recording real evidence for more items as more of them receive a permanent `ali_question_bank` row. Step 2 is the **consumer** of Educational Identity; this discovery is about strengthening the **supply**.

---

## Open questions for a Founder decision before any implementation begins

1. Sequencing: which of the ~200 untagged items get identity first — by subject, by coverage-gap severity (RC-04/QT-WC-01b/MR-06 currently have zero content), or by whatever the next real CSSE paper research adds?
2. Should the `skill` column's two-vocabulary risk be closed with an explicit rule now (real rows may only ever be `QT-*`), or left as a documented risk until it's ever actually violated?
3. Should identity-minting tooling (§5) be scoped as its own future work package, or folded into whatever authors the next batch of tagged content?

No code, schema, or route changes were made in the course of this discovery.
