-- Angel Digital 11+ — Migration 164
-- English Content Foundation, Increment 002 (Decision 241) — The Loose
-- Connection Naming Remediation + Q2(d) Vocabulary Precision Correction
-- (LIVE database correction; migrations 161/162/163 are Founder-confirmed
-- already applied and immutable).
--
-- ============================================================
-- BACKGROUND -- DECISION 240 / DECISION 241
-- ============================================================
-- Decision 240 (programme-wide, read-only audit, triggered by the
-- Founder noticing "Mr Adeyemi"/"Ade" in this passage) found: (a) no
-- programme-wide ethnic/cultural overrepresentation -- African-associated
-- naming is ~9% of 55 distinct fictional character names estate-wide,
-- plausible for UK demographics; (b) but a genuine, source-confirmed
-- LOCAL pattern -- the name-root "Ade" independently reused across two
-- unrelated migrations/sessions (this passage, and migration 044's
-- "Race Day"), and this passage additionally uses BOTH "Ade" and "Mr
-- Adeyemi" (two different people -- a student and his teacher -- sharing
-- one onomastic root). Decision 241 (Founder/leadership conclusion: "B --
-- LOCAL CORRECTIONS REQUIRED") directs a bounded, local naming
-- remediation for this passage ONLY, explicitly NOT because Yoruba/
-- Nigerian/African names are unsuitable, but to remove the unnecessary
-- repeat-root concentration and improve portfolio name variety. "Nisha"
-- is explicitly retained unchanged. Decision 240's own P2 register items
-- (Okafor repetition, migration 044 batch clustering, Mathematics
-- name-pool asymmetry) are explicitly NOT remediated by this migration,
-- per Decision 241's own explicit instruction -- they remain controlled
-- maintenance-window items, not P1, not blocking Increment 002.
--
-- Separately, and independently of the naming remediation, the Founder's
-- own live review (recorded at Decision 240 Section I) found Q2(d)'s
-- accepted synonym "gloating" for "triumphant" ("He didn't sound
-- triumphant about it") semantically questionable -- "gloating" carries a
-- smug/superior connotation the passage's own contrast (Ade/Daniel
-- explicitly does NOT gloat) argues against treating as a clean
-- synonym. Removed here; "victorious", "celebratory", and "proud of
-- winning" are retained as the remaining, semantically defensible
-- deterministic accepted answers -- not broadened further.
--
-- ============================================================
-- WHY A NEW, ADDITIVE MIGRATION (NOT AN IN-PLACE EDIT OF 161/163)
-- ============================================================
-- Migrations 161, 162 and 163 are Founder-confirmed already applied and
-- immutable, per this project's own standing "migrations are immutable
-- once applied; corrections are always new, additive migrations"
-- convention (Decision 218, re-affirmed at every subsequent live-
-- correction decision, most recently Decision 239). This migration
-- corrects the LIVE rows directly, via UPDATE only -- no DELETE, no
-- INSERT of new rows, no change to any id, marks value, question_type,
-- skill, grouping column, eligibility_status, or active flag. Only the
-- character-name text within `ali_passage_bank.original_text` and
-- `ali_question_bank.prompt`/`explanation`/`addresses_misconception`
-- changes, plus the single `gloating` array element removed from
-- eng-inc002-roboticsfinal-q02d's own acceptedAnswers.
--
-- ============================================================
-- DEPENDENCY SEARCH (Section 3 of this task's own directive: "search
-- rather than assuming the affected list")
-- ============================================================
-- Independently re-verified this session, from source, not assumed:
-- `grep` across migrations 161 and 163 found "Mr Adeyemi"/"Adeyemi"
-- ALWAYS appearing as the fixed phrase "Mr Adeyemi" (never bare
-- "Adeyemi"), and found standalone "Ade" (word-boundary, both
-- capitalised-narrative-prose and lowercase-normalised-answer-key forms,
-- including one ALL-CAPS emphasis instance, "ADE'S", inside Q7a's own
-- addresses_misconception text) present in ALL 8 of migration 161's own
-- Loose Connection question rows (Q1, Q3, Q4, Q5, Q6, Q7a, Q7b, Q8 --
-- Q5's own question/model-answer text does not itself name Ade, but its
-- embedded passageText, duplicated in every row per this codebase's own
-- established content-authoring convention, does) plus the passage row
-- itself, plus all 4 of migration 163's own grouped Q2 subpart rows
-- (q02b/c/d/e -- only via their own embedded passageText copies; their
-- own question/modelAnswer/explanation/addresses_misconception text does
-- not separately name either character). A repository-wide search
-- (`grep -rl "Mr Adeyemi\|Adeyemi"` and a word-boundary search for
-- standalone "Ade") across every `.ts`/`.tsx`/`.mjs`/`.js` file found
-- NO other reviewer-facing code, fixture, or generator referencing
-- either character -- the one other standalone-"Ade" match in the whole
-- codebase (`scripts/generate-english-wave1.mjs`) is migration 044's
-- entirely unrelated "Race Day" passage/protagonist, explicitly out of
-- scope for this decision. This migration's own UPDATE statements
-- therefore target exactly `learning_unit_id = 'eng-inc002-roboticsfinal'`
-- (all 12 live question rows for this passage, post-migration-163) plus
-- the passage row itself -- the complete, search-verified affected set.
--
-- ============================================================
-- HISTORICAL EVIDENCE PRESERVATION (explicit instruction, this task)
-- ============================================================
-- This migration does NOT touch, and was never asked to touch,
-- `ALI_DECISION_LOG.md`'s own prior entries (Decisions 237-240, which
-- quote "Mr Adeyemi"/"Ade" as historically accurate contemporaneous
-- record), `docs/audits/decision240-uk-representation-audit/`'s own
-- evidence files, or migrations 161/163's own immutable SQL text (which
-- remain byte-unchanged, exactly as Decision 238/239 established for
-- prior corrections of already-applied content). Only the LIVE DATABASE
-- ROWS are updated by this migration; Decision 241's own new log entry
-- uses the new names going forward, without rewriting any prior entry.
--
-- ============================================================
-- THE RENAME MECHANISM
-- ============================================================
-- A single, safe, four-pass text substitution is applied to every
-- affected text column: (1) the literal phrase "Mr Adeyemi" -> "Mr
-- Carter" (removes the teacher's full name in one pass, since "Adeyemi"
-- is confirmed, by the search above, to never appear without the "Mr "
-- prefix in this content); (2) whole-word (regex `\y` word-boundary,
-- both sides) "ADE" -> "DANIEL" (the one all-caps emphasis instance);
-- (3) whole-word "Ade" -> "Daniel" (capitalised narrative-prose form);
-- (4) whole-word "ade" -> "daniel" (lowercase, answer-key-normalised
-- form, e.g. migration 161's own Q6 orderedAnswer and Q8 acceptedAnswers
-- entries). Word-boundary matching means this can never corrupt a
-- different word merely containing the letters "ade" (e.g. "made",
-- "trade", "grade", "lemonade") -- confirmed safe both by the regex
-- semantics itself (a boundary cannot exist between two word characters)
-- and by this session's own line-by-line reading of every match before
-- writing this migration. "Nisha" contains no "ade" substring at all and
-- is structurally untouched by this substitution.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Fail-closed: idempotent (if the passage's own stored text already
-- contains "Mr Carter", this migration is a verified no-op); otherwise
-- requires the passage row to match its exact known pre-rename
-- signature (original_text containing "Mr Adeyemi", active = true,
-- eligibility_status = authentic_assessment_candidate), requires exactly
-- 12 live question rows for this passage (the confirmed post-163 count),
-- and requires eng-inc002-roboticsfinal-q02d to currently contain
-- "gloating" -- refusing and writing nothing if any precondition does
-- not match exactly. Post-write verification (below, inside its own DO
-- block) proves: new names present; old names completely absent from
-- every affected column; "Nisha" 's own total occurrence count across
-- every affected column is UNCHANGED (proving no accidental deletion or
-- duplication, not merely presence); "gloating" absent from Q2(d)'s own
-- acceptedAnswers; q02b-e grouping columns, Q2's own 4-mark total, and
-- the passage's own 22-mark total are all unchanged; eligibility_status
-- and active are unchanged on every row; the passage's own
-- ali_family_review registration (migration 162) is unchanged. Does not
-- touch eligibility_status, active, marks (except the single acceptedAnswers
-- array element removed from q02d), question_group_id, group_order,
-- subpart_label, marking_mode, or `ali_family_review` anywhere.
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query, after migrations 161/162/163 (already
-- applied).

begin;

do $$
declare
  v_already_renamed boolean;
  v_passage_pristine boolean;
  v_question_count int;
  v_gloating_present boolean;
  v_nisha_before int;
begin
  -- Idempotency check first.
  select exists(
    select 1 from public.ali_passage_bank
    where id = 'eng-inc002-roboticsfinal'
      and original_text like '%Mr Carter%'
  ) into v_already_renamed;

  if v_already_renamed then
    raise notice 'Migration 164: The Loose Connection already renamed (Mr Carter present) -- already applied. No changes made.';
    return;
  end if;

  -- Pristine-state precondition: the passage row.
  select exists(
    select 1 from public.ali_passage_bank
    where id = 'eng-inc002-roboticsfinal'
      and original_text like '%Mr Adeyemi%'
      and active = true
      and eligibility_status = 'authentic_assessment_candidate'
  ) into v_passage_pristine;

  if not v_passage_pristine then
    raise exception 'Migration 164 refused: The Loose Connection passage row (eng-inc002-roboticsfinal) does not match the expected pristine pre-rename signature (original_text containing "Mr Adeyemi", active = true, eligibility_status = authentic_assessment_candidate). Re-verify production state before proceeding; this migration will not guess.';
  end if;

  -- Pristine-state precondition: exactly 12 live question rows (the
  -- confirmed post-migration-163 count: 8 from 161 + 4 grouped Q2
  -- subparts from 163).
  select count(*) into v_question_count
  from public.ali_question_bank
  where learning_unit_id = 'eng-inc002-roboticsfinal';

  if v_question_count != 12 then
    raise exception 'Migration 164 refused: expected exactly 12 live question rows for eng-inc002-roboticsfinal (the confirmed post-migration-163 state), found %. Re-verify production state before proceeding; this migration will not guess.', v_question_count;
  end if;

  -- Pristine-state precondition: Q2(d) currently includes "gloating".
  select (prompt -> 'acceptedAnswers') ? 'gloating' into v_gloating_present
  from public.ali_question_bank
  where id = 'eng-inc002-roboticsfinal-q02d';

  if v_gloating_present is not true then
    raise exception 'Migration 164 refused: expected eng-inc002-roboticsfinal-q02d to currently include "gloating" in its own acceptedAnswers, found it absent or the row missing. Re-verify production state before proceeding; this migration will not guess.';
  end if;

  -- Capture the pre-rename "Nisha" occurrence count across every
  -- affected column, so the post-write check can prove count-
  -- preservation (not merely presence) after the rename.
  select coalesce(sum((length(t) - length(regexp_replace(t, 'Nisha', '', 'g'))) / length('Nisha')), 0)
    into v_nisha_before
  from (
    select original_text as t from public.ali_passage_bank where id = 'eng-inc002-roboticsfinal'
    union all
    select prompt::text from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select explanation from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select addresses_misconception from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
  ) as all_text;

  create temporary table migration164_pre_counts (nisha_count int) on commit drop;
  insert into migration164_pre_counts values (v_nisha_before);

  raise notice 'Migration 164: preconditions satisfied -- 12 question rows, Q2(d) contains gloating, pre-rename Nisha count = %.', v_nisha_before;
end $$;

-- Rename the passage's own stored text.
update public.ali_passage_bank
set original_text = regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(original_text, 'Mr Adeyemi', 'Mr Carter'),
        '\yADE\y', 'DANIEL', 'g'),
      '\yAde\y', 'Daniel', 'g'),
    '\yade\y', 'daniel', 'g')
where id = 'eng-inc002-roboticsfinal';

-- Rename every live question row's prompt/explanation/misconception text.
update public.ali_question_bank
set prompt = (
      regexp_replace(
        regexp_replace(
          regexp_replace(
            replace(prompt::text, 'Mr Adeyemi', 'Mr Carter'),
          '\yADE\y', 'DANIEL', 'g'),
        '\yAde\y', 'Daniel', 'g'),
      '\yade\y', 'daniel', 'g')
    )::jsonb,
    explanation = regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(explanation, 'Mr Adeyemi', 'Mr Carter'),
        '\yADE\y', 'DANIEL', 'g'),
      '\yAde\y', 'Daniel', 'g'),
    '\yade\y', 'daniel', 'g'),
    addresses_misconception = regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(addresses_misconception, 'Mr Adeyemi', 'Mr Carter'),
        '\yADE\y', 'DANIEL', 'g'),
      '\yAde\y', 'Daniel', 'g'),
    '\yade\y', 'daniel', 'g')
where learning_unit_id = 'eng-inc002-roboticsfinal';

-- Q2(d) vocabulary-precision correction: remove "gloating" as an
-- accepted deterministic synonym for "triumphant". Retains "victorious",
-- "celebratory", and "proud of winning" -- not broadened further.
update public.ali_question_bank
set prompt = jsonb_set(
  prompt,
  '{acceptedAnswers}',
  (prompt -> 'acceptedAnswers') - 'gloating'
)
where id = 'eng-inc002-roboticsfinal-q02d';

-- Post-write verification.
do $$
declare
  v_stale_count int;
  v_nisha_after int;
  v_nisha_before int;
  v_gloating_present boolean;
  v_q02_group_ok boolean;
  v_q02_marks int;
  v_passage_marks int;
  v_bad_eligibility_count int;
  v_bad_active_count int;
  v_review_ok boolean;
begin
  -- New names present.
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'eng-inc002-roboticsfinal' and original_text like '%Mr Carter%' and original_text ~ '\yDaniel\y'
  ) then
    raise exception 'Migration 164 post-write check failed: expected "Mr Carter" and whole-word "Daniel" to be present in the passage''s own stored text.';
  end if;

  -- Old names completely absent from every affected column.
  select count(*) into v_stale_count
  from (
    select original_text as t from public.ali_passage_bank where id = 'eng-inc002-roboticsfinal'
    union all
    select prompt::text from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select explanation from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select addresses_misconception from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
  ) as all_text
  where t like '%Mr Adeyemi%' or t ~ '\yAde\y' or t ~ '\yADE\y' or t ~ '\yade\y';

  if v_stale_count != 0 then
    raise exception 'Migration 164 post-write check failed: % stale reference(s) to the old character names ("Mr Adeyemi"/"Ade") remain across the passage and question rows.', v_stale_count;
  end if;

  -- "Nisha" occurrence count unchanged (count-preservation, not merely presence).
  select nisha_count into v_nisha_before from migration164_pre_counts;
  select coalesce(sum((length(t) - length(regexp_replace(t, 'Nisha', '', 'g'))) / length('Nisha')), 0)
    into v_nisha_after
  from (
    select original_text as t from public.ali_passage_bank where id = 'eng-inc002-roboticsfinal'
    union all
    select prompt::text from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select explanation from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select addresses_misconception from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
  ) as all_text;

  if v_nisha_after != v_nisha_before then
    raise exception 'Migration 164 post-write check failed: "Nisha" occurrence count changed (before %, after %) -- Nisha must remain completely unaffected by this rename.', v_nisha_before, v_nisha_after;
  end if;

  -- "gloating" absent from Q2(d).
  select (prompt -> 'acceptedAnswers') ? 'gloating' into v_gloating_present
  from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02d';

  if v_gloating_present is not false then
    raise exception 'Migration 164 post-write check failed: "gloating" is still present in eng-inc002-roboticsfinal-q02d''s own acceptedAnswers.';
  end if;

  -- q02b-e grouping columns intact.
  select bool_and(ok) into v_q02_group_ok from (
    select (question_group_id = 'eng-inc002-roboticsfinal-q02' and group_order = 1 and subpart_label = '(b)' and marking_mode = 'deterministic') as ok
      from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02b'
    union all
    select (question_group_id = 'eng-inc002-roboticsfinal-q02' and group_order = 2 and subpart_label = '(c)' and marking_mode = 'deterministic')
      from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02c'
    union all
    select (question_group_id = 'eng-inc002-roboticsfinal-q02' and group_order = 3 and subpart_label = '(d)' and marking_mode = 'deterministic')
      from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02d'
    union all
    select (question_group_id = 'eng-inc002-roboticsfinal-q02' and group_order = 4 and subpart_label = '(e)' and marking_mode = 'deterministic')
      from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02e'
  ) as checks;

  if v_q02_group_ok is not true then
    raise exception 'Migration 164 post-write check failed: q02b-e grouping columns (question_group_id/group_order/subpart_label/marking_mode) no longer match the expected migration-163 state.';
  end if;

  -- Q2 total marks still 4.
  select coalesce(sum((prompt ->> 'marks')::int), 0) into v_q02_marks
  from public.ali_question_bank
  where id in ('eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c', 'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e');

  if v_q02_marks != 4 then
    raise exception 'Migration 164 post-write check failed: expected Q2''s own total marks to remain 4, found %.', v_q02_marks;
  end if;

  -- Passage total marks still 22.
  select coalesce(sum((prompt ->> 'marks')::int), 0) into v_passage_marks
  from public.ali_question_bank
  where learning_unit_id = 'eng-inc002-roboticsfinal';

  if v_passage_marks != 22 then
    raise exception 'Migration 164 post-write check failed: expected the passage''s own total marks to remain 22, found %.', v_passage_marks;
  end if;

  -- eligibility_status unchanged everywhere (12 question rows + 1 passage row).
  select count(*) into v_bad_eligibility_count
  from (
    select eligibility_status from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select eligibility_status from public.ali_passage_bank where id = 'eng-inc002-roboticsfinal'
  ) as rows_checked
  where eligibility_status != 'authentic_assessment_candidate';

  if v_bad_eligibility_count != 0 then
    raise exception 'Migration 164 post-write check failed: % row(s) no longer have eligibility_status = authentic_assessment_candidate.', v_bad_eligibility_count;
  end if;

  -- active unchanged everywhere.
  select count(*) into v_bad_active_count
  from (
    select active from public.ali_question_bank where learning_unit_id = 'eng-inc002-roboticsfinal'
    union all
    select active from public.ali_passage_bank where id = 'eng-inc002-roboticsfinal'
  ) as rows_checked
  where active is not true;

  if v_bad_active_count != 0 then
    raise exception 'Migration 164 post-write check failed: % row(s) no longer have active = true.', v_bad_active_count;
  end if;

  -- Review registration (migration 162) unchanged.
  select exists(
    select 1 from public.ali_family_review
    where family_id = 'eng-inc002-roboticsfinal'
      and review_type = 'mock_english_passage_independent_review'
      and decision = 'pending_independent_review'
  ) into v_review_ok;

  if v_review_ok is not true then
    raise exception 'Migration 164 post-write check failed: The Loose Connection''s own ali_family_review registration (review_type = mock_english_passage_independent_review, decision = pending_independent_review) is no longer present as expected -- this migration must never touch review registration.';
  end if;

  raise notice 'Migration 164: post-write verification passed -- new names present, old names absent, Nisha count unchanged (%), gloating removed, q02b-e grouping intact, Q2 = 4 marks, passage = 22 marks, eligibility/active unchanged, review registration unchanged.', v_nisha_after;
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, active, eligibility_status,
--   prompt ->> 'question' as question_text,
--   prompt -> 'acceptedAnswers' as accepted_answers,
--   (prompt ->> 'marks')::int as marks
-- from public.ali_question_bank
-- where learning_unit_id = 'eng-inc002-roboticsfinal'
-- order by id;
--
-- select id, active, eligibility_status, original_text
-- from public.ali_passage_bank
-- where id = 'eng-inc002-roboticsfinal';
--
-- select family_id, review_type, decision, reviewer
-- from public.ali_family_review
-- where family_id = 'eng-inc002-roboticsfinal';
