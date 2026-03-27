import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { resolveDestinations, resolveSkillsRoot } from "../dist/targets.js";
import { mkTempDir, writeSkill } from "./helpers.mjs";

test("resolveSkillsRoot returns resolved source path", () => {
  const dir = mkTempDir();
  const skills = path.join(dir, "skills");
  fs.mkdirSync(skills, { recursive: true });
  const cfg = {
    version: 1,
    sources: [{ name: "main", path: skills }],
    targets: [],
  };
  const root = resolveSkillsRoot(cfg, {
    id: "t",
    source: "main",
    repoRoot: dir,
    destinations: [{ type: "cursor" }],
  });
  assert.strictEqual(root, path.resolve(skills));
});

test("resolveSkillsRoot throws for unknown source", () => {
  assert.throws(
    () =>
      resolveSkillsRoot(
        { version: 1, sources: [], targets: [] },
        {
          id: "t",
          source: "missing",
          repoRoot: "/",
          destinations: [{ type: "cursor" }],
        },
      ),
    /Unknown source/,
  );
});

test("resolveDestinations cursor and agents", () => {
  const repo = mkTempDir();
  const cfg = { version: 1, sources: [], targets: [] };
  const dests = resolveDestinations(cfg, {
    id: "t",
    source: "s",
    repoRoot: repo,
    destinations: [{ type: "cursor" }, { type: "agents" }],
  });
  assert.strictEqual(dests[0].label, "cursor");
  assert.strictEqual(dests[0].baseDir, path.join(repo, ".cursor", "skills"));
  assert.strictEqual(dests[1].label, "agents");
  assert.strictEqual(dests[1].baseDir, path.join(repo, ".agents", "skills"));
});

test("resolveDestinations path relative", () => {
  const repo = mkTempDir();
  const cfg = { version: 1, sources: [], targets: [] };
  const dests = resolveDestinations(cfg, {
    id: "t",
    source: "s",
    repoRoot: repo,
    destinations: [{ type: "path", relative: "tools/skills" }],
  });
  assert.strictEqual(dests[0].baseDir, path.join(repo, "tools", "skills"));
});

test("resolveDestinations codex uses CODEX_HOME when set", () => {
  const codexHome = mkTempDir();
  const prev = process.env.CODEX_HOME;
  process.env.CODEX_HOME = codexHome;
  try {
    const cfg = { version: 1, sources: [], targets: [] };
    const dests = resolveDestinations(cfg, {
      id: "t",
      source: "s",
      repoRoot: null,
      destinations: [{ type: "codex" }],
    });
    assert.strictEqual(dests[0].baseDir, path.join(codexHome, "skills"));
  } finally {
    if (prev === undefined) {
      delete process.env.CODEX_HOME;
    } else {
      process.env.CODEX_HOME = prev;
    }
  }
});

test("resolveDestinations throws when cursor needs repoRoot", () => {
  assert.throws(
    () =>
      resolveDestinations(
        { version: 1, sources: [], targets: [] },
        {
          id: "t",
          source: "s",
          repoRoot: null,
          destinations: [{ type: "cursor" }],
        },
      ),
    /repoRoot/,
  );
});
