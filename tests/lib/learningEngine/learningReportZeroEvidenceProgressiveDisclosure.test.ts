import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Increment 3 Closure Correction, Section 2 (Founder production visual
 * testing). Real production screenshot evidence: a new, zero-evidence
 * learner's Learning Report rendered the entire detailed competency
 * catalogue below the honest "How you're doing" summary, with every row
 * repeating "NOT STARTED YET" -- unnecessary density that made Angel look
 * like a static curriculum tracker. The upper hierarchy (Practise now /
 * You're just getting started / How you're doing / What's going well / What
 * to work on / What to do next) was explicitly correct and preserved
 * unchanged.
 *
 * Structural/source-text assertions (no jsdom/React Testing Library in this
 * repository's test setup, matching every other page-level test here).
 */

const PAGE = readFileSync("app/learning-intelligence/page.tsx", "utf8");

test("the full competency catalogue (CompetencyProfile) is gated on profile.hasAnyEvidence, never rendered unconditionally", () => {
  assert.match(
    PAGE,
    /\{profile\.hasAnyEvidence \? \(/,
    "the full CompetencyProfile section must be behind a real hasAnyEvidence gate"
  );
  assert.match(PAGE, /<CompetencyProfile competencies=\{profile\.competencies\} durableCompetencyIds=\{durableCompetencyIds\} \/>/);
});

test("the zero-evidence branch shows the three real subject areas (from PRACTICE_AREAS, not a hardcoded/invented list) and never claims a fabricated skill state", () => {
  assert.match(PAGE, /import \{ PRACTICE_AREAS \} from "@\/lib\/learningEngine\/practiceContent";/);
  assert.match(PAGE, /\{PRACTICE_AREAS\.map\(\(area\) => \(/, "the zero-evidence subject list must be driven by the real PRACTICE_AREAS data, not a second hardcoded list");
  assert.doesNotMatch(PAGE, /NOT STARTED YET/i, "the zero-evidence branch must never repeat a per-skill not-started status");
});

test("the zero-evidence branch explains Angel will build a clearer picture as the child works, honestly, without a percentage or chart", () => {
  const zeroEvidenceBranch = PAGE.split(") : (")[1]?.split("</section>")[0] ?? "";
  assert.match(zeroEvidenceBranch, /Angel will build a clearer, more detailed[\s\S]*picture/i);
  assert.doesNotMatch(zeroEvidenceBranch, /%|percent/i, "no fabricated percentage may appear in the zero-evidence subject list");
});

test("the upper Learning Report hierarchy the Founder confirmed correct is unchanged: Practise now CTA, the getting-started banner, How you're doing, and What to do next all still exist", () => {
  assert.match(PAGE, /Practise now<\/p>/);
  assert.match(PAGE, /You&apos;re just getting started<\/p>/);
  assert.match(PAGE, /How you&apos;re doing<\/h2>/);
  assert.match(PAGE, /What to do next<\/h2>/);
});

test("the underlying competency model and CompetencyProfile component are untouched by this correction -- only this page's own gating logic changed", () => {
  const componentSrc = readFileSync("components/learningEngine/CompetencyProfile.tsx", "utf8");
  assert.doesNotMatch(componentSrc, /hasAnyEvidence/, "CompetencyProfile itself must not know about the zero-evidence gate -- the gate lives at the page level only");
});
