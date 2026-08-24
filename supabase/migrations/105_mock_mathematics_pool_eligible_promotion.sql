-- Angel Digital 11+ — Migration 105
-- Mathematics First Mock Foundation — Pool-Level Mock Eligibility
-- Promotion (Decision 160).
--
-- Promotes exactly the 48 Mathematics rows across Batch 001 (18), Batch
-- 002 (20), and Batch 003 (10) from eligibility_status
-- 'independently_validated' to 'mock_eligible' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own next, and final,
-- content-eligibility transition (authentic_assessment_candidate ->
-- independently_validated -> mock_eligible), mirroring migration
-- 090/094/101's own proven assertion-and-refuse pattern, scaled to a
-- multi-batch pool for the first time.
--
-- POOL-GATE CONTRACT applied to every one of the 48 rows before this
-- migration was written (Decision 160's own Part 2/3, not re-derived
-- here in SQL -- the contract is an authoring-time content-suitability
-- check, not a runtime one, matching how every promotion migration in
-- this arc has already treated its own precondition as a snapshot proof
-- rather than a live business-rule engine):
--   1. eligibility_status = 'independently_validated' (genuine review
--      already completed -- checked live below).
--   2. active = true (checked live below).
--   3. subject = 'maths' (this migration's own scope boundary).
--   4. a defensible, single-form answer: confirmed by direct text
--      search of migrations 088/091/095's own real "answer" fields --
--      all 48 are either purely numeric or an unambiguous short string
--      (a time, a coordinate pair, "true"/"false"), none null, none
--      containing a semicolon (the existing scoring function's own
--      manual-marking trigger) -- every row scores through the existing,
--      proven, single-scalar-match path.
--   5. a declared marks value: confirmed by direct count -- exactly 48
--      "marks" fields across the three source migrations, matching the
--      row count exactly; no row relies on the scoring function's own
--      coalesce(...,1) fallback.
--   6. marking_mode is NULL or 'deterministic': confirmed by direct
--      text search -- no Mathematics row anywhere uses any other value.
--      Migration 104's own new fail-closed check makes this a structural
--      guarantee going forward, not merely an observation about today.
--   7. grouping consistency: the 4 mock-mr01mr10-costumeschedule rows
--      (the only grouped family in this pool) are promoted together, in
--      the same exact-ID list, in the same migration -- never a partial
--      group.
--   8. no known review rejection/amendment dependency: every family's
--      own ali_family_review decision is 'approved' (Decisions 143/149/
--      158's own established, Founder-supplied evidence for Batch
--      001/002/003 respectively) -- not 'approved_with_amendment',
--      'rejected', or 'requires_revalidation'.
--   9. Practice isolation: unaffected either way -- migration 100's own
--      RLS predicate (eligibility_status = 'practice_eligible' OR
--      is_current_user_admin()) already excludes both
--      independently_validated AND mock_eligible identically from
--      ordinary anon/authenticated reads; this migration changes which
--      of those two excluded values a row carries, never whether it is
--      excluded.
--  10. scoring-architecture suitability: satisfied by migration 104
--      (applied before this migration, per this migration's own stated
--      dependency below).
--
-- All 48 rows satisfy every criterion above -- no row is excluded from
-- this promotion (Decision 160's own Part 3 finding, disclosed
-- honestly: a clean result, not manufactured exclusions to appear more
-- rigorous than the evidence supports).
--
-- STATUS SEMANTICS, verified before writing this migration, per the
-- Founder's own explicit instruction not to destroy certification
-- provenance silently: eligibility_status is, and has been throughout
-- this entire arc, a SINGLE mutually-exclusive column modelling a
-- strictly linear progression (RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md
-- 's own transition table) -- mock_eligible is documented there as a
-- LATER stage that presupposes independent validation already
-- happened, never a parallel or incompatible state. No information is
-- destroyed by this transition: (a) ali_family_review is APPEND-ONLY --
-- every genuine 'approved' review decision for these 48 rows remains
-- permanently in that table, untouched by this migration, exactly as it
-- has for every prior promotion in this arc; (b) migrations 090/094/101
-- remain permanent, immutable repository history proving these exact
-- IDs passed through independently_validated before this migration ever
-- ran; (c) every governance-count query this entire arc has used
-- (Decisions 144/150/158/159) already treats eligibility_status as a
-- current-snapshot, not a cumulative badge set -- a row moving further
-- along and no longer being counted under its earlier status is the
-- CORRECT, already-established reading, not a new problem this
-- migration introduces.
--
-- INDEPENDENT-VALIDATION-TO-MOCK-ELIGIBLE BOUNDARY, not activation: this
-- migration moves these 48 rows to 'mock_eligible' ONLY. It does NOT
-- create or modify any ali_mock_form row, does NOT assemble a paper,
-- does NOT change Mock Centre availability (still governed entirely by
-- whether an active ali_mock_form row exists -- zero today, unchanged
-- by this migration), and does NOT touch ali_family_review in any way.
--
-- CONTENT IMMUTABILITY: no prompt, answer, explanation, marks, skill,
-- family_id, provenance, content_version, question_group_id, group_order,
-- subpart_label, marking_mode, or active state is changed. Only
-- eligibility_status moves.
--
-- Fails safely, mirroring migration 090/094/101's own assertion-and-
-- refuse pattern at the full 48-row scale: if the live count of matching
-- rows is not exactly 48 independently_validated rows across these exact
-- IDs, and is not already exactly 48 mock_eligible rows across the same
-- IDs (the safe already-applied no-op case), this migration refuses to
-- guess and raises an exception naming the actual counts observed,
-- touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 104
-- (Mathematics grouped-question scoring + marking-mode safety) has
-- already been applied — this migration's own Part 10 pool-gate
-- criterion depends on it.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    -- Batch 001 (18)
    'mock-mr02-invdiv-01', 'mock-mr02-invdiv-02', 'mock-mr02-invdiv-03',
    'mock-mr02-twostep-01', 'mock-mr02-twostep-02', 'mock-mr02-twostep-03',
    'mock-mr03-unitconv-01', 'mock-mr03-unitconv-02', 'mock-mr03-unitconv-03',
    'mock-mr05-forward-01', 'mock-mr05-forward-02',
    'mock-mr05-inverse-01', 'mock-mr05-inverse-02',
    'mock-mr09-data-01', 'mock-mr09-data-02', 'mock-mr09-data-03',
    'mock-mr13-bestvalue-01', 'mock-mr13-bestvalue-02',
    -- Batch 002 (20)
    'mock-mr04-percentchange-01', 'mock-mr04-percentchange-02',
    'mock-mr04-reversepercent-01', 'mock-mr04-reversepercent-02',
    'mock-mr06-sumdiff-01', 'mock-mr06-sumdiff-02',
    'mock-mr06-multiplerelation-01', 'mock-mr06-multiplerelation-02',
    'mock-mr07-triangleanglesum-01', 'mock-mr07-triangleanglesum-02',
    'mock-mr07-isoscelesproperty-01', 'mock-mr07-isoscelesproperty-02',
    'mock-mr10-forwardschedule-01', 'mock-mr10-forwardschedule-02',
    'mock-mr10-reverseschedule-01', 'mock-mr10-reverseschedule-02',
    'mock-mr11-truefalsejudgement-01', 'mock-mr11-truefalsejudgement-02',
    'mock-mr11-propertysearch-01', 'mock-mr11-propertysearch-02',
    -- Batch 003 (10)
    'mock-mr01-directcalc-01', 'mock-mr01-directcalc-02',
    'mock-mr08-rotation-01', 'mock-mr08-rotation-02',
    'mock-mr12-reversemean-01', 'mock-mr12-reversemean-02',
    'mock-mr01mr10-costumeschedule-01a', 'mock-mr01mr10-costumeschedule-01b',
    'mock-mr01mr10-costumeschedule-02a', 'mock-mr01mr10-costumeschedule-02b'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated'
    and active = true
    and subject = 'maths';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'mock_eligible';

  if v_pending_count = 48 then
    update public.ali_question_bank
    set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids)
      and eligibility_status = 'independently_validated';

    raise notice 'Migration 105: promoted 48 Mathematics rows (Batch 001: 18, Batch 002: 20, Batch 003: 10) from independently_validated to mock_eligible.';

  elsif v_already_validated_count = 48 then
    raise notice 'Migration 105: all 48 target rows are already mock_eligible -- already applied. No changes made.';

  else
    raise exception
      'Migration 105 refused: expected 48 independently_validated Mathematics rows across the named IDs (found %), or 48 already mock_eligible (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
