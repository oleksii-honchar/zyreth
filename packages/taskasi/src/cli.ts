#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";
import {
  initConfigFile,
  loadConfig,
  buildPathContext,
  resolveWorktreeFolder,
  resolveEnvSource,
  resolveWorkspaceSource,
  resolveWorkspaceOutput,
} from "./config.js";
import { getTaskasiConfigPath } from "./paths.js";
import { findEnvFilesInRepo, mirrorEnvFilesToWorktree } from "./env-mirror.js";
import { ensureTaskasiGitignoreRules } from "./gitignore.js";
import { addWorktree, getGitRoot } from "./git.js";
import { writeWorkspace } from "./workspace.js";

/** Legacy: single `env.source` file copied to worktree root as `.env`. */
function copyLegacyEnvToRoot(source: string, worktreePath: string): void {
  if (!fs.existsSync(source)) {
    console.warn(`taskasi: skip env copy (missing source): ${source}`);
    return;
  }
  const dest = path.join(worktreePath, ".env");
  fs.copyFileSync(source, dest);
  console.log(`taskasi: copied .env -> ${dest}`);
}

const program = new Command();

program
  .name("taskasi")
  .description("Create git worktrees and optional VS Code workspace copies")
  .version("0.1.0");

program
  .command("init")
  .description("Create ~/.taskasi/config.yaml with defaults if missing")
  .action(() => {
    initConfigFile();
    console.log(getTaskasiConfigPath());
  });

program
  .command("config")
  .description("Print config file path and effective defaults")
  .action(() => {
    initConfigFile();
    const cfg = loadConfig();
    console.log(`config: ${getTaskasiConfigPath()}`);
    console.log(JSON.stringify(cfg, null, 2));
  });

program
  .command("switch")
  .description("Add a worktree for task id (branch = prefix + id)")
  .argument("<id>", "Task id (e.g. 1587)")
  .option("--no-env", "Do not copy .env into the worktree")
  .option("--no-workspace", "Do not write a workspace copy or touch .gitignore")
  .action(
    (
      id: string,
      opts: { env: boolean; workspace: boolean },
    ) => {
      const cwd = process.cwd();
      const repoRoot = getGitRoot(cwd);
      initConfigFile();
      const cfg = loadConfig();
      const ctx = buildPathContext(repoRoot, id, cfg);
      const folderName = resolveWorktreeFolder(cfg, ctx);
      const worktreePath = path.join(
        ctx.repoRoot,
        cfg.worktreeRelativeDir,
        folderName,
      );

      console.log(`taskasi: repo ${ctx.repoRoot}`);
      console.log(`taskasi: worktree ${worktreePath}`);
      console.log(`taskasi: branch ${ctx.branch}`);

      addWorktree(ctx.repoRoot, worktreePath, ctx.branch);

      const envOn = opts.env !== false && cfg.env.enabled;
      if (envOn) {
        if (cfg.env.source?.trim()) {
          copyLegacyEnvToRoot(resolveEnvSource(cfg, ctx), worktreePath);
        } else {
          const envFiles = findEnvFilesInRepo(ctx.repoRoot, {
            worktreeRelativeDir: cfg.worktreeRelativeDir,
            extraSkipDirs: cfg.env.skipDirs,
            extraBasenames: cfg.env.fileNames,
            useGitignoreHints: cfg.env.useGitignoreHints,
          });
          if (envFiles.length === 0) {
            console.warn(
              "taskasi: no env files matched discovery rules (env mirror skipped)",
            );
          } else {
            mirrorEnvFilesToWorktree(ctx.repoRoot, worktreePath, envFiles);
          }
        }
      }

      const wsOn = opts.workspace !== false && cfg.workspace.enabled;
      if (wsOn) {
        const src = resolveWorkspaceSource(cfg, ctx);
        if (!src) {
          console.warn(
            "taskasi: workspace enabled but no template found (expected {basename}.workspace or {basename}.code-workspace in repo or parent; set workspace.source to override)",
          );
        } else {
          const out = resolveWorkspaceOutput(cfg, ctx);
          writeWorkspace(src, out, worktreePath);
          console.log(`taskasi: workspace -> ${out}`);
          if (cfg.workspace.gitignore.enabled) {
            const touched = ensureTaskasiGitignoreRules(ctx.repoRoot, ctx.basename);
            if (touched) {
              console.log(
                "taskasi: .gitignore updated (taskasi block: ignore per-task workspace copies)",
              );
            }
          }
        }
      }
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
