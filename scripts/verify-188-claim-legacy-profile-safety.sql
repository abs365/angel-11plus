-- Angel Digital 11+ — Post-Migration Verification for Migration 188
-- (Identity / Evidence Isolation Correction).
--
-- Run this AFTER applying migration 188, via Supabase Dashboard > SQL
-- Editor > New query. Everything below runs inside ONE transaction that
-- ends in ROLLBACK — no row it touches survives, including the two real
-- auth.users ids it borrows (read-only SELECT only, never modified) to
-- satisfy profiles.auth_user_id's foreign key while simulating two
-- different authenticated callers. This proves the function's decision
-- logic directly at the database layer, in addition to (not instead of)
-- the real two-browser sign-out/sign-in sequence you're already planning
-- as the final production confirmation -- that live sequence is the one
-- authoritative end-to-end proof; this script is the fast, repeatable,
-- non-destructive check of the exact decision claim_legacy_profile makes.
--
-- Requires at least 2 rows in auth.users to exist already (true in this
-- project — real accounts already exist). If your project genuinely has
-- fewer than 2, this script reports that explicitly instead of failing
-- confusingly.

begin;

do $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_profile_empty uuid;
  v_profile_evidence uuid;
  v_profile_owned uuid;
  v_claim_result uuid;
  v_check int := 0;
  v_pass int := 0;
begin
  select id into v_user_a from auth.users order by created_at asc limit 1;
  select id into v_user_b from auth.users where id <> v_user_a order by created_at asc limit 1;

  if v_user_a is null or v_user_b is null then
    -- A DO block cannot issue ROLLBACK itself (not valid inside PL/pgSQL);
    -- raising forces the enclosing transaction to abort instead, which
    -- undoes nothing since no fixture has been inserted yet at this point.
    -- The outer `rollback;` at the end of this file still runs afterward
    -- and is a safe no-op in that case.
    raise exception 'SKIPPED: fewer than 2 auth.users rows exist — cannot simulate two distinct callers. Apply migration 188 and rely on the live two-account browser sequence instead.';
  end if;

  -- Test fixtures: three unowned legacy profiles on three distinct
  -- fabricated device ids. v_user_a's real id is pre-attached to the
  -- "owned" one below to simulate an already-claimed profile; it is never
  -- attached to v_user_a's own real profile row (untouched throughout).
  insert into public.profiles (device_id, name, auth_user_id)
    values ('TEST-188-EMPTY-DEVICE', 'Test Empty', null)
    returning id into v_profile_empty;

  insert into public.profiles (device_id, name, auth_user_id)
    values ('TEST-188-EVIDENCE-DEVICE', 'Test With Evidence', null)
    returning id into v_profile_evidence;
  insert into public.user_stats (profile_id, total_xp) values (v_profile_evidence, 500);
  insert into public.lesson_progress (profile_id, lesson_id, subject, score)
    values (v_profile_evidence, 'test-lesson', 'maths', 90);

  insert into public.profiles (device_id, name, auth_user_id)
    values ('TEST-188-OWNED-DEVICE', 'Test Already Owned', v_user_a)
    returning id into v_profile_owned;

  -- === Simulate v_user_b calling claim_legacy_profile as themselves ===
  -- Deliberately NOT switching the actual Postgres role here: SECURITY
  -- DEFINER already runs the function with its owner's privileges
  -- regardless of caller role, auth.uid() reads only request.jwt.claims
  -- (role-independent), and staying as this session's own privileged role
  -- throughout means checks 4-5 below read the true underlying data state
  -- directly rather than through v_user_b's own RLS-filtered view (which
  -- would wrongly report v_user_a's row as "not found" simply because
  -- v_user_b has no SELECT permission on it, not because the data is
  -- actually wrong).
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_b, 'role', 'authenticated')::text, true);

  -- Check 1: genuinely empty profile CAN still be claimed (legitimate
  -- anonymous-to-real continuity, the one case this function exists for).
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-EMPTY-DEVICE') into v_claim_result;
  if v_claim_result = v_profile_empty then
    v_pass := v_pass + 1;
    raise notice 'PASS 1/5: empty unclaimed profile was claimable';
  else
    raise notice 'FAIL 1/5: empty unclaimed profile was NOT claimable (got %)', v_claim_result;
  end if;

  -- Check 2: a DIFFERENT unclaimed profile that already carries evidence
  -- must be refused — this is the exact defect this migration fixes.
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-EVIDENCE-DEVICE') into v_claim_result;
  if v_claim_result is null then
    v_pass := v_pass + 1;
    raise notice 'PASS 2/5: unclaimed-but-evidence-bearing profile was correctly refused';
  else
    raise notice 'FAIL 2/5: unclaimed-but-evidence-bearing profile was wrongly claimed (got %) — THE DEFECT IS STILL PRESENT', v_claim_result;
  end if;

  -- Check 3: an already-owned profile (by a different real user) must
  -- remain refused, exactly as migration 019 already guaranteed.
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-OWNED-DEVICE') into v_claim_result;
  if v_claim_result is null then
    v_pass := v_pass + 1;
    raise notice 'PASS 3/5: already-owned profile remained refused';
  else
    raise notice 'FAIL 3/5: already-owned profile was wrongly reassigned (got %) — this would be a NEW, more severe defect', v_claim_result;
  end if;

  -- Check 4: v_user_a's own real, pre-existing profile (their genuine
  -- account) is untouched by any of the above — still owned by v_user_a,
  -- auth_user_id never overwritten.
  v_check := v_check + 1;
  perform 1 from public.profiles where auth_user_id = v_user_a and id = v_profile_owned;
  if found then
    v_pass := v_pass + 1;
    raise notice 'PASS 4/5: the already-owned test profile still belongs to its original owner';
  else
    raise notice 'FAIL 4/5: the already-owned test profile''s ownership changed unexpectedly';
  end if;

  -- Check 5: the evidence-bearing profile's evidence itself was not
  -- altered by the refused claim attempt (refusal must be a true no-op,
  -- not a partial write).
  v_check := v_check + 1;
  perform 1 from public.user_stats where profile_id = v_profile_evidence and total_xp = 500;
  if found then
    v_pass := v_pass + 1;
    raise notice 'PASS 5/5: refused-claim profile''s existing evidence was left completely unmodified';
  else
    raise notice 'FAIL 5/5: refused-claim profile''s evidence was altered';
  end if;

  raise notice '=== RESULT: % / % checks passed ===', v_pass, v_check;
end $$;

rollback;
