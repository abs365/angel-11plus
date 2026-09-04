-- Angel Digital 11+ — Migration 221
-- Programme Increment 020, Part 16 — English Passage-Level Practice-
-- Eligibility Reconciliation (DESIGN + PREPARED MIGRATION, NOT APPLIED).
--
-- ============================================================
-- THE REAL GAP THIS RECONCILES
-- ============================================================
-- Increment 019 found: 30 active passages, but only 1 passage-level row
-- carries eligibility_status = 'practice_eligible', while 142 English
-- Reading QUESTIONS are already practice_eligible and genuinely reachable
-- by a learner today. Direct code inspection this increment (Increment
-- 020) confirms WHY: lib/ali/questionBank.ts — the real, only Practice
-- retrieval/eligibility gate — never references public.ali_passage_bank
-- at all. Passage-level eligibility_status currently gates nothing.
--
-- This is not merely inert bookkeeping, however: migration 043's own
-- table comment states the ORIGINAL DESIGN INTENT plainly — "Passage-
-- level provenance/eligibility gate every question that shares this
-- passage's id... though this enforcement is application-layer... and is
-- not yet wired since zero passages exist." That wiring was never built
-- once real passages arrived. Verdict, precisely: CLASSIFICATION DEBT
-- inside a designed-but-never-wired REACHABILITY GATE — the passage
-- table's own status column was always meant to be a real floor, not a
-- decorative field, and today it silently is not one.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- A narrow, MONOTONIC, evidence-computed reconciliation — catches
-- passage-level metadata UP to match already-live reality, never grants
-- new access and never touches a passage this codebase's own real Mock-
-- exposure signal (migration 209's ali_mock_exposed_passage_ids view)
-- marks as ever exposed to Mock, and never touches a passage already at
-- eligibility_status = 'mock_eligible' — the stricter Mock/SEALED
-- protection always wins, exactly matching lib/ali/inventoryClass.ts's
-- own established precedence rule.
--
-- For every passage where:
--   (a) its own eligibility_status is NOT already 'practice_eligible' and
--       NOT 'mock_eligible', AND
--   (b) it has never been exposed to Mock (ali_mock_exposed_passage_ids), AND
--   (c) at least one of its own real questions (matched by
--       ali_question_bank.learning_unit_id = ali_passage_bank.id) is
--       ALREADY active AND practice_eligible today —
-- ...promote that passage's own eligibility_status to 'practice_eligible'
-- and nothing else. No question row, no ali_family_review row, and no
-- passage already at or above 'authentic_assessment_candidate' toward the
-- Mock track (independently_validated/mock_eligible) that has NOT already
-- leaked a practice_eligible question is touched.
--
-- Deliberately NOT hardcoded to a specific id list: unlike this
-- programme's other reconciliation migrations, this repository session
-- has no live production read access, so the target set is computed
-- entirely from the migration's own live evidence at apply-time, not
-- asserted from a number this session cannot independently verify. Every
-- guard below is structural (never touch mock_eligible/exposed; only
-- ever promote to exactly 'practice_eligible'; only when real reachable
-- evidence already exists), not a hardcoded row count.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT wire the real enforcement gap itself (lib/ali/questionBank.ts
-- still does not consult ali_passage_bank.eligibility_status when
-- retrieving Practice questions) — that is a CODE change, correctly out
-- of scope for a data migration, and is recorded as the real next step
-- below. Applying this data reconciliation WITHOUT that code change
-- changes no learner-visible behaviour today (the gate still isn't
-- wired); it only makes the passage-level field honestly reflect
-- already-live reality, so that a FUTURE wiring of the intended gate
-- (recommended below) does not immediately break the 142 questions
-- already reachable through passages this migration would catch up.
-- Does NOT promote any passage toward the Mock track. Does NOT touch
-- ali_question_bank, ali_family_review, or any Mock-related table at all.
--
-- ============================================================
-- RECOMMENDED NEXT STEP (NOT implemented by this migration or this increment)
-- ============================================================
-- Once (and only once) this reconciliation has been applied, wire
-- lib/ali/questionBank.ts's own Practice-eligible retrieval to also
-- require the question's own passage (matched by learning_unit_id) to be
-- at eligibility_status = 'practice_eligible' whenever learning_unit_id
-- resolves to a real ali_passage_bank row — the exact enforcement
-- migration 043's own comment always intended. That is an application-
-- code change with its own test coverage, deliberately not bundled into
-- this data-only migration, and deliberately not written this increment
-- (Part 16 asks for the reconciliation DESIGN, not the live gate itself).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_candidate_count int;
  v_pre_mock_eligible_count int;
  v_post_mock_eligible_count int;
  v_pre_exposed_count int;
  v_post_exposed_still_untouched int;
begin
  -- Live count of passages this migration would touch -- computed, not
  -- asserted, since this session has no live figure to check it against.
  select count(*) into v_candidate_count
  from public.ali_passage_bank pb
  where pb.eligibility_status not in ('practice_eligible', 'mock_eligible')
    and not exists (
      select 1 from public.ali_mock_exposed_passage_ids ep where ep.passage_id = pb.id
    )
    and exists (
      select 1 from public.ali_question_bank qb
      where qb.learning_unit_id = pb.id
        and qb.active = true
        and qb.eligibility_status = 'practice_eligible'
    );

  select count(*) into v_pre_mock_eligible_count
  from public.ali_passage_bank where eligibility_status = 'mock_eligible';
  select count(*) into v_pre_exposed_count
  from public.ali_mock_exposed_passage_ids;

  if v_candidate_count = 0 then
    raise notice 'Migration 221: no passage meets the reconciliation precondition (already reconciled, or no passage has a live practice_eligible question) -- safe no-op.';
  else
    update public.ali_passage_bank pb
    set eligibility_status = 'practice_eligible', updated_at = now()
    where pb.eligibility_status not in ('practice_eligible', 'mock_eligible')
      and not exists (
        select 1 from public.ali_mock_exposed_passage_ids ep where ep.passage_id = pb.id
      )
      and exists (
        select 1 from public.ali_question_bank qb
        where qb.learning_unit_id = pb.id
          and qb.active = true
          and qb.eligibility_status = 'practice_eligible'
      );

    -- Post-write re-verification: never a mock_eligible passage created or lost, never a newly-exposed passage's status disturbed.
    select count(*) into v_post_mock_eligible_count
    from public.ali_passage_bank where eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_count <> v_pre_mock_eligible_count then
      raise exception 'Migration 221 refused: mock_eligible passage count changed from % to % -- this migration must never touch the Mock track. Rolling back.', v_pre_mock_eligible_count, v_post_mock_eligible_count;
    end if;

    select count(*) into v_post_exposed_still_untouched
    from public.ali_passage_bank pb
    join public.ali_mock_exposed_passage_ids ep on ep.passage_id = pb.id
    where pb.eligibility_status = 'practice_eligible'
      and pb.updated_at >= (now() - interval '1 minute');
    if v_post_exposed_still_untouched <> 0 then
      raise exception 'Migration 221 refused: % Mock-exposed passage(s) were touched by this write -- this must never happen. Rolling back.', v_post_exposed_still_untouched;
    end if;

    raise notice 'Migration 221: promoted % passage(s) to practice_eligible, each already carrying at least one real, live, active practice_eligible question. Mock-exposed and mock_eligible passages confirmed untouched (% before, % after).', v_candidate_count, v_pre_mock_eligible_count, v_post_mock_eligible_count;
  end if;
end $$;

commit;
