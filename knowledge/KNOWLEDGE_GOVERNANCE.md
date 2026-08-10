# Knowledge Repository Governance Standard

**Angel 11+ — Version 3.0, Academic Excellence Programme**
**Work Package:** KG-001
**Status:** Governance Standard — permanent, version-independent

---

## 1. Mission

The Knowledge Repository exists to hold the academic evidence on which Angel 11+ is built, separately from the application code that delivers it to learners.

Application code answers the question "how does Angel 11+ work?" The Knowledge Repository answers a different, prior question: "how do we know what Angel 11+ should teach, and how do we know it is correct?" Confusing these two concerns — treating a design decision embedded in code as though it were academic evidence, or treating an assumption as though it were a verified fact — is how educational products drift from the examinations they claim to prepare learners for.

Separating knowledge from code enforces three permanent guarantees:

- Every academic claim Angel 11+ makes can be traced back to a specific, identifiable piece of evidence, not to a developer's memory or a plausible-sounding assumption.
- Academic evidence can be reviewed, corrected and superseded on its own timeline, independent of code releases.
- The same body of evidence can inform many different implementations — content, assessment, recommendation, reporting — without being duplicated or reinterpreted inconsistently in each one.

The Knowledge Repository is therefore the constitutional foundation beneath every examination-board pathway Angel 11+ supports, present or future.

## 2. Guiding Principles

These principles govern every decision made about the Knowledge Repository and every piece of work that draws on it. They are non-contradictory by design and are to be read together, not selectively.

**Knowledge before Code.** No implementation decision is made before the underlying academic knowledge exists and has been captured in the repository. Code that encodes an assumption in place of evidence is a defect, not a shortcut.

**Evidence before Intelligence.** Intelligence — patterns, models, frameworks — may only be derived from evidence that has actually been placed in the repository. Intelligence produced without corresponding evidence is not intelligence; it is speculation presented as intelligence, and is prohibited.

**Intelligence before Implementation.** Implementation work packages may only build on intelligence that has itself been derived from evidence and has passed the quality gates defined in Section 9. Implementation must never reach back past intelligence to justify itself directly from raw, uninterpreted evidence.

**Truth before Completeness.** An incomplete but accurate picture of a subject is always preferable to a complete but invented one. Where evidence is insufficient to support a claim, the correct governance response is to leave the claim unmade, not to fill the gap with a plausible substitute.

**Traceability over Assumption.** Every academic claim, competency, difficulty judgement or pattern used anywhere in Angel 11+ must be traceable to a specific knowledge asset via the provenance standard in Section 5. An untraceable claim is treated as an assumption, regardless of how confident it appears.

**Continuous Academic Review.** The Knowledge Repository is never considered finished. Evidence is reviewed on an ongoing basis as examination boards revise their syllabi, formats and guidance, and as new evidence becomes available. Governance under this standard is a continuing discipline, not a one-time setup task.

## 3. Repository Structure

The Knowledge Repository is organised by examination provider, with one shared area for material that applies across providers.

```
knowledge/
    csse/
    gl-assessment/
    cem/
    iseb/
    independent/
    shared/
```

| Area | Purpose |
|---|---|
| `csse/` | Evidence specific to the CSSE (Essex) examination. |
| `gl-assessment/` | Evidence specific to GL Assessment. |
| `cem/` | Evidence specific to CEM (Durham University). |
| `iseb/` | Evidence specific to the ISEB Pre-Test. |
| `independent/` | Evidence relevant to independent and bespoke school entrance examinations, which vary by school and do not share a single governing body. |
| `shared/` | Evidence, research or guidance that applies across more than one provider — for example, general principles of examination design, child assessment research, or comparative studies spanning multiple boards. Material belongs here only when it is genuinely cross-provider; provider-specific evidence must not be placed in `shared/` for convenience. |

Each provider area holds its evidence organised by evidence type (for example: official papers, mark schemes, writing requirements, examiner guidance, supporting research). The specific subdivisions within a provider area may vary to suit the evidence that provider publishes, provided every asset remains classified under Section 4 and documented under Section 5.

## 4. Evidence Classification

Every knowledge asset is classified into exactly one of five evidence levels. The level determines how much trust the asset carries and what it may be used for.

| Level | Category | Trust | Permitted use |
|---|---|---|---|
| **A** | Official examination authorities — papers, mark schemes and specifications published directly by the examination board or its authorised agent. | Highest. Treated as ground truth for the examination it describes. | May be used as the primary basis for any intelligence framework or downstream implementation. |
| **B** | Official guidance and specifications — syllabus documents, admissions guidance, examiner reports and other material published by the examination board or the schools it serves, but not itself a paper or mark scheme. | High. Authoritative on format, scope and expectation, though not a direct record of assessed content. | May be used to interpret and contextualise Level A evidence; may support intelligence frameworks in its own right where no Level A evidence exists for the point in question. |
| **C** | Peer-reviewed educational research — published academic research on assessment design, child learning, or the relevant examinations, subject to independent review before publication. | Moderate-to-high, contingent on the rigour and relevance of the specific source. | May inform intelligence frameworks, particularly for pedagogical and developmental questions Level A/B evidence does not address; must be cited individually, not treated as uniformly authoritative. |
| **D** | Internal intelligence derived from Levels A–C — frameworks, models and patterns produced by Angel 11+ work packages through analysis of higher-level evidence. | Derived, not primary. Trustworthy only insofar as its derivation from Levels A–C is documented and traceable. | May inform implementation directly, provided its provenance chain back to Levels A–C is complete and auditable. |
| **E** | Draft analysis and working notes — provisional observations, in-progress reasoning, and material not yet reviewed. | Lowest. Explicitly provisional. | Must not be used as the basis for implementation. May only inform further analysis, and must be either promoted to Level D through review or discarded — it may not remain a permanent, unreviewed input. |

Evidence must never be used above its classified level. Where a work package requires a level of evidence that is not yet present in the repository, the correct governance response is to treat the work as blocked, not to substitute a lower level of evidence while presenting it as though it met the required level.

## 5. Provenance Standard

Every knowledge asset added to the repository must carry the following metadata, recorded alongside the asset itself:

- **Title** — a clear, unambiguous name for the asset.
- **Source** — the originating body, publication or author, stated precisely enough to be independently verified.
- **Version** — the edition, series, or version identifier of the source material, where the source itself is versioned.
- **Publication date** — the date the source material was originally published or issued.
- **Date added** — the date the asset was added to the Knowledge Repository.
- **Reviewer** — the individual who reviewed the asset for accuracy of classification and metadata prior to acceptance.
- **Confidence level** — the reviewer's assessment of how reliable the asset is within its evidence level (Section 4 classifies the category of evidence; confidence level records reviewer judgement about the specific asset).
- **Review status** — the asset's current position in the lifecycle defined in Section 7 (for example: under review, accepted, superseded, archived).

An asset without complete provenance metadata is not considered part of the governed Knowledge Repository, regardless of where it physically resides within the directory structure.

## 6. Copyright and Usage

Official examination materials may be retained within the Knowledge Repository strictly for internal educational analysis — that is, for the derivation of intelligence frameworks, competency models and assessment patterns used to inform Angel 11+'s own, independently authored content and features.

Learner-facing content must not reproduce copyrighted examination material — including but not limited to official questions, passages, mark schemes or examiner commentary — unless appropriate permission or licensing has been obtained and recorded against the relevant asset's provenance metadata. In the absence of such permission, only the underlying educational patterns, competencies and structures may be extracted and used; the specific expression of the source material may not be copied, paraphrased into near-equivalence, or otherwise reproduced.

All intelligence and implementation derived from copyrighted source material must remain traceable to that source under the provenance standard in Section 5, so that questions of permitted use can always be re-examined against the original terms under which the material was obtained.

## 7. Knowledge Lifecycle

Every knowledge asset progresses through a defined lifecycle, and its full history is retained rather than overwritten at each stage.

- **Added.** The asset is placed in the repository with complete provenance metadata and an initial review status of "under review."
- **Reviewed.** The asset is assessed against its claimed evidence level and provenance metadata is verified. Review status is updated to "accepted" or the asset is returned for correction.
- **Updated.** Where a newer version of the same underlying source becomes available, it is added as a new asset with its own provenance record, rather than overwriting the existing one.
- **Superseded.** When a newer asset replaces an older one, the older asset's review status is updated to "superseded," recording which asset replaced it. The superseded asset is retained, not deleted.
- **Archived.** Assets no longer relevant to current examination formats are moved to an archived status. Archived assets remain in the repository and remain traceable, but are excluded from active use by new work packages.

Complete historical traceability is maintained at every stage: the repository must always be able to show not only its current state, but how that state was reached.

## 8. Traceability Model

All work drawing on the Knowledge Repository follows a single, mandatory lifecycle. No stage may be skipped, and no stage may be justified by reference to a stage more than one step removed from it:

```
Knowledge Asset
    ↓
Intelligence Framework
    ↓
Architecture
    ↓
Implementation
    ↓
Verification
    ↓
Production
```

- A **Knowledge Asset** is raw evidence, classified and provenanced under Sections 4 and 5.
- An **Intelligence Framework** is analysis derived from one or more Knowledge Assets, producing patterns, models or competency structures.
- **Architecture** translates an Intelligence Framework into a technical design.
- **Implementation** builds the architecture into working software.
- **Verification** confirms the implementation faithfully reflects the architecture, and, by extension, the Intelligence Framework and underlying Knowledge Assets.
- **Production** is the verified implementation released for real use.

Each stage's output must be traceable to the specific output of the stage before it. A gap anywhere in this chain — an architecture with no Intelligence Framework behind it, an implementation with no corresponding architecture — is a governance failure, regardless of how reasonable the ungoverned step appears in isolation.

## 9. Quality Gates

Knowledge must not progress into implementation until governance requirements have been satisfied. Specifically:

- No Intelligence Framework may be produced except from Knowledge Assets that have completed the "Reviewed" stage of the lifecycle in Section 7.
- No Architecture may be produced except from an Intelligence Framework that documents its own traceability back to specific Knowledge Assets.
- No Implementation may begin except against an Architecture that has itself been reviewed and approved.
- No Implementation may reach Production except through Verification that confirms its fidelity to the preceding stages.

Where any gate is not satisfied, the correct governance response is to hold the work at its current stage until the gate is met, not to proceed on the understanding that the gap will be closed later.

## 10. Future Expansion

This governance model is provider-agnostic by design. It applies identically to every examination provider represented in the Knowledge Repository's directory structure, and to any provider added to that structure in the future.

Extending the Knowledge Repository to a new examination provider requires only that the new provider's evidence be classified (Section 4), provenanced (Section 5) and lifecycle-managed (Section 7) in exactly the same way as every existing provider's evidence — no change to this governance standard, to the evidence hierarchy, to the traceability model, or to the quality gates is required to accommodate it. Provider-specific detail belongs in the evidence itself and in the intelligence derived from it, never in the governance standard that applies uniformly across all providers.

## 11. Admissions Data Governance

**Added:** Angel Assessment Transformation Programme, Programme 001, Release 0 (Governance and Evidence Foundation), per Decision AEP4-D15. **Scope of this addition: admissions-specific evidence only** (Published Admission Numbers, priority-area definitions, oversubscription criteria, lowest-offered scores, and equivalent per-school admissions facts). Sections 1–10 above continue to govern exam-paper and syllabus evidence exactly as written and are not modified by this section. This section exists because the Assessment Excellence Programme found admissions evidence has a materially different reliability profile from exam-paper evidence: it changes on an annual administrative cycle, and two contemporaneous official sources can legitimately disagree about the same fact (see the Assessment Excellence Conflict Register, `knowledge/assessment-excellence-programme/phase-4-review-board/ASSESSMENT_EXCELLENCE_CONFLICT_REGISTER.md`, for two live, confirmed examples). Sections 1–10's lifecycle was built around evidence that rarely conflicts with itself; this section closes that gap for the evidence type where it does.

### 11.1 Evidence Year

Every admissions-specific fact carries a mandatory **Evidence Year** — the specific entry year (e.g. "September 2026 entry") the figure applies to — recorded distinctly from the existing Provenance Standard's Publication Date and Date Added fields (Section 5). An admissions fact's Publication Date records when the source document was issued; its Evidence Year records which annual cycle the fact itself describes. The two are not interchangeable: the Assessment Excellence Programme found multiple cases of a single document (e.g. a school's admissions policy) whose Publication Date and Evidence Year genuinely differ, and conflating them risks citing a stale figure as current or a current figure as historical.

### 11.2 Annual Re-Verification Cadence

Unlike exam-paper evidence, which the existing lifecycle (Section 7) correctly manages by waiting for a new version to be noticed, an admissions fact must be **actively re-checked against its current-cycle primary source before the next admissions season it would inform**, not left to sit until someone happens to notice a replacement document. A populated admissions fact whose Evidence Year has lapsed without this re-check is not "Accepted" under Section 7's lifecycle — it is stale, and must be flagged as such rather than silently continuing to display.

### 11.3 Conflicting Sources, Unresolved

A sixth Review Status value is added to the five named in Section 7 (Added, Reviewed, Updated, Superseded, Archived), for admissions evidence only: **Conflicting Sources, Unresolved.** This status applies when two or more Level 1 Official Primary sources state materially different values for the same fact and the same Evidence Year, with no source-hierarchy rule available to prefer one over the other (Section 4's A–E scale ranks evidence *type*, not one same-level source over another of identical type). A fact in this status is structurally prevented from being surfaced as a single confident value in any parent-facing or Admissions Intelligence context — it must be shown, where shown at all, as a disclosed disagreement between named, dated sources, never as a silently-resolved single figure. Moving a fact out of this status requires either a superseding document from one of the conflicting sources, a direct enquiry response from the school or authority in question, or an explicit Founder instruction to treat one source as authoritative pending resolution — never a default or convenience choice by whoever is populating the data.

### 11.4 Relationship to Sections 1–10

This section does not alter the Evidence Classification scale (Section 4), the Provenance Standard's existing fields (Section 5), the Copyright and Usage rules (Section 6), or the Quality Gates (Section 9) — it adds three admissions-specific requirements on top of them. Any future provider or evidence category with a similar volatility and cross-source-conflict profile to admissions data may adopt this section's pattern by the same "consult, don't repeat" discipline Section 10 already establishes for provider expansion — this section is retained as the template, not duplicated per provider.
