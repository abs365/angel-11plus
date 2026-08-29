-- Angel Digital 11+ — Migration 165
-- English Content Foundation Increment 002, Decision 242 — Independent
-- Validation Promotion (Certification Gate).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS, AND ITS OWN EVIDENCE BASIS
-- ============================================================
-- Founder-supplied evidence (Level 1 by this project's own established
-- convention — see migration 160's own header for the precedent this
-- migration follows exactly): both Increment 002 review targets ("The
-- Loose Connection", "Crossing the Atlantic: Sail and Steam") show a
-- complete, closed independent educational review on the production
-- Educational Review interface, decision = 'approved' for each, review
-- as a complete assessment unit (passage + all attached questions).
-- Decision 241's naming/vocabulary remediation (migration 164) is
-- reported Founder-confirmed applied before these two reviews took
-- place. This migration promotes exactly these 24 rows (2 passages + 22
-- attached comprehension questions) from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' — the
-- SAME transition, and the SAME precondition/pristine/already-done/
-- refuse pattern, migrations 102/103/160 already established for this
-- codebase's only prior precedent of promoting English content this way.
--
-- DISCLOSED LIMITATION (this session): this environment's standing
-- inability to independently query production via the anon key (Decision
-- 234 and every certification decision since) was re-tested this session,
-- not merely assumed from memory — network access to the Supabase REST
-- endpoint IS reachable this session (a change from earlier sandbox
-- history), but `ali_family_review` and `ali_passage_bank` remain
-- completely invisible to the anon key (RLS default-deny, no anon SELECT
-- policy), and `ali_question_bank` is visible to the anon key ONLY for
-- eligibility_status = 'practice_eligible' rows — confirmed empirically
-- this session: an unfiltered, no-id `ali_question_bank` select returns
-- real practice_eligible rows, but a `count=exact` HEAD query for
-- eligibility_status = 'independently_validated' returns 0 across the
-- WHOLE table (314 total, not just Increment 002), and a direct query for
-- this migration's own 24 target IDs returns an empty array. Neither
-- result is evidence that no such rows exist — it is the same RLS
-- opacity this project has documented since Decision 234, now
-- reconfirmed with a live 2026-08-29 data point instead of merely cited
-- from memory. The Founder's own direct report from the authenticated
-- admin Educational Review interface (which bypasses RLS) remains the
-- accepted evidence basis, exactly as migration 160/163/164 already
-- established — not independently re-verified by this migration's own
-- SQL, which instead relies purely on its own live, transactional
-- eligibility_status/active preconditions below.
--
-- ============================================================
-- WHY THIS MIGRATION DOES NOT QUERY ali_family_review
-- ============================================================
-- Deliberate, matching migration 160's own established, documented
-- precedent exactly: `ali_family_review` is an append-only,
-- multi-row-per-family_id evidence log with no unique-per-target
-- invariant a runtime query could safely rely on — baking a live read of
-- it into a promotion migration's own precondition would be a fragile,
-- novel mechanism this codebase has never used for this transition. The
-- review evidence itself is verified by THIS SESSION, from the Founder's
-- own direct report, and documented here and in Decision 242's own log
-- entry. This migration's own SQL precondition is scoped purely to
-- eligibility_status/active on the content tables, exactly like its
-- precedent.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY, NOT PRACTICE
-- ============================================================
-- This migration moves these 24 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere. It does
-- NOT set eligibility_status = 'practice_eligible' anywhere — every one
-- of these 24 rows was authored, from its very first migration (161),
-- directly as 'authentic_assessment_candidate' — the Mock track — never
-- as 'provisional'/'practice_eligible' (the separate Practice track).
-- Promoting the SAME passage into both Practice and a future Mock would
-- break passage-level anti-memorisation isolation. This migration does
-- not create that risk. It does NOT insert or modify any ali_mock_form
-- row — no English Mock is created or activated. It does NOT touch ali_family_review in any way (see above). It does NOT touch
-- provenance, content_version, active, family_id, learning_unit_id,
-- question_group_id, group_order, subpart_label, or prompt/passage-text
-- content on any row — only eligibility_status moves.
--
-- ============================================================
-- ATOMICITY
-- ============================================================
-- Each passage and its complete attached question set is promoted
-- together, by two do $$ blocks sharing the same exact-id array pattern
-- migration 160 established (questions first, then the passage) — one
-- pair of blocks per family. A reviewer's approval of "the passage as a
-- whole" can never result in a partially-promoted family.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Fails safely, mirroring migration 160's own assertion-and-refuse
-- pattern: if the live count of matching rows for any block is not
-- exactly the expected number of 'authentic_assessment_candidate' rows
-- across that block's own exact IDs, and is not already exactly that
-- same number already 'independently_validated', that block refuses to
-- guess and raises an exception naming the actual counts observed,
-- touching nothing. Each of the 4 blocks below is independent — a
-- refusal in one does not prevent the others from being evaluated
-- (though a raised exception aborts the whole transaction, matching
-- every other migration in this project).
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query, after migrations 161-164 (Founder-confirmed
-- already applied).

begin;

-- ─── The Loose Connection: 12 questions (post-migration-163/164 shape), then the passage ───
do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and learning_unit_id = 'eng-inc002-roboticsfinal';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 12 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 165: promoted 12 The Loose Connection question rows from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 12 then
    raise notice 'Migration 165: all 12 The Loose Connection question rows are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 165 refused (Loose Connection questions): expected 12 authentic_assessment_candidate rows attached to eng-inc002-roboticsfinal (found %), or 12 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
begin
  select count(*) into v_pending_count
  from public.ali_passage_bank
  where id = 'eng-inc002-roboticsfinal'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_validated_count
  from public.ali_passage_bank
  where id = 'eng-inc002-roboticsfinal'
    and eligibility_status = 'independently_validated';

  if v_pending_count = 1 then
    update public.ali_passage_bank
    set eligibility_status = 'independently_validated'
    where id = 'eng-inc002-roboticsfinal'
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 165: promoted the eng-inc002-roboticsfinal passage row, alongside its 12 question rows.';

  elsif v_already_validated_count = 1 then
    raise notice 'Migration 165: the eng-inc002-roboticsfinal passage row is already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 165 refused (Loose Connection passage): expected 1 authentic_assessment_candidate row at eng-inc002-roboticsfinal (found %), or already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

-- ─── Crossing the Atlantic: Sail and Steam: 10 questions, then the passage ───
do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and learning_unit_id = 'eng-inc002-sailandsteam';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 10 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 165: promoted 10 Sail and Steam question rows from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 10 then
    raise notice 'Migration 165: all 10 Sail and Steam question rows are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 165 refused (Sail and Steam questions): expected 10 authentic_assessment_candidate rows attached to eng-inc002-sailandsteam (found %), or 10 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
begin
  select count(*) into v_pending_count
  from public.ali_passage_bank
  where id = 'eng-inc002-sailandsteam'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_validated_count
  from public.ali_passage_bank
  where id = 'eng-inc002-sailandsteam'
    and eligibility_status = 'independently_validated';

  if v_pending_count = 1 then
    update public.ali_passage_bank
    set eligibility_status = 'independently_validated'
    where id = 'eng-inc002-sailandsteam'
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 165: promoted the eng-inc002-sailandsteam passage row, alongside its 10 question rows.';

  elsif v_already_validated_count = 1 then
    raise notice 'Migration 165: the eng-inc002-sailandsteam passage row is already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 165 refused (Sail and Steam passage): expected 1 authentic_assessment_candidate row at eng-inc002-sailandsteam (found %), or already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, eligibility_status from public.ali_passage_bank
--   where id in ('eng-inc002-roboticsfinal', 'eng-inc002-sailandsteam') order by id;
--
-- select id, learning_unit_id, question_group_id, subpart_label, eligibility_status
--   from public.ali_question_bank
--   where learning_unit_id in ('eng-inc002-roboticsfinal', 'eng-inc002-sailandsteam')
--   order by learning_unit_id, id;
--
-- select sum((prompt ->> 'marks')::int) from public.ali_question_bank
--   where learning_unit_id = 'eng-inc002-roboticsfinal'; -- expect 22
-- select sum((prompt ->> 'marks')::int) from public.ali_question_bank
--   where learning_unit_id = 'eng-inc002-sailandsteam'; -- expect 17
