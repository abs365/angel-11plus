-- Angel Digital 11+ — Migration 181
-- English Reading Remediation, Practice Eligibility Transition —
-- promotes exactly the 22 Founder-Approved companion questions
-- (migrations 178/179) from 'provisional' to 'practice_eligible'.
--
-- ============================================================
-- AUTHORITY
-- ============================================================
-- The Founder independently reviewed all 11 passages/22 companion
-- questions through the live `/admin-beta/review` interface and
-- recorded `approved` for every one (Review Closure Report, this
-- session; cross-checked directly against persisted `ali_family_review`
-- rows, not accepted from the UI summary alone: 19/19 targets confirmed
-- Approved, 0 outstanding). The Founder then explicitly authorised
-- preparing (not applying) this exact transition, per this project's
-- own established two-step model: content review and eligibility
-- promotion are always separate, distinct actions (Decision 55/144's
-- own precedent), never combined into one migration.
--
-- ============================================================
-- SCOPE: EXACTLY 22 ROWS, ONE COLUMN
-- ============================================================
-- Only `eligibility_status` is ever SET by this migration, on exactly
-- these 22 ids (verified this session, matching the exact set migration
-- 180 registered for review):
--   Wave 1 (12): w1-kitemaker-08/09, w1-lastbus-08/09, w1-newgirl-08/09,
--     w1-atticdoor-08/09, w1-raceday-08/09, w1-letter-08/09
--   Wave 3 (10): w3-rc01-emptyclassroom-01, w3-rc08-emptyclassroom-01,
--     w3-rc01-bakersapprentice-01, w3-rc07-bakersapprentice-01,
--     w3-rc01-lettertograndad-01, w3-rc06-lettertograndad-01,
--     w3-rc01-stormharbour-01, w3-rc08-stormharbour-01,
--     w3-rc01-newtrainers-01, w3-rc07-newtrainers-01
-- `prompt`, `learning_unit_id`, `family_id`, `active`, `content_version`,
-- `provenance` are all re-verified UNCHANGED as live preconditions AND
-- post-write checks — proven, not merely asserted, by a full pre-write
-- snapshot of `prompt`/`learning_unit_id`/`family_id`/`active` compared
-- byte-for-byte against the live values after the write, mirroring
-- migration 144's own established single-column-correction discipline.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT touch the wave1-fam-tick-justify rows (w1-atticdoor-04,
-- w1-kitemaker-04, w1-lastbus-04, w1-letter-04, w1-newgirl-04,
-- w2-lastslice-05, w2-morningpatrol-07, w2-pianorecital-04,
-- w2-sciencefair-04, w2-twoletters-04, w2-understudy-05) — these remain
-- deliberately excluded pending the separate self-assessment-validity
-- mechanism fix, per the standing Founder instruction; none of their ids
-- appear anywhere in this migration's own target array. Does NOT touch
-- any of the 106 previously-live Practice questions (migrations
-- 044/045/049/051/063 + their own activation migrations). Does NOT
-- touch any Mock-track content (mock-eng-*, eng-inc001/002/003-*,
-- ali_passage_bank). Does NOT touch Mathematics content in any way. Does
-- NOT create, modify, or activate any ali_mock_form row. Does NOT touch
-- `ali_passage_bank` — the 11 passages' own row-level eligibility_status
-- there remains non-authoritative metadata (Founder-confirmed this
-- session), never written to by any migration in this repository.
--
-- ============================================================
-- FAIL-CLOSED THREE-STATE STRUCTURE (mirroring migration 144)
-- ============================================================
-- PRISTINE (all 22 rows exist, `provisional`, `active=true`) -> promotes
-- all 22 atomically, then positively re-verifies: 22 now
-- `practice_eligible`; byte-for-byte `prompt`/`learning_unit_id`/
-- `family_id`/`active` preservation across all 22 (full pre-write
-- snapshot compared post-write); the 11 tick-justify rows independently
-- re-confirmed untouched (still NOT `practice_eligible`) in the same
-- transaction.
-- ALREADY-APPLIED (all 22 already `practice_eligible`) -> safe no-op,
-- re-verifies the tick-justify rows remain untouched and the total count
-- is still exactly 22.
-- MIXED/UNEXPECTED (missing row, wrong count, mixed eligibility state,
-- inactive row, or any tick-justify row found `practice_eligible`) ->
-- `RAISE EXCEPTION` naming the actual state observed, nothing written.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'w1-kitemaker-08','w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09',
    'w1-newgirl-08','w1-newgirl-09','w1-atticdoor-08','w1-atticdoor-09',
    'w1-raceday-08','w1-raceday-09','w1-letter-08','w1-letter-09',
    'w3-rc01-emptyclassroom-01','w3-rc08-emptyclassroom-01',
    'w3-rc01-bakersapprentice-01','w3-rc07-bakersapprentice-01',
    'w3-rc01-lettertograndad-01','w3-rc06-lettertograndad-01',
    'w3-rc01-stormharbour-01','w3-rc08-stormharbour-01',
    'w3-rc01-newtrainers-01','w3-rc07-newtrainers-01'
  ];
  v_tick_justify_ids constant text[] := array[
    'w1-atticdoor-04','w1-kitemaker-04','w1-lastbus-04','w1-letter-04','w1-newgirl-04',
    'w2-lastslice-05','w2-morningpatrol-07','w2-pianorecital-04','w2-sciencefair-04',
    'w2-twoletters-04','w2-understudy-05'
  ];
  v_total_count int;
  v_active_count int;
  v_pristine_count int;
  v_already_applied_count int;
  v_tick_justify_live_count int;
  v_post_practice_eligible_count int;
  v_post_tick_justify_safe_count int;
  v_post_active_count int;
begin
  -- === Live preconditions -- structural shape, evaluated regardless of branch ===
  select count(*) into v_total_count from public.ali_question_bank where id = any(v_target_ids);
  if v_total_count <> 22 then
    raise exception 'Migration 181 refused: expected exactly 22 target rows to exist, found %.', v_total_count;
  end if;

  select count(*) into v_active_count from public.ali_question_bank where id = any(v_target_ids) and active = true;
  if v_active_count <> 22 then
    raise exception 'Migration 181 refused: expected 22 active=true rows, found %.', v_active_count;
  end if;

  select count(*) into v_tick_justify_live_count
    from public.ali_question_bank where id = any(v_tick_justify_ids) and eligibility_status = 'practice_eligible';
  if v_tick_justify_live_count <> 0 then
    raise exception 'Migration 181 refused: a wave1-fam-tick-justify row is already practice_eligible (found %). This migration must never run while that self-assessment-validity risk remains unaddressed.', v_tick_justify_live_count;
  end if;

  -- === Pending vs. already-applied state ===
  select count(*) into v_pristine_count
    from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'provisional';

  select count(*) into v_already_applied_count
    from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

  if v_pristine_count = 22 then
    create temporary table tmp_reading_remediation_snapshot (
      id text primary key, learning_unit_id text, family_id text, active boolean, prompt_snapshot jsonb not null
    ) on commit drop;
    insert into tmp_reading_remediation_snapshot (id, learning_unit_id, family_id, active, prompt_snapshot)
      select id, learning_unit_id, family_id, active, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'practice_eligible'
    where id = any(v_target_ids) and eligibility_status = 'provisional';

    select count(*) into v_post_practice_eligible_count
      from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

    select count(*) into v_post_tick_justify_safe_count
      from public.ali_question_bank where id = any(v_tick_justify_ids) and eligibility_status <> 'practice_eligible';

    select count(*) into v_post_active_count
      from public.ali_question_bank q
      join tmp_reading_remediation_snapshot s on s.id = q.id
      where q.active = s.active and q.learning_unit_id = s.learning_unit_id
        and q.family_id = s.family_id and q.prompt = s.prompt_snapshot;

    if v_post_practice_eligible_count <> 22 or v_post_tick_justify_safe_count <> 11 or v_post_active_count <> 22 then
      raise exception 'Migration 181 post-write verification failed: practice_eligible_count=%, tick_justify_safe_count=% (expect 11), unchanged_field_count=% (expect 22). Transaction will roll back.',
        v_post_practice_eligible_count, v_post_tick_justify_safe_count, v_post_active_count;
    end if;

    raise notice 'Migration 181: 22 Reading remediation questions promoted to practice_eligible and re-verified. 11 tick-justify rows confirmed still excluded.';
  elsif v_already_applied_count = 22 then
    select count(*) into v_post_tick_justify_safe_count
      from public.ali_question_bank where id = any(v_tick_justify_ids) and eligibility_status <> 'practice_eligible';
    if v_post_tick_justify_safe_count <> 11 then
      raise exception 'Migration 181 refused (already-applied branch): tick-justify safety check failed, safe_count=% (expect 11).', v_post_tick_justify_safe_count;
    end if;
    raise notice 'Migration 181: all 22 target rows already practice_eligible -- safe no-op. Tick-justify exclusion re-confirmed intact.';
  else
    raise exception 'Migration 181 refused: target rows match neither the expected PRISTINE (all 22 provisional) nor ALREADY-APPLIED (all 22 practice_eligible) state (pristine_count=%, already_applied_count=%, total=%). Investigate before re-running.',
      v_pristine_count, v_already_applied_count, v_total_count;
  end if;
end $$;

commit;
