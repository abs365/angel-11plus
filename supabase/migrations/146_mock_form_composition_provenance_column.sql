-- Angel Digital 11+ — Migration 146
-- Mathematics First Mock — ali_mock_form Composition Provenance Column
-- (Decision 210 Part 9, Decision 212).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 212's own minimum composition/freeze capability
-- (lib/ali/mockComposition.ts, lib/ali/mockFreezeManifest.ts) can build
-- the exact row a future, separately-authorised action would insert into
-- `ali_mock_form` -- but that row, as the table exists today (migration
-- 070, extended by 085/093), has nowhere to durably record WHAT was
-- actually reviewed and approved: total marks, numbered-question count,
-- difficulty/skill distribution, and which family ids were included.
-- `question_manifest` itself cannot carry this -- every existing reader
-- (`mock_create_attempt()`, `mock_create_cycle_attempt()`,
-- `scripts/verify-mock-attempt-engine.mjs`) treats it as a flat array of
-- `{question_id, section}` objects via
-- `jsonb_array_elements(question_manifest)`; inserting a summary object
-- into that array would break every one of those readers. Without a
-- separate place to record this, a future session could only re-derive
-- "what was approved" by re-querying `ali_question_bank` for the
-- manifest's own ids after the fact -- which silently drifts from the
-- truth the moment `ali_question_bank` itself changes (further
-- authoring, further promotions) after a form is frozen.
--
-- Prefers existing schema wherever possible, per the governing
-- directive's own instruction: `active` (already on `ali_mock_form`,
-- migration 070) remains the sole freeze/activation gate, unchanged --
-- this migration adds no new "approval state" column, since one already
-- exists and is already read by both attempt-creation functions
-- (`WHERE ... AND active = true`). Only the one genuinely missing piece
-- -- a durable snapshot of what a candidate composition actually was at
-- the moment it was proposed -- is added.
--
-- ============================================================
-- THE CHANGE: one new, nullable, additive column
-- ============================================================
-- `ali_mock_form.composition_provenance jsonb`, nullable, no default, no
-- check constraint on its own shape (this table's own established
-- convention -- `question_manifest` itself carries no schema-level shape
-- constraint either, per migration 070's own header, "a form may
-- reference a question that does not exist yet"). NULL for every
-- existing row (there are zero today, Founder-confirmed) and for any
-- future form inserted by a path other than the composition capability
-- (e.g. a hand-authored test fixture, matching
-- `scripts/verify-mock-attempt-engine.mjs`'s own precedent) -- this
-- column is documentation/audit metadata only, never read by
-- `mock_create_attempt()`, `mock_create_cycle_attempt()`,
-- `mock_get_question()`, or any scoring function, so its absence changes
-- no runtime behaviour whatsoever.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not insert, update, or delete any `ali_mock_form` row. Does not
-- create a Mock attempt. Does not change any RPC, RLS policy, or grant.
-- Does not touch `ali_question_bank`. Does not author new content. Does
-- not begin First Mock composition.
--
-- Idempotent: `add column if not exists`, matching this repository's own
-- established convention.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 070
-- (Founder-confirmed applied) has already been applied.

begin;

alter table public.ali_mock_form
  add column if not exists composition_provenance jsonb;

comment on column public.ali_mock_form.composition_provenance is
  'Optional, additive audit snapshot of the composition that produced this form (target experience count, numbered-question count, total marks, difficulty/skill distribution, family ids, generator version, composedAt) -- see lib/ali/mockFreezeManifest.ts buildCompositionProvenance(). NULL for every form not built by that capability (including every form that exists today). Never read by mock_create_attempt(), mock_create_cycle_attempt(), mock_get_question(), or any scoring function -- documentation/audit metadata only, no runtime dependency.';

commit;
