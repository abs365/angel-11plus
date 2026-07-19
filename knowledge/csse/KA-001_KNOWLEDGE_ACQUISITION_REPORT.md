# KA-001 — Knowledge Acquisition Report

**Angel 11+, Version 3.0 Knowledge Acquisition Programme**
**Work Package:** KA-001 — Official CSSE Evidence Acquisition
**Status:** Implemented. Evidence acquisition only — no educational analysis, no application code, no learner features.

---

## 1. Executive Summary

Acquired 17 official CSSE (Consortium of Selective Schools in Essex) documents directly from the official CSSE website (`csse.org.uk`): English, English Continuous Writing, and Mathematics papers for 2021, 2022 and 2023 Entry, each with its official mark scheme where separately published, plus the current CSSE Information Guide and a generic Continuous Writing sample mark scheme. Every asset was downloaded from a verified official source, checked for valid PDF structure and correct identity via extracted text, hashed with SHA-256, given an Asset Profile, and registered in `KNOWLEDGE_REGISTER.md`. No document content was modified. No educational analysis, competency mapping, difficulty classification, or teaching recommendation was performed, per the KA-001 boundary rule.

## 2. Repository Structure

```
knowledge/csse/
    README.md
    KA-001_KNOWLEDGE_ACQUISITION_REPORT.md   (this document)
    assets/                  17 Asset Profiles (CSSE-001 … CSSE-017)
    official-papers/         6 files  — English & Mathematics comprehension/test papers
    mark-schemes/            7 files  — official + sample mark schemes
    writing/                 3 files  — Continuous Writing papers
    examiner-guidance/       1 file   — CSSE Information Guide
    research/                0 files  — no research material acquired this pass
```

Structure complies with the approved layout in `KNOWLEDGE_GOVERNANCE.md` §3 and the KG-001 scaffold (`knowledge/csse/{official-papers,mark-schemes,writing,examiner-guidance,research}`), with `assets/` added per KA-001's Asset Profile Standard.

## 3. Assets Acquired

| # | Asset ID | Title | Folder |
|---|---|---|---|
| 1 | CSSE-001 | CSSE 11+ Information Guide, 2027 Entry | `examiner-guidance/` |
| 2 | CSSE-002 | English Continuous Writing — Sample Mark Scheme | `mark-schemes/` |
| 3 | CSSE-003 | English Paper — Main Test 1, 2023 Entry | `official-papers/` |
| 4 | CSSE-004 | English Continuous Writing Paper, 2023 Entry | `writing/` |
| 5 | CSSE-005 | English Paper — Marking Scheme, 2023 Entry | `mark-schemes/` |
| 6 | CSSE-006 | Mathematics Paper — Test 2, 2023 Entry | `official-papers/` |
| 7 | CSSE-007 | Mathematics Paper — Marking Scheme, 2023 Entry | `mark-schemes/` |
| 8 | CSSE-008 | English Paper — Main Test 1, 2022 Entry | `official-papers/` |
| 9 | CSSE-009 | English Continuous Writing Paper, 2022 Entry | `writing/` |
| 10 | CSSE-010 | English Paper — Marking Scheme, 2022 Entry | `mark-schemes/` |
| 11 | CSSE-011 | Mathematics Paper — Test 2, 2022 Entry | `official-papers/` |
| 12 | CSSE-012 | Mathematics Paper — Marking Scheme, 2022 Entry | `mark-schemes/` |
| 13 | CSSE-013 | English Paper — Main Test 1, 2021 Entry | `official-papers/` |
| 14 | CSSE-014 | English Continuous Writing Paper, 2021 Entry | `writing/` |
| 15 | CSSE-015 | English Paper — Marking Scheme, 2021 Entry | `mark-schemes/` |
| 16 | CSSE-016 | Mathematics Paper — Test 2, 2021 Entry | `official-papers/` |
| 17 | CSSE-017 | Mathematics Paper — Marking Scheme, 2021 Entry | `mark-schemes/` |

All 17 sourced from `https://csse.org.uk/?page_id=510` ("Free Downloadable Familiarisation Papers", linked from `csse.org.uk/examination/`) except CSSE-001 and CSSE-002, sourced directly from `csse.org.uk/examination/`.

## 4. Knowledge Register Summary

`knowledge/KNOWLEDGE_REGISTER.md` updated with all 17 entries. Register schema extended with a `Repository Location` column (per KA-001's minimum-fields requirement) alongside the existing KG-002 schema (Asset ID, Provider, Title, Version, Evidence Level, Source, Status, Date Added, Reviewer, Review Date). Every register row links to its full Asset Profile for detailed provenance (checksum, verification method, copyright notes). All 17 entries carry Status = "Under Review" — none has yet been formally Accepted, since that requires the human Reviewer role defined in `KNOWLEDGE_GOVERNANCE.md` §5, not yet assigned.

## 5. Asset Profile Summary

All 17 Asset Profiles created under `knowledge/csse/assets/CSSE-001.md` … `CSSE-017.md`, each containing every field required by KA-001 §Asset Profile Standard (Asset ID, Title, Provider, Document Type, Publication Year, Evidence Level, Repository Location, Original Source, Acquisition Date, Verification Status, Review Status, Reviewer, Notes) plus two fields added per the Founder's mid-acquisition instruction: Copyright/Licensing Status and SHA-256 Checksum. No educational analysis appears in any profile — Notes fields record only structural/provenance observations (e.g. companion-document cross-references, file-naming artefacts), never content judgements.

**Evidence Level assigned:** 16 of 17 assets classified Level A (official examination-authority papers and mark schemes); 1 asset (CSSE-001, the Information Guide) classified Level B (official guidance, not itself a paper or mark scheme), per `KNOWLEDGE_GOVERNANCE.md` §4.

## 6. Source Verification

Every asset was independently verified before acceptance into the repository, using three checks per file:

1. **Domain and transport verification** — every URL resolved on the `csse.org.uk` domain with HTTP 200, confirmed by direct `curl` requests, not merely trusted from search-engine snippets. Two rounds of link discovery were needed: the CSSE examination page's "Free Downloadable Familiarisation Papers" link led to a second page (`?page_id=510`) that a first-pass fetch did not surface, requiring a targeted re-fetch to find the actual paper/mark-scheme links.
2. **File integrity** — every downloaded file was checked for the PDF magic-byte signature (`%PDF`) and its downloaded size cross-checked against an independent `HEAD`-request size probe taken before download; all 17 matched exactly.
3. **Content identity** — every file's text was extracted (`pdftotext`) and checked for CSSE branding and correct subject/year, confirming each PDF's actual content matches its filename and title (e.g. CSSE-016's extracted text opens "The Consortium of Selective Schools in Essex MATHEMATICS PAPER FOR 2021 ENTRY - TEST 2"). This step also caught nothing anomalous — no file returned an HTML error page, login wall, or mismatched subject/year.

## 7. Duplicate Review

All 17 files' SHA-256 checksums were compared; zero duplicates found (`sha256sum ... | sort | uniq -d` returned empty). Each asset is a distinct document.

## 8. Coverage Assessment

For the three entry years with papers published on the official site (2021, 2022, 2023), coverage is complete for the components CSSE publishes online: English (comprehension) paper, English Continuous Writing paper, Mathematics paper, and mark schemes for English and Mathematics. No year has a separately published Continuous Writing mark scheme — only the single, undated, generic sample (CSSE-002) is published for that component across all years, which is recorded as a coverage characteristic, not an omission on this programme's part.

## 9. Missing Official Evidence

- **Continuous Writing mark schemes, year-specific.** Only a generic/undated sample mark scheme (CSSE-002) is published for the Continuous Writing component; no year-specific Continuous Writing mark scheme was found on the official site for 2021, 2022, or 2023 Entry.
- **Papers prior to 2021 Entry.** The official familiarisation-papers page only lists 2021, 2022 and 2023 Entry; no earlier papers were found there.
- **Examiner reports / moderation guidance.** No document describing examiner behaviour, moderation standards, or post-exam analysis was found on the official site — the `examiner-guidance/` folder currently holds only the administrative Information Guide (CSSE-001), not examiner-specific commentary.
- **Peer-reviewed research (Level C).** No academic research on the CSSE examination specifically was sought or acquired this pass — KA-001's scope was official-provider evidence acquisition only.

All of the above are recorded as explicitly-documented absences, per KA-001's Success Criteria, not silently omitted.

## 10. Copyright and Licensing Notes

All 17 documents are freely published by CSSE for public download via its own official website, evidently intended to help candidates and families prepare for the 11+ test. No explicit reuse/redistribution licence text was found on the source pages accompanying the downloads. Consistent with `KNOWLEDGE_GOVERNANCE.md` §6, these assets are retained strictly for internal educational analysis (informing future intelligence frameworks such as AEP-002) and must not be reproduced — in full, in part, or in close paraphrase — in learner-facing Angel 11+ content unless and until explicit permission or licensing is separately confirmed. Each Asset Profile repeats this restriction individually so it cannot be lost if a profile is read in isolation.

## 11. Recommendations for KA-002

1. Assign a human Reviewer to move the 17 "Under Review" assets to "Accepted" status, per `KNOWLEDGE_GOVERNANCE.md` §7 — this report does not itself constitute that review.
2. If a genuine Continuous Writing mark scheme (year-specific) exists but is not publicly hosted, consider requesting it directly from CSSE rather than treating its absence as permanent.
3. Consider a targeted, official-source-only search for genuine examiner guidance or moderation standards (Level B), distinct from the administrative Information Guide already acquired.
4. Any future acquisition pass for a different provider (GL Assessment, CEM, ISEB, Independent) should follow this same three-check verification method (domain/transport, file integrity, content identity) before any file is accepted into the repository.
5. AEP-002 (CSSE Examination Intelligence) may now be considered for authorisation with real source material in place, subject to the Founder's own review of these assets first, per KA-001's explicit stop condition.
