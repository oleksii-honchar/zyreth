import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { listSkillNames, skillSourceDir } from "../dist/skills.js";
import { mkTempDir, writeSkill } from "./helpers.mjs";

test("listSkillNames returns empty for missing root", () => {
  assert.deepStrictEqual(listSkillNames("/nonexistent/path/agasi-xyz"), []);
});

test("listSkillNames ignores dirs without SKILL.md and non-directories", () => {
  const root = mkTempDir();
  writeSkill(root, "a");
  fs.mkdirSync(path.join(root, "no-md"));
  fs.writeFileSync(path.join(root, "file.txt"), "", "utf-8");
  assert.deepStrictEqual(listSkillNames(root), ["a"]);
});

test("listSkillNames sorts names", () => {
  const root = mkTempDir();
  writeSkill(root, "z");
  writeSkill(root, "m");
  writeSkill(root, "a");
  assert.deepStrictEqual(listSkillNames(root), ["a", "m", "z"]);
});

test("skillSourceDir joins paths", () => {
  assert.strictEqual(
    skillSourceDir("/skills", "architect"),
    path.join("/skills", "architect"),
  );
});
