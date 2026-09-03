-- Angel Digital 11+ — Migration 202
-- Programme Completion Increment 009 — Amendment Verification for
-- eng-pc005-writing-somethingnew ("Something You Would Like to Learn").
--
-- ============================================================
-- WHY THIS IS ITS OWN, SEPARATE MIGRATION
-- ============================================================
-- Migration 157 established review_type = 'amendment_verification' as a
-- deliberately ADDITIVE record, distinct from the approved_with_amendment
-- decision itself -- "confirming whether a recorded amendment was
-- satisfactorily resolved," never folded into the same row. The Founder's
-- own Increment 009 instruction is explicit: "Because this is APPROVED
-- WITH AMENDMENT: do NOT silently convert it to APPROVED. It requires
-- additive AMENDMENT VERIFICATION before final eligibility." This
-- migration is that additive record, and nothing else.
--
-- ============================================================
-- WHAT IS BEING VERIFIED
-- ============================================================
-- Unlike "An Invented Place"'s own amendment (Decision 255/256 -- a real
-- CODE change: checklist context-separation, later verified against the
-- actual implementation), this amendment is a DISCLOSURE requirement, not
-- a content or code change -- the Founder's own instruction: "Do NOT
-- rewrite the learner-facing content. The amendment is evidence/
-- classification disclosure... Persist this limitation appropriately."
-- Verification here therefore means exactly one thing: confirming the
-- disclosure text is genuinely present, verbatim, in the recorded
-- decision (migration 201) -- not confirming a code change, since none
-- was required or made. The DO block below queries the live row inserted
-- by migration 201 and refuses to proceed unless the exact disclosure
-- sentence is found there.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Insert-only against ali_family_review; touches no other table; sets no
-- eligibility_status anywhere; does not alter migration 201's own row.
-- Idempotent (same "where not exists" pattern). Fails closed if migration
-- 201 has not yet been applied, or if its notes do not contain the exact
-- disclosure sentence.
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard SQL Editor,
-- after migration 201.

begin;

do $$
declare
  v_disclosure_present boolean;
begin
  select exists (
    select 1 from public.ali_family_review
    where family_id = 'mock-writing-wc01a-somethingnew'
      and reviewer = 'FOUNDER'
      and decision = 'approved_with_amendment'
      and notes like '%Prospective self-projection is an Angel-original extrapolation within QT-WC-01a''s broader imagination/opinion boundary, not a directly evidenced CSSE topic pattern.%'
  ) into v_disclosure_present;

  if not v_disclosure_present then
    raise exception 'Migration 202 refused: no approved_with_amendment decision carrying the required disclosure sentence was found for mock-writing-wc01a-somethingnew. Apply migration 201 first.';
  end if;
end $$;

insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-somethingnew', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner (Programme Completion Increment 009, session 2026-09-03).' || E'\n\n' ||
  'AMENDMENT VERIFICATION. The amendment required by the approved_with_amendment decision (migration 201) was a disclosure, not a content or code change -- confirmed present, verbatim, in that decision''s own notes (verified at this migration''s own apply-time, see the DO block above). No learner-facing content was rewritten. This record is additive: migration 201''s own approved_with_amendment row is not altered or superseded. Lifecycle now closed; intended destination Practice.',
  'amendment_verification'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-somethingnew' and reviewer = 'FOUNDER' and review_type = 'amendment_verification'
);

commit;
