-- Angel Digital 11+ — Review Closure Cross-Check (READ-ONLY)
-- Returns the FULL ali_family_review history (append-only: pending
-- placeholder row + real decision row) for all 19 review targets from
-- migrations 171/172/175/177/180, so the Founder-reported "19 of 19
-- Approved" UI summary can be verified against the persisted evidence
-- rather than accepted on the UI's word alone. SELECT only.

with target_markers as (
  select id, marker from (values
    ('mock-mr11-impossibletotal', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT007'),
    ('mock-mr05-numberpyramid', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008'),
    ('mock-mr13-toppingcombos', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008'),
    ('mock-mr06-agenarrative', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008'),
    ('mock-mr12-weightedmeancombine', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009'),
    ('mock-mr12-weightedmeanreverse', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009'),
    ('eng-inc003-writing-wc01a-favouriteplace', 'WRITING-DEPTH-EXTENSION-DECISION259'),
    ('eng-inc003-writing-wc01a-pocketmoney', 'WRITING-DEPTH-EXTENSION-DECISION259'),
    ('wave1-eng-kitemaker', 'READING-REMEDIATION-WAVE1'),
    ('wave1-eng-lastbus', 'READING-REMEDIATION-WAVE1'),
    ('wave1-eng-newgirl', 'READING-REMEDIATION-WAVE1'),
    ('wave1-eng-atticdoor', 'READING-REMEDIATION-WAVE1'),
    ('wave1-eng-raceday', 'READING-REMEDIATION-WAVE1'),
    ('wave1-eng-lettertonana', 'READING-REMEDIATION-WAVE1'),
    ('wave3-eng-emptyclassroom', 'READING-REMEDIATION-WAVE3'),
    ('wave3-eng-bakersapprentice', 'READING-REMEDIATION-WAVE3'),
    ('wave3-eng-lettertograndad', 'READING-REMEDIATION-WAVE3'),
    ('wave3-eng-stormharbour', 'READING-REMEDIATION-WAVE3'),
    ('wave3-eng-newtrainers', 'READING-REMEDIATION-WAVE3')
  ) as t(id, marker)
)

-- 1. Full history per target: every row (pending placeholder + any real
--    decision), oldest first, so the append-only sequence is visible.
select
  tm.marker as batch,
  r.family_id,
  r.review_target_type,
  r.review_type,
  r.decision,
  r.reviewer,
  r.created_at,
  left(r.notes, 60) as notes_preview
from target_markers tm
join public.ali_family_review r on r.family_id = tm.id
order by tm.marker, r.family_id, r.created_at;

-- 2. Latest decision only, one row per target (what actually governs
--    today), plus whether the original pending row is still present
--    (append-only history preserved) and a decision-total summary.
select
  tm.marker as batch,
  tm.id as target,
  latest.decision as latest_decision,
  latest.reviewer as latest_reviewer,
  latest.created_at as latest_decision_at,
  exists (
    select 1 from public.ali_family_review p
    where p.family_id = tm.id and p.decision = 'pending_independent_review'
  ) as pending_history_row_preserved
from target_markers tm
cross join lateral (
  select decision, reviewer, created_at
  from public.ali_family_review r
  where r.family_id = tm.id
    and r.decision <> 'pending_independent_review'
  order by created_at desc
  limit 1
) latest
order by tm.marker, tm.id;

-- 3. Decision totals across all 19 (the exact counts the Founder asked
--    to confirm).
select
  latest.decision,
  count(*) as target_count
from target_markers tm
cross join lateral (
  select decision
  from public.ali_family_review r
  where r.family_id = tm.id
    and r.decision <> 'pending_independent_review'
  order by created_at desc
  limit 1
) latest
group by latest.decision
order by latest.decision;

-- 4. Any of the 19 with NO real decision at all yet (outstanding).
select tm.marker as batch, tm.id as target
from target_markers tm
where not exists (
  select 1 from public.ali_family_review r
  where r.family_id = tm.id and r.decision <> 'pending_independent_review'
)
order by tm.marker, tm.id;
