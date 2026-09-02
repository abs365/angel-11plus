-- Angel Digital 11+ — Verification for Migration 189
-- Gate 3 Closure Wave, Defect B — mr03-mix-04 area-answer unit correction.
--
-- Read-only. Safe to run before OR after migration 189 is applied.
-- Run in: Supabase Dashboard > SQL Editor > New query.

select
  id,
  prompt->>'question' as question_text,
  prompt->>'answer' as answer_text,
  family_id,
  eligibility_status,
  pathway,
  active,
  content_version,
  -- (1) exactly the intended row
  (id = 'mr03-mix-04') as is_intended_row,
  -- (2) canonical answer now carries the intended area unit
  (prompt->>'answer' = '180 m²') as answer_is_corrected,
  -- (3) family/question identity unchanged
  (family_id = 'mr03-mixed-perimeter') as family_unchanged,
  (prompt->>'question' = 'A rectangular playground has a perimeter of 54m. One side is 15m. What is the area?') as question_unchanged,
  -- (4) no eligibility/pathway/content-state field changed from its
  -- established post-migration-068 value
  (eligibility_status = 'practice_eligible') as eligibility_unchanged,
  (pathway = array['csse']) as pathway_unchanged,
  (active = true) as active_unchanged,
  (content_version = 1) as content_version_unchanged,
  -- (5) migration is in the intended applied state
  case
    when prompt->>'answer' = '180 m²' then 'APPLIED'
    when prompt->>'answer' = '180' then 'NOT YET APPLIED'
    else 'UNEXPECTED STATE — investigate before reapplying'
  end as migration_189_state
from public.ali_question_bank
where id = 'mr03-mix-04';
