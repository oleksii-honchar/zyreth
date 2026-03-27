import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it, before, after } from "node:test";
import { mkTestTmp, rmTestTmp } from "./helpers/tmp.mjs";
import {
  buildPathContext,
  loadConfig,
  resolveEnvSource,
  resolveWorkspaceOutput,
  resolveWorktreeFolder,
  resolveWorkspaceSource,
} from "../dist/config.js";

const DEFAULTS_CFG = () => ({
  branchPrefix: "NWDEXP-",
  worktreeRelativeDir: ".worktrees",
  worktreeFolderTemplate: "{branch}",
  env: {
    enabled: true,
    source: undefined,
    fileNames: undefined,
    useGitignoreHints: true,
    skipDirs: undefined,
  },
  workspace: {
    enabled: true,
    source: undefined,
    output: undefined,
    gitignore: { enabled: true },
  },
});

describe("buildPathContext / resolveWorktreeFolder", () => {
  it("builds branch and prefixLower", () => {
    const cfg = DEFAULTS_CFG();
    const ctx = buildPathContext("/tmp/myrepo", "99", cfg);
    assert.equal(ctx.basename, "myrepo");
    assert.equal(ctx.branch, "NWDEXP-99");
    assert.equal(ctx.prefixLower, "nwdexp-");
  });

  it("resolves worktree folder from template", () => {
    const cfg = DEFAULTS_CFG();
    const ctx = buildPathContext("/tmp/foo", "1", cfg);
    assert.equal(resolveWorktreeFolder(cfg, ctx), "NWDEXP-1");
  });

  it("sanitizes slashes in template output", () => {
    const cfg = {
      ...DEFAULTS_CFG(),
      worktreeFolderTemplate: "{id}/bad",
    };
    const ctx = buildPathContext("/tmp/foo", "x", cfg);
    assert.equal(resolveWorktreeFolder(cfg, ctx), "x-bad");
  });
});

describe("resolveEnvSource", () => {
  it("defaults to repo .env", () => {
    const cfg = DEFAULTS_CFG();
    const ctx = buildPathContext("/tmp/proj", "1", cfg);
    assert.equal(resolveEnvSource(cfg, ctx), path.resolve("/tmp/proj", ".env"));
  });

  it("respects env.source relative to repo", () => {
    const cfg = {
      ...DEFAULTS_CFG(),
      env: { ...DEFAULTS_CFG().env, source: "secrets/.env" },
    };
    const ctx = buildPathContext("/tmp/proj", "1", cfg);
    assert.equal(resolveEnvSource(cfg, ctx), path.resolve("/tmp/proj", "secrets/.env"));
  });
});

describe("resolveWorkspaceOutput", () => {
  it("defaults to basename-id.workspace under repo", () => {
    const cfg = DEFAULTS_CFG();
    const ctx = buildPathContext("/tmp/subscriptions", "1587", cfg);
    assert.equal(
      resolveWorkspaceOutput(cfg, ctx),
      path.resolve("/tmp/subscriptions", "subscriptions-1587.workspace"),
    );
  });

  it("expands custom pattern with parent", () => {
    const cfg = {
      ...DEFAULTS_CFG(),
      workspace: {
        ...DEFAULTS_CFG().workspace,
        output: "{parent}/{basename}-{id}.code-workspace",
      },
    };
    const ctx = buildPathContext("/tmp/subscriptions", "1", cfg);
    assert.equal(
      resolveWorkspaceOutput(cfg, ctx),
      path.join(path.dirname("/tmp/subscriptions"), "subscriptions-1.code-workspace"),
    );
  });
});

describe("loadConfig with TASKASI_CONFIG_PATH", () => {
  let tmpDir;
  let prevEnv;

  before(() => {
    prevEnv = process.env.TASKASI_CONFIG_PATH;
    tmpDir = mkTestTmp("yaml-");
    const yamlPath = path.join(tmpDir, "config.yaml");
    fs.writeFileSync(
      yamlPath,
      `branchPrefix: "TICKET-"
env:
  enabled: false
`,
      "utf-8",
    );
    process.env.TASKASI_CONFIG_PATH = yamlPath;
  });

  after(() => {
    if (prevEnv === undefined) {
      delete process.env.TASKASI_CONFIG_PATH;
    } else {
      process.env.TASKASI_CONFIG_PATH = prevEnv;
    }
    rmTestTmp(tmpDir);
  });

  it("merges YAML over defaults", () => {
    const cfg = loadConfig();
    assert.equal(cfg.branchPrefix, "TICKET-");
    assert.equal(cfg.env.enabled, false);
    assert.equal(cfg.worktreeRelativeDir, ".worktrees");
    assert.equal(cfg.workspace.gitignore.enabled, true);
  });
});

describe("resolveWorkspaceSource with temp files", () => {
  let prevEnv;

  before(() => {
    prevEnv = process.env.TASKASI_CONFIG_PATH;
    delete process.env.TASKASI_CONFIG_PATH;
  });

  after(() => {
    if (prevEnv === undefined) {
      delete process.env.TASKASI_CONFIG_PATH;
    } else {
      process.env.TASKASI_CONFIG_PATH = prevEnv;
    }
  });

  it("finds repo-root .code-workspace first", () => {
    const repo = mkTestTmp("ws-a-");
    try {
      const base = path.basename(repo);
      const cfg = DEFAULTS_CFG();
      fs.writeFileSync(path.join(repo, `${base}.code-workspace`), "{}", "utf-8");
      const ctx = buildPathContext(repo, "1", cfg);
      assert.equal(resolveWorkspaceSource(cfg, ctx), path.join(repo, `${base}.code-workspace`));
    } finally {
      rmTestTmp(repo);
    }
  });

  it("finds .workspace in repo when code-workspace missing", () => {
    const repo = mkTestTmp("ws-b-");
    try {
      const base = path.basename(repo);
      const cfg = DEFAULTS_CFG();
      fs.writeFileSync(path.join(repo, `${base}.workspace`), "{}", "utf-8");
      const ctx = buildPathContext(repo, "1", cfg);
      assert.equal(resolveWorkspaceSource(cfg, ctx), path.join(repo, `${base}.workspace`));
    } finally {
      rmTestTmp(repo);
    }
  });
});
