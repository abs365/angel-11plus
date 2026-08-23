import type { BankQuestion } from "@/types/ali/questionBank";

/**
 * Mock Programme Increment 005 (Decision 148) — pure, directly-testable
 * representation of the cross-subject assessment hierarchy (PAPER ->
 * SECTION -> SOURCE/STIMULUS -> NUMBERED QUESTION -> SUBPART -> RESPONSE
 * COMPONENT -> MARK, Decision 148 Part 2) at the level this increment
 * actually builds: a numbered question and its subparts/response
 * components, represented as several `ali_question_bank` rows (migration
 * 093) sharing one `questionGroupId`, ordered by `groupOrder`.
 *
 * This is NOT a new scoring engine. `mock_score_attempt()` (migrations
 * 074/075) is untouched by this module and by migration 093 — no Mock
 * form exists yet for it to score. These functions exist so that (1) the
 * grouping/ordering/mark-aggregation capability Decision 148 requires can
 * be proven directly, without a live database or a Mock form, and (2) a
 * future form-assembly/scoring increment has a proven, reusable starting
 * point rather than needing to invent this logic from scratch against
 * real content for the first time.
 *
 * Deliberately does not group standalone items (questionGroupId ===
 * undefined) at all -- a standalone item is not part of a "group" of any
 * size, matching the current, correct meaning of every one of the 331+
 * existing ali_question_bank rows and all 38 Batch 001/002 Mock
 * candidate questions (Decisions 141/145), none of which carry a
 * questionGroupId.
 */

export interface GroupedQuestion {
  id: string;
  questionGroupId: string;
  groupOrder: number;
  subpartLabel?: string;
  marks?: number;
}

/**
 * True only when `q` carries a non-empty `questionGroupId` -- the sole,
 * deliberately narrow signal this module uses to distinguish a grouped
 * subpart/response-component from a standalone numbered question. Never
 * inferred from `familyId`, `learningUnitId`, or any other field (see
 * migration 093's own header comment for why those two are deliberately
 * not reused for this purpose).
 */
export function isGroupedItem(q: Pick<BankQuestion, "questionGroupId">): boolean {
  return typeof q.questionGroupId === "string" && q.questionGroupId.length > 0;
}

/**
 * Extracts the one scalar `marks` value a `BankQuestion.prompt` already
 * carries today (Question/MathsQuestion/EnglishComprehensionPrompt/
 * VocabularyPrompt all declare `marks: number`; only ReasoningQuestion and
 * WritingPrompt do not, hence the optional return) -- reads the existing
 * shape, never invents a second marks representation.
 */
export function marksOf(q: Pick<BankQuestion, "prompt">): number | undefined {
  const prompt = q.prompt as { marks?: unknown };
  return typeof prompt?.marks === "number" ? prompt.marks : undefined;
}

/**
 * Groups only the genuinely grouped items (isGroupedItem) from a
 * candidate pool by `questionGroupId`, each member sorted deterministically
 * by `groupOrder` ascending (ties broken by `id` for full determinism,
 * never by array/fetch order, which this project's own established
 * discipline treats as never guaranteed). Standalone items are excluded
 * entirely -- callers that also need standalone items should filter the
 * original pool themselves with `!isGroupedItem(q)`.
 */
export function groupQuestionsByGroupId(
  questions: readonly BankQuestion[]
): Map<string, GroupedQuestion[]> {
  const byGroup = new Map<string, GroupedQuestion[]>();

  for (const q of questions) {
    if (!isGroupedItem(q) || q.questionGroupId === undefined) continue;
    const entry: GroupedQuestion = {
      id: q.id,
      questionGroupId: q.questionGroupId,
      groupOrder: q.groupOrder ?? Number.MAX_SAFE_INTEGER,
      subpartLabel: q.subpartLabel,
      marks: marksOf(q),
    };
    const existing = byGroup.get(q.questionGroupId);
    if (existing) {
      existing.push(entry);
    } else {
      byGroup.set(q.questionGroupId, [entry]);
    }
  }

  for (const members of byGroup.values()) {
    members.sort((a, b) => a.groupOrder - b.groupOrder || a.id.localeCompare(b.id));
  }

  return byGroup;
}

/**
 * Deterministic ordering for one already-grouped set of members, exposed
 * standalone since a caller may already hold one group's members (e.g.
 * from a future form's own question_manifest) without needing to
 * re-derive the grouping itself. Same tie-break as
 * `groupQuestionsByGroupId()` -- groupOrder ascending, then id -- so the
 * two functions can never disagree about ordering for the same input.
 */
export function sortGroupMembers(members: readonly GroupedQuestion[]): GroupedQuestion[] {
  return [...members].sort((a, b) => a.groupOrder - b.groupOrder || a.id.localeCompare(b.id));
}

/**
 * Sums the marks of one numbered question's own subparts/response
 * components -- the group-level rollup a future scoring/reporting
 * increment needs (Decision 148 Part 9: "subpart marks -> numbered-
 * question marks -> section marks -> ... -> total paper score"), proven
 * here as a pure aggregation over already-known per-item marks. A member
 * with no resolvable `marks` (see `marksOf()`) contributes 0 and is
 * reported separately in `unresolvedCount` rather than silently treated
 * as correct-but-worthless or thrown away -- callers that must not
 * proceed with an incomplete group should check `unresolvedCount === 0`
 * themselves; this function never assumes a default mark value on a
 * caller's behalf.
 */
export function computeGroupMarks(members: readonly GroupedQuestion[]): {
  totalMarks: number;
  unresolvedCount: number;
} {
  let totalMarks = 0;
  let unresolvedCount = 0;
  for (const m of members) {
    if (typeof m.marks === "number") {
      totalMarks += m.marks;
    } else {
      unresolvedCount += 1;
    }
  }
  return { totalMarks, unresolvedCount };
}
