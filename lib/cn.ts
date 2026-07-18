/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — a minimal className
 * joiner for the new components/ui/* library. Deliberately not clsx or
 * tailwind-merge: neither is an existing dependency, and this project has
 * added zero new npm packages across every prior phase (Reuse Before
 * Rebuild extends to tooling, not only components). Falsy values are
 * skipped; no Tailwind-class-conflict resolution is attempted, matching
 * this codebase's existing convention of plain template-literal className
 * composition everywhere else.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
