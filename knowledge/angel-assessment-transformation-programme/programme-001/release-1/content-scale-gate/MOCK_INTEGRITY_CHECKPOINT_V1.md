# Mock Integrity Checkpoint V1

**Prepared:** 2026-08-12, Angel 11+ Completion Programme, Continuation Directive 002.
**Scope:** verify what the current architecture can and cannot support for Mock integrity. Does not build the Mock Engine — that is a later, separately-authorised phase.

## Findings, by required capability

| Capability | Status | Evidence |
|---|---|---|
| Practice versus Mock separation | **NOT SUPPORTED** | Direct code inspection: `app/learning-intelligence/mock-exam/page.tsx` (lines 141-151) and `app/learning-intelligence/practice/[area]/page.tsx` both call the identical `fetchQuestionBank(supabase, subject, "csse")` with only a `skill.startsWith("QT-")` filter. There is no eligibility-status filter (none exists in the schema — see Content Inventory §1) and no separate "mock pool" query. **Any item in `ali_question_bank`, regardless of how thin its evidence, can be selected into a mock today.** |
| Mock Eligible status | **NOT SUPPORTED** | The five-status model is documentation-only (Content Scale Gate §1); nothing enforces it |
| Exact-item exposure tracking | **SUPPORTED** | `ali_student_question_history.times_seen`/`last_presented_at`, written by `recordPresentation()`, read by `fetchStudentHistory()` — a real, working per-item exposure record, confirmed live in this session's own testing |
| Family/archetype exposure tracking | **NOT SUPPORTED** | No archetype/family concept exists in the schema (Content Sufficiency Standard §3, layer B is observed informally, not tracked); exposure is tracked per exact item ID only |
| Near-duplicate protection | **NOT SUPPORTED** | No similarity check exists anywhere in the selection or authoring pipeline |
| Unseen-item eligibility | **PARTIALLY SUPPORTED** | `selectQuestions()` (session generator) already prefers unseen items using real history — this mechanism exists and works, but operates over the same undifferentiated pool as Practice, with no eligibility gate |
| Retake identification | **NOT SUPPORTED** | No mock-attempt/session identity concept found that would let the system recognise "this learner is retaking a mock" versus a fresh sitting, beyond the generic `sessionId` used for evidence tagging |
| Fresh-paper assembly | **NOT SUPPORTED** | No blueprint/paper-assembly mechanism exists; `mock-exam/page.tsx` assembles its set from whatever the pool currently contains, not from a defined structure (contrast with `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md`'s target structure table — 12-16 Comprehension, 5 AR, 20-21 Maths questions, 120 total marks — which is not yet wired into any code) |

## What this means

The current Mock Centre is, honestly, a **Practice session with exam framing**, not a governed mock instrument — it draws from the same 46-row pool, with the same lack of eligibility enforcement, as ordinary Practice. This is consistent with, and does not contradict, Release 0's own disclosure banner (commit `1dbd90a`), which already tells users the current mock content is not yet authenticated to full CSSE-equivalent standard. Nothing here is a new problem; this checkpoint just makes the specific missing mechanisms explicit for the later Mock Engine phase, per the directive's request.

## Recorded for the later Mock completion phase (not actioned now)

1. A Mock-eligible item filter (reading from wherever eligibility status ends up being persisted — schema work not yet scoped).
2. A blueprint/paper-assembly mechanism consuming `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md`'s target structure.
3. Family-level (not just item-level) exposure tracking, once an archetype/family concept exists in the schema.
4. A near-duplicate similarity check, shared between Practice and Mock content pipelines.
5. Explicit retake/fresh-sitting identification, separate from the generic session ID.
