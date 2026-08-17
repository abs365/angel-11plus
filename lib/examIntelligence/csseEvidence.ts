/**
 * Programme Increment 008B (Exam Intelligence + Preparation Clock Product
 * Integration) — the single canonical source for verified CSSE exam
 * facts, per Increment 008A's own instruction ("design one canonical
 * source where practical" rather than hardcoding facts into many UI
 * components). Every fact below was independently retrieved directly
 * from csse.org.uk (not a tuition-centre marketing page) during 008A and
 * re-carried forward here unchanged — see Decision 83 and
 * ANGEL_008A_MOCK_EXPERIENCE_AND_EXAM_INTELLIGENCE_PROGRAMME_V1.md §5.
 *
 * Every entry is typed with its own evidence category and confidence —
 * this module must never be edited to quietly upgrade a medium-confidence
 * figure to high without a genuine re-verification (see the Continuous
 * Writing entry below, which remains disclosed as medium-confidence per
 * the Founder's own explicit 008B instruction not to silently upgrade it).
 */

export type EvidenceCategory =
  | "official_exam_fact"
  | "official_policy_process"
  | "angel_preparation_strategy"
  | "inference_design_decision"
  | "unknown_requires_evidence";

export type EvidenceConfidence = "current" | "stale" | "superseded" | "unverified";

export interface CsseEvidenceFact {
  id: string;
  label: string;
  detail: string;
  category: EvidenceCategory;
  confidence: EvidenceConfidence;
  sourceUrl: string;
  retrievedAt: string; // ISO date
}

export const CSSE_EXAM_AUTHORITY_NAME = "Consortium of Selective Schools in Essex (CSSE)";

export const CSSE_EVIDENCE_FACTS: CsseEvidenceFact[] = [
  {
    id: "paper-structure",
    label: "Two papers: English and Mathematics",
    detail: "English (60 minutes, plus 10 minutes additional reading time) and Mathematics (60 minutes).",
    category: "official_exam_fact",
    confidence: "current",
    sourceUrl: "https://www.csse.org.uk",
    retrievedAt: "2026-08-17",
  },
  {
    id: "applied-reasoning-removed",
    label: "Applied Reasoning is not part of the English paper",
    detail: "\"With effect from September 2024 (2025 Entry) the English paper does not contain Applied Reasoning questions.\"",
    category: "official_exam_fact",
    confidence: "current",
    sourceUrl: "https://www.csse.org.uk",
    retrievedAt: "2026-08-17",
  },
  {
    id: "continuous-writing-structure",
    label: "Continuous Writing: two contrasting tasks within the English paper",
    detail: "Continuous Writing is part of the English paper, with two contrasting writing tasks. An official sample mark scheme is published.",
    category: "official_exam_fact",
    confidence: "current",
    sourceUrl: "https://csse.org.uk/wp-content/uploads/2020/05/ECW-Sample-Mark-Scheme.pdf",
    retrievedAt: "2026-08-17",
  },
  {
    id: "continuous-writing-marks-weighting",
    label: "Continuous Writing exact marks, weighting and per-task timing",
    detail: "Not independently line-verified against the official PDF in this session (PDF rendering was unavailable in this environment). Deliberately not surfaced to parents as a confirmed figure until directly re-verified.",
    category: "unknown_requires_evidence",
    confidence: "unverified",
    sourceUrl: "https://csse.org.uk/wp-content/uploads/2020/05/ECW-Sample-Mark-Scheme.pdf",
    retrievedAt: "2026-08-17",
  },
  {
    id: "standardisation-method",
    label: "Official standardisation/scoring methodology",
    detail: "No published methodology was found on the official site. Angel 11+ cannot and does not claim to reproduce an official CSSE standardised score.",
    category: "unknown_requires_evidence",
    confidence: "unverified",
    sourceUrl: "https://www.csse.org.uk",
    retrievedAt: "2026-08-17",
  },
];

export function getCurrentCsseFacts(): CsseEvidenceFact[] {
  return CSSE_EVIDENCE_FACTS.filter((f) => f.category === "official_exam_fact");
}

export const CSSE_EVIDENCE_LAST_VERIFIED = "2026-08-17";
