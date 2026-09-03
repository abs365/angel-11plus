# Angel 11+ English — Programme Completion Increment 009: Writing Review Persistence and Controlled Activation Preparation

**Session date:** 3 September 2026. **New this increment:** migrations `201`, `202`, `203` (supersedes `200`), `204`, each with a test file. No prompt content authored or rewritten. No migration applied.

---

## 1. Review architecture role-boundary evidence

**Source:** `knowledge/.../RELEASE_1_VALIDATION_STRATEGY.md` §"Validation Ownership": *"No stage above may be self-certified by whoever **authored the content** or built the timing model"* — its own worked example of the defect this closes: *"the sole 'reviewer' of all 18 items was the same **work package** that authored the tagging."* `ali_family_review`'s own table comment (migration 034): *"A reviewer must not be the family's own author"*, enforced procedurally, not by a DB column naming an "author."

**Finding:** the rule targets the *content-authoring process* (in this codebase, the AI agent producing migrations), not the Founder. Every prior successfully-promoted Writing row (migrations 103, 160, 181) was authored this way and reviewed by the Founder via the live `/admin-beta/review` surface — this is the sole, unbroken, established pattern; no separate third-party human identity has ever been used or required anywhere in this codebase's history. **`/admin-beta/review`, with the Founder acting as reviewer, is the established, sufficient mechanism.** No new review architecture is invented; none is needed.

## 2. Founder-decision persistence plan

Your 7 written decisions (Increment 008/009) are genuine, but were not entered through the live UI — persisting them required an honest choice between (a) leaving them undocumented pending a future live-UI pass, or (b) writing them into `ali_family_review` via migration, with the provenance made unmistakable. Chose (b), since you explicitly asked for "the correct persistence mechanism." **Migration 201** inserts all 7 as real decisions, `reviewer = 'FOUNDER'`, each `notes` field stating plainly *"Not represented as a live /admin-beta/review submission — recorded from a written Founder governance directive"* — so this provenance is never mistaken for a UI click, satisfying "Founder approval and independent review history must remain distinguishable."

## 3. Amendment lifecycle for 199 (`somethingnew`)

Migration 201 records `approved_with_amendment` for `mock-writing-wc01a-somethingnew`, with `notes` carrying your exact disclosure sentence verbatim, formatted to satisfy migration 157's own database constraint (`Reviewer qualification: ...` + a genuine blank-line separator + content — the DB literally rejects `approved_with_amendment` without this shape). **Migration 202** is the separate, additive `amendment_verification` record migration 157 requires — it fails closed unless it first finds the exact disclosure sentence already persisted by 201, then records that the amendment (a disclosure, not a code/content change — none was needed) is closed. 201's own row is never altered.

## 4. Final 169 → 173 → 172 execution package

Unchanged from Increment 007/008 — still the correct, only-permitted sequence, still not applied. Full purpose/dependency table and single combined verification query already delivered (Increment 007 §4); reproduced in the combined query below (§12).

## 5. 198/199 execution package

Both remain **NOT APPLIED**, exactly as authored and Founder-approved (198 unchanged; 199 unchanged — no content rewrite, per your explicit instruction). They must land before migration 201 (which references both rows).

## 6. Migration-200 disposition: corrected and superseded

**Migration 200 is not applied and is now superseded — do not apply it.** Its own precondition (`eligibility_status = 'authentic_assessment_candidate'` only) could not distinguish "genuinely review-closed" from "still merely a candidate," which matters specifically for `somethingnew`'s amendment-pending status. **Migration 203** replaces it: same 5 target ids, but additionally requires, per id, a real closed decision in `ali_family_review` (`approved`, or `approved_with_amendment` **plus** a separate `amendment_verification` row) before promoting — it will refuse, naming the exact id, if 201/202 haven't landed yet for any of them. Migration 200's file is left untouched (an inert historical artifact, not silently rewritten).

## 7. Exact Practice pool after authorised decisions

Once 169→173→172, 198/199, 201, 202, **203**, and **204** (new — see below) are all applied:

| ID | Eligibility after full sequence |
|---|---|
| `eng-inc003-writing-imaginedplace-01` | `practice_eligible` |
| `eng-inc003-writing-favouriteplace-01` | `practice_eligible` |
| `eng-inc003-writing-pocketmoney-01` | `practice_eligible` |
| `eng-pc005-writing-personinfluence` | `practice_eligible` |
| `eng-pc005-writing-somethingnew` | `practice_eligible` |
| `mock-writing-newplace-01` | `practice_eligible` (new: migration 204, the first-ever `independently_validated → practice_eligible` transition, explicitly authorised for these 2 rows only, per your item-4 decision and its provenance basis — migration 153's own header frames this batch as authored for "sustained multi-month use," unlike migration 098's explicit "Mock Programme" framing) |
| `mock-writing-mistakelearned-01` | `practice_eligible` (migration 204) |

**Practice count: 7.** **Response-shape distribution** (gate field): 5 descriptive, 2 narrative. **True purpose-register distribution:** invention (imaginedplace), place (favouriteplace), opinion-two-position (pocketmoney), person (personinfluence), prospective (somethingnew), event/arrival-change (newplace), event/single-moment (mistakelearned) — **7 rows, 7 distinct registers**, zero duplication in the live pool.

## 8. Exact protected reserve

Per your explicit floor plus this session's own finding: `mock-writing-mindchange-01`, `mock-writing-kindness-01`, `mock-writing-cookopinion-01`, `eng-pc003-writing-difficulttask`, `eng-pc003-writing-meaningfulplace` — **5 rows**, all content-approved (migration 201, for the two new ones; historical decisions for the three old ones), none promoted. **`mock-writing-screentime-01` remains REVISE** — not counted as reserve or Practice capacity, per your explicit instruction not to count unresolved content.

## 9. Remaining Writing content gaps

- **No single-position opinion prompt in the live Practice pool** — `cookopinion` is reserved (Mock-origin provenance), `screentime` (its would-be successor) needs revision, `pocketmoney` is structurally two-position, not single. **This is now a documented future content gap, explicitly not solved this increment**, per your own instruction.
- `screentime` still needs a migration-173-style checklist correction before it can be considered for any destination — not authored this increment.
- The Mock/Practice boundary question is now resolved for these 6 specific rows (your decision), but the underlying tension (no live Mock Writing renderer exists to ever consume the reserved rows) remains philosophically open for future Mock-programme planning — noted, not re-litigated.

## 10. `/writing` activation readiness

**Still NOT MET, and will remain not met even after the full migration sequence above is applied**, until every one of your item-9 conditions is separately verified: review lifecycle closure (would be true, once 201-204 apply) and approved Practice allocation (would be true) are necessary but not sufficient — adequate diversity is now genuinely strong (7 registers/7 rows), but protected-reserve retention, evidence-pipeline integrity, Guided Practice, Independent Practice, and **mobile/tablet learner experience have not been re-verified this increment** (no device/browser testing was performed this session — this remains an open item, not silently assumed). No unresolved high-severity Writing defect is currently known. **Recommendation: the next increment, after you execute the migration sequence, should be exactly this verification pass — not another content or governance increment.**

## 11. Migrations requiring Founder execution (in order)

`169 → 173 → 172` (together or in that exact order) → `198` → `199` → `201` → `202` → `203` → `204`. Each fails closed if applied out of order or without its own dependencies already live.

## 12. One combined post-execution verification query

```sql
with targets(id) as (
  values
    ('eng-inc003-writing-imaginedplace-01'), ('eng-inc003-writing-favouriteplace-01'),
    ('eng-inc003-writing-pocketmoney-01'), ('eng-pc003-writing-difficulttask'),
    ('eng-pc003-writing-meaningfulplace'), ('eng-pc005-writing-personinfluence'),
    ('eng-pc005-writing-somethingnew'), ('mock-writing-newplace-01'),
    ('mock-writing-mistakelearned-01'), ('mock-writing-mindchange-01'),
    ('mock-writing-kindness-01'), ('mock-writing-cookopinion-01'), ('mock-writing-screentime-01')
)
select
  q.id,
  q.eligibility_status,
  q.family_id,
  (select count(*) from public.ali_family_review r
   where r.family_id = q.family_id and r.reviewer = 'FOUNDER' and r.decision in ('approved','approved_with_amendment')) as founder_decisions,
  (select count(*) from public.ali_family_review r
   where r.family_id = q.family_id and r.review_type = 'amendment_verification') as amendment_verifications
from targets t
join public.ali_question_bank q on q.id = t.id
order by q.id;
```
Expected: 7 rows `practice_eligible` with `founder_decisions ≥ 1` (§7); `difficulttask`/`meaningfulplace` `authentic_assessment_candidate` with `founder_decisions = 1`; `mindchange`/`kindness`/`cookopinion`/`screentime` unchanged historical status, `founder_decisions = 0` (no new decision recorded for these 4 — their historical decisions predate migration 201 and are not duplicated); `somethingnew` uniquely shows `amendment_verifications = 1`.

## 13. Tests/build/guards

| Guard | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm test` | **3214/3214** passing (+32 new, migrations 201–204) |
| `npm run migration-sql-guard` | PASS — 204 files |
| `npm run copy-guard` | PASS — 0 violations, 264 files |
| `npm run build` | PASS, exit 0, 56/56 pages (same pre-existing, unrelated `location` messages) |
| ESLint, full repo | **72/23 — unchanged, zero net-new** |

## 14. Production state

No database change. 4 new migration files + 4 test files committed to the repo only.

## 15. Authoritative migration register

| # | Status |
|---|---|
| 169, 172, 173 | Prepared for controlled application, in that exact order. Not applied; not claimed applied. |
| 198, 199 | Founder content decisions made (this session); not yet production-applied. |
| 200 | **Superseded by 203 — do not apply.** |
| 201, 202, 203, 204 | **New this increment.** All NOT APPLIED, all fail-closed, all tested. |
| 182 | HOLD / NOT APPLIED. (unchanged) |
| 191–194, 196, 197 | MANUALLY EXECUTED BY FOUNDER 2 SEP 2026; post-state verification outstanding; DO NOT REAPPLY. (unchanged) |
| 195 | MANUALLY APPLIED BY FOUNDER 3 SEP 2026 + LIVE VERIFIED. (unchanged) |

## 16. Next bounded action

You execute the 8-migration sequence (§11) and run the combined verification query (§12). The next increment is a **verification-only** pass confirming the remaining §10 conditions (Guided/Independent Practice behaviour against real `practice_eligible` content, mobile/tablet experience, evidence-pipeline integrity end to end) — the actual `/writing` activation decision follows that, not before.
