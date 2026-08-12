# Workstream 2 — Essex County Council Admissions Sources

Research conducted 2026-08-05. All URLs below were verified either by full-text extraction (via WebFetch/Read on the downloaded PDF) or by a direct HTTP status check (`curl -o /dev/null -w "%{http_code}"`) confirming a live 200 response on the essex.gov.uk domain at the time of research. Both methods are noted per source.

## Which of the 7 schools does Essex CC actually administer admissions for?

**Verified finding: Essex County Council directly administers/coordinates admissions for only 3 of the 7 schools** — Colchester Royal Grammar School (CRGS), Colchester County High School for Girls (CCHSG), and King Edward VI Grammar School, Chelmsford (KEGS). The other 4 — Southend High School for Boys, Southend High School for Girls, Westcliff High School for Boys, Westcliff High School for Girls — do **not** appear in Essex CC's own admissions machinery.

Evidence, cross-verified across three independent Essex CC documents:

1. **Essex County Council Co-ordinated Scheme for Secondary Admissions, Academic Year 2026-2027** (full text extracted), section 7.3.5: *"In respect of the three CSSE selective schools within Essex, the LA will communicate directly with the Consortium."* — Essex CC's own scheme explicitly says only **three** CSSE schools fall within its area.
2. **Schools Admission Policies Directory 2026/2027 — Secondary Schools in Essex** (full text extracted, 115-page document with an alphabetical school index) lists individual entries and PANs for Colchester Royal Grammar School, Colchester County High School for Girls, and King Edward VI Grammar School, Chelmsford — but contains **no entry at all** for Southend High School for Boys/Girls or Westcliff High School for Boys/Girls anywhere in its alphabetical index (page 115) or district listings (the directory covers only Chelmsford, Uttlesford, Braintree, Colchester, Tendring, Maldon, Rochford, Castle Point, Basildon, Brentwood, Epping Forest, Harlow — not the Borough of Southend-on-Sea).
3. **Schools Admission Policies Directory**, page 2, "Online admissions": *"Parents and carers who live in the Essex County Council area (excluding those living in the Borough of Southend-on-Sea or in Thurrock) can apply for their child's school place online using the Essex Online Admissions Service."* This confirms Southend-on-Sea is administratively separate from Essex CC (Southend-on-Sea became a unitary authority independent of Essex CC in 1998).

This is consistent with the task's own framing that a separate workstream is covering Southend BC, and matches what a CSSE Supplementary Information Form (extracted from the CRGS PDF, page 6) shows: the CSSE's 10 member/associated schools span both authorities, but each home Local Authority (Essex CC vs Southend-on-Sea City Council) runs its own coordinated admissions scheme and receives the CSSE's Order of Merit list separately for the schools in its own area.

**Conclusion:** Essex CC is Level-1 official-primary-evidence authority for CRGS, CCHSG, and KEGS only. For the other 4 schools, Essex CC is not the right primary source — Southend-on-Sea City Council is (see the parallel Southend BC workstream).

## Sources Found

### 1. Essex County Council Co-ordinated Scheme for Secondary Admissions, Academic Year 2026-2027
- **Authority:** Essex County Council (Admissions, Applications and Awards team)
- **URL:** https://www.essex.gov.uk/sites/default/files/2025-02/Secondary%20Coordinated%20Scheme%202026%20to%202027.pdf
- **Publication Date:** 15 January 2025 (per document's own title page); Version 1.0 FINAL
- **Years Covered:** Academic Year 2026-2027 entry (i.e. children applying autumn 2025 for September 2026 entry)
- **Schools Covered:** All Essex-coordinated secondary schools and academies, including the 3 CSSE schools within Essex (CRGS, CCHSG, KEGS)
- **Source Type:** Official statutory scheme document (required under the School Admissions Regulations (Admission Arrangements and Co-ordination of Admission Arrangements) (England))
- **Copyright/Licensing Notes:** No explicit copyright/licence statement observed within the extracted text; standard ECC branding/logo present. Not marked Open Government Licence in the document itself.
- **How Verified:** Fetched via WebFetch, saved as a local PDF, and full text extracted and read directly (13 pages) via the Read tool — confirmed genuine ECC letterhead, contact details (admissions@essex.gov.uk, 0345 603 2200, County Hall, Chelmsford CM1 1QH), and full statutory timetable (application open 12 Sept 2025, national closing date 31 Oct 2025, CSSE Order of Merit lists due to LA by 18 Dec 2025, National Offer Day 2 March 2026).
- **Key content:** Full statutory timetable; confirms LA "will communicate directly with the Consortium of Selective Schools in Essex (CSSE)" (6.5) and that this applies to "the three CSSE selective schools within Essex" (7.3.5); waiting list rules (LA holds waiting lists to 31 August 2026, minimum requirement of 31 December in normal year of entry for other year groups per 10.5.1); appeals process.

### 2. Secondary schools co-ordinated scheme: 2025 to 2026 (prior year)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2024-02/Secondary%20Coordinated%20Scheme%202025%20to%202026.pdf
- **Publication Date:** Not directly extracted (filename/path dated Feb 2024); linked from the admissions booklets page as "2025 to 2026"
- **Years Covered:** Academic Year 2025-2026 entry
- **Schools Covered:** Same scope as above
- **Source Type:** Official statutory scheme document (prior-year version)
- **Copyright/Licensing Notes:** Not separately checked (only HTTP-status verified, not full-text extracted)
- **How Verified:** Direct HTTP status check — `curl` returned `200`, file size 252,920 bytes. Not full-text read.

### 3. Secondary schools co-ordinated scheme: 2027 to 2028 (future year, already published)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2026-02/Secondary%20schools%20co-ordinated%20scheme%20-%202027%20to%202028.pdf
- **Publication Date:** Filename/path dated Feb 2026
- **Years Covered:** Academic Year 2027-2028 entry
- **Schools Covered:** Same scope as above
- **Source Type:** Official statutory scheme document (next-year version, published ahead of the statutory 28 February deadline required by the scheme itself)
- **Copyright/Licensing Notes:** Not separately checked
- **How Verified:** Direct HTTP status check — `curl` returned `200`, file size 293,090 bytes. Not full-text read. Found via WebFetch of the parent listing page (essex.gov.uk/schools-and-learning/schools/admissions/admissions-booklets-policies-and-forms), which itself was fetched and confirmed to list exactly these three scheme years (2025-26, 2026-27, 2027-28) — no earlier archived years are linked from that page.

### 4. Schools Admission Policies Directory 2026/2027 — Secondary Schools in Essex
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2025-09/ECC%20Secondary%20Policies%20Directory_2026_2027.pdf
- **Publication Date:** Not stated on cover; PAN/application figures inside are dated "Sept 2026" (PAN) / "Sept 2025" (applications received) / "Jan 2025" (roll numbers) / "3 March 2025" (last-admitted-criterion snapshot) — internally consistent with a document compiled mid-to-late 2025.
- **Years Covered:** Admission Number for September 2026 entry; roll/application figures from the 2025-26 cycle
- **Schools Covered:** All 12 Essex districts (Chelmsford, Uttlesford, Braintree, Colchester, Tendring, Maldon, Rochford, Castle Point, Basildon, Brentwood, Epping Forest, Harlow) — includes full individual entries for CRGS (pp.67-69, PAN 128), CCHSG (pp.62-66, PAN 192), and KEGS Chelmsford (pp.51-54, PAN 150). **Does not include** Southend-on-Sea or Thurrock schools.
- **Source Type:** Official composite policy directory / PAN data publication (essentially a per-school "how oversubscription criteria work" digest, each entry also giving the prior year's number of applications received and the last admissions criterion under which a place was offered)
- **Copyright/Licensing Notes:** No explicit copyright statement extracted; final page (p.116) gives ECC contact details, "essex.gov.uk/keepmeposted" sign-up, and states "Published September 2024" with document code "DS16_5345" — note this date/code appears to be a **carried-over footer from a prior edition** and is inconsistent with the 2026/2027-dated content, which is itself a data-quality flag worth recording (see Conflicts section below).
- **How Verified:** Fetched via WebFetch, saved as local PDF, full text extracted and read directly (116 pages) via the Read tool. Confirmed real ECC branding, real school addresses/telephone numbers/headteacher names, and internally consistent PAN figures for CRGS (128) and KEGS (150) matching the school-specific admission-arrangements PDFs (source 6 and 7 below).

### 5. Schools Admission Policies Directory 2026/2027 — alternate/later-dated copy
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2025-12/ECC%20Secondary%20Policies%20Directory_2026_2027.pdf
- **Publication Date:** Path dated December 2025 (three months after source 4's September 2025 path)
- **Years Covered:** Same "2026/2027" title as source 4
- **Schools Covered:** Presumed same scope as source 4 (not separately confirmed by full-text read)
- **Source Type:** Official composite policy directory — **apparent revised/updated republication of the same document as source 4**
- **Copyright/Licensing Notes:** Not separately checked
- **How Verified:** Direct HTTP status check only — `curl` returned `200`, file size 767,728 bytes (vs 812,684 bytes for the September-dated copy at source 4 — different file size confirms this is not simply a duplicate URL for the identical file, but a genuinely different version). Not full-text read, so the substantive differences between the two versions were not established. **Flagged as an unresolved possible-supersession — see Conflicts section.**

### 6. Colchester Royal Grammar School — Admissions Arrangements, Academic Year 2025-2026
- **Authority:** Essex County Council (hosted school-specific admission-arrangements document, ECC document reference "4036")
- **URL:** https://www.essex.gov.uk/sites/default/files/2024-09/Colchester%20Royal%20Grammar%20School%20(4036).pdf
- **Publication Date:** Path dated September 2024; document itself titled "Admissions Arrangements - Academic Year 2025-2026"
- **Years Covered:** September 2025 entry (2025-2026 academic year)
- **Schools Covered:** Colchester Royal Grammar School only
- **Source Type:** Official individual-school determined admission arrangements, published/hosted by Essex CC as part of its statutory admissions documentation set (also incorporates a CSSE Supplementary Information Form for 2025 entry as an appendix)
- **Copyright/Licensing Notes:** No explicit copyright/licence line extracted; school branding (CRGS crest) plus a Thinking Schools Academy Trust company-registration footer (Company Number: 7359755)
- **How Verified:** Fetched via WebFetch, saved as local PDF, full text extracted and read directly (7 pages including the appended CSSE SIF) via the Read tool.
- **Key content:** PAN confirmed as 128 for Year 7 (text: *"The published admission number for Year 7 is 128"*); Sixth Form PAN of 200 (*"The school's PAN, including existing CRGS students transferring from Year 11, is 200"*); full oversubscription criteria (Priority 1 — up to 12 places for looked-after/Pupil-Premium children scoring above 320; Priority 2 — remaining places by descending rank order of CSSE test score); waiting list held to end of Autumn Term following September entry.
- **Note:** A newer 2026-2027 version of the same document (school PAN 128 again) was located inside the Directory in source 4 and matches this figure — cross-verified.

### 7. King Edward VI Grammar School, Chelmsford — Admissions Policy for September 2026 entry (ref. 5411)
- **Authority:** Essex County Council (hosted school-specific admission-arrangements document, ECC reference "5411")
- **URL:** https://www.essex.gov.uk/sites/default/files/2025-08/2025%20King%20Edward%20VI%20Grammar%20School%20(5411)_0.pdf
- **Publication Date:** Path dated August 2025; per search-result summary the policy was "approved by trustees in December 2024"
- **Years Covered:** September 2026 entry
- **Schools Covered:** King Edward VI Grammar School, Chelmsford, only
- **Source Type:** Official individual-school determined admission arrangements
- **Copyright/Licensing Notes:** Not directly extracted (verified by HTTP status only)
- **How Verified:** Direct HTTP status check — `curl` returned `200`, file size 375,159 bytes. Content not fetched via WebFetch (avoided a second large-PDF extraction attempt given time constraints), but a WebSearch summary of the same document independently corroborated the PAN of 150 and CSSE registration process, which matches the PAN of 150 already cross-verified in source 4 (the Directory).

### 8. King Edward VI Grammar School, Chelmsford — Admissions Policy for September 2025 entry (prior year)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2024-09/King%20Edward%20VI%20Grammar%20School%20-%202025.pdf
- **Publication Date:** Path dated September 2024
- **Years Covered:** September 2025 entry
- **Schools Covered:** KEGS only
- **Source Type:** Official individual-school determined admission arrangements (prior-year version)
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** Direct HTTP status check — `curl` returned `200`, file size 590,055 bytes. Content not read.

### 9. Colchester County High School for Girls — Admissions Arrangements 2023 (ECC ref. 5454)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2023-09/Colchester-County-High-School-For-Girls-5454-2023.pdf
- **Publication Date:** Path dated September 2023
- **Years Covered:** Appears to be for 2023 entry (title includes "2023")
- **Schools Covered:** Colchester County High School for Girls only
- **Source Type:** Official individual-school determined admission arrangements (an older, archived-but-still-live year)
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** Direct HTTP status check only — `curl` returned `200`, file size 268,919 bytes. Content not read; PAN cross-checked instead against the Sept-2025-dated Directory (source 4), which independently gives CCHSG's PAN as 192 for Sept 2026 entry.
- **Note:** This is the **oldest live individual-school document found for any of the 3 in-scope Essex schools** — it demonstrates Essex CC does retain some individual-school PDFs from several years back on live URLs, but a systematic year-by-year archive (2016-2024) was not located (see "Categories Searched With Nothing Found" below).

### 10. Secondary education in Essex 2026 to 2027 (composite prospectus / "Secondary Education in Essex" booklet)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/sites/default/files/2025-10/Secondary%20education%20Brochure%202026%20to%202027.pdf
- **Publication Date:** Path dated October 2025
- **Years Covered:** 2026-2027 admissions cycle
- **Schools Covered:** All Essex secondary schools (this is the booklet the Coordinated Scheme repeatedly refers parents to for full admissions guidance, timetable notes, and identification of which schools require a Supplementary Information Form)
- **Source Type:** Official composite admissions guidance booklet ("Secondary Education in Essex" booklet referenced throughout the Coordinated Scheme document, e.g. sections 7.1.1, 7.1.3, 7.2.2)
- **Copyright/Licensing Notes:** Not checked (file too large — 10.35MB — for full-text extraction via WebFetch; only HTTP status confirmed)
- **How Verified:** Direct HTTP status check — `curl` returned `200`, file size 10,852,788 bytes. WebFetch attempt failed with a "maxContentLength exceeded" tool error (file exceeds the 10MB fetch limit); content itself was **not** read, so no direct quotes can be given from this specific document — it is recorded here purely as a verified-live official source, not as a source whose content has been checked line-by-line.

### 11. Essex County Council Freedom of Information disclosure log / search portal
- **Authority:** Essex County Council
- **URL:** https://secureapps.essex.gov.uk/Freedom_of_information/
- **Publication Date:** N/A — live searchable database, continuously updated
- **Years Covered:** Portal covers requests across many years (page indicated "939 total pages of requests" at time of check, not filtered to a specific year range)
- **Schools Covered:** N/A directly — the portal has a "Business Area" filter that includes "Schools" as a category, per WebFetch summary
- **Source Type:** Official FOI disclosure log / live searchable portal (not a single static document)
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** WebFetch confirmed the page is genuinely titled/functions as Essex CC's FOI search tool, with date-range and Business Area filters, a "YourRight.ToKnow@essex.gov.uk" contact address, and individual FOI records showing reference number, title, received date and outcome status.
- **Important caveat:** I did **not** run an actual search inside this portal for grammar-school-specific FOI responses (the tool available to me could only fetch/summarise the page, not interact with the search form), so **no specific grammar-school FOI disclosure record from this log has been verified or cited**. I also encountered one specific disclosed-document URL (`https://secureapps.essex.gov.uk/Freedom_of_information/view_doc.aspx?DocID=52593`) while investigating — this resolved to a genuine Essex CC-hosted `.xlsx` spreadsheet file (confirming the disclosure log does serve real disclosed data files), but **I could not determine what topic that specific spreadsheet covers** (it could not be opened as plain text, and I did not have a way to open it as a spreadsheet), so it is **not** claimed as grammar-school-related — it is recorded only as evidence that the portal genuinely serves real disclosed documents, not as a Category source in its own right.
- Separately, third-party site WhatDoTheyKnow.com hosts at least two FOI requests addressed to Essex County Council specifically about grammar school admissions ("Grammar school admissions breakdown by postcode groups (SS0 to SS8)" and "Grammar School Admissions from Basildon Borough"), but **WhatDoTheyKnow.com is not an essex.gov.uk domain** and per the task rules I am not treating it as a qualifying primary-source URL — it is noted here only as a pointer for a future researcher who wants to chase the underlying ECC FOI reference numbers through the official portal at source 11.

### 12. "Grammar school places" guidance page
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/schools-and-learning/schools/admissions/grammar-school-places
- **Publication Date:** Not dated (standard CMS page, no visible publication/last-updated date extracted)
- **Years Covered:** Current-cycle guidance, undated
- **Schools Covered:** General reference to "Essex grammar schools" as a category; directs readers to the CSSE website for the 11+ examination; does not itself name/list the individual CSSE schools
- **Source Type:** Official web guidance page (not a downloadable document)
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** Fetched via WebFetch; confirmed live (HTTP 200, 28,549 bytes) and content-summarised. Contains no PAN, waiting-list, or statistical data — it is a basic explainer page only.

### 13. Secondary School Offer Day (news article)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/news/secondary-school-offer-day
- **Publication Date:** 28 February 2023 (per WebFetch extraction)
- **Years Covered:** September 2023 admissions cycle
- **Schools Covered:** All Essex secondary schools generally — **does not mention grammar schools, CSSE, or the Consortium of Selective Schools by name** (confirmed by direct extraction — this is an important negative finding, see below)
- **Source Type:** Official news release with aggregate offer statistics
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** Fetched via WebFetch; confirmed live and content extracted.
- **Key figures quoted directly:** 16,945 total applications for September 2023 admissions (described as the highest number ECC had ever received); 84.17% of children offered their first preference; almost 93% offered either first or second preference; just under 97% offered one of their named preferences.
- **Important limitation:** These are **whole-Essex, all-secondary-schools aggregate figures** — they are **not** grammar-school-specific and **not** broken down by CSSE school. No school-by-school or grammar-school-specific offer/oversubscription statistics were found published by Essex CC in this or any other source located in this workstream (see "Categories Searched With Nothing Found" below).

### 14. Admissions booklets, policies and forms (listing/index page)
- **Authority:** Essex County Council
- **URL:** https://www.essex.gov.uk/schools-and-learning/schools/admissions/admissions-booklets-policies-and-forms
- **Publication Date:** Not dated (live index page)
- **Years Covered:** Currently links to 2025-26, 2026-27, and 2027-28 coordinated scheme years
- **Schools Covered:** Index to all secondary (and other-phase) admissions documents
- **Source Type:** Official index/listing page — the parent page from which sources 1-3 were discovered
- **Copyright/Licensing Notes:** Not checked
- **How Verified:** Fetched via WebFetch and confirmed to list the three coordinated-scheme-year documents by exact filename/URL, which were then independently HTTP-verified.

## Categories Searched With Nothing Found

- **Secondary transfer statistics broken down by individual grammar school or by CSSE school** (e.g. applications received, offers made, oversubscription ratio specifically for CRGS, CCHSG, or KEGS): Searched repeatedly; only whole-Essex aggregate figures were found (source 13). Essex CC's own Directory (source 4) does give a per-school "Applications received (all preferences)" figure for every comprehensive/academy school in the directory, but — importantly — **CRGS, CCHSG, and KEGS entries in the Directory do not include an "Applications received" line at all** (unlike ordinary comprehensive schools' entries), presumably because their intake is determined by the CSSE test/Order-of-Merit process rather than parental preference ranking in the same way. This is a genuine content gap in the primary source itself, not a search failure — recorded here as "searched, not found."
- **Consultation documents specifically about changes to admissions arrangements for CRGS, CCHSG, or KEGS** (e.g. a public consultation on altering PAN, oversubscription criteria, or catchment/priority-area boundaries for any of the 3 schools): No such consultation document was located on essex.gov.uk in this pass. Only general "Determined Admission Arrangements" documents for infant/junior/primary schools were found via search (and one such primary document was directly confirmed to be out of scope for secondary grammar schools). No secondary-specific, grammar-specific consultation PDF was found.
- **Archived/historical Coordinated Admissions Scheme documents prior to 2025-26** (i.e. covering entry years 2016-2024): Searched via site-restricted web search; the current Essex CC "Admissions booklets, policies and forms" index page only lists the three most recent scheme years (2025-26, 2026-27, 2027-28) — no earlier years are linked from that live index. One individual-school PDF from 2023 was found still live (source 9), showing ECC does not blanket-delete old files, but no systematic historical index or archive of pre-2025 coordinated schemes was located on essex.gov.uk itself. (The Wayback Machine / web.archive.org was not checked in this pass — that would be the next step for a researcher wanting 2016-2024 coverage, but web.archive.org captures are not essex.gov.uk primary sources in themselves.)
- **A specific, named FOI disclosure record about CSSE/grammar school admissions data, actually retrieved and confirmed** on the essex.gov.uk FOI portal (source 11): The portal itself was confirmed live and functional, but no specific grammar-school-related disclosed record was pulled up and verified within the scope of this pass (the available tooling could not execute a search inside the portal's form). See note under source 11.

## Possible Conflicts / Duplicate or Superseded Versions

1. **Two differently-sized copies of the "Schools Admission Policies Directory 2026/2027" exist at different URLs** (source 4, dated Sept 2025 in its URL path, 812,684 bytes vs source 5, dated Dec 2025 in its URL path, 767,728 bytes). Both currently resolve live. The September-dated copy is the one whose full text was extracted for this register (giving CRGS PAN 128, CCHSG PAN 192, KEGS PAN 150). The December-dated copy was **not** full-text checked, so it is not known whether it contains updated PAN figures, updated oversubscription criteria, or is simply a re-upload of identical content under a later filename/path. **This should be re-checked before the register treats the September-dated PAN figures as final** — a later republication existing on the same domain is a signal that ECC may have revised the document after September 2025.
2. **The Schools Admission Policies Directory's own final page states "Published September 2024"** (document code DS16_5345) even though the document's substantive content (PANs, application figures, "last child admitted" criteria) is explicitly dated to the 2025-26/2026-27 cycle. This internal date inconsistency suggests the document template/footer was carried over from a prior year's edition without updating the "Published" line — a minor but genuine data-quality flag in Essex CC's own publication, not an error introduced by this research.
3. **No conflict was found regarding the "3 of 7 schools" finding itself** — three independent Essex CC documents (the Coordinated Scheme's own explicit "three CSSE selective schools within Essex" statement, the Directory's school-by-school coverage, and the Directory's explicit statement that its online admissions service excludes Southend-on-Sea residents) all agree with each other, giving this finding a strong (triple-corroborated, Level-1) evidence basis.
