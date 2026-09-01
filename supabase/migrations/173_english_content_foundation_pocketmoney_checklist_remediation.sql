-- Angel Digital 11+ — Migration 173
-- English Content Foundation, Writing Depth Extension (Decision 259) —
-- "Pocket Money or Helping Anyway?" Checklist Remediation.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- The Founder's review of the Completion and Readiness handoff (this
-- session) found that `eng-inc003-writing-pocketmoney-01`'s own
-- checklist (migration 169), despite the prompt's genuinely distinct
-- two-position structure, reused two of `mock-writing-cookopinion-01`'s
-- (migration 098) `coaching`-tier checklist items near-verbatim:
--
--   - migration 169's "Support your view with your own experience or
--     something you have genuinely noticed, not a generic list of
--     reasons" vs. migration 098's "Support your opinion with your own
--     experience or something you have genuinely noticed, not a generic
--     list of reasons" — a single word changed ("view"/"opinion").
--   - migration 169's "Keep a consistent personal voice throughout,
--     since this is your own opinion, not a formal debate speech" vs.
--     migration 098's identical sentence, word-for-word.
--
-- This is exactly the "structurally the same task with different nouns"
-- pattern migration 169's own header already named as a defect it was
-- meant to correct for a DIFFERENT pair of prompts (cookopinion/
-- screentime) — the Founder correctly identified that the same pattern
-- had crept back in when authoring pocketmoney's own checklist against
-- cookopinion. The `core` items (length, paragraphing, proofreading) are
-- legitimately shared boilerplate across every QT-WC-01a prompt (migration
-- 169's own disclosed convention, `lib/writing/supportLevelPolicy.ts`) —
-- this migration touches only the two `coaching` items that were not
-- legitimately shared, per the Founder's explicit instruction not to
-- merely reword but to make "the response support... genuinely reflect
-- the task's educational shape."
--
-- ============================================================
-- THE FIX
-- ============================================================
-- Both replaced items are rewritten to reflect what is actually distinct
-- about THIS prompt's own reasoning demand (weighing two explicitly
-- named, opposing positions before answering) rather than generic
-- opinion-writing coaching reused from a single-position prompt:
--
--   - The experience-support item now names the specific evidentiary
--     shape required ("one specific moment... or something you have
--     noticed a family member or friend do") and gives a concrete
--     example of the generic statement to avoid, rather than reusing
--     cookopinion's own generic "not a generic list of reasons" phrasing.
--   - The register item is rewritten to name the SPECIFIC risk this
--     prompt's own two-position structure creates that a single-opinion
--     prompt does not: a child pulled toward writing a formal for-and-
--     against debate essay (headings, "in conclusion") instead of a
--     personal reflection — a genuinely prompt-specific coaching point,
--     not boilerplate.
--   - A new, third coaching item is added ("Say specifically what is
--     genuinely appealing about EACH view...") to make the checklist
--     actually test the prompt's own core two-position-engagement demand
--     explicitly, rather than leaving that demand solely implicit in the
--     "refer to both views" item carried over unchanged from migration
--     169.
--
-- `addresses_misconception` is extended in the same migration (a natural
-- companion correction, not a separate scope expansion) to name the
-- specific failure mode the strengthened checklist is meant to catch:
-- naming the second position only in passing without ever explaining
-- what is appealing about it.
--
-- ============================================================
-- SCOPE: `eng-inc003-writing-pocketmoney-01` ONLY, TWO COLUMNS
-- ============================================================
-- Only the `checklist` key inside this one row's own `prompt` jsonb, and
-- this one row's own `addresses_misconception` column, are ever touched.
-- `title`, `prompt.prompt` (the task text itself), `type`, `difficulty`,
-- `timeMinutes`, `skill`, `pathway`, `content_difficulty`,
-- `estimated_time_seconds`, `mastery_threshold`, `learning_unit_id`,
-- `family_id`, `provenance`, `eligibility_status`, `content_version`,
-- `active`, and `transfer_class` are all re-verified unchanged as live
-- preconditions AND post-write checks, mirroring migration 148's own
-- fail-closed single-key-correction pattern exactly. No other row —
-- `eng-inc003-writing-favouriteplace-01` included — is referenced
-- anywhere in this migration's own executable SQL. Does not touch
-- "An Invented Place" (`eng-inc003-writing-wc01a-imaginedplace`) — that
-- prompt's amendment lifecycle is closed and not reopened here, per the
-- Founder's explicit instruction.
--
-- eligibility_status remains 'authentic_assessment_candidate' throughout
-- — this migration does not certify, validate, or promote this prompt;
-- it only corrects its checklist content ahead of the independent review
-- migration 172 already registered for it.
--
-- FAIL-CLOSED THREE-STATE STRUCTURE (mirroring migration 148): PRISTINE
-- (row carries the exact original migration-169 checklist/misconception)
-- -> applies the correction, then positively re-verifies the new values
-- and every unchanged field. ALREADY-CORRECTED (row already carries the
-- new checklist/misconception, e.g. a re-run) -> safe no-op, re-verifies
-- unchanged fields only. MIXED/UNEXPECTED (neither exact state, or any
-- unchanged-field mismatch) -> RAISE EXCEPTION naming the actual values
-- observed, nothing written.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, before (or together with)
-- migration 172's independent-review registration for this prompt.

begin;

do $$
declare
  v_id constant text := 'eng-inc003-writing-pocketmoney-01';
  v_old_checklist constant jsonb := to_jsonb(array[
    'Write at least six sentences',
    'Refer to both views given in the question, not only the one you agree with',
    'State clearly which view you agree with, or explain a genuine middle position, and why',
    'Support your view with your own experience or something you have genuinely noticed, not a generic list of reasons',
    'Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech',
    'Organise your writing into clear paragraphs',
    'Check spelling and punctuation carefully'
  ]::text[]);
  v_new_checklist constant jsonb := to_jsonb(array[
    'Write at least six sentences',
    'Refer to both views named in the question -- pocket money for helping at home, and helping without being paid -- before giving your own view',
    'Say specifically what is genuinely appealing about EACH view, even the one you lean away from, before explaining which way you lean (or a genuine middle position)',
    'Give one specific moment from your own life, or something you have noticed a family member or friend do, that shaped your thinking -- not a general statement like "some people think helping is good"',
    'Even though you are weighing two views, write this as YOUR OWN reflection in your own voice -- not a formal for-and-against debate with headings or an "in conclusion" closing',
    'Organise your writing into clear paragraphs',
    'Check spelling and punctuation carefully'
  ]::text[]);
  v_old_misconception constant text := 'Answering as if only one view was offered -- stating an opinion without ever referring to the second, named position -- which fails the prompt''s explicit two-position framing even if the opinion itself is well argued.';
  v_new_misconception constant text := 'Answering as if only one view was offered -- stating an opinion without ever referring to the second, named position, or naming it only in passing without ever explaining what is genuinely appealing about it -- which fails the prompt''s explicit two-position framing even if the opinion itself is well argued.';
  v_row_count int;
  v_pristine_count int;
  v_already_corrected_count int;
  v_static_fields_count int;
  v_post_checklist_count int;
  v_post_misconception_count int;
  v_post_static_fields_count int;
begin
  select count(*) into v_row_count
    from public.ali_question_bank where id = v_id;
  if v_row_count <> 1 then
    raise exception 'Migration 173 refused: expected exactly 1 row with id=%, found %.', v_id, v_row_count;
  end if;

  select count(*) into v_static_fields_count
    from public.ali_question_bank
    where id = v_id
      and subject = 'writing' and skill = 'QT-WC-01a'
      and eligibility_status = 'authentic_assessment_candidate'
      and family_id = 'eng-inc003-writing-wc01a-pocketmoney'
      and provenance = 'angel_original' and content_version = 1 and active = true
      and transfer_class = 'MIXED_TRANSFER'
      and (prompt->>'title') = 'Pocket Money or Helping Anyway?'
      and (prompt->>'type') = 'descriptive' and (prompt->>'difficulty') = 'year6-exam'
      and (prompt->>'timeMinutes') = '25'
      and (prompt->>'prompt') = 'Some people think children should be given pocket money for helping at home. Other people think children should help at home anyway, without being paid for it. What do you think, and why?';
  if v_static_fields_count <> 1 then
    raise exception 'Migration 173 refused: one or more fields expected to remain untouched by this migration do not match the live row for id=% (found % of 1 matching). This migration must never run if the row has drifted from migration 169''s own authored shape.', v_id, v_static_fields_count;
  end if;

  select count(*) into v_pristine_count
    from public.ali_question_bank
    where id = v_id and (prompt->'checklist') = v_old_checklist and addresses_misconception = v_old_misconception;

  select count(*) into v_already_corrected_count
    from public.ali_question_bank
    where id = v_id and (prompt->'checklist') = v_new_checklist and addresses_misconception = v_new_misconception;

  if v_pristine_count = 1 then
    update public.ali_question_bank
    set prompt = jsonb_set(prompt, '{checklist}', v_new_checklist),
        addresses_misconception = v_new_misconception
    where id = v_id;

    select count(*) into v_post_checklist_count
      from public.ali_question_bank where id = v_id and (prompt->'checklist') = v_new_checklist;
    select count(*) into v_post_misconception_count
      from public.ali_question_bank where id = v_id and addresses_misconception = v_new_misconception;
    select count(*) into v_post_static_fields_count
      from public.ali_question_bank
      where id = v_id
        and subject = 'writing' and skill = 'QT-WC-01a'
        and eligibility_status = 'authentic_assessment_candidate'
        and family_id = 'eng-inc003-writing-wc01a-pocketmoney'
        and provenance = 'angel_original' and content_version = 1 and active = true
        and transfer_class = 'MIXED_TRANSFER'
        and (prompt->>'title') = 'Pocket Money or Helping Anyway?'
        and (prompt->>'prompt') = 'Some people think children should be given pocket money for helping at home. Other people think children should help at home anyway, without being paid for it. What do you think, and why?';

    if v_post_checklist_count <> 1 or v_post_misconception_count <> 1 or v_post_static_fields_count <> 1 then
      raise exception 'Migration 173 post-write verification failed: checklist_match=%, misconception_match=%, static_fields_match=% (all must be 1). Transaction will roll back.', v_post_checklist_count, v_post_misconception_count, v_post_static_fields_count;
    end if;

    raise notice 'Migration 173: eng-inc003-writing-pocketmoney-01 checklist and addresses_misconception corrected and re-verified.';
  elsif v_already_corrected_count = 1 then
    raise notice 'Migration 173: eng-inc003-writing-pocketmoney-01 already carries the corrected checklist/misconception -- safe no-op.';
  else
    raise exception 'Migration 173 refused: row for id=% matches neither the expected PRISTINE (migration-169-authored) state nor the ALREADY-CORRECTED state. No write performed. Investigate before re-running.', v_id;
  end if;
end $$;

commit;
