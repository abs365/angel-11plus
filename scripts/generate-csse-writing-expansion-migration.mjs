#!/usr/bin/env node
/**
 * CSSE Completion, Priority 4 -- emits migration 268 (NOT APPLIED) from the typed prompt definitions in
 * lib/ali/questionFactory/csseWritingExpansion.ts.
 *
 * The migration only REGISTERS the prompts as 'authentic_assessment_candidate' (not learner-reachable, exactly like
 * migrations 257/258 before the Treehouse Lantern was approved) and records one pending-review row per family. It
 * promotes nothing. Promotion to practice_eligible is a separate, later migration the Founder applies only for the
 * prompts they approve (migration 269 template emitted alongside, with every id commented OUT by default).
 *
 * Run: npx tsx scripts/generate-csse-writing-expansion-migration.mjs
 */
import fs from "node:fs";
import { CSSE_WRITING_EXPANSION, toStoredPromptJson } from "../lib/ali/questionFactory/csseWritingExpansion.ts";

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const rows = CSSE_WRITING_EXPANSION.map((p) => {
  const json = JSON.stringify(toStoredPromptJson(p));
  if (json.includes("$json$")) throw new Error(`${p.id}: prompt JSON contains the dollar-quote tag`);
  return ` (${q(p.id)}, 'writing', ${q(p.skill)}, array['csse'], 'hard', 'open-response', 1500,\n  $json$${json}$json$,\n  ${q(p.authorNote)},\n  3, ${q(p.id)},\n  ${q(p.familyId)}, 'angel_original', 'authentic_assessment_candidate', 1, true,\n  ${q(p.addressesMisconception)},\n  ${q(p.transferClass)})`;
});

const reviewNote = (p) =>
  `CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "${p.title}" (${p.skill}). Awaiting independent educational review before any promotion to Practice. ${p.skill === "QT-WC-01b" ? "Picture-led: judge whether the picture offers enough story to write (Riverboat precedent) and approve the illustration itself." : "Reflective/discursive: judge topic suitability for a Year 5-6 learner and that it asks for the writer's own experience or view."}`;

const migration268 = `-- Angel Digital 11+ -- Migration 268 (PREPARED, NOT APPLIED)
-- CSSE Completion, Priority 4 -- Continuous Writing expansion: candidate registration.
--
-- WHAT THIS DOES
--   Registers ${CSSE_WRITING_EXPANSION.length} new Writing prompts (${CSSE_WRITING_EXPANSION.filter((p) => p.skill === "QT-WC-01a").length} reflective/discursive QT-WC-01a, ${CSSE_WRITING_EXPANSION.filter((p) => p.skill === "QT-WC-01b").length} picture-led QT-WC-01b) in ali_question_bank as
--   'authentic_assessment_candidate' -- NOT learner-reachable, NOT Practice, NOT Mock -- exactly as migrations 257/258
--   registered the Treehouse Lantern before the Founder approved it, and inserts one 'pending_independent_review'
--   ali_family_review row per family so each appears on /admin-beta/review.
--   The three picture prompts reference original SVG illustrations already committed under
--   public/practice-assets/writing-picture-narrative/.
--
-- WHAT THIS DOES NOT DO
--   Promotes nothing. No eligibility_status is changed on any existing row. No Mock row is touched. No reviewer or
--   decision is fabricated. Idempotent: every insert is guarded (on conflict do nothing / where not exists).
--
-- PREREQUISITES: the deploy containing the SVG files must be live before the Founder reviews the pictures.
-- NEXT STEP: Founder reviews at /admin-beta/review, then applies migration 269 (template) for the approved ids only.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
${rows.join(",\n")}
on conflict (id) do nothing;

${CSSE_WRITING_EXPANSION.map(
  (p) => `insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', ${q(p.familyId)}, 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  ${q(reviewNote(p))},
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = ${q(p.familyId)} and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);`
).join("\n\n")}

commit;
`;

const idList = CSSE_WRITING_EXPANSION.map((p) => `    -- '${p.id}',   -- ${p.title}`).join(String.fromCharCode(10));
const migration269 = `-- Angel Digital 11+ -- Migration 269 (TEMPLATE, NOT APPLIED -- lives in scripts/output, not supabase/migrations)
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
${idList}
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
`;

fs.writeFileSync("supabase/migrations/268_csse_writing_expansion_candidates_pending_review.sql", migration268);
fs.mkdirSync("scripts/output/csse-writing-expansion", { recursive: true });
fs.writeFileSync("scripts/output/csse-writing-expansion/269_promotion_TEMPLATE.sql", migration269);
console.log("written 268 (" + migration268.length + " bytes) and 269 template; prompts:", CSSE_WRITING_EXPANSION.length);
