# ALI Seeding Plan

**Purpose:** How a signed-off hand-tagging worksheet (`ALI_HAND_TAGGING_WORKFLOW.md`) actually becomes real rows in `ali_question_bank`, and how to confirm the synthetic fixtures are no longer what production is running on. **No code changes accompany this document** — it describes a data-loading process, not new application logic.

---

## 1. How tagged data enters `ali_question_bank`

### 1.1 The import is a data operation, not a code change

`ali_question_bank` (migration 005) already has every column a worksheet row needs (`ALI_HAND_TAGGING_WORKFLOW.md` §4). Importing is: read the signed-off worksheet, assemble each row's `prompt` jsonb from its sub-fields, and `insert`/`upsert` into `ali_question_bank`. No `lib/ali/*` function, no route, no type needs to change to make this work — `fetchQuestionBank()` (`lib/ali/questionBank.ts`) already reads whatever rows exist for a given `subject`/`pathway` combination and maps them into `BankQuestion` via `rowToBankQuestion()`, exactly as it does today against an empty table.

### 1.2 Recommended mechanism

A one-off script (Node/`tsx`, or a spreadsheet-to-SQL generator) that:
1. Reads the signed-off worksheet (CSV/spreadsheet export).
2. For each row, assembles the `prompt` jsonb value per subject shape (`ReasoningQuestion` / `MathsQuestion` / `EnglishComprehensionPrompt` — `types/ali/questionBank.ts`).
3. Emits either a single batched `insert into ali_question_bank (...) values (...), (...), ...` statement (paste into Supabase SQL Editor, same manual-apply convention as the migrations themselves), or a small script using the Supabase JS client with a real service-role key if one becomes available.
4. Uses `on conflict (id) do update` (upsert) rather than plain `insert`, so re-running the import after a correction doesn't require manually deleting old rows first — safe to run more than once.

This script is explicitly **not** part of this planning phase's deliverables (no code changes accompany this document) — building it is the natural first step of the *next* phase once a worksheet is actually signed off, not before.

### 1.3 Per-subject import order

No dependency between subjects — VR, Maths, and English worksheets can each be imported independently, in any order, whenever each is individually signed off. This mirrors the "one subject at a time" principle that's governed every ALI phase so far: there's no reason English's import has to wait for VR's, or vice versa.

---

## 2. How `learning_unit_id` is populated

- **Verbal Reasoning / Mathematics:** `learning_unit_id = id` for every row — the worksheet already carries this per `ALI_HAND_TAGGING_WORKFLOW.md` §1–§2, so the import script copies it straight across. No computation needed.
- **English Reading Comprehension:** `learning_unit_id` = the shared passage id (e.g. `"eng-001"`) already assigned per `ALI_HAND_TAGGING_WORKFLOW.md` §3 — every sibling question's row carries the identical value. The import script does not need to *derive* this; it needs to **verify** it (§4.3 below) before trusting it, since a copy-paste error in the worksheet (one sibling question accidentally getting a different unit id) would silently break passage-grouping at selection time without raising any error — `groupQuestionsByLearningUnit()` (`lib/ali/learningUnit.ts`) would just treat it as two smaller units instead of one, degrading the "never split apart" guarantee without any exception being thrown.

---

## 3. How the synthetic fixture is replaced by real content

**No code change is required for this step — it already works automatically.** Every adaptive route (`app/mocks/adaptive/gl/page.tsx`, `.../maths/page.tsx`, `.../english/page.tsx`) already follows the same pattern:

```ts
let bank = await fetchQuestionBank(supabase, "<subject>", "gl");
let synthetic = false;
if (bank.length === 0) {
  bank = <subject>SyntheticFixture;
  synthetic = true;
}
```

The moment `ali_question_bank` has one or more real rows for a subject, `fetchQuestionBank()` returns them, `bank.length === 0` is false, and the synthetic fixture is never touched for that subject again — automatically, per subject, with no flag to flip and no deploy to trigger. This was true from the moment Slice 1 shipped; seeding real content is a pure data operation against behaviour that's already been live in the codebase since 2026-07-02.

**Consequence for partial seeding:** if only, say, the English worksheet is imported and VR/Maths aren't yet, English's route stops using its synthetic fixture (and stops showing the "sample practice data" banner) while VR and Maths continue to, correctly and independently — because the check is per-subject, per-request, not a single global switch.

---

## 4. How to confirm no synthetic data is used in production

### 4.1 Real row counts per subject (the primary check)

```sql
select subject, count(*) as real_question_count
from public.ali_question_bank
group by subject
order by subject;
```
**Expected after full seeding:** `verbal-reasoning` → 52, `maths` → 20, `english` → 10. Any subject showing `0` here means that subject's adaptive route is still (correctly, safely) falling back to its synthetic fixture — not a bug, but a sign that subject's worksheet hasn't been imported yet.

### 4.2 Defensive check — no synthetic IDs ever reach the real table

Synthetic fixture questions are prefixed `synthetic-vr-`, `synthetic-maths-`, `synthetic-eng-` specifically so they can never collide with real IDs (`vrSyntheticFixture.ts` / `mathsSyntheticFixture.ts` / `englishSyntheticFixture.ts`, each documented inline). Nothing in the current codebase ever writes a fixture object to Supabase — fixtures are an in-memory, client-side-only fallback — but this query is a cheap, belt-and-braces confirmation that stays true:
```sql
select id from public.ali_question_bank where id like 'synthetic-%';
```
**Expected: zero rows, always.** A non-empty result here would indicate someone ran a script that imported fixture data by mistake — worth checking after every import run, not just once.

### 4.3 Learning Unit integrity check (English, and any future multi-question-unit subject)

```sql
select learning_unit_id, count(*) as questions_in_unit, count(distinct subject) as distinct_subjects
from public.ali_question_bank
where subject = 'english'
group by learning_unit_id;
```
**Expected:** each of the 3 real passages' `learning_unit_id` groups together exactly the number of questions that passage actually has (per `ENGLISH_COMPETENCY_FRAMEWORK.md` §1's table — `eng-001`→4, `eng-002`→3, `eng-003`→3), and `distinct_subjects` is always `1` (a unit never spans subjects). A row here with an unexpected count is exactly the copy-paste failure mode described in §2 — catch it here, before it reaches a real student's adaptive mock.

### 4.4 One live adaptive mock per subject, observed directly

The most direct confirmation: complete one real adaptive mock per subject (VR, Maths, English) as a test profile after seeding, and confirm in the browser that **no** "Sample practice data — real hand-tagged questions/passages coming soon" banner appears (`usingSyntheticFixture` state in each route). This is the single check that directly observes what a real student would see, rather than inferring it from row counts — pair it with `ALI_LIVE_VALIDATION_PROTOCOL.md`'s scenarios, which this banner-absence check is also folded into.

---

## 5. Sequencing relative to the other three documents

1. `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` — migrations applied, tables exist and are empty.
2. `ALI_HAND_TAGGING_WORKFLOW.md` — worksheets produced and signed off, per subject, independently.
3. **This document** — signed-off worksheets become real `ali_question_bank` rows, verified via §4.
4. `ALI_LIVE_VALIDATION_PROTOCOL.md` — full behavioural re-validation against real seeded data and real network access.

A subject can move through steps 2–4 on its own schedule — nothing here requires all three subjects to be seeded simultaneously.
