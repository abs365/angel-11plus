-- Angel Digital 11+ — Migration 230
-- Question Factory Candidate Persistence, Human Review, and Publication
-- Gate (Question Factory Wave 2, Sections 3-5). Additive-only, no
-- historical migration edited in place.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Wave 1 proved the Question Factory's generation + automated-validation
-- logic (lib/ali/questionFactory/) in a bounded, in-memory proof -- real
-- candidates were generated and validated, but nothing was persisted, and
-- nothing could be reviewed by a human. Wave 2 requires a real, auditable
-- lifecycle: GENERATED -> VALIDATED -> REVIEWED -> APPROVED -> PUBLISHED/
-- ELIGIBLE -> LEARNER SELECTABLE, with no step skippable and no candidate
-- ever reaching a learner "merely because it was generated, validation
-- passed, or it exists in the database" (the Founder's own exact words).
--
-- ============================================================
-- DESIGN -- reuse over parallel architecture, per explicit instruction
-- ============================================================
-- One new table, `ali_question_candidate`. It is NOT `ali_question_bank`
-- and carries no `eligibility_status` of its own that could ever be
-- confused with a trusted, learner-reachable row -- the same structural
-- separation `lib/ali/questionFactory/types.ts`'s `MathsQuestionCandidate`
-- already enforces in application code (proven by
-- tests/lib/ali/questionFactory/reviewGateEnforcement.test.ts). This
-- migration is the FIRST and ONLY path by which a factory candidate can
-- ever become a real `ali_question_bank` row -- via `publish_question_
-- candidate()` below, which requires `review_status = 'approved'` and
-- performs the insert itself; there is no other write path into
-- `ali_question_bank` from candidate data anywhere in this schema.
--
-- Reuses this schema's own established admin-gating convention
-- (`is_current_user_admin()`) throughout, exactly like `mock_apply_manual_
-- mark`/`mock_release_report` (migration 227) -- no new authorisation
-- mechanism invented. Reuses the same soft-reference-to-family_id
-- discipline migration 228 already established (no FK, since not every
-- candidate need target an already-registered family on day one).
--
-- ============================================================
-- THREE RPCS, EACH A SINGLE, NARROW STEP -- NEVER A COMBINED SHORTCUT
-- ============================================================
-- 1. submit_question_candidate() -- admin-only. Inserts ONE new candidate
--    row at review_status='pending_review', publication_status=
--    'unpublished'. This is the only way a candidate enters the table --
--    there is no bulk-insert path and no default that could mark a
--    candidate as already reviewed.
-- 2. review_question_candidate() -- admin-only. Sets review_status to
--    exactly one of 'approved' / 'rejected' / 'needs_correction', records
--    the real reviewer (from auth.uid(), never caller-supplied) and
--    timestamp, and FAILS CLOSED if a reason is not supplied for a
--    rejection or correction request -- per the Founder's explicit
--    instruction ("where rejection occurs, require an appropriate
--    reason"). No bulk-approve exists: this function operates on exactly
--    one candidate id per call, so "approve everything" is not a single
--    available action.
-- 3. publish_question_candidate() -- admin-only. Requires review_status
--    = 'approved' (fails closed otherwise, including for 'pending_review'
--    -- there is no path from pending straight to published). Inserts a
--    real `ali_question_bank` row (eligibility_status = 'practice_
--    eligible', provenance recording its factory origin), then marks the
--    candidate publication_status = 'published' and records the new
--    bank row's id. This is the ONE moment a candidate becomes learner-
--    reachable, and it is a deliberate, separate, auditable admin action
--    distinct from approval itself, per the Founder's explicit "approval
--    and publication must be separate concepts" instruction.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Purely additive: one new table, three new functions, zero change to
--   any existing table, policy, trigger, or function (including
--   ali_question_bank's own grants/RLS from migration 084 -- publication
--   writes via this migration's own SECURITY DEFINER function, which
--   needs no new table-level grant, exactly like every other privileged
--   write in this schema).
-- - RLS enabled on the new table, admin-only SELECT policy -- no anon/
--   authenticated policy of any kind. All three lifecycle actions go
--   through the RPCs above, never direct table access.
-- - Idempotent where it matters: review/publish are naturally idempotent
--   in effect (re-approving an already-approved candidate is a no-op
--   status write; re-publishing an already-published candidate is
--   explicitly blocked, see the function body).
-- - Fails closed throughout: missing reason on rejection, wrong review
--   state on publish, non-admin caller -- all raise, none silently no-op.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-229
-- (per this arc's own standing record) have already been applied.

begin;

-- ============================================================
-- 1. The candidate table
-- ============================================================
create table if not exists public.ali_question_candidate (
  candidate_id text primary key,
  family_id text not null,
  generation_spec_id text not null,
  generation_spec_version text not null default '1',
  subject text not null check (subject in ('maths', 'english', 'writing')),
  competency_id text,
  skill text not null,
  question_type text,
  pathway text[] not null default '{}',
  preparation_stage text,
  difficulty public.content_difficulty not null,

  question_content jsonb not null,
  claimed_answer text not null,
  worked_explanation text,
  distractors jsonb,

  mathematical_validation jsonb not null,
  similarity_validation jsonb not null,

  generated_at timestamptz not null default now(),
  provenance text not null default 'question_factory_wave1',

  review_status text not null default 'pending_review'
    check (review_status in ('pending_review', 'approved', 'rejected', 'needs_correction')),
  reviewer_id uuid references public.profiles(id),
  review_timestamp timestamptz,
  rejection_reason text,

  publication_status text not null default 'unpublished'
    check (publication_status in ('unpublished', 'published')),
  published_question_id text references public.ali_question_bank(id),

  created_at timestamptz not null default now()
);

comment on table public.ali_question_candidate is
  'Question Factory Wave 2 -- one row per generated candidate, from generation through human review to publication. Never itself learner-reachable; publish_question_candidate() is the sole path into ali_question_bank.';

-- A candidate can only be marked published once it actually has a
-- published_question_id, and only ever in that order -- enforced as a
-- table constraint, not merely by RPC discipline, so even a direct
-- (admin-only, RLS-gated) update could not create an inconsistent state.
alter table public.ali_question_candidate
  add constraint ali_question_candidate_publication_consistency
  check (
    (publication_status = 'unpublished' and published_question_id is null)
    or (publication_status = 'published' and published_question_id is not null)
  );

-- Publication can only follow approval -- enforced as a table constraint,
-- not merely by RPC discipline, per the Founder's explicit "approval and
-- publication must be separate concepts" and "unapproved content cannot
-- reach learners" instructions.
alter table public.ali_question_candidate
  add constraint ali_question_candidate_publish_requires_approval
  check (publication_status = 'unpublished' or review_status = 'approved');

-- Rejection/needs-correction always carries a reason -- enforced as a
-- table constraint, not merely by RPC discipline.
alter table public.ali_question_candidate
  add constraint ali_question_candidate_rejection_requires_reason
  check (review_status not in ('rejected', 'needs_correction') or rejection_reason is not null);

create index if not exists ali_question_candidate_family_idx on public.ali_question_candidate (family_id);
create index if not exists ali_question_candidate_review_status_idx on public.ali_question_candidate (review_status);

-- ============================================================
-- 2. RLS -- admin-only, no anon/authenticated policy
-- ============================================================
alter table public.ali_question_candidate enable row level security;

drop policy if exists ali_question_candidate_admin_select on public.ali_question_candidate;
create policy ali_question_candidate_admin_select
  on public.ali_question_candidate
  for select
  to authenticated
  using (public.is_current_user_admin());

-- ============================================================
-- 3. submit_question_candidate() -- the only insertion path
-- ============================================================
create or replace function public.submit_question_candidate(
  p_candidate_id text,
  p_family_id text,
  p_generation_spec_id text,
  p_generation_spec_version text,
  p_subject text,
  p_competency_id text,
  p_skill text,
  p_question_type text,
  p_pathway text[],
  p_preparation_stage text,
  p_difficulty public.content_difficulty,
  p_question_content jsonb,
  p_claimed_answer text,
  p_worked_explanation text,
  p_distractors jsonb,
  p_mathematical_validation jsonb,
  p_similarity_validation jsonb
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may submit a Question Factory candidate';
  end if;

  insert into public.ali_question_candidate (
    candidate_id, family_id, generation_spec_id, generation_spec_version,
    subject, competency_id, skill, question_type, pathway, preparation_stage,
    difficulty, question_content, claimed_answer, worked_explanation, distractors,
    mathematical_validation, similarity_validation
  ) values (
    p_candidate_id, p_family_id, p_generation_spec_id, p_generation_spec_version,
    p_subject, p_competency_id, p_skill, p_question_type, p_pathway, p_preparation_stage,
    p_difficulty, p_question_content, p_claimed_answer, p_worked_explanation, p_distractors,
    p_mathematical_validation, p_similarity_validation
  );

  return p_candidate_id;
end;
$$;

grant execute on function public.submit_question_candidate(
  text, text, text, text, text, text, text, text, text[], text,
  public.content_difficulty, jsonb, text, text, jsonb, jsonb, jsonb
) to authenticated;

-- ============================================================
-- 4. review_question_candidate() -- the human review action
-- ============================================================
create or replace function public.review_question_candidate(
  p_candidate_id text,
  p_decision text,
  p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reviewer_id uuid;
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may review a Question Factory candidate';
  end if;

  if p_decision not in ('approved', 'rejected', 'needs_correction') then
    raise exception 'Invalid review decision: %', p_decision;
  end if;

  if p_decision in ('rejected', 'needs_correction') and (p_rejection_reason is null or trim(p_rejection_reason) = '') then
    raise exception 'A reason is required when rejecting or requesting correction on candidate %', p_candidate_id;
  end if;

  select id into v_reviewer_id from public.profiles where auth_user_id = auth.uid();
  if v_reviewer_id is null then
    raise exception 'No profile found for the reviewing admin';
  end if;

  update public.ali_question_candidate
  set
    review_status = p_decision,
    reviewer_id = v_reviewer_id,
    review_timestamp = now(),
    rejection_reason = case when p_decision = 'approved' then null else p_rejection_reason end
  where candidate_id = p_candidate_id;

  if not found then
    raise exception 'Candidate % not found', p_candidate_id;
  end if;
end;
$$;

grant execute on function public.review_question_candidate(text, text, text) to authenticated;

-- ============================================================
-- 5. publish_question_candidate() -- the ONE path into ali_question_bank
-- ============================================================
create or replace function public.publish_question_candidate(p_candidate_id text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_candidate public.ali_question_candidate;
  v_new_question_id text;
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may publish a Question Factory candidate';
  end if;

  select * into v_candidate from public.ali_question_candidate where candidate_id = p_candidate_id;
  if not found then
    raise exception 'Candidate % not found', p_candidate_id;
  end if;

  if v_candidate.review_status <> 'approved' then
    raise exception 'Candidate % cannot be published -- review_status is % (must be approved)', p_candidate_id, v_candidate.review_status;
  end if;

  if v_candidate.publication_status = 'published' then
    raise exception 'Candidate % has already been published as %', p_candidate_id, v_candidate.published_question_id;
  end if;

  v_new_question_id := 'qf-' || v_candidate.candidate_id;

  insert into public.ali_question_bank (
    id, subject, skill, pathway, content_difficulty, question_type,
    prompt, explanation, mastery_threshold, family_id, provenance,
    eligibility_status, active
  ) values (
    v_new_question_id, v_candidate.subject, v_candidate.skill, v_candidate.pathway, v_candidate.difficulty,
    coalesce(v_candidate.question_type, 'short-answer'),
    v_candidate.question_content, coalesce(v_candidate.worked_explanation, ''),
    (select default_threshold from public.ali_mastery_defaults where content_difficulty = v_candidate.difficulty),
    v_candidate.family_id, v_candidate.provenance,
    'practice_eligible', true
  );

  update public.ali_question_candidate
  set publication_status = 'published', published_question_id = v_new_question_id
  where candidate_id = p_candidate_id;

  return v_new_question_id;
end;
$$;

grant execute on function public.publish_question_candidate(text) to authenticated;

commit;
