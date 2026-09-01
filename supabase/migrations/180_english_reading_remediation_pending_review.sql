-- Angel Digital 11+ — Migration 180
-- English Reading Remediation (Wave 1 + Wave 3) — Consolidated Pending
-- Review Registration (Founder Completion and Readiness Programme,
-- Reading Integrity Reconciliation, 2026-09-01).
--
-- Registers all 11 passages touched by migrations 178 (Wave 1, 12 new
-- rows across 6 passages) and 179 (Wave 3, 10 new rows across 5
-- passages) for independent review, as ONE consolidated batch — per the
-- Founder's explicit instruction not to create 11 separate review
-- chains. Each passage's own review target names the NEW rows only
-- (existing, already-reviewed content for wave1's 36 live rows, and the
-- existing wave3 14 rows, is not re-registered or re-reviewed by this
-- migration — those approvals remain untouched and authoritative, per
-- the Founder's own instruction that historical reviews must not be
-- overwritten).
--
-- review_type = 'mock_english_passage_independent_review' — the SAME
-- value every prior passage-level review in this project has used
-- (migrations 099/154/162/168), not a new one. reviewer is explicitly
-- 'UNASSIGNED'. No row's eligibility_status changes anywhere.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 11 rows (one per passage), never touches
-- ali_question_bank, cannot change eligibility_status, cannot activate
-- Practice or Mock, and cannot manufacture an Approved review (every
-- decision value inserted is 'pending_independent_review').
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migrations 178/179.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', v.passage_id, 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  v.note, 'mock_english_passage_independent_review'
from (values
  ('wave1-eng-kitemaker', 'READING-REMEDIATION-WAVE1 new companion question review: "The Kite Maker" +2 new questions (w1-kitemaker-08 RC-10 effect-of-language, w1-kitemaker-09 RC-02 motive-inference). Existing 7 rows (migration 044) unchanged, not re-reviewed -- their prior approval stands. wave1-fam-tick-justify row (w1-kitemaker-04) explicitly NOT included, remains excluded per standing Founder instruction.'),
  ('wave1-eng-lastbus', 'READING-REMEDIATION-WAVE1 new companion question review: "The Last Bus" +2 new questions (w1-lastbus-08 RC-10, w1-lastbus-09 RC-07 comparative). Existing 7 rows unchanged, not re-reviewed. tick-justify row (w1-lastbus-04) NOT included.'),
  ('wave1-eng-newgirl', 'READING-REMEDIATION-WAVE1 new companion question review: "The New Girl" +2 new questions (w1-newgirl-08 RC-07, w1-newgirl-09 RC-02 motive-inference). Existing 7 rows unchanged, not re-reviewed. tick-justify row (w1-newgirl-04) NOT included.'),
  ('wave1-eng-atticdoor', 'READING-REMEDIATION-WAVE1 new companion question review: "The Attic Door" +2 new questions (w1-atticdoor-08 RC-10, w1-atticdoor-09 RC-02 motive-inference). Existing 7 rows unchanged, not re-reviewed. tick-justify row (w1-atticdoor-04) NOT included.'),
  ('wave1-eng-raceday', 'READING-REMEDIATION-WAVE1 new companion question review: "Race Day" +2 new questions (w1-raceday-08 RC-07, w1-raceday-09 RC-10). Existing 7 rows unchanged, not re-reviewed. Note: w1-raceday-05 (an EXISTING, already-live row) is the sibling row named in the Reading Integrity Report''s self-assessment-validity finding -- unchanged, not touched, flagged here only for the reviewer''s awareness since it shares this passage.'),
  ('wave1-eng-lettertonana', 'READING-REMEDIATION-WAVE1 new companion question review: "A Letter to Nana" +2 new questions (w1-letter-08 RC-07, w1-letter-09 RC-02 motive-inference). Existing 7 rows unchanged, not re-reviewed. tick-justify row (w1-letter-04) NOT included.'),
  ('wave3-eng-emptyclassroom', 'READING-REMEDIATION-WAVE3 new companion question review: "The Empty Classroom" +2 new questions (w3-rc01-emptyclassroom-01 RC-01 retrieval, w3-rc08-emptyclassroom-01 RC-08 emotion). Existing 4 QT-RC-10 rows (migration 063) unchanged, not re-reviewed -- their prior approval (Decision 73) stands.'),
  ('wave3-eng-bakersapprentice', 'READING-REMEDIATION-WAVE3 new companion question review: "The Baker''s Apprentice" +2 new questions (w3-rc01-bakersapprentice-01, w3-rc07-bakersapprentice-01 comparative). Existing 2 rows unchanged, not re-reviewed.'),
  ('wave3-eng-lettertograndad', 'READING-REMEDIATION-WAVE3 new companion question review: "Letter to Grandad" +2 new questions (w3-rc01-lettertograndad-01, w3-rc06-lettertograndad-01 sequencing). Existing 3 rows unchanged, not re-reviewed.'),
  ('wave3-eng-stormharbour', 'READING-REMEDIATION-WAVE3 new companion question review: "The Storm at the Harbour" +2 new questions (w3-rc01-stormharbour-01, w3-rc08-stormharbour-01). Existing 3 rows unchanged, not re-reviewed.'),
  ('wave3-eng-newtrainers', 'READING-REMEDIATION-WAVE3 new companion question review: "The New Trainers" +2 new questions (w3-rc01-newtrainers-01, w3-rc07-newtrainers-01 comparative). Existing 2 rows unchanged, not re-reviewed.')
) as v(passage_id, note)
where not exists (
  select 1 from public.ali_family_review
  where family_id = v.passage_id and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = v.note
);

commit;
