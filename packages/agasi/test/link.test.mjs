import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { test } from "node:test";
import { linkSkillDir, pruneStaleSymlinks } from "../dist/link.js";

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agasi-test-"));
}

test("linkSkillDir creates symlink to skill directory", () => {
  const root = tmpDir();
  const skill = path.join(root, "my-skill");
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, "SKILL.md"), "---\n", "utf-8");
  const destBase = path.join(root, "dest");
  fs.mkdirSync(destBase, { recursive: true });
  const destLink = path.join(destBase, "my-skill");
  const r = linkSkillDir(skill, destLink, { force: false });
  assert.strictEqual(r.status, "created");
  assert.ok(fs.lstatSync(destLink).isSymbolicLink());
  assert.strictEqual(fs.realpathSync(destLink), fs.realpathSync(skill));
});

test("linkSkillDir ok when symlink already correct", () => {
  const root = tmpDir();
  const skill = path.join(root, "s");
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, "SKILL.md"), "x", "utf-8");
  const dest = path.join(root, "link");
  fs.symlinkSync(skill, dest, "dir");
  const r = linkSkillDir(skill, dest, { force: false });
  assert.strictEqual(r.status, "ok");
});

test("linkSkillDir blocks when symlink points elsewhere without force", () => {
  const root = tmpDir();
  const skillA = path.join(root, "a");
  const skillB = path.join(root, "b");
  fs.mkdirSync(skillA, { recursive: true });
  fs.mkdirSync(skillB, { recursive: true });
  fs.writeFileSync(path.join(skillA, "SKILL.md"), "a", "utf-8");
  fs.writeFileSync(path.join(skillB, "SKILL.md"), "b", "utf-8");
  const dest = path.join(root, "link");
  fs.symlinkSync(skillB, dest, "dir");
  const r = linkSkillDir(skillA, dest, { force: false });
  assert.strictEqual(r.status, "blocked");
  assert.match(r.message, /elsewhere/);
});

test("linkSkillDir replaces wrong symlink when force", () => {
  const root = tmpDir();
  const skillA = path.join(root, "a");
  const skillB = path.join(root, "b");
  fs.mkdirSync(skillA, { recursive: true });
  fs.mkdirSync(skillB, { recursive: true });
  fs.writeFileSync(path.join(skillA, "SKILL.md"), "a", "utf-8");
  fs.writeFileSync(path.join(skillB, "SKILL.md"), "b", "utf-8");
  const dest = path.join(root, "link");
  fs.symlinkSync(skillB, dest, "dir");
  const r = linkSkillDir(skillA, dest, { force: true });
  assert.strictEqual(r.status, "replaced");
  assert.strictEqual(fs.realpathSync(dest), fs.realpathSync(skillA));
});

test("linkSkillDir blocks real directory", () => {
  const root = tmpDir();
  const skill = path.join(root, "skill");
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, "SKILL.md"), "x", "utf-8");
  const dest = path.join(root, "dest");
  fs.mkdirSync(dest, { recursive: true });
  const r = linkSkillDir(skill, dest, { force: true });
  assert.strictEqual(r.status, "blocked");
  assert.match(r.message, /real directory/);
});

test("pruneStaleSymlinks removes symlink for removed skill name", () => {
  const root = tmpDir();
  const skillsRoot = path.join(root, "skills");
  const keep = path.join(skillsRoot, "keep");
  fs.mkdirSync(keep, { recursive: true });
  fs.writeFileSync(path.join(keep, "SKILL.md"), "x", "utf-8");
  const gone = path.join(skillsRoot, "gone");
  fs.mkdirSync(gone, { recursive: true });
  fs.writeFileSync(path.join(gone, "SKILL.md"), "x", "utf-8");
  const destBase = path.join(root, "out");
  fs.mkdirSync(destBase, { recursive: true });
  fs.symlinkSync(keep, path.join(destBase, "keep"), "dir");
  fs.symlinkSync(gone, path.join(destBase, "gone"), "dir");
  const n = pruneStaleSymlinks(destBase, skillsRoot, new Set(["keep"]));
  assert.strictEqual(n, 1);
  assert.ok(fs.existsSync(path.join(destBase, "keep")));
  assert.ok(!fs.existsSync(path.join(destBase, "gone")));
});
