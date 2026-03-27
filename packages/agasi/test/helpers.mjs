import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Temporary directory under os.tmpdir() */
export function mkTempDir(prefix = "agasi-test-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Absolute path to compiled CLI */
export function cliPath() {
  return path.join(__dirname, "..", "dist", "cli.js");
}

/** Create a minimal skill directory with SKILL.md */
export function writeSkill(skillsRoot, name) {
  const dir = path.join(skillsRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: x\n---\n", "utf-8");
  return dir;
}
