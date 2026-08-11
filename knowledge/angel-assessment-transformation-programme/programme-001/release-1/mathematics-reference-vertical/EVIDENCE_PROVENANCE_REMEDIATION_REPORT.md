# Evidence Provenance Remediation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Reference Vertical Remediation Gate §§6-7
**Prepared:** 2026-08-11

## The fix: one new write-once field, `first_source`

Migration 024 adds `ali_student_question_history.first_source` (nullable text). `lib/ali/history.ts`'s `recordPresentation()` now calls a new `recordFirstSourceIfUnset()` helper (a separate, best-effort `.update()` — see "Regression protection" below) that sets `first_source` **only** on rows where it is currently null. Once set, it is never overwritten by any later call, from any surface.

This directly answers the two questions the Remediation Gate requires the system to be able to answer independently:

- **"Where did this content come from?"** — `ali_question_bank.id` / its authoring migration. Unchanged, was never at risk.
- **"Where/how was this particular attempt generated?"** — `source` (most recent context, unchanged, correct as designed) alongside the new `first_source` (first-ever context, immutable once set).

A later Practice presentation touching `learn-mth-arith-guided` will still correctly update `source` to `"practice_experience"` (truthful — that Practice attempt genuinely happened) but can never again touch `first_source`, which permanently reads `"learning_guided"` from the moment this vertical's lesson first presents it. Content provenance is never inferred from the most recent usage context, satisfying the Gate's explicit requirement.

Append-only event-level provenance (a full per-attempt log table) was considered and rejected for this increment: `ali_student_question_history` is a foundational, frozen, one-row-per-question rolling-state design (migration 006, Decision 7) — it does not support append-only at all, for *any* field, including `last_attempt_correct`. Building a genuine per-attempt event log would mean a new table and a new write path touched by every mock/practice/lesson/founder-validation caller in the app — exactly the kind of "parallel mastery engine" / major architecture expansion the Remediation Gate itself warns against building without a full, separately-scoped impact assessment. `first_source` achieves the Gate's actual stated requirement ("a later Practice presentation must not rewrite historical truth about an earlier Learn... event") with a minimal, additive, single-column change instead.

## Impact assessment

| Area | Touched by this migration? | Impact |
|---|---|---|
| `ali_student_question_history` | Yes — 2 new nullable columns (`first_source`, `last_attempt_support_tier`) | Additive only; every existing row's existing columns unchanged |
| `recordPresentation()` / `recordOutcome()` (`lib/ali/history.ts`) | Yes | Both gain optional parameters/calls with defaults matching prior exact behaviour |
| Learn (this vertical) | Yes | The only current caller of `supportTier: "supported"` and the only content deliberately shared with the general pool |
| Practice | No functional change | Continues to call `recordOutcome()`/`recordPresentation()` exactly as before; the new columns are additive and optional |
| Mock (adaptive GL/maths/English/vocabulary, mock-exam) | No functional change | Same — every existing call omits the new parameters |
| Founder Validation (CSSE, Family Choice) | No functional change | Same |
| Recommendations / `computeRealRecommendationOrchestration` | No | Does not read `source`/`first_source`/`last_attempt_support_tier` (confirmed by repo search) |
| Mastery (`applyAttemptOutcome`) | Yes | New `supportTier` parameter, defaulted; see `LEARNING_EVIDENCE_SEMANTICS_SPEC.md` for the full downstream-safety check |
| Parent reporting | No functional change | Inherits the mastery-accounting correction automatically, no direct change needed |
| Mock Readiness (`assessMockReadiness`) | No | Confirmed it does not read `ali_student_question_history` at all |

## Historical records: what cannot be reconstructed

The one row known to have lost its intended tag — `learn-mth-arith-guided`, for the specific test profile used during the earlier Founder Activation Test — had its `source` legitimately overwritten to `"practice_experience"` before migration 024 existed. **This migration does not, and cannot, fabricate what its `first_source` should have been.** The column is added `null` for every pre-existing row, including this one; its true first-ever context is not reconstructed or guessed. Any future read of that specific row's `first_source` will correctly show "unknown," not a false "learning_guided." This is a real, disclosed, permanent gap for that one historical row — not a defect that can be fixed retroactively without inventing data that wasn't recorded at the time.

No other historical provenance loss is known. This is the only row this session has directly confirmed was affected (found during the Founder Activation Test's own DB inspection).

## Regression protection

Both new writes (`first_source`, `last_attempt_support_tier`) are deliberately implemented as **separate, best-effort `.update()` calls**, isolated from the core evidence write every existing caller depends on (`times_seen`/`times_correct`/`mastery_state`/etc.), exactly matching the existing codebase convention already used for `recordOutcome()`'s `ali_question_bank` usage-stat update. This means: if migration 024 has not yet been applied to a given database, the new calls fail gracefully (logged via `console.warn`, swallowed) while the pre-existing evidence write — used by every mock, Practice, Founder Validation, and Family Choice surface — continues to succeed completely unaffected. No existing surface's evidence recording depends on migration 024 being live.

## Status

**PROVENANCE INTEGRITY: SAFE** — content provenance was never at risk; per-encounter-context tracking (`source`) works exactly as designed; the genuine gap (a write-once "first encountered as" fact) is now closed for all future writes, with the one known historical exception disclosed above, honestly marked unknown rather than fabricated.
