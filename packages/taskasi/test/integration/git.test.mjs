import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it, before, after } from "node:test";
import { addWorktree, getGitRoot, localBranchExists } from "../../dist/git.js";
import { mkTestTmp, rmTestTmp } from "../helpers/tmp.mjs";

/**
 * Integration tests against a real `git` binary (init, worktree).
 * Not included in default `npm test` — run `npm run test:integration` or `npm run test:all`.
 * Requires a normal environment (e.g. Cursor **open shell** / full permissions) so `git init`
 * can create `.git/hooks`; restricted sandboxes often block this.
 */

function git(repo, args) {
  execFileSync("git", args, { cwd: repo, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
}

describe("git helpers (integration)", () => {
  let repo;

  before(() => {
    repo = mkTestTmp("git-");
    git(repo, ["init", "-b", "main"]);
    git(repo, ["config", "user.email", "test@test.local"]);
    git(repo, ["config", "user.name", "taskasi-test"]);
    fs.writeFileSync(path.join(repo, "README.md"), "# t\n", "utf-8");
    git(repo, ["add", "README.md"]);
    git(repo, ["commit", "-m", "init"]);
  });

  after(() => {
    rmTestTmp(repo);
  });

  it("getGitRoot resolves from subfolder", () => {
    const sub = path.join(repo, "apps", "deep");
    fs.mkdirSync(sub, { recursive: true });
    assert.equal(getGitRoot(sub), path.resolve(repo));
  });

  it("localBranchExists is false for unknown branch", () => {
    assert.equal(localBranchExists(repo, "nonexistent-branch-xyz"), false);
  });

  it("localBranchExists is true for main", () => {
    assert.equal(localBranchExists(repo, "main"), true);
  });

  it("addWorktree creates new branch and path", () => {
    const wt = path.join(repo, ".worktrees", "nw-1");
    addWorktree(repo, wt, "feature-nw-1", { stdio: "ignore" });
    assert.equal(fs.existsSync(path.join(wt, "README.md")), true);
    assert.equal(localBranchExists(repo, "feature-nw-1"), true);
  });
});
