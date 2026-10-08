-- Angel Digital 11+ -- Migration 269 (TEMPLATE, NOT APPLIED -- lives in scripts/output, not supabase/migrations)
-- CSSE Completion, Priority 4 -- promote Founder-APPROVED Writing candidates to practice_eligible.
--
-- HOW TO USE: review the candidates registered by migration 268 at /admin-beta/review and record your decision there
-- (that is what creates the closed, non-UNASSIGNED review row this migration checks for). Then copy this file into
-- supabase/migrations as 269_..., UNCOMMENT only the ids you approved, and apply it. With every id commented out it
-- changes nothing. It never writes a review decision itself -- exactly the discipline of migration 259.
-- Preconditions per id (any failure aborts the whole migration): active angel_original candidate Writing row; a closed
-- mock_writing_prompt_independent_review decision (approved, or approved_with_amendment plus an approved
-- amendment_verification) by a real reviewer; never mock_eligible; never Mock-exposed.

begin;

do $$
declare
  v_approved text[] := array[
    -- 'eng-csse-writing-proudofother-01',   -- Proud of Someone Else
    -- 'eng-csse-writing-onefriendmany-01',   -- One Close Friend or Many Friends?
    -- 'eng-csse-writing-tradition-01',   -- A Tradition That Matters
    -- 'eng-csse-writing-wintakepart-01',   -- Is It Better to Win or to Take Part?
    -- 'eng-csse-writing-picturenarrative-stationclock-01',   -- The Station Clock
    -- 'eng-csse-writing-picturenarrative-lastbus-01',   -- The Last Bus
    -- 'eng-csse-writing-picturenarrative-afterclosing-01',   -- After Closing Time
    'placeholder-never-matches'
  ];
  v_id text;
  v_family text;
  v_n int;
begin
  foreach v_id in array v_approved loop
    continue when v_id = 'placeholder-never-matches';

    select family_id into v_family from public.ali_question_bank where id = v_id;

    select count(*) into v_n from public.ali_question_bank
      where id = v_id and subject = 'writing' and provenance = 'angel_original'
        and eligibility_status = 'authentic_assessment_candidate' and active = true;
    if v_n <> 1 then
      raise exception 'Migration 269 refused: % is not an active, angel_original, candidate Writing row.', v_id;
    end if;

    select count(*) into v_n from public.ali_question_bank q
      join public.ali_mock_exposed_question_ids ex on ex.question_id = q.id where q.id = v_id;
    if v_n <> 0 then
      raise exception 'Migration 269 refused: % has been Mock-exposed.', v_id;
    end if;

    select count(*) into v_n from public.ali_family_review
      where review_target_type = 'writing_prompt' and family_id = v_family and reviewer <> 'UNASSIGNED'
        and review_type = 'mock_writing_prompt_independent_review'
        and (decision = 'approved' or (decision = 'approved_with_amendment' and exists (
          select 1 from public.ali_family_review r2
          where r2.review_target_type = 'writing_prompt' and r2.family_id = v_family and r2.reviewer <> 'UNASSIGNED'
            and r2.review_type = 'amendment_verification' and r2.decision = 'approved')));
    if v_n < 1 then
      raise exception 'Migration 269 refused: family % has no closed, real review decision.', v_family;
    end if;

    update public.ali_question_bank set eligibility_status = 'practice_eligible'
      where id = v_id and eligibility_status = 'authentic_assessment_candidate';
  end loop;
end $$;

commit;
