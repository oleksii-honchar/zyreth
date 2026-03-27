import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { cliPath, mkTempDir, writeSkill } from "./helpers.mjs";

function run(args, env = {}) {
  return spawnSync(process.execPath, [cliPath(), ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
  });
}

test("CLI --help exits 0", () => {
  const r = run(["--help"]);
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /agasi/);
});

test("CLI init creates config file", () => {
  const dir = mkTempDir();
  const cfg = path.join(dir, "cfg.yaml");
  const r = run(["--config", cfg, "init"]);
  assert.strictEqual(r.status, 0);
  assert.ok(fs.existsSync(cfg));
  assert.match(fs.readFileSync(cfg, "utf-8"), /version:\s*1/);
});

test("CLI source add and target add and install create symlink", () => {
  const base = mkTempDir();
  const cfg = path.join(base, "cfg.yaml");
  const skills = path.join(base, "skills");
  const repo = path.join(base, "repo");
  fs.mkdirSync(repo, { recursive: true });
  writeSkill(skills, "architect");

  let r = run(["--config", cfg, "init"]);
  assert.strictEqual(r.status, 0, r.stderr);

  r = run(["--config", cfg, "source", "add", "rules", skills]);
  assert.strictEqual(r.status, 0, r.stderr);

  r = run([
    "--config",
    cfg,
    "target",
    "add",
    "--id",
    "t1",
    "--source",
    "rules",
    "--repo",
    repo,
    "--dest",
    "cursor",
  ]);
  assert.strictEqual(r.status, 0, r.stderr);

  r = run(["--config", cfg, "install", "architect"]);
  assert.strictEqual(r.status, 0, r.stderr);

  const linkPath = path.join(repo, ".cursor", "skills", "architect");
  assert.ok(fs.lstatSync(linkPath).isSymbolicLink());
  assert.strictEqual(fs.realpathSync(linkPath), fs.realpathSync(path.join(skills, "architect")));
});

test("CLI config prints JSON", () => {
  const base = mkTempDir();
  const cfg = path.join(base, "cfg.yaml");
  run(["--config", cfg, "init"]);
  const r = run(["--config", cfg, "config"]);
  assert.strictEqual(r.status, 0);
  assert.ok(r.stdout.includes('"sources"'));
});
