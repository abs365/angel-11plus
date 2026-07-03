# ALI Production Activation Checklist

**Purpose:** Move ALI's already-implemented, already-validated architecture (Slice 1 through Phase 2.1 — Verbal Reasoning, Mathematics, Reading Comprehension) from code-only into real production operation. **No code changes accompany this document.** This is a manual-execution checklist for whoever has real Supabase Dashboard access — migrations 004–007 have never been applied to production, and this environment cannot apply them (no outbound network route to this project's Supabase instance, confirmed since Slice 1).

**Scope reminder:** this phase is activation and verification only. No new subject, no new feature, no schema beyond what 004–007 already define.

---

## 0. Before you start

- [ ] Confirm the Supabase project open in the Dashboard matches this repo's `.env.local` value for `NEXT_PUBLIC_SUPABASE_URL` — the wrong project would apply these statements to unrelated data.
- [ ] Confirm you are in **SQL Editor → New query**, not a saved/shared query someone else is mid-editing.
- [ ] Take a manual export or note the current point-in-time — Supabase's built-in Point-in-Time Recovery (paid tiers) or a manual `pg_dump` if you have CLI access. Every statement below is additive-only (§4), so the realistic risk is low, but "additive-only" is a claim this checklist should let you verify, not just trust.
- [ ] Confirm no other migration work is in flight for this project (check with whoever else has Dashboard access) — running 004–007 concurrently with an unrelated schema change is the one scenario that could produce a genuine conflict.

---

## 1. Run order

Migrations must run **in this exact order, each as its own separate SQL Editor execution** — not pasted together as one script. This isn't a style preference: migration 004 uses `ALTER TYPE ... ADD VALUE`, and Postgres cannot use a newly-added enum value inside the same transaction that added it. Every migration file already carries this constraint in its own header comment; this checklist just makes the consequence explicit at the activation-sequencing level.

1. [ ] **`004_ali_subject_enum.sql`** — run, wait for success, confirm with §2 query before continuing.
2. [ ] **`005_ali_question_bank.sql`** — depends on 004's enum values existing. Run, confirm.
3. [ ] **`006_ali_student_state.sql`** — depends on 005's `ali_question_bank` table (foreign key from `ali_student_question_history.question_id`). Run, confirm.
4. [ ] **`007_ali_learning_unit.sql`** — depends on 005's `ali_question_bank` table (adds a column to it). Run, confirm.

Do not skip ahead if an earlier step's confirmation query doesn't match §2 — stop and diagnose before running the next file.

---

## 2. Expected table/type changes per migration

### 004 — `subject_type` enum extended
No new tables. Adds 4 values to the existing `public.subject_type` enum: `verbal-reasoning`, `non-verbal-reasoning`, `spatial-reasoning`, `numerical-reasoning`. The 5 original values (`english`, `maths`, `vocabulary`, `writing`, `mock-test`, from migration 001) are untouched.

**Confirm:**
```sql
select enumlabel from pg_enum
where enumtypid = 'public.subject_type'::regtype
order by enumsortorder;
```
Expected: 9 rows — the original 5 plus the 4 new ones, none missing, none duplicated.

### 005 — `ali_question_bank` + `ali_mastery_defaults` created
- New enum `public.content_difficulty` (`easy`, `medium`, `hard`, `challenge`).
- New table `public.ali_mastery_defaults` (primary key `content_difficulty`), seeded with 4 rows: easy→2, medium→2, hard→3, challenge→3.
- New table `public.ali_question_bank` — content columns per `QUESTION_AUTHORING_STANDARD.md` §1 (`id`, `subject`, `skill`, `pathway`, `content_difficulty`, `question_type`, `estimated_time_seconds`, `prompt` jsonb, `explanation`, `hint`, `confidence_weight`, `learning_objective`, `revision_priority`, `mastery_threshold`, `usage_count`, `avg_success_rate`, `created_at`). Empty — this migration creates the table, it does not seed content (§ALI_SEEDING_PLAN.md covers that separately).
- Both new tables have RLS disabled, matching the existing account-wide convention (no auth-based policy layer exists on any table yet).

**Confirm:**
```sql
select count(*) from public.ali_mastery_defaults; -- expect 4
select content_difficulty, default_threshold from public.ali_mastery_defaults order by content_difficulty;
-- expect: challenge/3, easy/2, hard/3, medium/2

select count(*) from public.ali_question_bank; -- expect 0 (not seeded yet)

select relrowsecurity from pg_class where relname = 'ali_question_bank'; -- expect false
```

### 006 — `ali_student_adaptive_state` + `ali_student_question_history` created
- `public.ali_student_adaptive_state` — one row per profile (created lazily by the app, not seeded here), `profile_id` FK to `profiles(id) on delete cascade`.
- `public.ali_student_question_history` — one row per `(profile_id, question_id)` ever encountered, `question_id` FK to `ali_question_bank(id) on delete cascade`, unique constraint on `(profile_id, question_id)`.
- Both tables get an `updated_at` trigger reusing the existing `set_updated_at()` function (migration 001) — no new trigger function is defined.
- Both new tables have RLS disabled.

**Confirm:**
```sql
select count(*) from public.ali_student_adaptive_state; -- expect 0 (no student has done an adaptive mock in production yet)
select count(*) from public.ali_student_question_history; -- expect 0

select tgname from pg_trigger where tgrelid = 'public.ali_student_adaptive_state'::regclass;
select tgname from pg_trigger where tgrelid = 'public.ali_student_question_history'::regclass;
-- expect the *_updated_at trigger present on each
```

### 007 — `ali_question_bank.learning_unit_id` added
Adds `learning_unit_id text not null` to the existing `ali_question_bank` table (added nullable, backfilled, then constrained — safe against either an empty table or one with real rows), plus a lookup index. No new table.

**Confirm:**
```sql
select column_name, is_nullable, data_type
from information_schema.columns
where table_name = 'ali_question_bank' and column_name = 'learning_unit_id';
-- expect: learning_unit_id | NO | text

select indexname from pg_indexes where tablename = 'ali_question_bank';
-- expect ali_question_bank_lookup_idx (005) and ali_question_bank_learning_unit_id_idx (007) both present
```

---

## 3. Full activation validation (all four applied)

```sql
-- Every ALI table/type exists
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'ali_%'
order by table_name;
-- expect: ali_mastery_defaults, ali_question_bank, ali_student_adaptive_state, ali_student_question_history

-- subject_type has all 9 values, content_difficulty exists with 4 values
select enumlabel from pg_enum where enumtypid = 'public.subject_type'::regtype order by enumsortorder;
select enumlabel from pg_enum where enumtypid = 'public.content_difficulty'::regtype order by enumsortorder;

-- ali_question_bank has learning_unit_id and is still empty (pre-seeding)
select count(*), count(learning_unit_id) from public.ali_question_bank;
-- expect: 0, 0 (both columns agree — no partial state)
```

- [ ] All four confirmation blocks above return the expected shape before moving on to `ALI_SEEDING_PLAN.md`.

---

## 4. Rollback considerations

**General posture:** every statement across 004–007 is additive (`create table if not exists`, `add column if not exists`, `alter type ... add value if not exists`) — nothing in these four files drops, renames, or rewrites existing data. The existing `profiles`/`user_stats`/`lesson_progress` tables and the original 5 `subject_type` values are never touched. This is deliberate, ongoing project convention (see every migration's own header comment), not new to this checklist.

**What genuinely cannot be rolled back cleanly:**
- **Migration 004's `ALTER TYPE ... ADD VALUE`.** Postgres does not support removing a value from an enum type. If a rollback of 004 is ever needed, the real options are: (a) leave the unused enum values in place (harmless — nothing in the app writes them until a table actually uses them, and 005 does), or (b) a full enum-type rebuild (`create type ... rename`, migrate every dependent column, drop the old type) — a genuinely invasive operation, not a one-line undo. **Practical implication: do not run 004 unless you intend 005–007 to follow.** There is no cheap way to "just undo the enum part."

**What can be rolled back cleanly, if ever needed (write, don't run, unless actually rolling back):**
```sql
-- Reverse of 007
drop index if exists public.ali_question_bank_learning_unit_id_idx;
alter table public.ali_question_bank drop column if exists learning_unit_id;

-- Reverse of 006
drop table if exists public.ali_student_question_history;
drop table if exists public.ali_student_adaptive_state;

-- Reverse of 005
drop table if exists public.ali_question_bank;
drop table if exists public.ali_mastery_defaults;
drop type if exists public.content_difficulty;
-- (004's enum values are not reversible — see above)
```
Run in this exact reverse order (007 back to 005) if a rollback of the table layer is ever needed — `ali_student_question_history` has a foreign key to `ali_question_bank`, so it must be dropped first.

**Data-loss risk assessment:** essentially none at activation time, because every table created by 004–007 starts empty. The real data-loss risk window opens only after `ALI_SEEDING_PLAN.md`'s import step populates `ali_question_bank`, and after real students start writing to `ali_student_question_history` — a rollback after that point would be a genuine decision to discard real content or real student progress, not a routine reversal, and is out of scope for this checklist.

---

## 5. Production safety checks

- [ ] **RLS is intentionally disabled** on all four ALI tables, matching the existing account-wide convention (no auth-based policy layer exists on any table in this schema yet, including `profiles`/`user_stats`). This is not a gap introduced by ALI — it is the project's current baseline. Do not add RLS to only the ALI tables as a one-off; if RLS is ever introduced, it should be an app-wide decision covering every table consistently.
- [ ] **Zero application code changes ship with this activation.** `fetchQuestionBank()` (`lib/ali/questionBank.ts`) already handles an empty `ali_question_bank` gracefully — every adaptive route falls back to its synthetic fixture with a visible "sample practice data" banner. This means running 004–007 with zero seeded content is safe and non-breaking: no student-facing behaviour changes until `ALI_SEEDING_PLAN.md`'s import actually populates rows for a given subject.
- [ ] **No other pending schema work touches `subject_type`, `profiles`, or `lesson_progress`** at the same time as this activation (confirm with whoever else has Dashboard access) — the one real way these additive migrations could conflict with something is a concurrent, unrelated change to the same enum or the same referenced tables.
- [ ] **Migrations are applied by a human with real Dashboard access, not by this sandbox or any automated agent** — this environment has no outbound route to Supabase and cannot apply these migrations; this checklist exists specifically so a human can do it safely without needing the agent's help for the apply step itself.
