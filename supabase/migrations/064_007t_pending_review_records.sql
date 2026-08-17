-- Angel Digital 11+ — Migration 064
-- Educational Increment 007T, Post-Migration Reconciliation Part 9 — registers
-- the 6 new families and 5 new passages from migration 063 as awaiting an
-- independent reviewer, using the exact same review_target_type/pending
-- placeholder pattern established by migrations 048/050/052 for every prior
-- English wave. Without this migration, the 6 new families and 5 new
-- passages exist in ali_question_bank/ali_passage_bank but do NOT appear in
-- the /admin-beta/review pending-targets list, since fetchPendingReviewTargets()
-- reads ali_family_review WHERE decision = 'pending_independent_review',
-- not ali_question_bank directly.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status changes;
-- all 34 new questions and 5 new passages remain 'provisional'. This
-- migration inserts ONLY placeholder rows recording that review is awaited
-- — it does not itself constitute, preselect, or imply any review decision.
--
-- Full review evidence for every target named below lives in
-- ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md (Parts 3, 5, 6,
-- 8, 9, 12) and ANGEL_007T_POST_MIGRATION_RECONCILIATION_V1.md.
--
-- Idempotent by construction (WHERE NOT EXISTS per target), matching the
-- established pattern from migrations 042/048/050/052.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, after
-- migrations 062 and 063 have both been applied (confirmed applied by the
-- Founder as of this migration's generation).

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('question_family', 'mr01-whole-number-computation', 'Educational Increment 007T, Part 3/4. 5 provisional questions (mr01-wholenum-01..05). Real evidence basis: QT-MR-01, EMC-4, HIGH — CSSE-006/011/016 Q1-3, opening arithmetic questions, all 3 years. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 3, 4, 8, 9, 10, 12. Dedicated Mathematics MODEL/Guided teaching content has NOT yet been authored for this family — practice-question layer only.'),
    ('question_family', 'mr01-decimal-computation', 'Educational Increment 007T, Part 3/4. 5 provisional questions (mr01-decimal-01..05). Same QT-MR-01 evidence base as whole-number-computation, "decimal arithmetic" explicitly named. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 3, 4, 8, 9, 10, 12. Dedicated Mathematics MODEL/Guided teaching content has NOT yet been authored for this family.'),
    ('question_family', 'mr01-fraction-computation', 'Educational Increment 007T, Part 3/4. 5 provisional questions (mr01-fraction-01..05). Same QT-MR-01 evidence base, "fraction... arithmetic" explicitly named. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 3, 4, 8, 9, 10, 12. Dedicated Mathematics MODEL/Guided teaching content has NOT yet been authored for this family.'),
    ('question_family', 'mr01-multistep-order-of-operations', 'Educational Increment 007T, Part 3/4. 5 provisional questions (mr01-multistep-01..05). QT-MR-01''s own "Supporting Competencies: MR-06" signals this combined-operation direction. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 3, 4, 8, 9, 10, 12. Dedicated Mathematics MODEL/Guided teaching content has NOT yet been authored for this family.'),
    ('question_family', 'wave3-fam-rc10-word-choice', 'Educational Increment 007T, Part 5/7. 8 provisional questions across 5 new passages. Real evidence basis: QT-RC-10, EMC-3, MEDIUM — CSSE-013 (2021) Q4/Q9, CSSE-008 (2022) Q8/9/11/14/16. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 5, 7, 8, 9, 10, 12.'),
    ('question_family', 'wave3-fam-rc10-atmosphere-mood', 'Educational Increment 007T, Part 5/7. 6 provisional questions across 5 new passages. Same QT-RC-10 evidence base — CSSE''s own worked example ("quiet-house description suggests coming event") is exactly this pattern. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Parts 5, 7, 8, 9, 10, 12.'),
    ('passage', 'wave3-eng-emptyclassroom', 'Educational Increment 007T, Part 6. Original contemporary-realistic-fiction, 138 words, used by both new QT-RC-10 families. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 6.'),
    ('passage', 'wave3-eng-bakersapprentice', 'Educational Increment 007T, Part 6. Original contemporary-realistic-fiction, 158 words, used by wave3-fam-rc10-word-choice only. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 6.'),
    ('passage', 'wave3-eng-lettertograndad', 'Educational Increment 007T, Part 6. Original epistolary-fiction (personal-letter register), 156 words, used by both new QT-RC-10 families — the only non-narrative-fiction genre in this batch. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 6.'),
    ('passage', 'wave3-eng-stormharbour', 'Educational Increment 007T, Part 6. Original contemporary-realistic-fiction, 149 words, used by both new QT-RC-10 families. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 6.'),
    ('passage', 'wave3-eng-newtrainers', 'Educational Increment 007T, Part 6. Original contemporary-realistic-fiction, 118 words, used by wave3-fam-rc10-word-choice only. Review evidence pack: ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 6.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = v.review_target_type
    and existing.family_id = v.family_id
    and existing.decision = 'pending_independent_review'
);

commit;
