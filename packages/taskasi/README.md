# @zyreth/taskasi

**taskasi** is a global CLI for **git worktrees**, **gitignore-aware env file mirroring**, and optional **VS Code / Cursor** multi-root **`.workspace`** generation — with persistent defaults in **`~/.taskasi/config.yaml`**.

| | |
|--|--|
| **npm** | [`@zyreth/taskasi`](https://www.npmjs.com/package/@zyreth/taskasi) |
| **Source** | [`packages/taskasi`](https://github.com/oleksii-honchar/zyreth/tree/main/packages/taskasi) |
| **Full documentation** | **[Static HTML docs](#documentation-static-site)** (Markdown → VitePress, **search** included) |

---

## Features

- **Git root from anywhere** — run inside any subdirectory; uses `git rev-parse --show-toplevel`.
- **Worktrees** — `git worktree add` under `.worktrees/` with a configurable branch prefix (e.g. `NWDEXP-<id>`).
- **Env files** — mirrors `.env` / `.env.*` (and optional `git check-ignore` hints for patterns like `*.env`); legacy single-file `env.source` still supported.
- **Workspaces** — duplicates template `.workspace` / `.code-workspace`, rewrites `folders[].path` to the new worktree; optional **`# >>> taskasi`** `.gitignore` block so per-task files stay untracked.

---

## Install

```bash
npm install -g @zyreth/taskasi
taskasi --help
```

Binary name: **`taskasi`**.

---

## Quick start

```bash
# Optional: create ~/.taskasi/config.yaml
taskasi init

cd /path/to/your/git/repo
taskasi switch 1587
```

- **`taskasi switch <id>`** — creates/uses branch `{prefix}{id}`, worktree, env mirror, workspace file (unless `--no-env` / `--no-workspace`).
- **`taskasi config`** — prints merged config.

---

## Configuration

Config file: **`~/.taskasi/config.yaml`** (YAML, created on first use).

| Key | Purpose |
|-----|---------|
| `branchPrefix` | Branch = `{prefix}{id}` (default `NWDEXP-`) |
| `worktreeRelativeDir` / `worktreeFolderTemplate` | Where worktrees live and how folders are named |
| `env.*` | Env mirroring, `env.source` legacy, `env.useGitignoreHints`, `env.skipDirs` |
| `workspace.*` | Template/output paths, `.gitignore` block toggle |

**Full key reference, placeholders, and behavior:** see the **[documentation site](#documentation-static-site)** (same content as the `docs/` Markdown sources).

---

## Documentation (static site)

The docs are written in **Markdown** under **`docs/`** and built with **[VitePress](https://vitepress.dev/)** into **static HTML** with a **client-side search index** (no server required after build).

### Develop (hot reload)

```bash
cd packages/taskasi
npm install
npm run docs:dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`). Use the **search** box in the header.

### Build static HTML

```bash
npm run docs:build
```

Output: **`docs/.vitepress/dist/`** — deploy this folder to any static host (GitHub Pages, Netlify, S3, etc.).

```bash
npm run docs:preview   # preview the production build locally
```

### Deploy notes

- Serve **`dist`** as the site **root** unless you use a subpath; if you use a subpath (e.g. `https://example.com/taskasi/`), set `base` in `docs/.vitepress/config.mts` (e.g. `base: '/taskasi/'`).
- Search is **local** (bundled index); no external search API.

---

## Requirements

- **Node.js** 20+
- **Git** on `PATH`

---

## Development (package)

```bash
cd packages/taskasi
npm install
npm run build
npm test
```

---

## Tests

```bash
npm test
```

- **Runner:** `node --test` with **`--test-concurrency=1`** (one file at a time) so `TASKASI_CONFIG_PATH` stays isolated.
- **Default `npm test`:** only **`test/*.test.mjs`** — safe for a **restricted sandbox** (Cursor default): fixtures under `test/.tmp/` inside the repo, no real `git init` / hooks.
- **Git integration:** **`npm run test:integration`** or **`npm run test:all`** — runs **`test/integration/git.test.mjs`**. Use an **open shell** / full permissions so `git` can create `.git/hooks` (restricted sandboxes often return `EPERM` on `git init`).
- **Areas (default):** `paths`, `config`, `env-mirror`, `workspace`, `gitignore`, CLI `--help`.

More detail: **[docs/reference/testing.md](./docs/reference/testing.md)** (also in the VitePress site).

---

## Publishing the npm package

Maintainers: **[PUBLISHING.md](./PUBLISHING.md)** (`npm login`, `npm run pack:dry`, `npm publish`, `@zyreth` scope).

---

## Session / handoff

Internal notes for this package: `agent-sessions/.../session-20260324-1728-zyreth-taskasi/` (`INSTRUCTIONS.md`, `SESSION.md`).
