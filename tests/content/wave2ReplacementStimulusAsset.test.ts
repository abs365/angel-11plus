import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Educational Depth Phase 1, Wave 2 REPLACEMENT — asset-level checks for
 * "The Treehouse Lantern" (migration 257). Automated checks here can
 * only prove structural safety (the file exists, is valid, is original,
 * and stays in Practice's own asset directory, never Mock's) — they
 * cannot prove educational/narrative quality, which is exactly why this
 * replacement still requires the Founder's own genuine independent
 * review before any promotion migration is authored.
 */

const ASSET_PATH = "public/practice-assets/writing-picture-narrative/treehouselantern-v1.svg";

test("the replacement stimulus asset exists at the exact path migration 257 references", () => {
  assert.ok(fs.existsSync(ASSET_PATH), `expected ${ASSET_PATH} to exist`);
});

test("the replacement asset is well-formed SVG with a title and desc for accessibility, and is not the rejected riverboat file reused under a new name", () => {
  const svg = fs.readFileSync(ASSET_PATH, "utf8");
  assert.match(svg, /<svg[^>]*viewBox="0 0 800 600"/);
  assert.match(svg, /<title id="treehouseLanternTitle">/);
  assert.match(svg, /<desc id="treehouseLanternDesc">/);

  const riverboatSvg = fs.readFileSync("public/practice-assets/writing-picture-narrative/riverboat-v1.svg", "utf8");
  assert.notEqual(svg, riverboatSvg);
});

test("the replacement asset lives under Practice's own asset directory, not Mock's -- Practice and Mock stimuli stay physically separated on disk", () => {
  assert.ok(ASSET_PATH.startsWith("public/practice-assets/"));
  assert.ok(!ASSET_PATH.includes("mock-assets"));
});

test("the replacement asset contains no <text> element -- the picture itself carries no title, speech bubble, or written clue that would dictate the story", () => {
  const svg = fs.readFileSync(ASSET_PATH, "utf8");
  assert.doesNotMatch(svg, /<text[\s>]/);
});

test("Mock's own sealed Q2 asset (old-shed-v1.svg) is untouched by this Wave's replacement work", () => {
  const shedPath = "public/mock-assets/q2-picture-narrative/old-shed-v1.svg";
  assert.ok(fs.existsSync(shedPath));
  const shed = fs.readFileSync(shedPath, "utf8");
  assert.match(shed, /oldShedTitle/);
});

test("the unchanged teaching worked example (a fallen bicycle in a playground) stays a genuinely different scene from the replacement stimulus -- the teaching model still never previews the live Practice picture", () => {
  const teachingSource = fs.readFileSync("lib/learningEngine/writingTeachingContent.ts", "utf8");
  const workedOpeningMatch = teachingSource.match(/workedOpening: "([^"]*bicycle[^"]*)"/);
  assert.ok(workedOpeningMatch, "expected the existing picture-narrative worked opening to be unchanged");
  const workedOpening = workedOpeningMatch![1].toLowerCase();
  for (const term of ["treehouse", "ladder", "lantern", "compass", "magpie"]) {
    assert.ok(!workedOpening.includes(term), `teaching worked example must not reference the replacement scene's own detail: "${term}"`);
  }
});
