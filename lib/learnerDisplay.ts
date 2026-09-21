/**
 * Customer-facing label for a learner. Learner ids are never shown; a
 * learner whose parent has not added a name yet is "Child 1", "Child 2", ...
 * in the order they were added (stable: the list is ordered by creation).
 */
export function learnerDisplayName(learner: { name: string | null }, index: number): string {
  return learner.name && learner.name.trim() ? learner.name : `Child ${index + 1}`;
}
