-- Angel Digital 11+ — Migration 030
-- Educational Increment 003: MR-06 Controlled Content Scale Pilot +
-- Minimum Scale Infrastructure.
--
-- Two parts, both additive, neither touches any existing row's content:
--
-- PART A — minimum viable content-lifecycle schema (Content Scale Gate V1's
-- "provenance", "eligibility", "versioning", "retirement" gaps). Nullable or
-- safely-defaulted columns only. Existing 46 rows are NOT retroactively
-- promoted: family_id/provenance land NULL (unknown history, honestly left
-- unknown rather than guessed), eligibility_status defaults to
-- 'provisional' (their real, already-documented status per
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md — a default that describes
-- reality, not a promotion), content_version defaults to 1, active
-- defaults to true (they are in fact currently live and in use).
--
-- PART B — 6 new MR-06 items (2 families x 3 variants), the pilot content.
--
-- MR-06 ("Precision Under Exact-Match Conditions") is NOT a standalone
-- mathematics topic — verified directly against
-- docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's QT-MR-14
-- entry before writing a single item: "Not a content format in its own
-- right but a scoring condition applying to every Mathematics Question
-- Type... a candidate's final answer must be fully correct to receive the
-- mark, with no partial or method credit" (Asset IDs CSSE-007/012/017,
-- "1 mark for each correct answer", identical wording, 3/3 years, EMC-4).
-- Both families below therefore test the SAME real, evidenced demand
-- (exact final-answer precision, no partial credit for a close answer)
-- rather than inventing a new mathematical domain the evidence does not
-- support.
--
-- Family PRECISION-DECIMAL (division requiring an exact, specified number
-- of decimal places — the common near-miss is truncating instead of
-- rounding, or giving the wrong number of decimal places):
--   precision-dec-01 (seed):    19 / 6  to 2 d.p. = 3.17
--   precision-dec-02 (variant): 13 / 7  to 2 d.p. = 1.86
--   precision-dec-03 (variant): 25 / 6  to 2 d.p. = 4.17
-- Each hand-verified: the third decimal digit is >=5 in every case, so
-- rounding and truncation genuinely disagree (a real, not cosmetic, trap).
--
-- Family PRECISION-EXACT-FRACTION (equal division that does not terminate
-- in decimal — the common near-miss is giving a rounded decimal
-- approximation instead of the exact fraction the question requires):
--   precision-frac-01 (seed):    10m / 3 pieces = 3 1/3 m
--   precision-frac-02 (variant): 20m / 7 pieces = 2 6/7 m
--   precision-frac-03 (variant): 17m / 6 pieces = 2 5/6 m
-- Each hand-verified: none of the three divisions terminate in decimal, so
-- "give an exact answer" is a genuine, not cosmetic, requirement.
--
-- provenance = 'angel_original' (newly authored, not copied or closely
-- paraphrased from any CSSE asset — no CSSE numeric combination or wording
-- reused, per RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md §7).
-- eligibility_status = 'practice_eligible', not 'provisional': each item
-- has a disclosed, non-forced Question Type/competency mapping (QT-MR-14 ->
-- MR-06, argued above from primary evidence) — exactly the bar
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's Provisional -> Practice
-- Eligible transition requires, self-disclosed by the author, which that
-- document explicitly says is acceptable at this stage. NOT
-- mock_eligible — that requires independent (non-author) review and a
-- pool-level balance check, neither of which has happened; the Mock
-- firewall added in this same increment enforces exactly that separation
-- in code, not just in this column's value.
--
-- addresses_misconception is populated for the first time on any row in
-- this table (0/46 existing rows carry it) — the specific, real near-miss
-- each family is designed to catch.
--
-- ali_question_bank has no browser-writable RLS/grant path — this must be
-- applied via Supabase Dashboard > SQL Editor, the same as every other
-- content migration in this project; it cannot be applied from
-- application code or the anon key.

begin;

-- ============================================================
-- PART A — minimum content-lifecycle fields
-- ============================================================

alter table public.ali_question_bank
  add column if not exists family_id text;

alter table public.ali_question_bank
  add column if not exists provenance text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_question_bank_provenance_check'
  ) then
    alter table public.ali_question_bank
      add constraint ali_question_bank_provenance_check
      check (provenance is null or provenance in (
        'angel_original', 'generated_original', 'licensed',
        'public_domain', 'authorised_import', 'evidence_only'
      ));
  end if;
end$$;

alter table public.ali_question_bank
  add column if not exists eligibility_status text not null default 'provisional';

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_question_bank_eligibility_status_check'
  ) then
    alter table public.ali_question_bank
      add constraint ali_question_bank_eligibility_status_check
      check (eligibility_status in (
        'provisional', 'practice_eligible', 'authentic_assessment_candidate',
        'independently_validated', 'mock_eligible'
      ));
  end if;
end$$;

alter table public.ali_question_bank
  add column if not exists content_version integer not null default 1 check (content_version >= 1);

alter table public.ali_question_bank
  add column if not exists active boolean not null default true;

create index if not exists ali_question_bank_family_idx
  on public.ali_question_bank (family_id) where family_id is not null;

create index if not exists ali_question_bank_eligibility_idx
  on public.ali_question_bank (eligibility_status);

-- ============================================================
-- PART B — MR-06 pilot content (2 families, 3 variants each)
-- ============================================================

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception)
values

('precision-dec-01', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-dec-01","marks":1,"skill":"arithmetic","answer":"3.17","question":"19 ÷ 6 = ? Give your answer to 2 decimal places.","workingSteps":["19 ÷ 6 = 3.1666... (repeating)","The third decimal digit is 6, so round the second decimal place up","3.16... rounds to 3.17"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). CSSE mark schemes give one mark for a fully correct final answer with no partial/method credit (Asset IDs CSSE-007/012/017, EMC-4). This item tests whether the learner rounds correctly to the exact requested precision rather than truncating.', 2, 'mr06-precision-decimal',
 'precision-dec', 'angel_original', 'practice_eligible', 1, true,
 'Truncating instead of rounding (giving 3.16, the truncated value, instead of 3.17, the correctly rounded value) — a real near-miss this Question Type is specifically evidenced to penalise with zero partial credit.'),

('precision-dec-02', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-dec-02","marks":1,"skill":"arithmetic","answer":"1.86","question":"13 ÷ 7 = ? Give your answer to 2 decimal places.","workingSteps":["13 ÷ 7 = 1.857142... (repeating)","The third decimal digit is 7, so round the second decimal place up","1.85... rounds to 1.86"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). Same real evidence basis as precision-dec-01; a genuinely different division (13/7, not a repeat of 19/6), same structural trap.', 2, 'mr06-precision-decimal',
 'precision-dec', 'angel_original', 'practice_eligible', 1, true,
 'Truncating instead of rounding (giving 1.85 instead of the correctly rounded 1.86).'),

('precision-dec-03', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-dec-03","marks":1,"skill":"arithmetic","answer":"4.17","question":"25 ÷ 6 = ? Give your answer to 2 decimal places.","workingSteps":["25 ÷ 6 = 4.1666... (repeating)","The third decimal digit is 6, so round the second decimal place up","4.16... rounds to 4.17"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). Same real evidence basis as precision-dec-01/02; a third genuinely different division.', 2, 'mr06-precision-decimal',
 'precision-dec', 'angel_original', 'practice_eligible', 1, true,
 'Truncating instead of rounding (giving 4.16 instead of the correctly rounded 4.17).'),

('precision-frac-01', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-frac-01","marks":1,"skill":"fractions","answer":"3 1/3","question":"A 10m ribbon is cut into 3 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["10 ÷ 3 does not divide evenly","As an exact fraction: 10/3 m","10/3 = 3 remainder 1, so 3 1/3 m"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). CSSE mark schemes require the fully correct exact answer, no partial credit for a close decimal approximation. This item tests whether the learner gives the exact fraction rather than a rounded decimal.', 2, 'mr06-precision-fraction',
 'precision-frac', 'angel_original', 'practice_eligible', 1, true,
 'Giving a rounded decimal approximation (e.g. 3.3 or 3.33) instead of the exact fraction 3 1/3 the question requires — the division does not terminate, so any decimal answer is necessarily inexact.'),

('precision-frac-02', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-frac-02","marks":1,"skill":"fractions","answer":"2 6/7","question":"A 20m rope is cut into 7 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["20 ÷ 7 does not divide evenly","As an exact fraction: 20/7 m","20/7 = 2 remainder 6, so 2 6/7 m"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). Same real evidence basis as precision-frac-01; a genuinely different division (20/7, not a repeat of 10/3).', 2, 'mr06-precision-fraction',
 'precision-frac', 'angel_original', 'practice_eligible', 1, true,
 'Giving a rounded decimal approximation (e.g. 2.9 or 2.86) instead of the exact fraction 2 6/7.'),

('precision-frac-03', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-frac-03","marks":1,"skill":"fractions","answer":"2 5/6","question":"A 17m plank is cut into 6 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["17 ÷ 6 does not divide evenly","As an exact fraction: 17/6 m","17/6 = 2 remainder 5, so 2 5/6 m"]}$json$,
 'Precision-under-exact-match item (QT-MR-14, competency MR-06). Same real evidence basis as precision-frac-01/02; a third genuinely different division.', 2, 'mr06-precision-fraction',
 'precision-frac', 'angel_original', 'practice_eligible', 1, true,
 'Giving a rounded decimal approximation (e.g. 2.8 or 2.83) instead of the exact fraction 2 5/6.')

on conflict (id) do nothing;

commit;
