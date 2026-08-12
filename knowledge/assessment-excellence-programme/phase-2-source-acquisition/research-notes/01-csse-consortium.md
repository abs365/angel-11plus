# Workstream 1 — CSSE Consortium Official Sources

**Programme:** Angel 11+ Assessment Excellence Programme (AEP-001), Phase 2 — Official Source Acquisition and Validation
**Workstream:** 1 of 10 — CSSE Consortium (csse.org.uk)
**Scope boundary:** Acquisition and verification only. No educational analysis, no competency mapping, no teaching conclusions.
**Cross-reference:** Prior acquisition `knowledge/csse/KA-001_KNOWLEDGE_ACQUISITION_REPORT.md` (17 official examination papers/mark schemes, CSSE-001…CSSE-017) was checked before this pass. This workstream does not re-report items already in KA-001, except where noted for cross-reference/duplicate detection.
**Verification method used throughout:** (1) domain/transport check — `curl -s -o /dev/null -w "%{http_code} %{size_download} %{content_type}"` against the live URL, confirming HTTP 200 on the `csse.org.uk` domain; (2) file-integrity check — PDF magic-byte header (`%PDF`) confirmed on every downloaded file, sizes cross-checked against the download; (3) content-identity check — `pdftotext` (or raw CSV read) run against each file to confirm the extracted text matches the claimed title/subject/year. Where a file returned no extractable text (see below), this is explicitly disclosed rather than silently skipped.

---

## Sources Found

### 1. CSSE 11+ Information Guide — 2026 Entry
- **Authority:** CSSE (Consortium of Selective Schools in Essex)
- **URL:** https://csse.org.uk/wp-content/uploads/2025/03/FINAL-Information-Guide-2026-Entry.pdf
- **Publication Date:** File path dated March 2025 ("FINAL...2025/03"); document text confirms test date "Saturday 20th September 2025"
- **What It Covers:** Full administrative/procedural guide for the 2026 Entry test cycle (registration process, dates, format, member schools, FAQs)
- **Source Type:** Official Administrative Guidance (Level B, consistent with CSSE-001's classification of the equivalent 2027 Entry guide)
- **Copyright/Licensing Notes:** No explicit reuse/redistribution licence found on the page; freely downloadable for public use, consistent with CSSE's general publishing pattern.
- **How Verified:** `curl` returned HTTP 200, `application/pdf`, 879,279 bytes; `pdftotext -layout` opens with "11+ Selective Test Information Guide 2026 Entry Saturday 20th September 2025" — title and date confirmed by direct text extraction, not just filename.
- **Status relative to KA-001:** NEW — distinct from CSSE-001 (2027 Entry edition), which is the current/live edition. This 2026 Entry edition is now the immediately-prior year's edition, still live on CSSE's own domain.

### 2. CSSE 11+ Information Guide — 2025 Entry
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2024/03/For-Publication-Information-Guide-2025-Entry.pdf
- **Publication Date:** File path dated March 2024; document text confirms test date "Saturday 21st September 2024"
- **What It Covers:** Same category of content as above, for the 2025 Entry cycle.
- **Source Type:** Official Administrative Guidance (Level B)
- **Copyright/Licensing Notes:** Same as above — no explicit licence, freely downloadable.
- **How Verified:** `curl` returned HTTP 200, `application/pdf`, 874,486 bytes; `pdftotext -layout` opens with "11+ Selective Test Information Guide 2025 Entry Saturday 21st September 2024."
- **Status relative to KA-001:** NEW — a second prior-year edition still live on the official domain.

### 3. Age Standardisation Statement
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2020/05/age-standardisation-statement.pdf
- **Publication Date:** Page metadata dated 07/04/2020; content references a change effective "from October 2018" following an Office of the Schools Adjudicator ruling
- **What It Covers:** CSSE's own explanation of its age-standardisation methodology — whether/how raw scores are adjusted for candidates' date of birth.
- **Source Type:** Official Standardisation Methodology Statement (Level A — this is exactly the "how CSSE standardises raw scores" category requested)
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** HTTP 200, `application/pdf`, 89,102 bytes; `pdftotext` extracted readable text confirming subject matter: "The results of all candidates will be analysed, by date of birth, to determine if a statistical age-adjustment is required... a modified approach to calculating age-adjustment will be adopted from October 2018."

### 4. 11+ Standardisation Reports (multi-year series — 7 editions found)
Each report documents the mean/standard-deviation values CSSE used to convert that year's raw English and Maths scores into standardised scores (target mean 100, SD 15). All hosted on `csse.org.uk`.

| Report (by URL year label) | URL | Test Year Covered (where confirmed by text) | Verified By |
|---|---|---|---|
| "2019 Entry" | https://csse.org.uk/storage/2020/05/Standardisation-Report-2019-Entry.pdf | Not confirmed by text (see note below) | HTTP 200, valid PDF, 47,174 bytes; **no extractable text** |
| "2020 Entry" | https://csse.org.uk/storage/2020/05/Standardisation-Report-2020-Entry.pdf | Confirmed: "11+ Standardisation Report - October 2019," "2019 (2020 entry)," n=5,465 | HTTP 200, `pdftotext` text extracted and read |
| "2021 Entry" | https://csse.org.uk/storage/2021/10/Standardisation-Report-2021-extract-003.pdf | Confirmed: "11+ Standardisation Report - October 2021," "2021 (2022 entry)," n=4,815 | HTTP 200, `pdftotext` text extracted and read |
| "2022 Entry" | https://csse.org.uk/storage/2022/10/Standardisation-Report-2022-extract.pdf | Not confirmed by text (see note below) | HTTP 200, valid PDF, 40,514 bytes; **no extractable text** |
| "2023 Entry" (filename: 2024-Entry-Standardisation-Report-October-2023) | https://csse.org.uk/wp-content/uploads/2023/10/2024-Entry-Standardisation-Report-October-2023.pdf | Confirmed: "11+ Standardisation Report - October 2023," "2023 (2024 entry)," n=4,983 | HTTP 200, `pdftotext` text extracted and read |
| "2024 Entry" (filename: 2025-Entry-Standardisation-Report) | https://csse.org.uk/storage/2024/10/2025-Entry-Standardisation-Report.pdf | Not confirmed by text (see note below) | HTTP 200, valid PDF, 41,268 bytes; **no extractable text** |
| "2025 Entry" (filename: 2026-Entry-Standardisation-Report-1) | https://csse.org.uk/storage/2025/10/2026-Entry-Standardisation-Report-1.pdf | Not confirmed by text (see note below) | HTTP 200, valid PDF, 42,126 bytes; **no extractable text** |

- **Source Type:** Official Standardisation Methodology / Results Data (Level A)
- **Copyright/Licensing Notes:** No explicit licence found; published under CSSE's Freedom of Information page as part of its transparency/publication scheme.
- **Important disclosed limitation:** Four of the seven reports (marked "no extractable text" above) are valid, correctly-sized PDFs served with HTTP 200 from the official domain, but `pdftotext` returned zero characters of text from them — consistent with these particular files being scanned/image-only PDFs rather than text PDFs (CSSE's own document production is inconsistent year to year: some years produced a text PDF, others an image PDF). I did not fabricate any content for these four; I am reporting them as verified-to-exist-and-resolve, with content identity for those four confirmed only by filename/FOI-page label, not by independent text-read. No tool was available in this environment to render PDF pages as images for visual confirmation (no `pdftoppm`/`pdfinfo` present) — this is disclosed as a genuine gap, not silently worked around.
- **CSSE's own year-labelling convention (observed, not assumed):** the URL's "20XX Entry" label refers to the school-entry year, one year after the test sitting — e.g. the file literally named "Standardisation-Report-2020-Entry.pdf" contains a report titled "October 2019" describing "2019 (2020 entry)" test data. This same one-year offset pattern held for every report where I could read the text (2020, 2021, 2023 files). I have listed the four unreadable reports under their URL-stated label only, without assuming their internal title also follows the same offset — that would be an inference, not a verified fact.

### 5. "Preparing for the 11+" — Statistical Information for Guidance
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2020/05/Appendix-6-FINAL-Preparing-for-the-11statistics-05-10-16.pdf
- **Publication Date:** Filename suggests 05/10/16 (5 October 2016); page listing dated 07/04/2020
- **What It Covers:** CSSE's own statement of what the 11+ test is designed to select for (stated candidate qualities), positioned as guidance rather than a methodology/statistics document despite the filename.
- **Source Type:** Official Guidance (Level B)
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** HTTP 200, `application/pdf`, 333,725 bytes; `pdftotext` confirmed readable text opening "Preparing for the 11+ /statistical information for guidance... The purpose of the 11+ test is to select the children who have the potential to thrive..."

### 6. CSSE Freedom of Information Page and Publication Scheme
- **Authority:** CSSE
- **URL (index page):** https://csse.org.uk/freedom-of-information/
- **URL (Publication Scheme document):** https://csse.org.uk/storage/2021/11/Model-Publication-Scheme-1121.pdf
- **Publication Date:** Publication Scheme dated 07.05.2020 on the index page (document itself undated internally but titled "Model Publication Scheme")
- **What It Covers:** CSSE's statement of what information it proactively publishes and why; confirms CSSE was "formed in 1993 as a voluntary association" and lists its member schools (see Conflicts section below — this document lists **ten** member schools, not seven).
- **Source Type:** Official FOI/Transparency Publication (Level A/B)
- **Copyright/Licensing Notes:** No explicit licence; part of CSSE's statutory-adjacent publication scheme.
- **How Verified:** Index page fetched directly and its full document list extracted (see items 7–9 below, all children of this page). Publication Scheme PDF: HTTP 200, `application/pdf`, 162,218 bytes; `pdftotext` confirmed readable text: "Publication Scheme for the CSSE Administration Office... The CSSE was formed in 1993 as a voluntary association. The ten schools that are currently members of the CSSE are as follows: Colchester County High School, Colchester Royal Grammar School, King Edward VI Grammar School, Shoeburyness High School, Southend High School for Boys, Southend High School for Girls, St Bernards High School, St Thomas More High School, Westcliff High School for Boys, Westcliff High School for Girls."

### 7. Notification Re: Publishing of Statistical Score Data for 2021 Entry
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2021/01/NOTIFICATION-IN-RELATION-TO-THE-PUBLISHING-OF-STATISTICAL-SCORE-DATA-FOR-2021-ENTRY.pdf
- **Publication Date:** 18.01.2021 (per FOI page listing)
- **What It Covers:** A short official notice explaining a delay in publishing statistical score data for 2021 Entry, due to the test being moved to November 2020 (COVID-era disruption) rather than the normal September sitting.
- **Source Type:** Official Examination Announcement (Level A) — exactly the "official examination announcements" category requested.
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** HTTP 200, `application/pdf`, 78,431 bytes; `pdftotext` confirmed full readable text matching the title: "Statistical score information is currently being collated due to our test being carried out in November 2020 rather than September 2020. This information will be published in March 2021 at the earliest."

### 8. Historical Guidance Sheets (score-cutoff / distribution data, 3 documents)
- **Authority:** CSSE
- **URLs:**
  - 2026 Entry (published 13.10.2025): https://csse.org.uk/storage/2025/10/FOR-PUBLICATION-HISTORICAL-GUIDANCE-SHEET-FOR-2026-ENTRY.pdf
  - 2025 Entry (published 14.10.2024): https://csse.org.uk/storage/2024/10/CSSE-Historical-Guidance-sheet-2025-Entry.pdf
  - 2019–2024 Entry compiled (published 13.10.2025): https://csse.org.uk/storage/2025/10/Historical-Guidance-Sheets-2019-Entry-to-2024-Entry-1.pdf
- **What It Covers:** "Scores of last selective place offered at each CSSE school on National Offer Day" — i.e. the official cut-off standardised score for each member school, by year and by priority-area status. This is the official score-distribution/cut-off publication requested in scope.
- **Source Type:** Official Score Distribution Data (Level A)
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** All three HTTP 200, `application/pdf`. 2025 Entry sheet and 2026 Entry sheet both returned readable text via `pdftotext`, e.g. the 2025-Entry-labelled sheet opens "Scores of last selective place offered at each CSSE school on National Offer Day (1st March 2024)... ESSEX GRAMMAR SCHOOLS 2024 ENTRY... Colchester County High School for Girls... 330." The 2019–2024 compiled sheet (486,007 bytes) returned **no extractable text** (same image-PDF limitation disclosed in item 4) — verified to exist and resolve, but its internal content was not independently text-confirmed.

### 9. Raw and Standardised Score Data Files (score distributions, machine-readable)
- **Authority:** CSSE
- **URLs:**
  - 2026 Entry raw scores (20.04.2026): https://csse.org.uk/storage/2026/04/Raw-scores-for-2026-Entry.csv
  - 2026 Entry standardised scores (20.04.2026): https://csse.org.uk/storage/2026/04/Standardised-scores-for-2026-Entry.csv
  - 2025 Entry raw scores (29.04.2025): https://csse.org.uk/storage/2025/04/Raw-scores-for-2025-Entry.csv
  - 2025 Entry standardised scores (29.04.2025): https://csse.org.uk/storage/2025/04/Standardised-scores-2025-Entry-1.csv
  - Raw scores, 2019–2024 Entry compiled (13.10.2025): https://csse.org.uk/storage/2025/10/Raw-Scores-from-2019-Entry-to-2024-Entry-for-publication.xlsx
  - Standardised scores, 2019–2024 Entry compiled (13.10.2025): https://csse.org.uk/storage/2025/10/Standardised-Scores-from-2019-Entry-to-2024-Entry-for-publication-1.xlsx
- **What It Covers:** Anonymised candidate-level score distributions by gender and birth month / test date.
- **Source Type:** Official Score Distribution Data (Level A), machine-readable
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable from the FOI page.
- **How Verified:** All six HTTP 200. The two CSV files were read directly (plain text, no extraction tool needed) and confirmed genuine tabular score data, e.g. "CSSE 11+ Examination 2026 Entry,,, Raw Scores sorted by gender and birth month..." The two 2025-labelled CSVs and two 2019–2024 xlsx files were confirmed by HTTP 200 + correct `content-type` (`text/csv` and the Excel MIME type respectively) but not opened cell-by-cell.
- **Anomaly observed (not fabricated, directly read):** the file named `Standardised-scores-for-2026-Entry.csv` contains an internal header row reading "CSSE 11+ Examination **2025**Entry" (no space, and the wrong year), even though its test-date rows correctly read "Test Day Saturday 20th September 2025" / "Test Day Tuesday 30th September 2025" — dates consistent with the 2026 Entry cycle. This reads as a labelling typo inside CSSE's own file, not a URL-vs-content mismatch on the substantive data. Recorded here as observed, not corrected or interpreted further.

### 10. Total Number of CSSE 11+ Examination Candidates, 2010–2025 Entry
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2025/04/Total-Number-of-CSSE-11-Examination-Candidates-2010-2025-Entry.pdf
- **Publication Date:** 03.04.2025 (per FOI page listing)
- **What It Covers:** Official candidate-volume / cohort-size figures across a 16-year span (2010–2025 Entry) — exactly the "candidate volume / cohort size" category requested.
- **Source Type:** Official Candidate Volume Publication (Level A)
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** HTTP 200, `application/pdf`, 17,191 bytes (confirmed by two independent downloads returning byte-identical files). Confirmed a genuine, linearized, single-page PDF via raw byte inspection (`/Linearized 1 ... /N 1`, i.e. one page). **No extractable text** — same image-PDF limitation as above; the specific candidate-volume figures were not independently read, only the document's existence, official domain, correct size/type and single-page structure were confirmed.

### 11. Official Administrative/Procedural Documents — 2027 Entry cycle (5 documents, all live alongside CSSE-001)
- **Authority:** CSSE
- **URLs and titles (all confirmed by `pdftotext`):**
  - SEND Access Arrangements 2027 Entry (27/03/2026): https://csse.org.uk/storage/2026/05/SEND-Guidelines-2027-Entry.pdf — opens "11+ SELECTIVE TEST SEND ACCESS ARRANGEMENTS 2027 ENTRY"
  - Postal Registration Form F1 (12/05/2026): https://csse.org.uk/storage/2026/05/F1-270426-Registration-form-4-pages-2026.pdf — opens "11+ EXAMINATION REGISTRATION FORM F1"
  - SEND Notification Form F2 (2027 Entry): https://csse.org.uk/storage/2026/03/SEND-Notification-Form-F2-2027-Entry.pdf — opens "NOTIFICATION OF MEDICAL CIRCUMSTANCES, EHCP OR ACCESS ARRANGEMENTS FORM F2"
  - Primary School Headteacher's Proforma F3 (2027 Entry): https://csse.org.uk/storage/2026/03/Primary-School-Headteachers-Pro-Forma-Letter-F3-2027-Entry.pdf — opens "HEADTEACHER'S LETTER: STUDENT CIRCUMSTANCES DECLARATION (CSSE 11+ ENTRANCE EXAMINATION) F3"
  - Under/Over Age Entry Policy (12.07.2021, still linked from the current examination page): https://csse.org.uk/storage/2021/07/UNDER-and-OVER-AGE-ENTRY-2022-Entry.pdf — opens "Arrangements for 'under age' and 'over age' entry to CSSE Schools"
- **What It Covers:** Admissions-process mechanics — registration, access arrangements/SEND, age-eligibility rules.
- **Source Type:** Official Administrative/Procedural Documents (Level A/B — these are the primary-source forms and policy statements governing the admissions process itself)
- **Copyright/Licensing Notes:** No explicit licence found; freely downloadable, evidently intended for use by applying families.
- **How Verified:** All five HTTP 200, valid PDFs, and all five returned readable, on-topic text via `pdftotext` confirming title and subject.

### 12. Photographing of Candidates Policy
- **Authority:** CSSE
- **URL:** https://csse.org.uk/storage/2022/03/Photographing-of-candidates.pdf
- **Publication Date:** 14.03.2022 (per page listing)
- **What It Covers:** Official policy on photographing/ID-checking candidates during the test.
- **Source Type:** Official Administrative/Procedural Document (Level B)
- **Copyright/Licensing Notes:** No explicit licence; freely downloadable.
- **How Verified:** HTTP 200, `application/pdf`, 60,752 bytes, correct content-type. **No extractable text** (image-PDF limitation, disclosed as above) — existence and domain confirmed; internal content not independently text-read.

### 13. Atom Learning Partnership (Pupil Premium 11+ access) — page and PDF
- **Authority:** CSSE
- **URLs:**
  - Page: https://csse.org.uk/11-atom-learning/
  - PDF: https://csse.org.uk/storage/2025/06/Atom-Learning.pdf (13.06.2025)
- **What It Covers:** CSSE's own explanation of a partnership with the commercial platform Atom Learning to give Pupil-Premium-eligible candidates free 11+ preparation access.
- **Source Type:** Official Guidance (Level B) — this is CSSE's own institutional page (confirmed by direct fetch: hosted under csse.org.uk, written in CSSE's own voice, e.g. "we work in partnership with Atom Learning...to provide students who are eligible for Pupil Premium with free online learning and 11+ exam familiarisation"), not third-party marketing merely linked from the site.
- **Copyright/Licensing Notes:** No explicit licence on the page itself; the PDF's own content could not be independently read (see below).
- **How Verified:** Page fetched directly, content confirmed as CSSE's own institutional voice, not a redirect to third-party content. PDF: HTTP 200, `application/pdf`, 67,458 bytes, correct content-type — **no extractable text** (image-PDF limitation disclosed above), so the PDF's specific internal content was not independently confirmed beyond existence/domain/type.

### 14. Examination Date Announcement (2027 Entry)
- **Authority:** CSSE
- **URL:** https://csse.org.uk/news/ (and repeated in the current Information Guide, csse.org.uk/examination/)
- **Publication Date:** Current news item, undated on the page itself as fetched
- **What It Covers:** "Examination date for 2027 Entry: Saturday 19th September 2026," plus a note that registration for that cycle is now closed.
- **Source Type:** Official Examination Announcement (Level A/B)
- **Copyright/Licensing Notes:** N/A — public news page.
- **How Verified:** Fetched directly; content is consistent with the test date already independently confirmed inside CSSE-001 (the 2027 Entry Information Guide, previously acquired under KA-001). No separate downloadable document beyond the news page itself was found for this specific announcement.

---

## Categories Searched With Nothing Found

- **Official FOI disclosure log (a structured index/register of FOI requests-and-responses hosted BY CSSE itself).** CSSE does not appear to publish its own FOI request log on csse.org.uk. What CSSE publishes instead is a proactive Publication Scheme (item 6/7 above) that pre-empts common FOI requests by publishing the underlying data directly. A genuine FOI request-and-response archive for CSSE does exist, but it is hosted by the third-party platform WhatDoTheyKnow.com (`https://www.whatdotheyknow.com/body/csse`), which is **not a CSSE-controlled or CSSE-published domain** — it is a public FOI-request mirror run by mySociety, to which CSSE merely replies by email. Per the workstream's scope rule (official CSSE domain or a domain CSSE itself officially publishes through), this was **not** counted as a Level 1 CSSE source and no items from it are listed above. It is flagged here as a candidate lead for a different, non-Level-1 workstream if the programme later wants third-party-mirrored correspondence.
- **Formal public consultation documents** (e.g. a consultation on admissions criteria changes). Searched via site-restricted and general queries; none found on csse.org.uk. CSSE's own Publication Scheme states admissions authority sits with the individual academy schools/Local Authorities, not CSSE itself, which may explain why CSSE does not appear to run consultations directly.
- **Examiner reports or moderation-standard documents distinct from the administrative Information Guide.** None found — consistent with KA-001's own prior finding of the same gap (KA-001 §9).
- **A dedicated "score distribution" publication in the sense of a full statistical/graphical distribution (e.g. histogram, percentile table) beyond raw/standardised score exports and the standardisation reports' mean/SD figures.** Not found as a separate document; the closest official equivalents are the Standardisation Reports (item 4) and the raw/standardised score CSV/XLSX exports (item 9), which contain the underlying data from which a distribution could be derived but are not themselves a published distribution analysis.

---

## Possible Conflicts / Duplicate or Superseded Versions

1. **Member-school count discrepancy (important for programme scope).** CSSE's own Publication Scheme (item 6, verified by direct text extraction) states CSSE has **ten** current member schools: Colchester County High School (for Girls), Colchester Royal Grammar School, King Edward VI Grammar School, Shoeburyness High School, Southend High School for Boys, Southend High School for Girls, St Bernard's High School, St Thomas More High School, Westcliff High School for Boys, Westcliff High School for Girls. This programme's own `schools/` folder (`knowledge/assessment-excellence-programme/phase-2-source-acquisition/schools/`) currently has only **seven** subfolders, covering Colchester County High School for Girls, Colchester Royal Grammar School, King Edward VI Grammar School, Southend High School for Boys, Southend High School for Girls, Westcliff High School for Boys, and Westcliff High School for Girls — omitting Shoeburyness High School, St Bernard's High School, and St Thomas More High School. This is reported factually as a scope-accuracy observation only (e.g. the three omitted schools may be partially-selective or faith academies rather than the "grammar school" framing used in this programme's brief) — no judgement is made here about whether the omission is correct; it is flagged for the programme's own decision-makers.
2. **Multiple live Information Guide editions.** Three distinct, currently-resolving editions were confirmed live simultaneously on csse.org.uk: 2027 Entry (current; already acquired as CSSE-001 under KA-001), 2026 Entry (item 1 above), and 2025 Entry (item 2 above). A fourth, older "Information Guide 2021" page (`https://csse.org.uk/information-guide-2021/`) also resolves (HTTP 200) but contains no working PDF download — it now just redirects readers to "click on the CSSE 11+ Examination tab to view the latest Information Guide." This is recorded as a dead/superseded stub, not a genuine standalone source, and is not listed under "Sources Found" above.
3. **Standardisation Report year-labelling convention.** As detailed in item 4, CSSE's URL naming convention labels each Standardisation Report by the school-entry year (one year after the test sitting), which could be misread as the test year itself if not checked against the document's own internal title. This is recorded so future workstreams do not misattribute a report's test year from its filename alone.
4. **CSV internal-header typo.** As detailed in item 9, the file `Standardised-scores-for-2026-Entry.csv` contains an internal title row saying "2025Entry" despite its URL, filing date, and internal test dates all being consistent with the 2026 Entry cycle. Recorded as an observed anomaly in CSSE's own document, not a discrepancy introduced by this research.
5. **Duplicate with KA-001.** The English Continuous Writing Sample Mark Scheme (`https://csse.org.uk/storage/2020/05/ECW-Sample-Mark-Scheme.pdf`) surfaced again independently in this workstream's search but is already acquired and profiled as CSSE-002 in KA-001 (identical URL, confirmed by cross-reading `knowledge/csse/assets/CSSE-002.md`). Not re-reported as a new source above.

---

## Environment Limitation Disclosed

This research environment had no `pdfinfo` or `pdftoppm` (or any PDF-to-image renderer) available, only `pdftotext`. For seven of the documents above, `pdftotext` returned zero characters despite the PDF being valid, correctly-sized, and served with HTTP 200 from the official domain — consistent with those specific files being scanned/image-only PDFs. In every such case this is stated explicitly next to the source entry, rather than being silently treated as a full content verification. Domain, transport, file-integrity and (where marked) content-identity checks were still performed and passed for all of these.
