# Release 1 — Authoring Pipeline Pilot Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Increment 2A
**Prepared:** 2026-08-10
**Status:** One QT-RC-01 pilot item authored, reviewed (author-side), and status-recorded. Not in production. Not independently validated. Not scaled.

---

## 1. The Pilot, In Brief

One original item authored: `eng-001-q5` ("Where exactly did Mira find the notebook?"), QT-RC-01, RC-01, `easy`, 1 mark, attached to Angel's own existing "The Lighthouse Mystery" passage. Full artefact trail in `increment-2a-qt-rc-01-pilot/`: Evidence Pack → Authoring Brief → Item → Authenticity Review → Originality Review → Eligibility Record. Final status: **Authentic Assessment Candidate** — the highest status self-certifiable without an external reviewer, per the Eligibility Model's own rule.

## 2. Pipeline Assessment — the 9 Required Questions

**1. Did authentic evidence genuinely determine the question design?** Yes, for the *format*: the narrow character/scene-scoped stem, single-fact retrieval, 1-mark structure all trace directly to CSSE-008 Q2/Q3/Q4/Q12, read this session, not assumed from memory. The *specific* fact chosen (a found object's location) was a free authorial choice within that format — correctly so, since format-authenticity and content-originality are supposed to be separate axes, not the same decision.

**2. Did the Specification provide enough authoring guidance?** Yes, for QT-RC-01 specifically, since it's one of the 6 Tier-1 types given full 20-field depth. Two fields (paper position, progression of challenge) could not be evaluated by a single standalone item — an honest limitation of a one-item pilot, not a Specification gap; both are pool-level properties.

**3. Was any important decision left to unsupported judgement?** Yes, two: `content_difficulty: easy` rests on applying `QUESTION_AUTHORING_STANDARD.md`'s general rubric (a documented method, but still authorial judgement, not empirical evidence — consistent with Increment 1's own finding that no item in this pool has empirical difficulty evidence). `estimated_time_seconds: 45` is an Angel-authored estimate, explicitly flagged as such in the Authenticity Review, not a CSSE-evidenced figure — the Specification itself (§5) already discloses this as a programme-wide limitation.

**4. Could another competent author reproduce the same standard from the Specification alone?** Reasonably yes for the item's *shape* — fields 3-9 and 19-20 are concrete enough to constrain a second author to the same format. Difficulty-tier and timing judgement calls would still vary slightly between authors, which is expected (these are disclosed as judgement fields, not measured ones) rather than a pipeline defect.

**5. Is the traceability chain auditable?** Yes — every deliverable cites specific documents and, where applicable, specific Asset IDs and question numbers; a reader can walk CSSE-008 → QT-RC-01 → RC-01 → this item without a gap.

**6. Is the originality boundary clear enough?** Reasonably yes for a single item — the Originality Review found a genuine, checkable basis for its PASS verdict, not an assumed one. It is less clear for *scale* (see Question 7) — the Specification doesn't yet say how many QT-RC-01 items can share a similar stem pattern before the pattern itself starts to feel templated rather than merely consistent.

**7. Can the method scale without producing formulaic questions?** This is the pilot's most honest concern, not smoothed over: QT-RC-01's own defining shape (name a character + scene, ask for one fact) is narrow by evidence-based design — that's exactly what makes it authentic, but at volume, if every future item defaults to a small rotation of stem templates ("Where did X find Y," "What did X do during Z"), the *pool* could become formulaic even while every *individual* item passes the Specification. Flagged here as a real risk for the eventual batch, not resolved by this single-item pilot.

**8. What additional human subject-matter review is required?** A qualified educational reviewer who did not author this item must confirm the Eligibility Model's "Independently Validated" gate before this item (or any item modeled on it) could move further — not yet done, and this report does not claim it is done.

**9. What must be improved before authoring a second item?** Two things, in order: (a) get real external reviewer sign-off on *this* item first, to test whether the review step itself is workable in practice, before producing a second item that would need the same review; (b) if a future batch is authorised, add explicit anti-formulaic/variety guidance to the Authoring Brief template, given Question 7's finding — not urgent for one item, but worth fixing before scale, not after.

## 3. Repository Impact — Confirmed

- `git status` after this increment shows only the new `increment-2a-qt-rc-01-pilot/` markdown files and this report — no code file, no migration, no `ali_question_bank` row, no Assessment Brain/Learning Engine/Educational Intelligence/Mock/evidence-pipeline file touched.
- Migrations 016-018: not applied, not touched.
- The 29 live production rows: unchanged.
- AR-01: not touched; this pilot's own primary-source reading (CSSE-008) surfaced nothing bearing on AR-01's post-2024 status.
- The pre-existing unrelated `ARCH-001_ED-001...md` modification remains exactly as it was before this increment — not touched by this pilot.

## 4. Did the Pipeline Pass?

**Yes, with one process gap and one scale risk, both named rather than hidden.** The evidence-first sequence held throughout (nothing was authored before its evidence pack existed); the traceability chain is real and auditable; the originality and authenticity reviews were genuinely performed, not rubber-stamped (both record specific PASS/FAIL/NOT APPLICABLE/NOT EVIDENCED verdicts per dimension, not a single blanket verdict). The process gap: this pilot cannot self-certify past Authentic Assessment Candidate — that is by design, not a failure, but it means the pipeline is only *proven* through the authoring-and-self-review half; the review-by-an-independent-human half remains untested until it actually happens once.

## 5. Recommendation

**Do not author a second item yet.** First, route this single pilot item to a genuine qualified educational reviewer (not Claude) to complete the Independently Validated gate — this tests the half of the pipeline that hasn't been exercised at all yet, and is cheaper to fix now (one item) than after a batch exists. Only once that step is proven workable should Increment 2B (a second QT-RC-01 item, or the first item of a different Tier-1 type) be authorised — and even then, the Question 7 formulaic-risk finding should be addressed in the Brief template first, not deferred again.

Stopping here for Founder review, as instructed. No item 2 authored, no Question Type beyond QT-RC-01 attempted, no production write made, no status self-awarded beyond what the Eligibility Model permits an author to certify.
