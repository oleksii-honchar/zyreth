#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";
import {
  initConfigFile,
  loadConfig,
  saveConfig,
  findSource,
  assertSourcePathsExist,
  targetReferencesSource,
  type DestinationEntry,
} from "./config.js";
import { AGASI_CONFIG_PATH, expandHome } from "./paths.js";
import { listSkillNames, skillSourceDir } from "./skills.js";
import {
  resolveDestinations,
  resolveSkillsRoot,
  ensureBaseParentDirs,
} from "./targets.js";
import { linkSkillDir, pruneStaleSymlinks } from "./link.js";

const PKG_VERSION = "0.1.0";

function resolveConfigPath(explicit?: string): string {
  if (explicit?.trim()) {
    return path.resolve(expandHome(explicit.trim()));
  }
  const env = process.env.AGASI_CONFIG_PATH?.trim();
  if (env) {
    return expandHome(env);
  }
  return AGASI_CONFIG_PATH;
}

function parseDestToken(s: string): DestinationEntry {
  const t = s.trim();
  if (t === "cursor" || t === "agents" || t === "codex") {
    return { type: t };
  }
  if (t.startsWith("path:")) {
    const rel = t.slice(5).trim();
    if (!rel) {
      throw new Error(`Invalid --dest "${s}" (use path:relative/path)`);
    }
    return { type: "path", relative: rel.replace(/\\/g, "/") };
  }
  throw new Error(`Invalid --dest "${s}" (expected cursor|agents|codex|path:rel)`);
}

function collectDest(value: string, prev: string[]): string[] {
  prev.push(value);
  return prev;
}

function runInstallOrSync(
  cfgPath: string,
  opts: {
    targetId?: string;
    skillFilter?: string[];
    sync: boolean;
    prune: boolean;
    force: boolean;
    yes: boolean;
  },
): void {
  const cfg = loadConfig(cfgPath);
  assertSourcePathsExist(cfg);

  const targets = opts.targetId
    ? cfg.targets.filter((t) => t.id === opts.targetId)
    : cfg.targets;
  if (opts.targetId && targets.length === 0) {
    throw new Error(`Unknown target id: ${opts.targetId}`);
  }

  for (const t of targets) {
    const root = resolveSkillsRoot(cfg, t);
    const allNames = listSkillNames(root);
    const allSet = new Set(allNames);

    let names = allNames;
    if (opts.skillFilter?.length) {
      for (const n of opts.skillFilter) {
        if (!allSet.has(n)) {
          console.warn(`agasi: skill not found under source (skipped): ${n}`);
        }
      }
      const want = new Set(opts.skillFilter);
      names = allNames.filter((n) => want.has(n));
    }

    const dests = resolveDestinations(cfg, t);
    for (const { label, baseDir } of dests) {
      ensureBaseParentDirs(baseDir);
      for (const skill of names) {
        const srcDir = skillSourceDir(root, skill);
        const destLink = path.join(baseDir, skill);
        const outcome = linkSkillDir(srcDir, destLink, { force: opts.sync || opts.force });
        if (outcome.status === "blocked") {
          if (
            outcome.message.includes("real directory") &&
            opts.force &&
            !opts.yes
          ) {
            throw new Error(
              `${outcome.message}\nRefuse to replace without --yes (or remove the directory manually).`,
            );
          }
          if (outcome.message.includes("real directory") && !opts.force) {
            throw new Error(`${outcome.message}\nUse --force --yes to attempt replacement (dangerous).`);
          }
          throw new Error(outcome.message);
        }
        if (outcome.status === "created") {
          console.log(`agasi: link ${t.id}/${label} -> ${skill}`);
        } else if (outcome.status === "replaced") {
          console.log(`agasi: fixed link ${t.id}/${label} -> ${skill}`);
        }
      }
      if (opts.sync && opts.prune) {
        const removed = pruneStaleSymlinks(baseDir, root, allSet);
        if (removed > 0) {
          console.log(`agasi: pruned ${removed} stale symlink(s) under ${baseDir}`);
        }
      }
    }
  }
}

function runDoctor(cfgPath: string): void {
  const cfg = loadConfig(cfgPath);
  let issues = 0;
  for (const s of cfg.sources) {
    if (!fs.existsSync(s.path)) {
      console.error(`agasi: source "${s.name}" missing path: ${s.path}`);
      issues += 1;
    }
  }
  for (const t of cfg.targets) {
    let root: string;
    try {
      root = resolveSkillsRoot(cfg, t);
    } catch (e) {
      console.error(`agasi: target "${t.id}": ${e instanceof Error ? e.message : e}`);
      issues += 1;
      continue;
    }
    const allNames = new Set(listSkillNames(root));
    let dests: ReturnType<typeof resolveDestinations>;
    try {
      dests = resolveDestinations(cfg, t);
    } catch (e) {
      console.error(`agasi: target "${t.id}": ${e instanceof Error ? e.message : e}`);
      issues += 1;
      continue;
    }
    for (const { label, baseDir } of dests) {
      if (!fs.existsSync(baseDir)) {
        console.warn(`agasi: destination base missing: ${t.id}/${label} (${baseDir})`);
        continue;
      }
      for (const ent of fs.readdirSync(baseDir, { withFileTypes: true })) {
        const p = path.join(baseDir, ent.name);
        const st = fs.lstatSync(p);
        if (!st.isSymbolicLink()) {
          continue;
        }
        let cur: string;
        try {
          cur = fs.readlinkSync(p);
        } catch {
          console.error(`agasi: broken symlink (read failed): ${p}`);
          issues += 1;
          continue;
        }
        const resolved = path.isAbsolute(cur)
          ? path.resolve(cur)
          : path.resolve(path.dirname(p), cur);
        if (!fs.existsSync(resolved)) {
          console.error(`agasi: broken symlink: ${p} -> ${cur}`);
          issues += 1;
          continue;
        }
        const md = path.join(resolved, "SKILL.md");
        if (!fs.existsSync(md)) {
          console.error(`agasi: symlink target missing SKILL.md: ${p} -> ${resolved}`);
          issues += 1;
          continue;
        }
        if (!allNames.has(ent.name)) {
          console.warn(
            `agasi: symlink name not in current source listing: ${ent.name} (${p}); run sync --prune to drop`,
          );
        }
      }
    }
  }
  if (issues === 0) {
    console.log("agasi: doctor finished (no hard errors)");
  } else {
    console.error(`agasi: doctor found ${issues} issue(s)`);
    process.exitCode = 1;
  }
}

const program = new Command();

program
  .name("agasi")
  .description("Symlink flat agent skills into Cursor, .agents, and Codex directories")
  .version(PKG_VERSION)
  .option("--config <file>", "Path to config file (default ~/.agasi/config.yaml)");

function activeConfigPath(): string {
  const o = program.opts() as { config?: string };
  return resolveConfigPath(o.config);
}

program
  .command("init")
  .description("Create ~/.agasi/config.yaml if missing")
  .action(() => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    console.log(cfgPath);
  });

program
  .command("config")
  .description("Print config path and effective configuration")
  .action(() => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    const cfg = loadConfig(cfgPath);
    console.log(`config: ${cfgPath}`);
    console.log(JSON.stringify(cfg, null, 2));
  });

const sourceCmd = program.command("source").description("Manage skill sources");

sourceCmd
  .command("list")
  .description("List configured sources")
  .action(() => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    const cfg = loadConfig(cfgPath);
    for (const s of cfg.sources) {
      console.log(`${s.name}\t${s.path}`);
    }
  });

sourceCmd
  .command("add")
  .description("Add a local source (skills root directory)")
  .argument("<name>", "Source id")
  .argument("<path>", "Absolute or ~/ path to skills folder")
  .action((name: string, p: string) => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    const cfg = loadConfig(cfgPath);
    if (cfg.sources.some((s) => s.name === name)) {
      throw new Error(`Source already exists: ${name}`);
    }
    const abs = expandHome(p);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      throw new Error(`Not a directory: ${abs}`);
    }
    cfg.sources.push({ name, path: abs });
    saveConfig(cfgPath, cfg);
    console.log(`agasi: added source ${name} -> ${abs}`);
  });

sourceCmd
  .command("remove")
  .description("Remove a source (must not be referenced by targets)")
  .argument("<name>", "Source id")
  .action((name: string) => {
    const cfgPath = activeConfigPath();
    const cfg = loadConfig(cfgPath);
    if (targetReferencesSource(cfg, name)) {
      throw new Error(`Source "${name}" is still referenced by a target`);
    }
    const next = cfg.sources.filter((s) => s.name !== name);
    if (next.length === cfg.sources.length) {
      throw new Error(`Unknown source: ${name}`);
    }
    cfg.sources = next;
    saveConfig(cfgPath, cfg);
    console.log(`agasi: removed source ${name}`);
  });

const targetCmd = program.command("target").description("Manage install targets");

targetCmd
  .command("list")
  .description("List targets and resolved destination bases")
  .action(() => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    const cfg = loadConfig(cfgPath);
    for (const t of cfg.targets) {
      console.log(`${t.id}\tsource=${t.source}\trepoRoot=${t.repoRoot ?? ""}`);
      let dests: ReturnType<typeof resolveDestinations>;
      try {
        dests = resolveDestinations(cfg, t);
      } catch (e) {
        console.log(`  (error: ${e instanceof Error ? e.message : e})`);
        continue;
      }
      for (const d of dests) {
        console.log(`  - ${d.label}: ${d.baseDir}`);
      }
    }
  });

targetCmd
  .command("add")
  .description("Add a target")
  .requiredOption("--id <id>", "Target id")
  .requiredOption("--source <name>", "Source name")
  .option("--repo <root>", "Repo root (required for cursor/agents/path destinations)")
  .option(
    "--dest <d>",
    "Repeatable: cursor | agents | codex | path:relative",
    collectDest,
    [] as string[],
  )
  .action(
    (
      _,
      cmd: Command & { opts: () => { id: string; source: string; repo?: string; dest: string[] } },
    ) => {
      const cfgPath = activeConfigPath();
      initConfigFile(cfgPath);
      const cfg = loadConfig(cfgPath);
      const o = cmd.opts();
      if (!findSource(cfg, o.source)) {
        throw new Error(`Unknown source: ${o.source}`);
      }
      if (cfg.targets.some((t) => t.id === o.id)) {
        throw new Error(`Target already exists: ${o.id}`);
      }
      const tokens = o.dest ?? [];
      if (tokens.length === 0) {
        throw new Error("Provide at least one --dest");
      }
      const destinations = tokens.map(parseDestToken);
      const repoRoot = o.repo?.trim() ? path.resolve(expandHome(o.repo.trim())) : null;
      cfg.targets.push({
        id: o.id,
        source: o.source,
        repoRoot,
        destinations,
      });
      saveConfig(cfgPath, cfg);
      console.log(`agasi: added target ${o.id}`);
    },
  );

targetCmd
  .command("remove")
  .description("Remove a target")
  .argument("<id>", "Target id")
  .action((id: string) => {
    const cfgPath = activeConfigPath();
    const cfg = loadConfig(cfgPath);
    const next = cfg.targets.filter((t) => t.id !== id);
    if (next.length === cfg.targets.length) {
      throw new Error(`Unknown target: ${id}`);
    }
    cfg.targets = next;
    saveConfig(cfgPath, cfg);
    console.log(`agasi: removed target ${id}`);
  });

function addInstallLikeCommand(
  name: string,
  opts: { sync: boolean; pruneOption: boolean },
): void {
  const c = program
    .command(name)
    .description(
      opts.sync
        ? "Reconcile symlinks (fix wrong/missing links)"
        : "Create symlinks for skills",
    )
    .option("--target <id>", "Only this target id")
    .option("--force", "Replace symlinks that point to the wrong place")
    .option("--yes", "Acknowledge replacing real directories with --force (unsafe)")
    .allowExcessArguments(true);
  if (opts.pruneOption) {
    c.option("--prune", "Remove stale symlinks for skills removed from source");
  }
  c.argument("[skills...]", "Skill folder names (default: all)")
    .action((skills: string[] | undefined, _opt: unknown, cmd: Command) => {
      const cfgPath = activeConfigPath();
      initConfigFile(cfgPath);
      const local = cmd.opts() as {
        target?: string;
        force?: boolean;
        yes?: boolean;
        prune?: boolean;
      };
      const list = Array.isArray(skills) ? skills : [];
      runInstallOrSync(cfgPath, {
        targetId: local.target,
        skillFilter: list.length > 0 ? list : undefined,
        sync: opts.sync,
        prune: Boolean(local.prune),
        force: Boolean(local.force),
        yes: Boolean(local.yes),
      });
    });
}

addInstallLikeCommand("install", { sync: false, pruneOption: false });
addInstallLikeCommand("sync", { sync: true, pruneOption: true });

program
  .command("doctor")
  .description("Check config, sources, and symlinks")
  .action(() => {
    const cfgPath = activeConfigPath();
    initConfigFile(cfgPath);
    runDoctor(cfgPath);
  });

program.configureHelp({ sortSubcommands: true });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
