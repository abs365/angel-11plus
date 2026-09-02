-- Angel Digital 11+ — Post-Migration Verification for Migration 188
-- (Identity / Evidence Isolation Correction).
--
-- Run this AFTER applying migration 188, via Supabase Dashboard > SQL
-- Editor > New query.
--
-- WHAT THIS SCRIPT PROVES, AND WHAT IT DOES NOT -- read before
-- interpreting the output:
--   Checks 1-5 = rollback-wrapped SQL-function BEHAVIOURAL verification.
--     Exercises claim_legacy_profile() itself, directly, against three
--     fabricated fixtures, inside a transaction that ends in ROLLBACK --
--     no row it touches survives, including the two real auth.users ids
--     it borrows (read-only SELECT only, never modified) to satisfy
--     profiles.auth_user_id's foreign key while simulating two different
--     authenticated callers.
--   Check 6 = live function-definition STRUCTURAL verification.
--     Confirms the function's own currently-deployed source text
--     actually contains the intended NOT EXISTS guard for each evidence
--     table, not merely that checks 1-5 happened to pass against this
--     script's own three fixtures.
--   Neither is independent RLS verification -- no policy on any table is
--     exercised here as a distinct authenticated role would see it.
--   Neither is live two-account browser verification -- that is the
--     separate, authoritative end-to-end step still to come.

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
  -- v_user_a / v_user_b must be real auth.users rows that currently have
  -- NO linked profiles row at all -- profiles.auth_user_id is UNIQUE
  -- (migration 002), so borrowing any already-linked identity to
  -- fabricate a fixture profile would violate that constraint against a
  -- REAL learner's own row, exactly as a live run of this script
  -- correctly did (23505 on profiles_auth_user_id_key) when this
  -- selection was too permissive. Fabricating a profile for an unlinked
  -- auth user, entirely inside this rollback-wrapped transaction, is
  -- safe: it creates that user's first-ever profile row for the
  -- duration of the test only, never touches or reuses any existing row.
  select id into v_user_a from auth.users u
    where not exists (select 1 from public.profiles p where p.auth_user_id = u.id)
    order by created_at asc limit 1;
  select id into v_user_b from auth.users u
    where not exists (select 1 from public.profiles p where p.auth_user_id = u.id)
      and u.id <> v_user_a
    order by created_at asc limit 1;

  -- Explicit precondition, proving all three required facts before any
  -- fixture is created: both ids exist (the selects above already
  -- guarantee this trivially, since a null result means no such row was
  -- found), both are distinct, and neither already owns a profiles row.
  if v_user_a is null or v_user_b is null then
    -- A DO block cannot issue ROLLBACK itself (not valid inside PL/pgSQL);
    -- raising forces the enclosing transaction to abort instead, which
    -- undoes nothing since no fixture has been inserted yet at this point.
    -- The outer `rollback;` below still runs afterward and is a safe
    -- no-op in that case.
    raise exception 'SKIPPED: fewer than 2 auth.users rows exist with no existing profiles.auth_user_id link — cannot safely fabricate an "already-owned" fixture without borrowing a real learner''s identity and violating their own unique-constraint-protected row. Apply migration 188 and rely on the live two-account browser sequence instead.';
  end if;

  if v_user_a = v_user_b then
    raise exception 'INTERNAL: v_user_a and v_user_b resolved to the same id (%) — fixture selection logic error, aborting rather than proceeding with an invalid test.', v_user_a;
  end if;

  perform 1 from public.profiles where auth_user_id = v_user_a;
  if found then
    raise exception 'INTERNAL: selected v_user_a % unexpectedly already has a linked profile — fixture selection logic error, aborting rather than risking that real row.', v_user_a;
  end if;

  perform 1 from public.profiles where auth_user_id = v_user_b;
  if found then
    raise exception 'INTERNAL: selected v_user_b % unexpectedly already has a linked profile — fixture selection logic error, aborting rather than risking that real row.', v_user_b;
  end if;

  -- Test fixtures: three unowned legacy profiles on three distinct
  -- fabricated device ids. v_user_a's real id is pre-attached to the
  -- "owned" one below to simulate an already-claimed profile -- this
  -- creates v_user_a's first-ever profile row, confirmed above to not
  -- yet exist, entirely inside this rollback-wrapped transaction.
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
  -- regardless of caller role, and staying as this session's own
  -- privileged role throughout means checks 4-5 below read the true
  -- underlying data state directly rather than through v_user_b's own
  -- RLS-filtered view (which would wrongly report v_user_a's row as "not
  -- found" simply because v_user_b has no SELECT permission on it, not
  -- because the data is actually wrong).
  --
  -- auth.uid() reads request.jwt.claims in current Supabase projects, but
  -- earlier project generations defined it against the older, separate
  -- request.jwt.claim.sub setting instead -- rather than assume which
  -- this project has, set both, then PROVE the simulation actually
  -- worked by calling this project's own real auth.uid() and comparing
  -- it to v_user_b before trusting anything that follows. If this
  -- precondition fails, every check below would otherwise report
  -- misleading FAILs (or accidental PASSes) that are really just "the
  -- caller was never actually simulated," not a finding about
  -- claim_legacy_profile itself.
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_b, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user_b::text, true);

  if auth.uid() is distinct from v_user_b then
    raise exception 'SIMULATION FAILED: auth.uid() resolved to % instead of the intended simulated caller % -- this project''s auth.uid() definition does not read request.jwt.claims/request.jwt.claim.sub the way this script assumes. Inspect auth.uid()''s actual definition (\df+ auth.uid) before trusting any check below; none of them ran.', auth.uid(), v_user_b;
  end if;

  -- Check 1: genuinely empty profile CAN still be claimed (legitimate
  -- anonymous-to-real continuity, the one case this function exists for).
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-EMPTY-DEVICE') into v_claim_result;
  if v_claim_result = v_profile_empty then
    v_pass := v_pass + 1;
    raise notice 'PASS 1/5 (behavioural): empty unclaimed profile was claimable';
  else
    raise notice 'FAIL 1/5 (behavioural): empty unclaimed profile was NOT claimable (got %)', v_claim_result;
  end if;

  -- Check 2: a DIFFERENT unclaimed profile that already carries evidence
  -- must be refused — this is the exact defect this migration fixes.
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-EVIDENCE-DEVICE') into v_claim_result;
  if v_claim_result is null then
    v_pass := v_pass + 1;
    raise notice 'PASS 2/5 (behavioural): unclaimed-but-evidence-bearing profile was correctly refused';
  else
    raise notice 'FAIL 2/5 (behavioural): unclaimed-but-evidence-bearing profile was wrongly claimed (got %) — THE DEFECT IS STILL PRESENT', v_claim_result;
  end if;

  -- Check 3: an already-owned profile (by a different real user) must
  -- remain refused, exactly as migration 019 already guaranteed.
  v_check := v_check + 1;
  select public.claim_legacy_profile('TEST-188-OWNED-DEVICE') into v_claim_result;
  if v_claim_result is null then
    v_pass := v_pass + 1;
    raise notice 'PASS 3/5 (behavioural): already-owned profile remained refused';
  else
    raise notice 'FAIL 3/5 (behavioural): already-owned profile was wrongly reassigned (got %) — this would be a NEW, more severe defect', v_claim_result;
  end if;

  -- Check 4: the fabricated "already-owned" fixture profile (v_user_a's
  -- own genuine auth identity, now attached to its first-ever profile
  -- row by this test's own setup step) is untouched by v_user_b's
  -- refused claim attempt above — still owned by v_user_a, auth_user_id
  -- never overwritten.
  v_check := v_check + 1;
  perform 1 from public.profiles where auth_user_id = v_user_a and id = v_profile_owned;
  if found then
    v_pass := v_pass + 1;
    raise notice 'PASS 4/5 (behavioural): the already-owned test profile still belongs to its original owner';
  else
    raise notice 'FAIL 4/5 (behavioural): the already-owned test profile''s ownership changed unexpectedly';
  end if;

  -- Check 5: the evidence-bearing profile's evidence itself was not
  -- altered by the refused claim attempt (refusal must be a true no-op,
  -- not a partial write).
  v_check := v_check + 1;
  perform 1 from public.user_stats where profile_id = v_profile_evidence and total_xp = 500;
  if found then
    v_pass := v_pass + 1;
    raise notice 'PASS 5/5 (behavioural): refused-claim profile''s existing evidence was left completely unmodified';
  else
    raise notice 'FAIL 5/5 (behavioural): refused-claim profile''s evidence was altered';
  end if;

  raise notice '=== RESULT: % / % behavioural checks passed (checks 1-5 only -- see check 6 below for structural verification, run separately) ===', v_pass, v_check;
end $$;

rollback;

-- Check 6 (separate from the rollback-wrapped behavioural checks above --
-- this is a pure, non-mutating read of function metadata, unaffected by
-- the rollback either way): STRUCTURAL verification, not behavioural.
--
-- The previous version of this check only confirmed each evidence
-- table's name appeared somewhere in the function source -- true even if
-- a table were referenced in an unrelated clause or a comment, which is
-- weaker than the PASS wording claimed. Corrected below without building
-- a SQL parser: each condition requires the literal sequence "not
-- exists ( select 1 from public.<table>" (whitespace-insensitive) to
-- appear in the source -- i.e. that specific table is the direct target
-- of its own NOT EXISTS guard, which is exactly the structure migration
-- 188 introduces and the only thing "simple and robust" needs to prove
-- here. It does not re-parse or validate the WHERE clause inside each
-- guard (e.g. the total_xp > 0 / questions_presented_count > 0
-- thresholds on user_stats / ali_student_adaptive_state) -- that
-- narrower behaviour is what checks 1-5 above already exercise directly.
--
-- Word-boundary note: Postgres's regex engine (Advanced Regular
-- Expressions, used by ~/~*) does NOT define \b as a word-boundary the
-- way JavaScript/PCRE do -- \b there is a character-entry escape
-- (backspace), not a constraint escape, so using it here would either
-- error or silently fail to constrain the match. The correct ARE
-- constraint escape for "end of word" is \M (see Postgres docs, Table
-- 9.20, Regular Expression Constraint Escapes) -- used below after each
-- table name so e.g. "public.user_stats" cannot be satisfied by a
-- same-prefixed but different table name.
select
  g.user_stats_guard,
  g.lesson_progress_guard,
  g.adaptive_state_guard,
  g.question_history_guard,
  g.durable_mastery_guard,
  g.educational_audit_guard,
  g.auth_user_id_null_guard,
  case
    when g.user_stats_guard and g.lesson_progress_guard and g.adaptive_state_guard
     and g.question_history_guard and g.durable_mastery_guard and g.educational_audit_guard
     and g.auth_user_id_null_guard
    then 'PASS 6/6 (structural): live function definition contains a NOT EXISTS guard structurally targeting each of the six evidence tables, plus the auth_user_id is null guard'
    else 'FAIL 6/6 (structural): at least one expected NOT EXISTS guard is missing or not structurally paired with its table -- inspect live_function_source directly'
  end as check_6_result,
  src.live_function_source
from (
  select pg_get_functiondef(p.oid) as live_function_source
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'claim_legacy_profile'
) src
cross join lateral (
  select
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.user_stats\M' as user_stats_guard,
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.lesson_progress\M' as lesson_progress_guard,
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.ali_student_adaptive_state\M' as adaptive_state_guard,
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.ali_student_question_history\M' as question_history_guard,
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.ali_durable_mastery\M' as durable_mastery_guard,
    src.live_function_source ~* 'not\s+exists\s*\(\s*select\s+1\s+from\s+public\.ali_educational_audit\M' as educational_audit_guard,
    src.live_function_source ~* 'where\s+device_id\s*=\s*p_device_id\s+and\s+auth_user_id\s+is\s+null' as auth_user_id_null_guard
) g;
