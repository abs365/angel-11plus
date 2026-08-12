import type { BankQuestion } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

/**
 * Educational Increment 005 Part G — a deterministic structural signature,
 * not a semantic/embedding one. Deliberately narrow: combines fields
 * already on every BankQuestion (competency's Question Type, family,
 * answer form, working-step count, representation class) into a short,
 * reviewable string. Two items sharing a signature are structurally
 * similar enough to warrant a human look during authoring — not
 * automatically rejected, since two items in the same family are SUPPOSED
 * to share most of this (that is what a family is). The real use is
 * cross-family: an item that collides with a DIFFERENT family's signature
 * suggests accidental duplication of structure under a new label, exactly
 * the "apparent volume created from educationally identical structures"
 * risk this Part exists to catch.
 *
 * Not embedding-based, not NLP-based, by design — the directive explicitly
 * asked not to introduce that infrastructure unless genuinely justified,
 * and a small, hand-authored bank does not yet justify it.
 */
export interface StructuralSignatureInput {
  skill: string; // Question Type code, e.g. "QT-MR-05"
  familyId?: string;
  answer: string;
  workingSteps?: string[];
}

function answerForm(answer: string): "numeric" | "degree" | "fraction" | "boolean" | "compound" | "text" {
  const trimmed = answer.trim();
  if (/^(true|false)$/i.test(trimmed)) return "boolean";
  if (/^-?\d+(\.\d+)?°$/.test(trimmed)) return "degree";
  if (/^-?\d+\s+\d+\/\d+$/.test(trimmed) || /^-?\d+\/\d+$/.test(trimmed)) return "fraction";
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "numeric";
  if (trimmed.includes(",") || trimmed.includes(";") || /[A-Za-z]=.+,\s*[A-Za-z]=/.test(trimmed)) return "compound";
  return "text";
}

/**
 * Returns a short, deterministic, human-readable signature — not a hash,
 * deliberately, so a reviewer can read what two colliding items actually
 * have in common without decoding anything.
 */
export function structuralSignature(input: StructuralSignatureInput): string {
  const stepCount = input.workingSteps?.length ?? 0;
  const form = answerForm(input.answer);
  return `${input.skill}|${form}|steps=${stepCount}`;
}

export function bankQuestionSignature(q: BankQuestion): string {
  const prompt = q.prompt as MathsQuestion;
  const workingSteps = "workingSteps" in prompt ? (prompt as { workingSteps?: string[] }).workingSteps : undefined;
  const answer = "answer" in prompt ? String((prompt as { answer: unknown }).answer) : "";
  return structuralSignature({ skill: q.skill, familyId: q.familyId, answer, workingSteps });
}

/**
 * Groups a candidate pool by signature and flags any group spanning more
 * than one family_id as a cross-family collision worth a human look —
 * the actual purpose of this mechanism (see module docstring). A
 * same-family group is expected and not flagged.
 */
export function findCrossFamilyCollisions(questions: BankQuestion[]): Map<string, Set<string>> {
  const bySignature = new Map<string, Set<string>>();
  for (const q of questions) {
    const sig = bankQuestionSignature(q);
    const familyId = q.familyId ?? `unfamilied:${q.id}`;
    if (!bySignature.has(sig)) bySignature.set(sig, new Set());
    bySignature.get(sig)!.add(familyId);
  }
  const collisions = new Map<string, Set<string>>();
  for (const [sig, families] of bySignature) {
    if (families.size > 1) collisions.set(sig, families);
  }
  return collisions;
}
