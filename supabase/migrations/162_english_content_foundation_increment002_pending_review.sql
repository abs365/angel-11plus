-- Angel Digital 11+ — Migration 162
-- English Content Foundation, Increment 002 (Decision 237) — Pending
-- Independent Review Registration.
--
-- Registers the new content from migration 161 (2 passages + their
-- complete 8- and 7-question comprehension sets) as awaiting an
-- independent reviewer — the same proactive placeholder-seeding pattern
-- migrations 099/154 already established.
--
-- TWO rows total — one per passage, NOT one per question. Each
-- Comprehension passage and its complete attached question set is
-- reviewed together as ONE unit, keyed by the passage's own `id` —
-- never approved by reviewing individual questions in isolation, and
-- never registered against `passage_family_id`.
--
-- CORRECTED FROM FIRST APPLICATION, NOT REPEATING THE DECISION 230
-- DEFECT: Decision 230 found migration 154 had registered Increment
-- 001's own two passage rows using `family_id = passage_family_id`
-- (e.g. 'eng-inc001-understudy-narrative') instead of the passage's own
-- `id` (e.g. 'eng-inc001-understudy') — the value `fetchPassageDetail`/
-- `fetchQuestionsForPassage` (lib/adminReview.ts) actually require,
-- making both new passages structurally unreachable through the review
-- surface until migration 155 corrected it after the fact. This
-- migration is authored with that lesson already applied: `family_id`
-- below is EACH PASSAGE'S OWN `id` ('eng-inc002-roboticsfinal',
-- 'eng-inc002-sailandsteam') from the very first application, not its
-- `passage_family_id` — independently re-verified this session against
-- migration 161's own real INSERT statements before writing this file,
-- not assumed from that migration's own header prose.
--
-- review_type = 'mock_english_passage_independent_review' — the SAME
-- value migrations 099/154 already used, not a new one; Increment 002's
-- own passages are reviewed through the same mechanism, disambiguated
-- by a new marker (ENGLISH-CONTENT-FOUNDATION-INC002) and a new,
-- dedicated target-id list in lib/adminReview.ts (see migration 163's
-- accompanying application-code changes), mirroring Decision 231's own
-- established `requireMarker: false` pattern for a passage target
-- (each id is brand-new and never reused for any other purpose, so the
-- `family_id` + `reviewType` pair is already unambiguous on its own).
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — both passages and all 16 new question rows remain
-- 'authentic_assessment_candidate' exactly as migration 161 left them.
-- This migration inserts ONLY placeholder rows recording that review is
-- awaited; it does not itself constitute, preselect, or imply any
-- review decision, and no reviewer identity is fabricated. Per this
-- project's own standing rule (Decision 48/51 precedent), Claude must
-- never impersonate an independent reviewer or self-approve content —
-- this migration performs neither.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 099/154's own exact convention.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md's own Decision 237 entry.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 161.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc002-roboticsfinal', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC002 new content review: passage "The Loose Connection" + its complete 8-numbered-question comprehension set (eng-inc002-roboticsfinal-q01..q06, q07a, q07b, q08)', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc002-roboticsfinal' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC002 new content review: passage "The Loose Connection" + its complete 8-numbered-question comprehension set (eng-inc002-roboticsfinal-q01..q06, q07a, q07b, q08)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc002-sailandsteam', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC002 new content review: passage "Crossing the Atlantic: Sail and Steam" + its complete 7-numbered-question comprehension set (eng-inc002-sailandsteam-q01..q07). Non-fiction: see migration 161''s own FACTUAL VERIFICATION CONTROL header section for the two real-world claims'' evidence basis before approving.', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc002-sailandsteam' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC002 new content review: passage "Crossing the Atlantic: Sail and Steam" + its complete 7-numbered-question comprehension set (eng-inc002-sailandsteam-q01..q07). Non-fiction: see migration 161''s own FACTUAL VERIFICATION CONTROL header section for the two real-world claims'' evidence basis before approving.'
);

commit;
