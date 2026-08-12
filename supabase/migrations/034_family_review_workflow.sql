-- Angel Digital 11+ — Migration 034
-- Educational Increment 005, Part B: Human Educational Review Workflow.
--
-- A real, minimum-viable review mechanism — not a review performed by
-- this migration, and not permitted to self-certify: no application code
-- writes to this table as part of authoring or generation. It exists so
-- an independent (non-author) reviewer can actually record a real
-- decision later, per RELEASE_1_VALIDATION_STRATEGY.md's "no stage may
-- be self-certified by whoever authored the content" rule.
--
-- Review unit is FAMILY, not individual item — reviewing
-- "mr02-sequence-rule" once (its structure, its representative variant,
-- and its boundary variants) is what the directive asks for, not manual
-- inspection of every deterministic rendering.
--
-- Additive-only. Does not touch ali_question_bank. A reviewer's decision
-- here does not itself change any row's eligibility_status — a future,
-- separately-authorised step would read an APPROVED review record and
-- apply the resulting promotion, keeping "a human decided this" and "the
-- system acted on it" as two distinct, auditable steps.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.

begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'family_review_decision') then
    create type public.family_review_decision as enum (
      'approved', 'approved_with_amendment', 'rejected', 'requires_revalidation'
    );
  end if;
end$$;

create table if not exists public.ali_family_review (
  id                        uuid primary key default gen_random_uuid(),
  family_id                 text not null,
  reviewer                  text not null,
  review_date               date not null default current_date,

  educational_validity      boolean,
  competency_validity       boolean,
  wording_quality           boolean,
  age_appropriate           boolean,
  ambiguity_free            boolean,
  difficulty_appropriate    boolean,
  misconception_quality     boolean,
  explanation_quality       boolean,
  variation_boundaries_sound boolean,
  authenticity_confirmed    boolean,

  provenance_reference      text,
  evidence_reference         text,

  decision                  public.family_review_decision not null,
  notes                     text,

  created_at                timestamptz not null default now(),

  -- A reviewer must not be the family's own author — enforced at the
  -- application layer (this table has no column recording the author to
  -- check against; the constraint is procedural, documented here rather
  -- than invented as an unenforceable database check).
  constraint ali_family_review_decision_requires_notes
    check (decision != 'rejected' or notes is not null)
);

create index if not exists ali_family_review_family_idx
  on public.ali_family_review (family_id);

comment on table public.ali_family_review is
  'Educational Increment 005 Part B. Review unit is a question family, not an individual item. No application code writes here as part of authoring/generation — self-certification is explicitly prohibited by RELEASE_1_VALIDATION_STRATEGY.md. A future, separate step reads an approved review to apply any resulting eligibility promotion; this table records the human decision only.';

alter table public.ali_family_review disable row level security;

commit;
