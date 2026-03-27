import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  loadConfig,
  saveConfig,
  assertSourcePathsExist,
  findSource,
  targetReferencesSource,
  needsRepoRoot,
  validateTargetForInstall,
} from "../dist/config.js";
import { mkTempDir, writeSkill } from "./helpers.mjs";

test("loadConfig returns defaults when file missing", () => {
  const p = path.join(mkTempDir(), "nope.yaml");
  const c = loadConfig(p);
  assert.strictEqual(c.version, 1);
  assert.deepStrictEqual(c.sources, []);
  assert.deepStrictEqual(c.targets, []);
});

test("loadConfig round-trip save and load", () => {
  const dir = mkTempDir();
  const cfgPath = path.join(dir, "c.yaml");
  const skills = path.join(dir, "skills");
  fs.mkdirSync(skills, { recursive: true });
  writeSkill(skills, "s1");
  const cfg = {
    version: 1,
    sources: [{ name: "main", path: skills }],
    targets: [
      {
        id: "t1",
        source: "main",
        repoRoot: dir,
        destinations: [{ type: "cursor" }],
      },
    ],
  };
  saveConfig(cfgPath, cfg);
  const loaded = loadConfig(cfgPath);
  assert.strictEqual(loaded.sources[0].name, "main");
  assert.strictEqual(loaded.sources[0].path, skills);
  assert.strictEqual(loaded.targets[0].id, "t1");
  assert.strictEqual(loaded.targets[0].repoRoot, dir);
  assert.deepStrictEqual(loaded.targets[0].destinations, [{ type: "cursor" }]);
});

test("loadConfig expands tilde in source path", () => {
  const marker = `agasi-tilde-${Date.now()}`;
  const underHome = path.join(os.homedir(), marker);
  fs.mkdirSync(underHome, { recursive: true });
  writeSkill(underHome, "x");
  try {
    const dir = mkTempDir();
    const cfgPath = path.join(dir, "c.yaml");
    fs.writeFileSync(
      cfgPath,
      `version: 1
sources:
  - name: main
    path: ~/${marker}
targets: []
`,
      "utf-8",
    );
    const c = loadConfig(cfgPath);
    assert.strictEqual(c.sources[0].path, underHome);
  } finally {
    fs.rmSync(underHome, { recursive: true, force: true });
  }
});

test("loadConfig throws on git-only source", () => {
  const dir = mkTempDir();
  const cfgPath = path.join(dir, "c.yaml");
  fs.writeFileSync(
    cfgPath,
    `
version: 1
sources:
  - name: remote
    git:
      url: https://github.com/x/y.git
targets: []
`,
    "utf-8",
  );
  assert.throws(() => loadConfig(cfgPath), /git-backed/);
});

test("loadConfig throws on path destination with empty relative", () => {
  const dir = mkTempDir();
  const cfgPath = path.join(dir, "c.yaml");
  fs.writeFileSync(
    cfgPath,
    `
version: 1
sources: []
targets:
  - id: bad
    source: x
    repoRoot: ${dir.replace(/\\/g, "/")}
    destinations:
      - type: path
        relative: ""
`,
    "utf-8",
  );
  assert.throws(() => loadConfig(cfgPath), /non-empty/);
});

test("assertSourcePathsExist passes when dirs exist", () => {
  const dir = mkTempDir();
  const skills = path.join(dir, "skills");
  fs.mkdirSync(skills, { recursive: true });
  assertSourcePathsExist({
    version: 1,
    sources: [{ name: "m", path: skills }],
    targets: [],
  });
});

test("assertSourcePathsExist throws when path missing", () => {
  assert.throws(
    () =>
      assertSourcePathsExist({
        version: 1,
        sources: [{ name: "m", path: "/nope/nope/nope" }],
        targets: [],
      }),
    /does not exist/,
  );
});

test("findSource and targetReferencesSource", () => {
  const cfg = {
    version: 1,
    sources: [
      { name: "a", path: "/x" },
      { name: "b", path: "/y" },
    ],
    targets: [{ id: "t", source: "a", repoRoot: "/r", destinations: [{ type: "codex" }] }],
  };
  assert.strictEqual(findSource(cfg, "a")?.path, "/x");
  assert.strictEqual(findSource(cfg, "missing"), undefined);
  assert.strictEqual(targetReferencesSource(cfg, "a"), true);
  assert.strictEqual(targetReferencesSource(cfg, "b"), false);
});

test("needsRepoRoot and validateTargetForInstall", () => {
  assert.strictEqual(needsRepoRoot({ type: "cursor" }), true);
  assert.strictEqual(needsRepoRoot({ type: "codex" }), false);
  assert.strictEqual(
    validateTargetForInstall({
      id: "x",
      source: "s",
      repoRoot: null,
      destinations: [{ type: "cursor" }],
    }),
    `Target "x" needs repoRoot for non-codex destinations`,
  );
  assert.strictEqual(
    validateTargetForInstall({
      id: "x",
      source: "s",
      repoRoot: "/repo",
      destinations: [{ type: "cursor" }],
    }),
    undefined,
  );
  assert.strictEqual(
    validateTargetForInstall({
      id: "x",
      source: "s",
      repoRoot: null,
      destinations: [{ type: "codex" }],
    }),
    undefined,
  );
});
