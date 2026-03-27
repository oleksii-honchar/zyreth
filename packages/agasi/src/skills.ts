import fs from "node:fs";
import path from "node:path";

export function listSkillNames(skillsRoot: string): string[] {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }
  const names: string[] = [];
  for (const ent of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) {
      continue;
    }
    const skillDir = path.join(skillsRoot, ent.name);
    const md = path.join(skillDir, "SKILL.md");
    if (fs.existsSync(md) && fs.statSync(md).isFile()) {
      names.push(ent.name);
    }
  }
  names.sort();
  return names;
}

export function skillSourceDir(skillsRoot: string, skillName: string): string {
  return path.join(skillsRoot, skillName);
}
