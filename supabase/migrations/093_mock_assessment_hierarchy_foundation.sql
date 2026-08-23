-- Angel Digital 11+ — Migration 093
-- Mock Programme Increment 005 — Authentic Cross-Subject Assessment
-- Structure Foundation (ALI_DECISION_LOG.md Decision 148).
--
-- Purely additive schema. No content authored, no row inserted or
-- modified, no eligibility_status change, no ali_mock_form row, no
-- Mock activation. All 38 existing Mock Mathematics candidate rows
-- (migrations 088/091, Batches 001/002) and every one of the 331+
-- existing ali_question_bank rows remain valid, unchanged, with every
-- new column NULL — the exact "standalone, atomic item" meaning that is
-- already true of them today.
--
-- ============================================================
-- WHY THIS IS NEEDED (Decision 147/148's own finding)
-- ============================================================
-- Decision 147 established that a real CSSE Mathematics numbered
-- question is not reliably one ali_question_bank row (it may contain
-- subparts (a)/(b)/(c), each independently markable). Decision 148
-- extends this finding cross-subject: a real CSSE English comprehension
-- numbered question may likewise contain a judgement subpart plus a
-- separate subpart made of several quotation+explanation response
-- components (Decision 148 Part 4), and Continuous Writing is scored
-- against multiple named criteria, not one scalar answer (Decision 148
-- Part 5). ali_question_bank's own `prompt` JSONB (migration 005) is,
-- and remains, exactly ONE gradable response with ONE scalar answer and
-- ONE `marks` value — confirmed correct and unchanged by this migration.
-- What is missing is a way to say several such rows belong together as
-- one displayed numbered question, in what order, and under what kind
-- of marking regime — this migration adds exactly that, nothing more.
--
-- ============================================================
-- DESIGN DECISION: A NEW COLUMN, NOT A REPURPOSED ONE
-- ============================================================
-- Two existing candidate mechanisms were inspected and deliberately NOT
-- reused, per direct evidence of a real collision risk with live
-- Practice behaviour:
--
-- 1. `family_id` (migration 030) groups structurally-similar variant
--    questions (e.g. migration 030's own precision-dec/precision-fraction
--    families) for exposure/selection purposes — a genuinely different
--    relationship (sibling variants of the SAME reasoning demand, not
--    subparts of the SAME displayed numbered question). Reusing it here
--    would conflate two distinct concepts this project has so far kept
--    correctly separate.
--
-- 2. `learning_unit_id` (migration 007) was considered and rejected.
--    `lib/ali/exposureIntelligence.ts`'s `groupingKeyOf()` (used by the
--    real, live Practice selection engine, `lib/learningEngine/
--    sessionGenerator.ts`) reads `q.familyId ?? q.learningUnitId` for
--    EVERY subject, not only English — confirmed by direct reading this
--    session. A Mathematics row lacking a `family_id` would fall through
--    to `learningUnitId`, so repurposing it as a Maths numbered-question-
--    group key would risk silently feeding Mock-only grouping metadata
--    into live Practice exposure/clustering logic for any such row —
--    exactly the "Mock composition metadata must not silently redefine
--    Practice behaviour" outcome Decision 148's own directive forbids.
--    (`passageGroupingKeyOf()`, the other consumer of `learningUnitId`,
--    IS already subject-gated to `"english"` only, confirmed safe on its
--    own — but `groupingKeyOf()`'s wider, ungated read is what rules out
--    reuse here.)
--
-- `question_group_id` is therefore a genuinely new column, read by no
-- existing selection, scoring, or rendering code path today (confirmed
-- by a dedicated structural test) — zero collision risk with Practice by
-- construction, not by convention.
--
-- ============================================================
-- WHAT WAS DELIBERATELY NOT ADDED
-- ============================================================
-- No `shared_context_id`/stimulus-content table. No Batch 001/002 item,
-- and no Question Type this repository's own evidence catalogues
-- (docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md), currently
-- requires storing a shared diagram/table/scenario separately from a
-- single question's own `prompt` — the exact real-need threshold
-- `ali_passage_bank` itself (migration 043) was only added once it was
-- crossed for English. Adding it now, with no content to prove it
-- against, would be exactly the "field solely because it appears in the
-- instruction" the directive warns against. Named as a future EXTEND
-- item (Decision 148 Part 8/11), not built here.
--
-- No third grouping level (a separate "response component" id distinct
-- from "subpart"). `subpart_label` is deliberately free text (e.g.
-- "6(b)-i", "7(a)"), not a constrained enum or a second foreign key —
-- capable of expressing arbitrary real CSSE numbering depth without a
-- rigid multi-table tree, a disclosed, deliberate simplification
-- (Decision 148 Part 2/7), not an oversight.
--
-- No new SQL function. No RLS/grant change: migration 084's
-- `ali_question_bank_select_all` policy governs row visibility, not
-- individual columns — these purely additive, nullable columns are
-- covered by that existing policy automatically, confirmed by direct
-- reading of migration 084 this session. Per the directive's own Part
-- 17 instruction ("If no new SQL function is required, prefer the
-- simpler implementation"), none is introduced.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard, per this project's own standing convention for
-- every Mock migration since 070.

begin;

alter table public.ali_question_bank
  add column if not exists question_group_id text,
  add column if not exists group_order smallint,
  add column if not exists subpart_label text,
  add column if not exists marking_mode text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_question_bank_group_order_check'
  ) then
    alter table public.ali_question_bank
      add constraint ali_question_bank_group_order_check
      check (group_order is null or group_order >= 1);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_question_bank_marking_mode_check'
  ) then
    alter table public.ali_question_bank
      add constraint ali_question_bank_marking_mode_check
      check (marking_mode is null or marking_mode in (
        'deterministic', 'structured_acceptable_response', 'criterion_rubric'
      ));
  end if;
end$$;

create index if not exists ali_question_bank_group_idx
  on public.ali_question_bank (question_group_id) where question_group_id is not null;

comment on column public.ali_question_bank.question_group_id is
  'Mock Programme Increment 005 (Decision 148). NULL (the default, and the current value of every existing row) means this item is a standalone, atomic numbered question -- unchanged, current-day meaning. A non-NULL value shared by several rows means those rows are subparts/response-components of one displayed numbered question, ordered by group_order. Deliberately NOT family_id (sibling reasoning-variant grouping, a different relationship) and NOT learning_unit_id (read by groupingKeyOf() for every subject in live Practice selection -- reusing it here risked silently affecting Practice exposure/clustering for any Mathematics row lacking a family_id). A brand new column, read by no existing selection/scoring/rendering code path -- zero Practice-isolation risk by construction.';

comment on column public.ali_question_bank.group_order is
  'Mock Programme Increment 005 (Decision 148). Deterministic 1-based position within a question_group_id group (e.g. 1 for subpart (a), 2 for (b)). NULL for a standalone item. Not DB-enforced unique within a group -- ordering discipline is an authoring-time and application-layer concern, matching this project''s established convention for family_id/passage_family_id (Decisions 030/043).';

comment on column public.ali_question_bank.subpart_label is
  'Mock Programme Increment 005 (Decision 148). Free-text display label for a grouped item''s position within its numbered question (e.g. "(a)", "(b)", "6(b)-i", "Quotation 2"). Deliberately free text rather than a constrained enum or a second grouping level -- real CSSE numbering depth varies (a bare subpart vs. a subpart containing several quotation+explanation components, Decision 148 Part 4) and this single free-text field can express any of it without a rigid multi-table tree. NULL for a standalone item.';

comment on column public.ali_question_bank.marking_mode is
  'Mock Programme Increment 005 (Decision 148). One of deterministic (typical Mathematics/exact-match, the only mode the live mock_score_attempt() -- migrations 074/075 -- currently implements), structured_acceptable_response (a comprehension response whose marks depend on multiple acceptable evidence components/quotations/reasons, not yet scored by any live function), or criterion_rubric (Continuous Writing or any future criteria-judged response, not yet scored by any live function, and NOT to be confused with automated AI scoring -- Decisions 47/61/106''s existing Writing AI-score quarantine from mastery/readiness evidence is untouched and still applies). NULL (the current value of every existing row) is a deliberate non-claim, not "deterministic" -- this migration does not assert a marking-mode classification for any of the 331+ rows authored before this column existed, since no such classification has actually been verified per row this session. Populating this column for real content is separate, future, per-row work, not performed by this migration.';

commit;
