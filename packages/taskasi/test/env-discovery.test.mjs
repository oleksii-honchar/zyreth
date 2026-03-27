import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it, before, after } from "node:test";
import { findEnvFilesInRepo, mirrorEnvFilesToWorktree } from "../dist/env-mirror.js";
import { mkTestTmp, rmTestTmp } from "./helpers/tmp.mjs";

describe("findEnvFilesInRepo", () => {
  let repo;

  before(() => {
    repo = mkTestTmp("envwalk-");
    fs.mkdirSync(path.join(repo, "apps", "api"), { recursive: true });
    fs.writeFileSync(path.join(repo, ".env"), "A=1\n", "utf-8");
    fs.writeFileSync(path.join(repo, "apps", "api", ".env.local"), "B=2\n", "utf-8");
    fs.mkdirSync(path.join(repo, "node_modules", "evil"), { recursive: true });
    fs.writeFileSync(path.join(repo, "node_modules", "evil", ".env"), "no\n", "utf-8");
  });

  after(() => {
    rmTestTmp(repo);
  });

  it("finds .env and nested .env.local but skips node_modules", () => {
    const files = findEnvFilesInRepo(repo, {
      worktreeRelativeDir: ".worktrees",
    });
    const rel = files.map((p) => path.relative(repo, p).split(path.sep).join("/")).sort();
    assert.deepEqual(rel, [".env", "apps/api/.env.local"]);
  });

  it("includes extra basename from fileNames", () => {
    fs.writeFileSync(path.join(repo, ".envrc"), "x\n", "utf-8");
    const files = findEnvFilesInRepo(repo, {
      worktreeRelativeDir: ".worktrees",
      extraBasenames: [".envrc"],
    });
    const basenames = files.map((p) => path.basename(p)).sort();
    assert.ok(basenames.includes(".envrc"));
  });
});

describe("mirrorEnvFilesToWorktree", () => {
  it("copies relative structure", () => {
    const repo = mkTestTmp("mirror-");
    const wt = path.join(repo, ".worktrees", "w1");
    fs.mkdirSync(path.join(repo, "pkg"), { recursive: true });
    fs.writeFileSync(path.join(repo, "pkg", ".env"), "k=v\n", "utf-8");
    try {
      const n = mirrorEnvFilesToWorktree(repo, wt, [path.join(repo, "pkg", ".env")]);
      assert.equal(n, 1);
      assert.equal(
        fs.readFileSync(path.join(wt, "pkg", ".env"), "utf-8"),
        "k=v\n",
      );
    } finally {
      rmTestTmp(repo);
    }
  });
});
