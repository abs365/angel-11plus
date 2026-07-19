# KA-002 — Evidence Verification Report

**Angel 11+, Version 3.0 Knowledge Acquisition Programme**
**Work Package:** KA-002 — CSSE Evidence Verification
**Status:** Implemented. Independent verification only — no educational analysis, no intelligence framework, no application code, no learner features.

**Method note:** every check in this report was re-derived directly from the repository as it currently stands (checksums recomputed from the files on disk, register cross-referenced against actual filesystem paths, source URLs re-fetched live) rather than taken on trust from `KA-001_KNOWLEDGE_ACQUISITION_REPORT.md`'s own claims. Where this report's findings agree with KA-001, that is stated as an independent confirmation, not assumed.

---

## 1. Executive Summary

The CSSE Knowledge Domain created under KA-001 was independently re-verified in full. Repository structure, the Knowledge Register, all 17 Asset Profiles, and file integrity (checksums, duplicate check, file-open check, live source re-resolution) all passed verification with zero discrepancies found. Coverage is strong for English (comprehension) and Mathematics papers across three entry years (2021–2023) with matching official mark schemes, but has a specific, material gap for the Continuous Writing component (no year-specific mark scheme exists), and the evidence set overall spans only three entry years. Separately, and independently of content quality: none of the 17 assets has yet passed the human-review gate the repository's own governance standard requires before an Intelligence Framework may be built from them. Confidence Statement: **READY WITH LIMITATIONS**.

## 2. Repository Verification

- **Folder structure matches governance.** All six approved subdirectories exist under `knowledge/csse/`: `official-papers/`, `mark-schemes/`, `writing/`, `examiner-guidance/`, `research/`, `assets/` — confirmed by direct filesystem check, not assumed from KA-001's report.
- **Asset categorisation checked against content, not just filename.** Spot-verified via `pdftotext` extraction (Section 5 of this report) that files placed in `official-papers/` are comprehension/maths question papers, files in `writing/` are Continuous Writing papers, and files in `mark-schemes/` are marking documents — categorisation is correct, not merely filename-plausible.
- **One structural finding, not previously flagged this precisely:** `knowledge/csse/research/` exists as a local directory but contains zero files and is **not tracked by git** (`git ls-tree` returns empty for this path) — because git cannot track empty directories. This means a fresh clone of the repository from GitHub will not have this folder until a real file is placed in it. This is a known, inherited git limitation (documented at the KG-002 stage), not a new defect, but is restated here because KA-002's own repository verification scope explicitly covers folder existence.
- **Other provider directories** (`gl-assessment/`, `cem/`, `iseb/`, `independent/`, `shared/`) do not exist on disk. This is correct and expected — `KNOWLEDGE_GOVERNANCE.md` §3 documents them as the *approved* structure for future use, and KG-001's own scope explicitly did not authorise scaffolding them.

**Verdict: Repository structure — PASS.**

## 3. Knowledge Register Verification

- **Every asset has a register entry, and vice versa.** Extracted all Asset IDs referenced in `KNOWLEDGE_REGISTER.md` (17) and compared against the actual `knowledge/csse/assets/*.md` files present (17): exact match, both directions.
- **No duplicate Asset IDs** — confirmed by sorting and checking for repeats; none found.
- **Repository Location paths verified against the actual filesystem.** Every one of the 17 `Repository Location` values quoted in the register was checked against `find knowledge/csse -name "*.pdf"`: exact match, both directions — no register entry points at a non-existent file, and no PDF on disk is missing a register row.
- **Status values are consistent.** All 17 rows read exactly `Under Review`; no stray, misspelled, or unrecognised status values found.

**Verdict: Knowledge Register — PASS.**

## 4. Asset Profile Verification

Checked all 17 profiles (`CSSE-001.md` … `CSSE-017.md`) programmatically for the presence of every required field: Asset ID, Title, Provider, Document Type, Publication Year, Evidence Level, Repository Location, Original Source, Acquisition Date, Verification Status, Review Status, Reviewer, plus the Founder-added Copyright/Licensing Status and SHA-256 Checksum fields. **Zero omissions found across all 17 profiles.**

**Verdict: Asset Profiles — PASS, no omissions identified.**

## 5. Integrity Verification

- **SHA-256 values exist and are correct.** Recomputed SHA-256 for all 17 files directly from disk and compared against the value recorded in each file's own Asset Profile: **17/17 match exactly.** This is the strongest check in this report, since it does not rely on any value KA-001 recorded being trusted — it re-derives the hash independently and checks it against the claim.
- **No duplicate files.** Recomputed and compared all 17 checksums pairwise; zero duplicates (re-confirms KA-001's own finding independently, using a fresh computation).
- **Every file opens successfully.** All 17 files begin with the correct PDF signature (`%PDF`) and yield substantial, non-empty extracted text (1,641–40,775 characters) via `pdftotext` — none is corrupt, truncated, or an HTML error page saved with a `.pdf` extension.
- **Repository files match the register.** Already confirmed bidirectionally in Section 3.
- **Source provenance spot-check.** Re-fetched 4 of the 17 recorded Original Source URLs live (CSSE-001, CSSE-004, CSSE-013, CSSE-017 — spanning all three entry years plus the administrative guide) at the time of this report: all 4 returned HTTP 200 from `csse.org.uk`, confirming the source links remain live and correctly recorded, not merely valid at acquisition time.

**Verdict: Integrity — PASS.**

## 6. Coverage Assessment

**Available official evidence (Level A unless noted):**
- English (comprehension) papers: 2021, 2022, 2023 Entry (3/3 years) — each with a matching official mark scheme (3/3).
- Mathematics papers: 2021, 2022, 2023 Entry (3/3 years) — each with a matching official mark scheme (3/3).
- English Continuous Writing papers: 2021, 2022, 2023 Entry (3/3 years) — question papers only.
- One generic, undated Continuous Writing sample mark scheme (not year-specific).
- One administrative Information Guide (Level B — format, dates, registration; not question content).

**Sufficiency for a first Academic Intelligence Framework:** The English and Mathematics evidence (paper + mark scheme, 3 consecutive years each) is genuinely paired and complete for those two components — sufficient in kind, if not necessarily in volume, to begin pattern analysis once authorised. The Continuous Writing evidence is materially thinner: three question papers exist, but no year-specific mark scheme does, only one generic sample — meaning any future writing-assessment intelligence work would have a narrower evidential basis than the English/Maths components.

## 7. Missing Official Evidence

Re-confirmed against the current repository state (no evidence has been added since KA-001):

- Year-specific Continuous Writing mark schemes (2021, 2022, 2023) — not published on the official site; only the one undated generic sample exists.
- Papers prior to 2021 Entry — the official familiarisation-papers page lists only 2021 onward.
- Examiner reports or moderation guidance — nothing beyond the administrative Information Guide was found on the official site.
- Level C peer-reviewed research on the CSSE examination — none sought or acquired under KA-001, and none added since.

## 8. Risks

Structural and process risks only — no educational or content-quality conclusions are drawn:

1. **Governance quality gate not yet satisfied.** `KNOWLEDGE_GOVERNANCE.md` §9 (Quality Gates) states that "No Intelligence Framework may be produced except from Knowledge Assets that have completed the 'Reviewed' stage of the lifecycle." All 17 assets are currently `Under Review`; none has reached `Accepted`, because no human Reviewer has yet been assigned (`Reviewer: Not yet assigned` on every profile and register row). This is an objective, procedural fact, verifiable directly from the register — not a judgment call.
2. **Small evidence volume per component.** Three entry years is enough to observe repeated structural patterns but is a thin base for any claim about year-to-year consistency; this is a volume characteristic of the evidence, not an analytical conclusion about the exam itself.
3. **Continuous Writing evidence asymmetry.** Question papers exist for three years; a matching year-specific mark scheme does not exist for any of them (Section 7). Any future work drawing on Continuous Writing assessment criteria would need to rely on the single generic sample, a narrower evidential base than English/Maths.
4. **Licensing status is unresolved, not merely unfavourable.** Every Asset Profile records "no explicit redistribution licence stated on the source page" — this is a documented open question, not a cleared status. Any future work must continue to treat these assets as internal-analysis-only per `KNOWLEDGE_GOVERNANCE.md` §6 until this is resolved.
5. **`research/` folder is not git-tracked** (Section 2) — a low-severity but real risk that a future contributor working from a fresh clone rather than this exact working tree could reasonably believe the folder does not exist.

## 9. Confidence Statement

**READY WITH LIMITATIONS**

**Justification:** Every independently-reproducible check in this report passed without exception — repository structure, register consistency (bidirectional), Asset Profile completeness, and file integrity (recomputed checksums, duplicate check, file-open check, live source re-verification) all confirm the acquired evidence is what it claims to be, correctly organised, and correctly documented. This is not a marginal or borderline pass; it is a clean result across every check performed.

The "with limitations" qualifier reflects two independent, factual constraints, not doubt about what has been verified: (1) coverage is strong and paired for English and Mathematics but materially thinner for Continuous Writing, where no year-specific mark scheme exists at all; and (2) the repository's own governance standard has not yet been satisfied procedurally — no asset has passed human review to reach "Accepted" status, which `KNOWLEDGE_GOVERNANCE.md` §9 states is a precondition for building any Intelligence Framework from this evidence.

## 10. Readiness Recommendation

1. **Content is ready to support English and Mathematics intelligence work**, subject to the process precondition below.
2. **Continuous Writing evidence should be treated as insufficient on its own** for building assessment-criteria intelligence, given the missing year-specific mark schemes — any AEP-002 scope touching Continuous Writing should account for this gap explicitly rather than treat the single generic sample as representative.
3. **Before AEP-002 is authorised, the Founder should either:** (a) assign a Reviewer and move some or all of the 17 assets to "Accepted" status per `KNOWLEDGE_GOVERNANCE.md` §7, satisfying the governance standard's own quality gate; or (b) explicitly and knowingly waive that gate for this instance. Proceeding to build an Intelligence Framework while every asset remains "Under Review" would be inconsistent with the governance standard this same program authored and approved.
4. Once either path in point 3 is taken, this report finds no other blocker to authorising AEP-002 against the CSSE evidence currently in the repository.
