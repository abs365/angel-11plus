#!/usr/bin/env node
/**
 * Generates ANGEL_CSSE_MATHS_CANDIDATES_EDUCATIONAL_REVIEW.md: a Founder-readable educational summary of the
 * 10 blueprints behind the 140 pending Maths candidates. Numbers (difficulty mix, distinct texts reachable,
 * repetition) are computed from the real blueprints and the prepared package; the judgements ("structural
 * difference", "transfer value") are authored below and are the thing the Founder is asked to confirm.
 * Read-only: submits, approves and publishes nothing.
 *
 * Run: npx tsx scripts/csse-context-expansion-review-summary.mjs
 */
import fs from "node:fs";
import { CSSE_CONTEXT_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseContextBlueprints.ts";
import { generateBlueprintCandidate } from "../lib/ali/questionFactory/candidateGeneration.ts";

const payload = JSON.parse(fs.readFileSync("scripts/output/csse-context-expansion/submission-payload.json", "utf8")).submissionPayload.map((p) => p.args);

// mulberry32 (well-mixed). The older multiply-add LCG loses low bits above 2^53 and can understate distinct outputs.
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Authored judgements, one per blueprint. These are what the Founder confirms or rejects.
const JUDGEMENT = {
  "mr05-bp-hcf-equal-groups": {
    structure: "Existing HCF items ask 'What is the HCF of a and b?' with no situation. Here the child must first recognise that 'identical groups, nothing left over, as many as possible' means HCF. The computation is the same; the recognition step is new.",
    transfer: "High. It is the standard exam form of HCF. A child who only knows the bare procedure cannot answer it unprompted.",
    risk: "Wording rotates over three situations only; the numbers are always g×m and g×n with coprime m, n, so the HCF is always the intended g (3 to 12).",
  },
  "mr05-bp-lcm-repeating-events": {
    structure: "Existing LCM items are bare 'LCM of a and b'. Here the situation (two repeating events) must be read as 'next time they coincide'. Pairs are chosen so neither interval divides the other, so the answer is never just the larger number.",
    transfer: "High. Recognising 'next time together' as LCM is the usual exam context.",
    risk: "Three situations only. Small number range (3 to 20) means a modest set of distinct pairs.",
  },
  "mr05-bp-smallest-common-multiple-above": {
    structure: "Adds a boundary condition on top of LCM: the answer is the first common multiple above k, so stopping at the LCM is wrong (enforced: k is at least the LCM).",
    transfer: "Medium-high. Teaches that a common multiple is a family of numbers, not one value.",
    risk: "One wording only (no context rotation); variation comes from a, b and k alone.",
  },
  "mr05-bp-identify-the-prime": {
    structure: "Existing prime items are True/False on one number. Here the child must test four numbers and select the single prime; the three composites are drawn from a pool of look-alike primes (51, 57, 91, 119 ...), and the prime's position varies.",
    transfer: "Medium. Builds the habit of testing for factors rather than recognising 'prime-looking' numbers.",
    risk: "Composites come from a fixed pool of 18 numbers and primes from 15, so the space is large (combinations) but the vocabulary of numbers is small; a determined learner could memorise the pool over many sessions.",
  },
  "mr02-bp-pattern-in-context": {
    structure: "Existing nth-term items present the sequence as a list of terms. Here a physical pattern (matchsticks, tiles, chairs) grows, and the child must see that pattern 1 already exists, so n-1 steps are added.",
    transfer: "Medium. The same rule in a concrete setting; an on-ramp from physical patterns to the abstract rule. Structurally close to the direct nth-term blueprint, so its main value is context, not a new demand.",
    risk: "Closest to existing material of the ten; context-only variation. Reviewer may judge it adds limited structural depth.",
  },
  "mr02-bp-first-term-exceeding": {
    structure: "A threshold question: 'first term greater than t'. Existing blueprints find term n, find n, or test membership; none asks for the first term past a boundary. The target is never itself a term.",
    transfer: "Medium-high. Connects sequences to inequalities and to 'when does it first exceed'.",
    risk: "One wording; variation from a, d, t alone. Difficulty skews hard (distance to target is often large).",
  },
  "mr02-bp-whole-periods-to-target": {
    structure: "Whole periods to reach a target where the division is not exact and the answer must round UP. Existing sequence items never involve rounding.",
    transfer: "High. Savings/reading/growth targets are classic exam word problems; rounding up is a well-documented error.",
    risk: "Three situations. The 'pages read' wording reuses the page total as both the book length and the target, so check the sentence reads naturally.",
  },
  "mr01-bp-containers-needed": {
    structure: "Division followed by interpreting the remainder (a part-filled container is still needed). Existing division blueprints report the remainder or the exact quotient; none asks what the remainder means in a situation.",
    transfer: "High. 'How many buses are needed' is the standard remainder-interpretation question.",
    risk: "Three situations; numbers 40 to 400 and container sizes 6 to 24.",
  },
  "mr01-bp-change-from-note": {
    structure: "Multiply to find a total, then subtract it from the note. A two-step order set by the situation; existing arithmetic blueprints are single-operation or add-then-multiply on bare numbers.",
    transfer: "Medium. Foundation-level money context; useful for Year 4/5 learners and as a quick confidence builder.",
    risk: "Easiest of the ten and the smallest parameter space (two note values); four buyer/item rotations.",
  },
  "mr01-bp-spend-then-share": {
    structure: "Subtract what was spent, then share the remainder equally. The order matters: dividing the whole amount first is the target misconception. Existing blueprints do not chain subtract then divide in a situation.",
    transfer: "Medium-high. Multi-step money/sharing is a common exam shape.",
    risk: "Three situations. The amounts are constrained to divide exactly, so only some (total, spend, k) combinations qualify.",
  },
};

const out = [];
out.push("# CSSE Maths candidates (140, pending): educational review summary", "");
out.push("Prepared for Founder review before any submission. **Nothing has been submitted, approved or published.** Numbers below are computed from the real blueprints and the prepared package; the 'structural difference' and 'transfer value' lines are my judgements for you to confirm or reject.", "");
out.push("**How to read the result**: for each blueprint, ask (1) is the demand genuinely different from what the child already meets, (2) would an 11+ child recognise this as exam-style, (3) is the working correct and teachable, (4) is repetition acceptable.", "");

const summary = [];
const sections = [];
for (const family of CSSE_CONTEXT_EXPANSION_FAMILIES) {
  for (const bp of family.blueprints) {
    const mine = payload.filter((a) => a.p_generation_spec_id === bp.blueprintId);
    const kept = mine.length;
    const diff = {};
    const ctx = {};
    for (const a of mine) {
      diff[a.p_difficulty] = (diff[a.p_difficulty] ?? 0) + 1;
      ctx[a.p_question_content.contextTag] = (ctx[a.p_question_content.contextTag] ?? 0) + 1;
    }
    // Distinct rendered texts reachable (sampled), a computed repetition indicator.
    const rnd = seeded(97);
    const texts = new Set();
    const N = 4000;
    for (let i = 0; i < N; i++) texts.add(generateBlueprintCandidate(bp, rnd).question);
    const distinct = texts.size;
    const risk = distinct >= 1500 ? "LOW" : distinct >= 400 ? "MODERATE" : "HIGHER";
    const ex = mine[0];
    const j = JUDGEMENT[bp.blueprintId];
    if (!j) throw new Error("no judgement for " + bp.blueprintId);
    summary.push(`| ${bp.blueprintId.replace(/^mr0\d-bp-/, "")} | ${bp.competencyId} | ${bp.familyId} | ${kept} | ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")} | ${distinct}/${N} (${risk}) |`);
    sections.push(
      `### ${bp.blueprintId}`,
      "",
      `- **Competency / family / skill:** ${bp.competencyId} / \`${bp.familyId}\` / ${bp.questionTypeId}`,
      `- **Purpose:** ${bp.mathematicalObjective}`,
      `- **Misconception targeted:** ${bp.misconceptionTargeted}`,
      `- **Example question:** ${ex.p_question_content.question}`,
      `- **Answer and derivation:** answer **${ex.p_claimed_answer}**. ${ex.p_question_content.workingSteps.join(" ")}  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_`,
      `- **Structural difference from existing material:** ${j.structure}`,
      `- **Context variation:** ${Object.keys(ctx).length} context tag(s): ${Object.entries(ctx).map(([k, v]) => `${k} (${v})`).join(", ")}`,
      `- **Difficulty (of the ${kept} prepared):** ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")}. Basis: ${bp.difficultyDimensions.join(", ")}.`,
      `- **Transfer value:** ${j.transfer}`,
      `- **Repetition risk:** ${risk}. ${distinct} distinct question texts in ${N} random draws. ${j.risk}`,
      ""
    );
  }
}

out.push("## At a glance", "", "| Blueprint | Competency | Family | Prepared | Difficulty mix | Distinct texts (of 4000 draws) |", "|---|---|---|---|---|---|", ...summary, "");
out.push("## Cross-cutting points for the reviewer", "");
out.push("- **Difficulty skews medium/hard** (no easy items for the `mr01` and `mr02` additions). Those families already hold easy items; the additions are about interpretation, not entry-level fluency.");
out.push("- **Representation is prose only.** These blueprints add context and structure, not tables or diagrams (see the representation gap analysis).");
out.push("- **Closest to existing material:** `mr02-bp-pattern-in-context` (context-only). Reasonable to drop if you want only structurally new demands.");
out.push("- **Not Mock:** every blueprint is `mockEligible: false`; nothing here enters a protected form.");
out.push("- **My recommendation on volume:** `change-from-note` has by far the smallest space (a few hundred distinct texts) and is the easiest blueprint; I would publish at most 8 of its 14 candidates. `first-term-exceeding` and `whole-periods-to-target` are 11 of 14 hard, so a learner who is not yet secure would meet them as stretch items only.");
out.push("- **Effect if all approved:** practice-eligible 901 to 1,041. This is a step, not the milestone.", "");
out.push("## Blueprint detail", "", ...sections);

fs.writeFileSync("ANGEL_CSSE_MATHS_CANDIDATES_EDUCATIONAL_REVIEW.md", out.join("\n"));
console.log("written; blueprints:", summary.length);
