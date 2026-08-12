-- Angel Digital 11+ — Migration 035
-- Educational Increment 005, Parts E/F: transfer classification and
-- mixed-skill attribution — minimum schema support only.
--
-- Adds two nullable, safely-defaulted fields:
--   transfer_class: ROUTINE | NEAR_TRANSFER | FAR_TRANSFER | MIXED_TRANSFER
--   supporting_competencies: text[] — competency codes supporting (not
--     primary to) this item, e.g. a compound question whose primary
--     competency is MR-04 but which also draws on MR-01.
--
-- Retroactively classifies Wave 1's 29 items honestly, not speculatively:
--   - mr02-sequence-rule's "-inv" (inverse) variants are genuine
--     NEAR_TRANSFER of their "-fwd" sibling (same rule, same family,
--     reversed direction — the textbook definition of near transfer per
--     this programme's own MATHEMATICS_LESSON_002_LEARNING_DESIGN.md
--     precedent).
--   - Every other Wave 1 item (mr02-substitution, mr03-angle-sum,
--     mr05-number-property, mr05-number-property-search) is ROUTINE —
--     each applies its family's method directly, with no requirement to
--     recognise which method is needed (that recognition demand is
--     exactly what would make an item FAR_TRANSFER, and none of Wave 1's
--     items were designed with that demand).
-- No FAR_TRANSFER or MIXED_TRANSFER item exists in the bank yet — this
-- migration does not fabricate one merely to populate the enum. That
-- content is explicitly deferred to a future wave (Educational Increment
-- 005 report, "Remaining Mathematics gaps").
--
-- ali_question_bank has no browser-writable RLS/grant path — apply via
-- Supabase Dashboard > SQL Editor, same as every other migration.

begin;

alter table public.ali_question_bank
  add column if not exists transfer_class text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_question_bank_transfer_class_check'
  ) then
    alter table public.ali_question_bank
      add constraint ali_question_bank_transfer_class_check
      check (transfer_class is null or transfer_class in (
        'ROUTINE', 'NEAR_TRANSFER', 'FAR_TRANSFER', 'MIXED_TRANSFER'
      ));
  end if;
end$$;

alter table public.ali_question_bank
  add column if not exists supporting_competencies text[];

-- Retroactive classification of Wave 1 (migration 031's 29 items).
update public.ali_question_bank
set transfer_class = 'NEAR_TRANSFER'
where id in ('mr02-seq-01-inv', 'mr02-seq-02-inv', 'mr02-seq-03-inv', 'mr02-seq-04-inv', 'mr02-seq-05-inv');

update public.ali_question_bank
set transfer_class = 'ROUTINE'
where id in (
  'mr02-seq-01-fwd', 'mr02-seq-02-fwd', 'mr02-seq-03-fwd', 'mr02-seq-04-fwd', 'mr02-seq-05-fwd',
  'mr02-sub-01', 'mr02-sub-02', 'mr02-sub-03', 'mr02-sub-04', 'mr02-sub-05',
  'mr03-ang-01', 'mr03-ang-02', 'mr03-ang-03', 'mr03-ang-04', 'mr03-ang-05', 'mr03-ang-06', 'mr03-ang-07',
  'mr05-tf-01', 'mr05-tf-02', 'mr05-tf-03', 'mr05-tf-04', 'mr05-tf-05',
  'mr05-search-01', 'mr05-search-02'
);

commit;
