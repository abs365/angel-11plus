import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";
import fs from "node:fs";

function normalise(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}
function sqlDollarQuote(text) {
  // None of these six passages contain the literal token "$passage$" --
  // verified below before use, matching migration 045's own convention.
  if (text.includes("$passage$")) {
    throw new Error("Passage text contains the dollar-quote delimiter itself -- cannot safely embed.");
  }
  return `$passage$${text}$passage$`;
}

const TEXT_TYPE = {
  "ei003-w2-eng-the-relay-baton": "narrative-extract",
  "ei003-w2-eng-the-last-delivery": "narrative-extract",
  "ei003-w2-eng-the-glass-frog": "informational",
  "ei003-w2-eng-the-clock-that-stopped": "narrative-extract",
  "ei003-w2-eng-crossing-the-fen": "narrative-extract",
  "ei003-w2-eng-the-attic-workshop": "narrative-extract",
};

const rows = EI003_WAVE2_PASSAGES.map((p) => {
  const text = normalise(p.text);
  return {
    id: p.id,
    title: p.title,
    text,
    textType: TEXT_TYPE[p.id],
    genre: p.genre,
    wordCount: wordCount(text),
  };
});

const valuesSql = rows
  .map(
    (r) => `('${r.id}', '${r.title.replace(/'/g, "''")}',
   ${sqlDollarQuote(r.text)},
   '${r.textType}', '${r.genre}', ${r.wordCount}, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null)`
  )
  .join(",\n  ");

const idListSql = rows.map((r) => `'${r.id}'`).join(", ");

const preconditionChecks = rows
  .map(
    (r) => `  if exists (select 1 from public.ali_passage_bank where id = '${r.id}') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = '${r.id}'
        and title = '${r.title.replace(/'/g, "''")}'
        and regexp_replace(original_text, E'\\r\\n|\\r', E'\\n', 'g') = regexp_replace(${sqlDollarQuote(r.text)}, E'\\r\\n|\\r', E'\\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', '${r.id}';
    end if;
  end if;`
  )
  .join("\n");

const postconditionChecks = rows
  .map(
    (r) => `  if not exists (
    select 1 from public.ali_passage_bank
    where id = '${r.id}'
      and title = '${r.title.replace(/'/g, "''")}'
      and regexp_replace(original_text, E'\\r\\n|\\r', E'\\n', 'g') = regexp_replace(${sqlDollarQuote(r.text)}, E'\\r\\n|\\r', E'\\n', 'g')
      and word_count = ${r.wordCount}
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', '${r.id}';
  end if;`
  )
  .join("\n");

const sql = `-- Angel Digital 11+ — Migration 241
-- Educational Increment 003, Wave 2 — bounded passage-bank registration.
--
-- Purpose: register the SIX approved, original EI003 Wave 2 English
-- passages into public.ali_passage_bank, and nothing else. This is the
-- single missing prerequisite blocking submit_question_candidate() for
-- the 40 already-designed, already-validated, already-human-reviewed
-- Wave 2 candidates (commit b3c6bfa) -- their
-- ali_question_candidate.passage_id foreign key
-- (ali_question_candidate_passage_id_fkey) requires each referenced
-- passage_id to already exist in this table, confirmed live via a real,
-- side-effect-free submission attempt that failed with Postgres error
-- 23503 for all 8 candidates in the first bounded batch (0/40 stored,
-- 0 residual rows -- see the Founder's own "BOUNDED PASSAGE REGISTRATION
-- REPAIR" instruction for full context).
--
-- Scope, explicitly bounded: this migration ONLY inserts into
-- ali_passage_bank, for exactly the six passage ids named below. It does
-- NOT submit, review, or publish any candidate; does NOT alter
-- submit_question_candidate(), publish_question_candidate(), RLS, or the
-- passage_id foreign key; does NOT modify any historical passage row.
--
-- Root cause / passage-registration contract, confirmed via direct
-- inspection of migration 043 (the original CREATE TABLE) and migration
-- 054 (which enabled RLS on ali_passage_bank with an admin-only SELECT
-- policy and explicitly NO insert/update/delete policy of any kind --
-- "Passage authoring and any correction remain Founder-applied
-- migrations, exactly as before"), and re-confirmed live: an
-- authenticated admin session's own attempted INSERT was rejected with
-- Postgres error 42501 ("new row violates row-level security policy"),
-- zero residual rows. Every existing passage in this table (34 rows as
-- of this writing) was registered the same way, via a direct,
-- Founder-applied SQL migration (precedent: migrations 044, 045, 049,
-- 051, 063, 097, 152, 161, 166, 191, and others) -- there has never been,
-- and still is not, any governed RPC for passage authoring. This
-- migration follows that exact precedent, most directly migration 045's
-- own idempotent, dollar-quoted-literal, WHERE NOT EXISTS pattern.
--
-- CRLF/LF integrity: this repository's own .gitattributes ("* text=auto")
-- combined with core.autocrlf=true on the authoring machine means a
-- committed .sql file's *working-directory* copy can carry different
-- line-ending bytes than its git-stored blob. The six passage texts
-- below were generated programmatically, directly from the same
-- lib/ali/questionFactory/ei003Wave2Passages.ts source the 40 candidates'
-- evidence quotes were themselves validated against (confirmed
-- byte-for-byte to already contain 0 CRLF sequences), and every literal
-- is additionally wrapped in regexp_replace(..., E'\\r\\n|\\r', E'\\n', 'g')
-- at comparison/assertion time as a second, defensive layer -- so this
-- migration's correctness does not depend on the exact bytes surviving
-- any copy/paste step untouched.
--
-- Fail-closed preconditions (no ON CONFLICT DO UPDATE anywhere in this
-- file): for each of the six target ids, if a row with that id ALREADY
-- exists, this migration verifies its title and (CRLF-normalised)
-- original_text match the expected passage exactly -- if they do not,
-- the whole migration raises an exception and rolls back rather than
-- silently reusing or overwriting a different passage under the same
-- id. Only once every precondition passes does the (idempotent, missing
-- rows only) insert run, followed by a postcondition assertion that all
-- six rows now exist with the expected material fields.
--
-- Deliberately left null (no fabricated value): content_difficulty and
-- reading_complexity (these six passages are written to support
-- questions spanning easy through challenge, so no single passage-level
-- difficulty label would be genuine -- two existing production rows,
-- eng-inc002-emperor-penguins and eng-inc002-journey-of-recycled-paper,
-- already use null for both, so this is a precedented choice, not a new
-- gap) and passage_family_id (Wave 2 designed an educational
-- family/blueprint taxonomy on a different axis -- wave3-fam-rc06-... --
-- and did not design an equivalent passage_family_id grouping; assigning
-- one now would be invented, not real, metadata).
--
-- eligibility_status is deliberately 'provisional' (the default for
-- every passage at registration, per migration 043 and every precedent
-- migration) -- promotion to practice_eligible is always a separate,
-- later, explicitly-governed step (precedent: migration 221), and is
-- NOT part of this migration's scope.
--
-- Word counts: computed programmatically from the same normalised text
-- being inserted (relay-baton 390, last-delivery 424, glass-frog 374,
-- clock-that-stopped 405, crossing-the-fen 392, attic-workshop 396).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, per the existing
-- passage-registration precedent. Not applied by this task -- no
-- service-role credential was used, and no browser/RPC write was
-- attempted against this table (a live RLS-rejection probe independently
-- confirmed no such path exists, see this migration's own header above).

begin;

do $$
begin
${preconditionChecks}
end$$;

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
select v.id, v.title, v.original_text, v.text_type, v.genre, v.word_count, v.reading_complexity,
       v.provenance, v.copyright_status, v.pathway, v.content_difficulty, v.content_version,
       v.eligibility_status, v.active, v.passage_family_id, v.review_state
from (
  values
  ${valuesSql}
) as v(id, title, original_text, text_type, genre, word_count, reading_complexity,
       provenance, copyright_status, pathway, content_difficulty, content_version,
       eligibility_status, active, passage_family_id, review_state)
where not exists (
  select 1 from public.ali_passage_bank existing where existing.id = v.id
);

do $$
begin
  if (select count(*) from public.ali_passage_bank where id in (${idListSql})) <> 6 then
    raise exception 'Migration 241 postcondition failed: expected exactly 6 EI003 Wave 2 passage rows to exist after this migration, found a different count.';
  end if;

${postconditionChecks}
end$$;

commit;
`;

fs.writeFileSync(new URL("../supabase/migrations/241_ei003_wave2_passage_bank_registration.sql", import.meta.url), sql);
console.log("Wrote supabase/migrations/241_ei003_wave2_passage_bank_registration.sql");
console.log("Row word counts:", Object.fromEntries(rows.map((r) => [r.id, r.wordCount])));
