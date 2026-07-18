# Defect Lineage Register

**Status:** Living implementation documentation. Created 2026-07-18 per Programme Decision APD-024 (Engineering Governance), formalising the cross-validation authority already exercised once in WP-06.
**Purpose:** Every implementation defect found and corrected during the Implementation Programme is recorded here — where it was discovered, where it was corrected, its root cause, the verification evidence, and its regression status — so cross-work-package corrections (Programme Decision APD-024's "Cross-Validation Authority") are traceable, not just mentioned once in a commit message and then lost.

**Governing conditions (APD-024) every entry below must satisfy:** the defect is evidence-based; regression testing was repeated after the fix; calibration history was updated where relevant; the correction is documented; the architectural intent remained unchanged (a defect correction, not a redesign).

---

## DEF-001 — Guessable-format evidence incorrectly capped at Moderate instead of Low

| Field | Value |
|---|---|
| **Work package discovered in** | WP-06 (Mastery Validation gate) — surfaced while cross-checking the gate's behaviour against AEP-005 §9's own illustrative example |
| **Work package corrected in** | WP-06, same session — `lib/ali/confidence.ts` |
| **Root cause** | WP-05's original implementation of `computeCompetencyConfidence()` treated a threshold-met result whose evidence came entirely from a low-`confidence_weight` (guessable-format) question as **Moderate** confidence. AEP-005 §6's own tier definitions place evidence from a low-`confidence_weight` format at **Low** confidence outright, regardless of whether the mastery threshold is technically met. The discrepancy was never caught during WP-05 itself because WP-05's own verification scenarios never specifically tested a threshold-met-but-guessable case against the Mastery Validation gate's behaviour — only WP-06's construction of that gate, and its direct cross-check against AEP-005 §9's illustrative example, surfaced it. |
| **Verification evidence** | A throwaway `npx tsx` script (deleted before commit) added the exact scenario AEP-005 §9 describes — threshold met entirely on a `confidenceWeight: 0.5` question — and confirmed it now correctly returns `tier: "low"` and `validated: false` from the gate, where the unfixed code would have returned `tier: "moderate"` and `validated: true`. |
| **Regression status** | All 3 of WP-05's original verification scenarios (Insufficient/zero-attempts, High-via-real-spread, High-via-transfer-corroboration) were re-run after the fix and confirmed unchanged — the correction narrowly affects only the guessable-format branch, nothing else. Full `tsc --noEmit` and `npm run build` both clean. |

**Architectural intent preserved:** this was a defect correction to WP-05's own implementation against its own governing document (AEP-005 §6), not a redesign of the Evidence Confidence Model, the Mastery Validation gate, or any frozen architecture document. `CALIBRATION_TRACEABILITY_REGISTER.md`'s `GUESSABLE_CONFIDENCE_WEIGHT` entry was updated in the same commit to record the correction against the constant it affects.

---

*(Future defects found via cross-validation during any subsequent work package should be appended below as DEF-002, etc., following the same structure and satisfying the same APD-024 conditions.)*
