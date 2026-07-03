-- Angel Digital 11+ — Migration 007
-- Angel Learning Intelligence (ALI) — Phase 2.1 (English/Reading Comprehension)
-- Additive-only. Depends on migration 005 (ali_question_bank).
-- Introduces the Learning Unit as a permanent architectural concept
-- (ALI_DECISION_LOG.md Decision 36): the schedulable, never-split unit of
-- adaptive selection. For atomic subjects (Verbal Reasoning, Mathematics)
-- a Learning Unit is exactly one question. For Reading Comprehension a
-- Learning Unit is one passage and every question linked to it.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- learning_unit_id
-- Added nullable first, backfilled, then constrained NOT NULL — the
-- standard safe pattern for an additive column, and works identically
-- whether the table is empty (no production rows yet, per migrations
-- 004-006's still-unapplied status) or already has real rows.
--
-- Backfill convention for atomic subjects: learning_unit_id = id (a
-- question is its own, single-member Learning Unit). Reading Comprehension
-- rows set learning_unit_id to the shared passage id at import time instead,
-- so multiple questions resolve to one Learning Unit.
-- ============================================================
alter table public.ali_question_bank
  add column if not exists learning_unit_id text;

update public.ali_question_bank
  set learning_unit_id = id
  where learning_unit_id is null;

alter table public.ali_question_bank
  alter column learning_unit_id set not null;

create index if not exists ali_question_bank_learning_unit_id_idx
  on public.ali_question_bank (learning_unit_id);
