-- Angel Digital 11+ — Migration 026
-- Active Pathway Context and Learner Focus Transformation
-- (knowledge/angel-assessment-transformation-programme/programme-001/
-- release-1/active-pathway-context/PATHWAY_EVIDENCE_INTEGRITY_ASSESSMENT.md)
--
-- The active pathway (which exam board a family is preparing for) has
-- existed only in client localStorage (lib/progress.ts's selectedPathwayId)
-- since the concept was introduced. This gives it a real, inspectable
-- database row on the existing profiles table, so pathway persistence and
-- pathway-switch history can be verified at the database level, not just
-- read back from the same client that wrote them.
--
-- Additive only: two nullable columns on an existing table. Does not alter
-- ali_question_bank, ali_student_question_history, ali_durable_mastery,
-- ali_educational_audit, ali_family_focus_selection, or any other table.
-- Deliberately does NOT add a pathway column to any evidence table — see
-- the integrity assessment above for why that is out of this increment's
-- scope.
--
-- The application writes to this best-effort and fire-and-forget (same
-- pattern as lib/progress.ts's existing syncFullProgress() call), and does
-- not depend on this migration being applied: localStorage remains the
-- authoritative source either way.
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter table public.profiles
  add column if not exists selected_pathway_id text,
  add column if not exists pathway_selected_at timestamptz;

comment on column public.profiles.selected_pathway_id is
  'The learner''s active examination pathway (gl | cem | csse | iseb | independent | core-foundation | not-sure), mirrored from client-side lib/progress.ts selectedPathwayId. Nullable: no pathway chosen yet.';

comment on column public.profiles.pathway_selected_at is
  'When selected_pathway_id was last set. Nullable.';
