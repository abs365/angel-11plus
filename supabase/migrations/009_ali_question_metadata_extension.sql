-- Angel Digital 11+ — Migration 009
-- Work Package WP-02 (Implementation Programme) — Question Intelligence
-- metadata extension, per AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §4/§7
-- and AIW-001_EDUCATIONAL_DATA_MODEL.md §4/§11.
-- Additive-only. Depends on migration 005 (ali_question_bank).
-- Does not touch profiles / user_stats / lesson_progress / any other table.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- addresses_misconception
-- Optional link to a named misconception (AEP-002_KNOWLEDGE_FRAMEWORK.md §4)
-- this question is deliberately designed to surface or correct. A short
-- text label, not a foreign key — no misconceptions table exists yet
-- (misconceptions are catalogued narratively in AEP-002 §4, not as a coded
-- list), and inventing one here would be scope creep beyond this migration.
-- Permanently optional: not every question targets a named misconception,
-- so this column is never intended to become NOT NULL.
--
-- transfer_links
-- Optional array of related competency codes (AIW-001 §2's Knowledge
-- Graph, AEP-002 §10's Cross-Subject Relationships) this question is
-- known to support transfer reinforcement for (AEP-004 §9.5, AEP-001
-- §2.12's Learning Transfer Principle). Same "text[]" shape as the
-- existing `pathway` column, since `skill` itself is already a plain
-- text competency code, not an enum. Also permanently optional.
-- ============================================================
alter table public.ali_question_bank
  add column if not exists addresses_misconception text,
  add column if not exists transfer_links text[];

-- No backfill, no NOT NULL step: unlike the nullable-then-NOT-NULL pattern
-- used for learning_unit_id (migration 007), these two fields are designed
-- to stay optional indefinitely (QUESTION_AUTHORING_STANDARD.md §12-§14's
-- worked examples never populate them), so there is no follow-up migration
-- planned to tighten this constraint.

-- ============================================================
-- ROW LEVEL SECURITY
-- Unchanged. ali_question_bank's RLS posture (disabled, migration 005) is
-- not affected by adding nullable columns to an existing table.
-- ============================================================
