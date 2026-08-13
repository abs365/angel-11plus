# Angel 11+ — Educational Review and Content Activation Operating Model V1

**Prepared:** Educational Increment 007E, 2026-08-13. **Status:** governance definition, ready for first real use. No genuine human review has occurred through this model yet — see `ANGEL_007E_PILOT_REVIEW_PACK_V1.md` for the bounded first batch.

## 1. Authorised roles

| Role | Who | What they may do | What they may NOT do |
|---|---|---|---|
| **A. Content Author** | Claude, under Founder direction | Creates/materially changes educational content (passages, questions, answer contracts, teaching support). | May not review their own content. May not change `eligibility_status`. |
| **B. Automated Validation** | Generator/emit scripts, `node:test` suite, `tsc`, Copy Quality Guard | Checks deterministic correctness: schema shape, answer-contract conformance, duplicate IDs/questions, quotation-verbatim, provenance tagging, dash-style compliance. | **Is not, and never substitutes for, independent educational review** — automated PASS is a precondition for review, never a replacement for it. |
| **C. Educational Reviewer** | A real human who did **not** author the content under review | Reviews educational validity, age-appropriateness, CSSE authenticity, difficulty, teaching quality, answer quality, ambiguity, misconception/distractor quality, transfer demand, exam relevance (full criteria: `ANGEL_EDUCATIONAL_REVIEW_STANDARD_V1.md`). Records one of the 4 canonical decisions. | May not promote content to `practice_eligible` merely by approving it — see §4 (Activation is a separate, later step). |
| **D. Founder Approver** | The Founder | Accepts programme-level decisions, approves release policy, resolves escalations, authorises activation batches. | **Founder approval must not silently masquerade as independent educational review** where the canonical eligibility state specifically requires one. The Founder may act AS an Educational Reviewer if they personally meet the qualification standard (§2) and record a review through the normal mechanism — but that is role C being exercised by the Founder, not a separate "Founder override" of the review requirement. |

**Eligibility transitions and the role required:**

| Transition | Required role |
|---|---|
| `null` -> `provisional` | Content Author + Automated Validation PASS |
| `provisional` -> `provisional` (correction) | Content Author + Automated Validation PASS (no review role needed to fix a defect the reviewer or author found) |
| `provisional` -> `practice_eligible` | Educational Reviewer decision = `approved` (or `approved_with_amendment` once the amendment is made and revalidated) **AND** Founder Approver activation (§4) |
| any -> `mock_eligible` | Not available yet — architecture only (Decision 49), no transition path exists in this increment |

## 2. Reviewer qualification standard

"Independent" primarily means **the reviewer must not be the person or system that authored the content being approved.** This is deliberately not a heavyweight bureaucratic gate — Angel 11+ must remain operable by a small team.

A reviewer is qualified if the Founder accepts at least one of:
- Teaching or tutoring experience relevant to the subject/age group;
- Formal assessment-writing or examining experience;
- Strong, demonstrable subject-matter knowledge (e.g. English/Mathematics degree-level or equivalent);
- Personal or professional 11+ preparation experience (parent who has been through the process, tutor, etc.);
- Curriculum or educational-content review experience in any subject;
- Any other demonstrable competence the Founder judges sufficient for the specific content being reviewed.

**Recording:** reviewer identity (real name, not a role label) and a one-line note on which qualification basis applies are recorded in the `reviewer` and `notes` fields of the `ali_family_review` row at the time of their first review — not in a separate credentialing system. This keeps the record lightweight while still real and auditable.

## 3. Family-level review sampling policy (what family approval covers and does not cover)

Reviewing a deterministic question family means the reviewer inspects:
1. The family definition and its evidence basis (which CSSE papers/years it is drawn from);
2. The teaching approach for that family (worked example / exam strategy / Guided Practice scaffold);
3. A **representative standard item**;
4. The **easiest boundary** variant;
5. The **hardest boundary** variant;
6. Any **unusual/structurally distinct** variant (e.g. a 4-item sequencing chain vs. the family's usual 3-item chain);
7. The answer-generation/validation logic's evidence basis (why this tier, why this scoring rule);
8. The misconception mapping for the sampled items;
9. Structural signature (does every sibling genuinely share the reviewed structure, or does the family silently contain a structurally different item that needs its own inspection);
10. Originality/provenance evidence for the family as a whole.

**If steps 1-10 pass AND automated validation (role B) proves every sibling conforms to the same declared tier/shape** (already enforced by `tests/content/*.test.ts`'s tier-conformance checks), family approval covers every deterministic sibling in that family — the reviewer does not re-inspect each of, e.g., a family's 17 instances individually.

**What is explicitly excluded from family-level coverage, and requires direct inspection regardless:**
- **Every passage** requires direct human reading in full — passages are never covered by a family-level sample, since each is a unique text, not a deterministic sibling of another passage.
- Any question with subjective interpretation, complex/ambiguous language, non-deterministic scoring (Tier 3/5 self-assessed items lean this way — their quotation/named-component half is deterministic and coverable, but the "does the explanation genuinely show understanding" judgement is inherently per-item and should be sampled more heavily, not waved through on one representative).
- Any item flagged by automated validation as an edge case (e.g. the boundary tests already run for multi-select) needs the reviewer to look at exactly that boundary, not just a "typical" item.

## 4. Reviewer workflow (extends `ali_family_review`, does not replace it)

```
PENDING (reviewer='UNASSIGNED', decision='pending_independent_review')
  -> REVIEW (a named reviewer opens the target)
  -> DECISION (approved | approved_with_amendment | requires_revalidation | rejected)
  -> AMENDMENT IF REQUIRED (Content Author fixes what the reviewer found)
  -> REVALIDATION (Automated Validation re-runs; for approved_with_amendment/requires_revalidation only)
  -> FINAL APPROVAL (a new ali_family_review row with decision='approved', referencing the amended content_version)
  -> ELIGIBILITY PROMOTION (§5 Activation — a SEPARATE, later, explicitly-authorised step; never automatic)
```

**Canonical decision states — reused, not reinvented:** `public.family_review_decision` (migration 034) already defines exactly the 4 states the Founder's directive asks for: `approved`, `approved_with_amendment`, `rejected`, `requires_revalidation`. No new enum is created.

**Traceability** (all already columns on `ali_family_review`, migration 034/047): `reviewer`, `review_date`, `family_id` (the target — extended by migration 047's `review_target_type`/`family_id` pair to also cover passages), `decision`, `notes` (findings/amendments), `evidence_reference`/`provenance_reference`. **Version** is the one gap: the table does not currently record which `content_version` was reviewed. Migration 054 (§6) does not add this column in 007E — flagged as a real, disclosed limitation, not silently worked around: today, "what was reviewed" is only as precise as the `notes` field a reviewer chooses to write, until a dedicated `reviewed_content_version` column is added in a future increment.

## 5. Activation process (design; not yet exercised — no approved review exists to activate)

```
REVIEW APPROVED (ali_family_review row, decision='approved' or 'approved_with_amendment' + revalidated)
  -> ACTIVATION CHECK:
       - content_version in ali_question_bank matches the version implicitly reviewed;
       - provenance = 'angel_original' (or otherwise Founder-accepted);
       - active = true;
       - automated answer-validation still passes (re-run, not assumed from authoring time);
       - teaching support exists where the review standard requires it (MODEL/Guided/exam-strategy);
       - no OTHER unresolved 'requires_revalidation' or 'rejected' record exists for the same family/passage.
  -> CONTROLLED PROMOTION: a hand-written, idempotent migration (same pattern as every migration in this
     project) sets eligibility_status='practice_eligible' for exactly the approved family's/passage's rows —
     never a blanket update, never "promote everything provisional."
  -> RECORD: the promotion migration's own header names the ali_family_review row(s) it acts on.
  -> VERIFY PRODUCTION: re-run the same field-by-field verification methodology used for every content
     migration in this project (007B/007C/007D), respecting Decision 48 for RLS-opaque tables.
  -> VERIFY LEARNER RENDERING: exercise the real Practice pathway for the newly-eligible content.
```

**No blanket promotion.** A promotion migration only ever lists the specific `family_id`/passage `id` values an actual `approved` review record names.

## 6. Relationship to Mock (Decision 49, unchanged)

Practice Eligible and Mock Eligible are and remain two separate, non-conflated promotions. Passing Practice review does not imply, and must never be silently treated as, qualifying for a future Mock-eligible state — Decision 49's sealed-reserve/unseen-content requirement means Mock content selection is a distinct future decision, out of scope for the activation process in §5.

## 7. Why review governance must not become a bottleneck

Family-level review (§3) plus deterministic automated validation (role B) is the scaling mechanism: a reviewer's judgement is spent once per family (plus once per passage), not once per authored row. At current supply (117 English questions across 9 families + 15 passages; ~130 provisional Mathematics questions across ~20 families), a reviewer working through §3's sampling process family-by-family, not row-by-row, is the only way this remains operable as authored supply grows into the hundreds and thousands the Founder anticipates.
