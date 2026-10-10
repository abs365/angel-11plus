import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

// Every SHA256 printed in the Founder execution document must be the real hash of the file it names (content with LF line endings),
// so a Founder who checks a file against the document can trust it. The six submit scripts and the manifest must also stay byte-identical
// to what the Founder approved (the candidates must not be regenerated).
const doc = fs.readFileSync("ANGEL_CSSE_FOUNDER_EXECUTION_PACKAGES.md", "utf8");
const pk = "scripts/output/csse-practice-publication-package";
const fx = "scripts/output/founder-execution";
const files = [
  "supabase/migrations/273_english_form_b_salmon_replacement_APPLIED_DO_NOT_RERUN.sql",
  "supabase/migrations/274_mock_maths_coordinate_answer_normaliser_APPLIED_DO_NOT_RERUN.sql",
  ...["context", "data-handling", "breadth", "grid", "angle", "numberline"].map((k) => `${pk}/submit-${k}.js`),
  `${pk}/review-and-publish-GUARDED.js`, `${pk}/manifest.json`,
  `${fx}/01-practice-374-verification.sql`, `${fx}/02-migration-273-verification.sql`, `${fx}/03-migration-274-verification.sql`, `${fx}/274-POST-APPLY-READONLY-verification.sql`,
  `${fx}/273-ROLLBACK-remove-additions-reactivate-salmon.sql`, `${fx}/274-ROLLBACK-restore-previous-function.sql`,
];
const sha = (f: string) => crypto.createHash("sha256").update(fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");

test("every SHA256 in the Founder execution document is the real hash of a package file, and every package file is listed", () => {
  const claimed = new Set(doc.match(/\b[0-9a-f]{64}\b/g));
  const real = new Map(files.map((f) => [sha(f), f]));
  for (const c of claimed) assert.ok(real.has(c), `hash in the document matches no file: ${c}`);
  for (const [h, f] of real) assert.ok(claimed.has(h), `file not hashed in the document: ${f} (${h})`);
});

test("the approved candidates are untouched: six submit scripts and the manifest keep the hashes the Founder was given", () => {
  const approved: Record<string, string> = {
    "submit-context.js": "42a51f7031153f60f8324ee7c99d0285f4a370182b4f19b4eee991751e974e9d",
    "submit-data-handling.js": "b87f9058c715c124843106e0a31fd3e7dd78ff2618117fac9a7e144f127a10a2",
    "submit-breadth.js": "a0b27cfc4b8ac66b2a9666df01600e91078c7d19de960977625075853f6aea31",
    "submit-grid.js": "26b12c76bf2cbf3deef8c967b0ecd084db82c149e6d51ed6b5beb09ed88da9e0",
    "submit-angle.js": "46246b88fcd3ba7537d7ef3c12678dd10b473d5a156c2dce8c5abe032d257dea",
    "submit-numberline.js": "0a7a43dda474c52934cc586b376abb0f76ab2cec8cd5fcec4f19860dc0ce6581",
    "manifest.json": "8bf7384a7b1e483e2d04b7180d28328b5ffb80012685b01561fa3753b96d792a",
  };
  for (const [f, h] of Object.entries(approved)) assert.equal(sha(`${pk}/${f}`), h, f);
});

test("document states what must be true: nothing applied, trimmed six excluded, 374 to 1,275, Great Stink sealed, Salmon preserved, coordinate-only scope", () => {
  assert.match(doc, /Nothing in this document has been run/);
  assert.match(doc, /\*\*1,275\*\*/);
  assert.match(doc, /Great Stink remains sealed and pending human validation: confirmed/);
  assert.match(doc, /Salmon is preserved as rejection evidence, not deleted: confirmed/);
  assert.match(doc, /Scope: restricted to the coordinate marking contract/);
  assert.match(doc, /controlled_batch_sampling/);
  const six = ["02", "08", "09", "11", "13", "14"].map((n) => `csse-ctx-mr01-bp-change-from-note-${n}`);
  for (const id of six) for (const f of ["context", "data-handling", "breadth", "grid", "angle", "numberline"]) assert.ok(!fs.readFileSync(`${pk}/submit-${f}.js`, "utf8").includes(`"${id}"`), `${id} in ${f}`);
});
