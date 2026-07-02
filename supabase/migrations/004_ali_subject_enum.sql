-- Angel Digital 11+ — Migration 004
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only: extends the existing subject_type enum with the 4 reasoning
-- subjects, which are already first-class throughout the app's SkillType/
-- MockConfig logic but were never added to the DB-level enum in migration 001.
-- Existing 5 values (english, maths, vocabulary, writing, mock-test) are
-- never modified. See ALI_DECISION_LOG.md Decision 5.
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter type public.subject_type add value if not exists 'verbal-reasoning';
alter type public.subject_type add value if not exists 'non-verbal-reasoning';
alter type public.subject_type add value if not exists 'spatial-reasoning';
alter type public.subject_type add value if not exists 'numerical-reasoning';

-- ============================================================
-- NOTE
-- Postgres cannot run ALTER TYPE ... ADD VALUE inside the same transaction
-- as a later statement that uses the new value, so this migration only
-- adds the enum values. Tables that use these new values (ali_question_bank,
-- migration 005) are created in a separate migration file/transaction.
-- ============================================================
