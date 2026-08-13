-- Angel Digital 11+ — Migration 047
-- Educational Increment 007B, Part D — extends the existing review
-- governance (migration 034's ali_family_review) so English passages and
-- English question families can receive independent review, per the
-- explicit instruction NOT to build a parallel review system where the
-- existing one can be safely extended.
--
-- ali_family_review's `family_id text` column already holds an
-- identifier string with no foreign key, subject-agnostic by
-- construction (it was never scoped to Mathematics specifically). This
-- migration reuses that column unchanged for BOTH an English question-
-- family id (e.g. 'wave1-fam-quote-explain') and an English passage id
-- (e.g. 'wave1-eng-kitemaker') — the two are already non-colliding
-- namespaces (Mathematics: 'mrNN-...', English families:
-- 'wave1-fam-...', English passages: 'wave1-eng-...'), so no rename or
-- restructuring of that column is needed.
--
-- What genuinely doesn't exist yet: (1) an explicit way to say whether a
-- given review row is about a PASSAGE or a QUESTION FAMILY (rather than
-- relying on a reviewer parsing id-naming conventions), and (2) several
-- review dimensions the 007B directive names that have no existing
-- column (answer correctness, Question Type alignment, transfer
-- validity, teaching quality, exam strategy quality, validation-
-- architecture behaviour, originality, copyright risk) — English's
-- review needs are a genuine superset of Mathematics' original 10
-- quality-check columns, not a mismatch requiring a separate table.
--
-- All new columns are nullable except review_target_type, which
-- defaults to 'question_family' — every existing row (all 4 current
-- Mathematics reviews) is unambiguously a question-family review, so the
-- default preserves their meaning exactly; no existing row's data
-- changes. Reviewer/review_date/decision/notes/the "no self-certifying
-- author" procedural rule are all reused completely unchanged.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.

begin;

alter table public.ali_family_review
  add column if not exists review_target_type text not null default 'question_family';

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_family_review_target_type_check'
  ) then
    alter table public.ali_family_review
      add constraint ali_family_review_target_type_check
      check (review_target_type in ('question_family', 'passage'));
  end if;
end$$;

alter table public.ali_family_review
  add column if not exists question_type_alignment boolean,
  add column if not exists answer_correctness_verified boolean,
  add column if not exists transfer_validity boolean,
  add column if not exists teaching_quality boolean,
  add column if not exists exam_strategy_quality boolean,
  add column if not exists validation_behaviour_sound boolean,
  add column if not exists originality_confirmed boolean,
  add column if not exists copyright_risk_clear boolean;

create index if not exists ali_family_review_target_type_idx
  on public.ali_family_review (review_target_type, family_id);

comment on column public.ali_family_review.family_id is
  'Subject-agnostic identifier under review — a Mathematics family_id ("mrNN-..."), an English question-family id ("wave1-fam-..."), or (when review_target_type = ''passage'') an English passage id ("wave1-eng-..."). No foreign key by design (migration 034); namespaces are kept non-colliding by naming convention.';

comment on column public.ali_family_review.review_target_type is
  'Disambiguates what family_id refers to: ''question_family'' (the original, still-default meaning — Mathematics families and English question families alike) or ''passage'' (an English passage reviewed as a whole, added Educational Increment 007B).';

commit;
