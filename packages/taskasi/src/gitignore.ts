import fs from "node:fs";
import path from "node:path";

const MARKER_START = "# >>> taskasi";
const MARKER_END = "# <<< taskasi";

function formatBlock(basename: string): string {
  return [
    MARKER_START,
    "# Local per-task workspace copies (template file stays tracked).",
    `${basename}-*.workspace`,
    `${basename}-*.code-workspace`,
    MARKER_END,
    "",
  ].join("\n");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ensures repo `.gitignore` contains a taskasi-managed section that ignores
 * `{basename}-*.workspace` and `{basename}-*.code-workspace` so the canonical
 * `basename.workspace` / `basename.code-workspace` template is not matched.
 */
/** @returns true if `.gitignore` was created or modified */
export function ensureTaskasiGitignoreRules(repoRoot: string, basename: string): boolean {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const newBlock = formatBlock(basename);

  let existing = "";
  if (fs.existsSync(gitignorePath)) {
    existing = fs.readFileSync(gitignorePath, "utf-8");
  }

  const blockRegex = new RegExp(
    `^${escapeRegExp(MARKER_START)}[\\s\\S]*?^${escapeRegExp(MARKER_END)}\\s*`,
    "m",
  );

  if (blockRegex.test(existing)) {
    const updated = existing.replace(blockRegex, newBlock);
    if (updated !== existing) {
      fs.writeFileSync(gitignorePath, updated, "utf-8");
      return true;
    }
    return false;
  }

  const prefix = existing.length === 0 ? "" : existing.endsWith("\n") ? "" : "\n";
  fs.appendFileSync(gitignorePath, `${prefix}${newBlock}`, "utf-8");
  return true;
}
