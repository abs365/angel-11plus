/**
 * Founder Validation Assessment (CSSE) — evidence metadata for the
 * Founder Evidence View. Not exam content itself (that lives in
 * supabase/migrations/021_founder_validation_csse_assessment.sql,
 * fetched at runtime like any other ali_question_bank content) — this
 * module carries only the traceability fields the live schema has no
 * column for (evidence Asset IDs, originality declaration, difficulty
 * basis, "why this belongs"), keyed by the same item id, so the results
 * screen can render them without a schema change.
 *
 * Every field here is a direct, disclosed transcription of the reasoning
 * already recorded in RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md
 * and FOUNDER_VALIDATION_ASSESSMENT_CONTENT_REGISTER.md — not invented
 * fresh for display purposes.
 */

export interface FounderValidationEvidenceEntry {
  itemId: string;
  section: "English" | "Mathematics";
  questionType: string;
  competency: string;
  marks: number;
  evidenceSourceIds: string[];
  evidenceNote: string;
  originalityDeclaration: string;
  difficultyBasis: string;
  whyItBelongs: string;
}

export const FOUNDER_VALIDATION_EVIDENCE: Record<string, FounderValidationEvidenceEntry> = {
  "fv-eng-001-q1": {
    itemId: "fv-eng-001-q1",
    section: "English",
    questionType: "QT-RC-01 — Literal Short-Answer Retrieval",
    competency: "RC-01 (Literal Retrieval from Narrative Text)",
    marks: 1,
    evidenceSourceIds: ["CSSE-008 Q2-Q4/Q12 (2022 Entry)", "CSSE-003 Q1/Q5(a)/Q9/Q11 (2023 Entry)", "CSSE-013 Q2 (2021 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, present with the same shape in all three CSSE years held.",
    originalityDeclaration: "New passage ('The Orchard'), new characters, new fact — no CSSE wording or scenario reused.",
    difficultyBasis: "Educational judgement (one direct reasoning step, low guessability) — not empirical.",
    whyItBelongs: "Reproduces CSSE's own single-fact, narrow-stem retrieval format at the paper's most foundational comprehension level.",
  },
  "fv-eng-001-q2": {
    itemId: "fv-eng-001-q2",
    section: "English",
    questionType: "QT-RC-02 — Yes/No Judgement with Written Justification",
    competency: "RC-02 (Inference and Justified Interpretation)",
    marks: 3,
    evidenceSourceIds: ["CSSE-008 Q1 (2022 Entry)", "CSSE-003 Q2 (2023 Entry)", "CSSE-013 Q1 (2021 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, always the paper's opening question in all three years — reason-count varies 1-3, treated as a parameter of the same format.",
    originalityDeclaration: "Original judgement question and reasons, independent of any CSSE example.",
    difficultyBasis: "Educational judgement, positioned as an accessible opening item, matching the source pattern's own paper position.",
    whyItBelongs: "Tests whether a judgement can be substantiated with textual evidence, the same two-stage demand CSSE uses to open its Comprehension section.",
  },
  "fv-eng-001-q3": {
    itemId: "fv-eng-001-q3",
    section: "English",
    questionType: "QT-RC-05 — Quotation-and-Explanation (Evidence-Linking)",
    competency: "RC-02 (Inference and Justified Interpretation)",
    marks: 3,
    evidenceSourceIds: ["CSSE-003 Q6b/Q12 (2023 Entry)", "CSSE-008 Q7 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-3/MEDIUM, directly evidenced with an explicit quotation-then-explanation dual field in two of three years.",
    originalityDeclaration: "Original quotation and explanation demand, independent of any CSSE passage.",
    difficultyBasis: "Educational judgement — pairing textual evidence with interpretive significance is a step up from single-fact retrieval.",
    whyItBelongs: "Reproduces CSSE's distinguishing labelled quotation-plus-explanation structure, not a generic 'explain your answer' prompt.",
  },
  "fv-eng-001-q4": {
    itemId: "fv-eng-001-q4",
    section: "English",
    questionType: "QT-RC-10 — Effect-of-Language / Word-Choice Interpretation",
    competency: "RC-02 (Inference and Justified Interpretation)",
    marks: 2,
    evidenceSourceIds: ["CSSE-013 Q4/Q9 (2021 Entry)", "CSSE-008 Q8/Q9/Q11/Q14/Q16 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-3/MEDIUM, open 'what does this suggest' phrasing evidenced in two of three years reviewed to this depth.",
    originalityDeclaration: "Original phrase and interpretation, independent of any CSSE text.",
    difficultyBasis: "Educational judgement — interpreting a personifying phrase beyond its literal meaning.",
    whyItBelongs: "Matches the open 'what does this word/phrase suggest' demand CSSE uses repeatedly across two of three held years.",
  },
  "fv-eng-001-q5": {
    itemId: "fv-eng-001-q5",
    section: "English",
    questionType: "QT-RC-07 — Multi-Entity Comparative Attribute Extraction",
    competency: "RC-01 (Literal Retrieval from Narrative Text)",
    marks: 4,
    evidenceSourceIds: ["CSSE-003 Q8 (2023 Entry)", "CSSE-008 Q15 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-3/MEDIUM, structurally comparable two-entity extraction in two of three years.",
    originalityDeclaration: "Original two-character comparison, independent of any CSSE example.",
    difficultyBasis: "Educational judgement — requires keeping two characters' details correctly separated, not conflated.",
    whyItBelongs: "Reproduces CSSE's two-entity parallel-extraction format, testing attribution accuracy rather than a single retrieval.",
  },
  "fv-mth-001": {
    itemId: "fv-mth-001",
    section: "Mathematics",
    questionType: "QT-MR-01 — Direct Arithmetic Computation",
    competency: "MR-01 (Arithmetic Calculation)",
    marks: 1,
    evidenceSourceIds: ["CSSE-006/011/016 Q1-Q3 (2021-2023 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, the paper's opening question format in an identical shape across all three years.",
    originalityDeclaration: "Original numbers, no CSSE value reused.",
    difficultyBasis: "Educational judgement — single-step subtraction with borrowing.",
    whyItBelongs: "Matches CSSE's own opening-question format exactly: a bare computation, no word-problem wrapper.",
  },
  "fv-mth-002": {
    itemId: "fv-mth-002",
    section: "Mathematics",
    questionType: "QT-MR-03 — Unit Conversion / Measurement Calculation",
    competency: "MR-01 (Arithmetic Calculation)",
    marks: 1,
    evidenceSourceIds: ["CSSE-011 Q4a (2022 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, present in all three years; specific unit pair varies naturally.",
    originalityDeclaration: "Original values (4.7m, not 3.12m) — the unit-pair genre is reproduced, the specific figures are not copied.",
    difficultyBasis: "Educational judgement — single standard-factor conversion.",
    whyItBelongs: "Directly mirrors CSSE's own metres-to-millimetres conversion pattern.",
  },
  "fv-mth-003": {
    itemId: "fv-mth-003",
    section: "Mathematics",
    questionType: "QT-MR-06 — Algebraic Symbol/Unknown-Value Problem-Solving",
    competency: "MR-02 (Algebraic/Symbolic Problem-Solving)",
    marks: 2,
    evidenceSourceIds: ["CSSE-011 Q6 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH (upgraded from AEP-003's original EMC-2 by AEP-004's fuller three-year reading).",
    originalityDeclaration: "Independently reworked with different letters and values from CSSE-011's own instance — not a name/number substitution of the same relationships.",
    difficultyBasis: "Educational judgement — requires substitution across two relationships before a single-variable solve (3 reasoning steps).",
    whyItBelongs: "Reproduces the exact structural shape CSSE-011 Q6 uses: two stated symbolic relationships plus one sum constraint.",
  },
  "fv-mth-004": {
    itemId: "fv-mth-004",
    section: "Mathematics",
    questionType: "QT-MR-07 — Geometric Angle/Shape Reasoning",
    competency: "MR-03 (Geometric and Spatial Reasoning)",
    marks: 1,
    evidenceSourceIds: ["CSSE-011 Q12 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH (upgraded from AEP-003's original EMC-2).",
    originalityDeclaration: "Original angle value (65°, not CSSE's own value).",
    difficultyBasis: "Educational judgement — one property application (isosceles) plus angle-sum-in-triangle.",
    whyItBelongs: "Matches CSSE-011 Q12's own isosceles-triangle-angle format directly.",
  },
  "fv-mth-005": {
    itemId: "fv-mth-005",
    section: "Mathematics",
    questionType: "QT-MR-09 — Data Reading (Table/Chart/Graph Interpretation)",
    competency: "MR-01 (Arithmetic Calculation)",
    marks: 1,
    evidenceSourceIds: ["CSSE-011 Q15 (2022 Entry)", "CSSE-016 Q10 (2021 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, present in all three years; representation type (table vs. chart) varies naturally.",
    originalityDeclaration: "Original data set (cafe tea sales), independent scenario.",
    difficultyBasis: "Educational judgement — single-step sum from tabular data.",
    whyItBelongs: "Reproduces the extract-then-compute demand CSSE tests via table/chart data across all three held years.",
  },
  "fv-mth-006": {
    itemId: "fv-mth-006",
    section: "Mathematics",
    questionType: "QT-MR-12 — Average (Mean) Calculation",
    competency: "MR-01 (Arithmetic Calculation)",
    marks: 2,
    evidenceSourceIds: ["CSSE-011 Q11 (2022 Entry)"],
    evidenceNote: "Confirmed EMC-4/HIGH, present in all three years; reverse/weighted-mean sub-format confirmed 2022/2023 only.",
    originalityDeclaration: "Independently reworked scenario and values, same forward-reconstruction-then-forward structure as CSSE-011 Q11.",
    difficultyBasis: "Educational judgement — reconstructing a total from a mean is a step up from a direct mean calculation.",
    whyItBelongs: "Reproduces CSSE's own forward-then-forward mean-reconstruction structure exactly.",
  },
};
