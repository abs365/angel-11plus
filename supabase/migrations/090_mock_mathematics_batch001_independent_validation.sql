-- Angel Digital 11+ — Migration 090
-- Mock Programme Increment 004, Batch 001 — Independent Validation
-- Promotion (Decision 143).
--
-- Promotes exactly the 18 questions across the 7 approved Mock
-- Mathematics Batch 001 families from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's (2026-08-10) own next
-- transition, per the Founder's authenticated Supabase inspection of
-- ali_family_review (that table remains RLS-opaque to every script/
-- anon-key path in this repository by design, migrations 034/054,
-- confirmed again this session — anon-key reads return 200/[] regardless
-- of real content, so this migration records the Founder-supplied
-- decision as its input, not a re-derivation, exactly as migrations
-- 080/083/119/123 already established for the analogous Practice
-- activation transition).
--
-- Founder-supplied evidence this session: all 7 families
-- (mock-mr02-invdiv, mock-mr02-twostep, mock-mr03-unitconv,
-- mock-mr09-data, mock-mr05-forward, mock-mr05-inverse,
-- mock-mr13-bestvalue) carry a genuine ali_family_review row with
-- review_type = 'mock_maths_independent_review', decision = 'approved'.
-- For mock-mr09-data specifically, the reviewer identity was corrected
-- directly in production after an initial typo; the corrected row shows
-- reviewer = Ayobami Lawal, review_date = 2026-08-20. The original
-- UNASSIGNED / pending_independent_review placeholder row (migration 089)
-- is historical audit evidence and is NOT modified, deleted, or touched
-- by this migration, or by the reviewer-identity correction itself,
-- which was applied directly against ali_family_review, not through this
-- repository.
--
-- Live production re-confirmed this session (anon-key read, safe: these
-- 18 rows are 'authentic_assessment_candidate', not yet 'mock_eligible',
-- so migration 084's own RLS predicate does not hide them): exactly 18
-- rows exist across these 7 family_id values, all
-- eligibility_status = 'authentic_assessment_candidate', all active =
-- true, all subject = 'maths'. No unexpected question exists in any of
-- these 7 families.
--
-- Selected by exact question ID, never by family_id alone: no other row
-- in any of the 7 families could exist (none does, confirmed above), and
-- no future sibling added later to any of these families could ever be
-- silently swept into this promotion, matching migration 083's own
-- established discipline.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 18 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, and does NOT touch ali_family_review in
-- any way (review history is written only through the independent
-- ali_family_review governance path, never by an activation migration —
-- the same separation migrations 080/083/119/123 already maintain for
-- the Practice-activation transition). Per
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md §3's own transition table,
-- Independently Validated -> Mock Eligible additionally requires a
-- pool-level review (Decision 138's own finding: this pool-level gate
-- has never been built) — that is explicitly NOT this migration's
-- purpose and is not performed here.
--
-- No content, answer, working step, misconception, difficulty, Question
-- Type, provenance, family_id, or content_version is changed by this
-- migration — only eligibility_status moves, matching migration 119's
-- own explicit discipline for the analogous Practice transition.
--
-- Fails safely, following migration 077's own established
-- assertion-and-refuse pattern (a stronger guarantee than migration
-- 083's simpler "affects fewer rows" idempotence): if the live count of
-- matching rows is not exactly 18 authentic_assessment_candidate rows
-- across these exact IDs, and is not already exactly 18
-- independently_validated rows across the same IDs (the safe
-- already-applied no-op case), this migration refuses to guess and
-- raises an exception naming the actual counts observed, touching
-- nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 087/088/
-- 089 have already been applied (confirmed, Decisions 140/141/142).

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-mr02-invdiv-01', 'mock-mr02-invdiv-02', 'mock-mr02-invdiv-03',
    'mock-mr02-twostep-01', 'mock-mr02-twostep-02', 'mock-mr02-twostep-03',
    'mock-mr03-unitconv-01', 'mock-mr03-unitconv-02', 'mock-mr03-unitconv-03',
    'mock-mr09-data-01', 'mock-mr09-data-02', 'mock-mr09-data-03',
    'mock-mr05-forward-01', 'mock-mr05-forward-02',
    'mock-mr05-inverse-01', 'mock-mr05-inverse-02',
    'mock-mr13-bestvalue-01', 'mock-mr13-bestvalue-02'
  ];
  v_target_families constant text[] := array[
    'mock-mr02-invdiv', 'mock-mr02-twostep', 'mock-mr03-unitconv',
    'mock-mr09-data', 'mock-mr05-forward', 'mock-mr05-inverse', 'mock-mr13-bestvalue'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and family_id = any(v_target_families);

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 18 then
    -- Exactly the expected pre-promotion state. Apply.

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 090: promoted 18 Mock Mathematics Batch 001 questions across 7 families from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 18 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 090: all 18 target questions are already independently_validated -- already applied. No changes made.';

  else
    -- Production no longer matches the expected pre-promotion state (18
    -- eligible rows) and is not in the clean post-application state (18
    -- already independently_validated). Refuse to guess -- something
    -- changed since this migration was generated. No rows are touched.
    raise exception
      'Migration 090 refused: expected 18 authentic_assessment_candidate rows across the 7 named families (found %), or 18 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
