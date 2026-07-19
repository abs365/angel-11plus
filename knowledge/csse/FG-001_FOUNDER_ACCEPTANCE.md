# FG-001 — Founder Acceptance

**Angel 11+, Version 3.0 Founder Governance Programme**
**Work Package:** FG-001 — Founder Knowledge Acceptance
**Status:** Complete. Governance acceptance only — no educational analysis, no intelligence framework, no learner functionality.

---

## 1. Executive Summary

The Founder has formally reviewed and accepted the 17-asset CSSE Knowledge Domain acquired under KA-001 and independently verified under KA-002. Every asset's `Review Status` has moved from `Under Review` to `Accepted`, with `Reviewer: Founder`, `Acceptance Reference: FG-001`, and `Acceptance Date: 2026-07-19` recorded on both the Knowledge Register and every individual Asset Profile. This satisfies the human-review precondition `KNOWLEDGE_GOVERNANCE.md` §9 (Quality Gates) requires before any Intelligence Framework may be built from these assets — the specific gap KA-002 identified and flagged as the sole remaining blocker. **The CSSE Knowledge Domain is approved for educational analysis. AEP-002 is authorised to begin.**

## 2. Evidence Reviewed

The Founder's acceptance decision is based on `knowledge/csse/KA-002_EVIDENCE_VERIFICATION_REPORT.md` in full, confirming:

- **Repository verified** — all required folders present and correctly organised; structure matches `KNOWLEDGE_GOVERNANCE.md` §3.
- **Asset Profiles verified** — all 17 contain every required field, with zero omissions.
- **Register verified** — every asset registered, no duplicates, no missing entries, register paths matched bidirectionally against the actual filesystem.
- **Integrity verified** — SHA-256 recomputed independently from disk for all 17 files and matched exactly against each profile's recorded value; no duplicate files; every file opens correctly and yields genuine, on-topic extracted text; a sample of source URLs re-resolved live at HTTP 200.
- **Coverage verified** — strong, paired evidence (paper + mark scheme) for English and Mathematics across three entry years; a specific, documented gap for Continuous Writing (no year-specific mark scheme exists officially).

KA-002's own confidence statement was **READY WITH LIMITATIONS**, with the sole procedural blocker being the absence of a completed human-review step. This work package closes that gap.

## 3. Repository Acceptance

The following are accepted into the governed Knowledge Repository, effective 2026-07-19:

- 17 CSSE knowledge assets (CSSE-001 through CSSE-017), spanning `official-papers/`, `mark-schemes/`, `writing/`, and `examiner-guidance/`.
- `knowledge/KNOWLEDGE_REGISTER.md`, updated: all 17 rows now read `Status: Accepted`, `Reviewer: Founder`, `Review Date: 2026-07-19`.
- All 17 Asset Profiles under `knowledge/csse/assets/`, updated: `Review Status: Accepted`, `Reviewer: Founder`, `Acceptance Reference: FG-001`, `Acceptance Date: 2026-07-19`.

No file content, checksum, or source attribution was altered by this acceptance — only governance-status fields were updated, consistent with FG-001's boundary rule against modifying repository structure or content.

## 4. Known Evidence Limitations

Carried forward unchanged from KA-001/KA-002, and accepted as-is rather than resolved by this work package:

- No official year-specific Continuous Writing mark schemes exist (only one generic, undated sample, CSSE-002).
- No official papers exist for entry years before 2021.
- No published examiner moderation reports exist beyond the administrative Information Guide (CSSE-001) already acquired.

These limitations remain accepted. Any future work drawing on this evidence — including AEP-002 — must account for them rather than treat the evidence base as exhaustive.

## 5. Acceptance Decision

**ACCEPTED.**

The CSSE Knowledge Domain, as verified under KA-002 and reviewed under this work package, is formally accepted by the Founder as Approved Knowledge Assets. This decision rests on KA-002's independently-reproduced verification findings (Section 2) and on the Founder's own review of that report, not on any new analysis performed under FG-001.

## 6. Scope Authorisation

This acceptance authorises use of the 17 CSSE knowledge assets for **educational analysis and Intelligence Framework work** (e.g. AEP-002), strictly within the boundaries already established:

- Use is governed at all times by `KNOWLEDGE_GOVERNANCE.md`, including its Evidence Classification (§4), Copyright and Usage (§6), and Traceability Model (§8).
- Continuous Writing-specific intelligence work must explicitly account for the mark-scheme gap in Section 4 above rather than treat CSSE-002's generic sample as year-specific.
- No copyrighted CSSE material may be reproduced in learner-facing content, per each Asset Profile's Copyright/Licensing Status field.

## 7. Authority Granted

This acceptance is granted by the Founder, acting as the human Reviewer role defined in `KNOWLEDGE_GOVERNANCE.md` §5, under Acceptance Reference **FG-001**. It authorises the next-stage programme (AEP-002) to begin building an Intelligence Framework from these specific 17 assets. It does not grant blanket authority over future acquisitions — each future Knowledge Domain (a new provider, or new CSSE evidence) requires its own acquisition, verification, and acceptance cycle.

## 8. Conditions

1. AEP-002 must operate within the Known Evidence Limitations (Section 4) and must not present Continuous Writing intelligence as equally well-evidenced as English/Mathematics intelligence.
2. AEP-002 must not reproduce copyrighted CSSE material in any learner-facing output, per `KNOWLEDGE_GOVERNANCE.md` §6.
3. Any future addition of CSSE evidence (e.g. a genuine year-specific Continuous Writing mark scheme, if one becomes available) requires its own acquisition and verification cycle before being registered as Accepted — this acceptance does not pre-approve future, as-yet-unacquired assets.
4. This acceptance covers evidence acquisition and verification governance only. It does not itself authorise any code change, learner feature, or deployment — those remain separately gated, as they have been throughout this program.

## 9. Next Approved Work Package

**AEP-002 — CSSE Examination Intelligence** is authorised to begin, against the 17 Accepted assets in this Knowledge Domain, subject to the conditions in Section 8.
