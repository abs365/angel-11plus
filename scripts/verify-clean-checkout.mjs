#!/usr/bin/env node
/**
 * Clean-checkout verification -- the acceptance standard for a release:
 * a CLEAN checkout of committed HEAD must install, type-check, build and
 * pass its tests by the project's NORMAL process, with no undocumented
 * local bypass.
 *
 * Why this exists: a developer working tree can hold uncommitted work
 * (e.g. the deliberately untracked Wave-1 question-factory files left on
 * disk by commit 810208b) that makes `next build` / `tsc` / `npm test`
 * fail locally even though committed HEAD is healthy. Running this script
 * checks committed HEAD in an isolated `git worktree`, leaving the working
 * tree and its uncommitted files completely untouched.
 *
 * Usage: node scripts/verify-clean-checkout.mjs [--webpack]
 *   --webpack  also run `next build --webpack` (stricter route-type check)
 *
 * Needs a SHORT scratch path on Windows (this repo's knowledge/ tree
 * exceeds the default path-length limit), hence C:\w\... or /tmp.
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const SCRATCH = process.platform === "win32" ? "C:\\w\\clean-checkout" : "/tmp/angel-clean-checkout";
const withWebpack = process.argv.includes("--webpack");

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

mkdirSync(join(SCRATCH, ".."), { recursive: true });
try { run(`git worktree remove --force "${SCRATCH}"`, ROOT); } catch { /* none */ }
// core.autocrlf=false: production (Vercel) checks out on Linux with LF. A Windows checkout with
// autocrlf=true converts to CRLF, which makes tests that pattern-match migration text on "\n"
// fail for a reason that does not exist in production.
run(`git -c core.longpaths=true -c core.autocrlf=false worktree add --detach "${SCRATCH}" HEAD`, ROOT);
try {
  const env = join(ROOT, ".env.local");
  if (existsSync(env)) copyFileSync(env, join(SCRATCH, ".env.local")); // env only; never committed
  run("npm ci --no-audit --no-fund", SCRATCH);
  run("npx tsc --noEmit", SCRATCH);
  run("npx next build", SCRATCH);
  if (withWebpack) run("npx next build --webpack", SCRATCH);
  run("npm test", SCRATCH);
  console.log("\nCLEAN CHECKOUT: install, type-check, build and tests all passed for committed HEAD.");
} finally {
  try { run(`git worktree remove --force "${SCRATCH}"`, ROOT); } catch { /* leave for inspection */ }
}
