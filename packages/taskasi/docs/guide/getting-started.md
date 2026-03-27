# Getting started

**taskasi** helps you spin up a **parallel git worktree** for a task id, copy **environment files** into matching paths, and optionally emit a **VS Code / Cursor workspace** file that points folder roots at that worktree.

## Prerequisites

- **Node.js** 20+ (for installing the CLI from npm)
- **Git** on your `PATH`
- A local clone of a repository you can create branches and worktrees in

## Install the CLI

```bash
npm install -g @zyreth/taskasi
taskasi --help
```

## Initialize config (optional)

The first run creates **`~/.taskasi/config.yaml`** if it does not exist. You can create it explicitly:

```bash
taskasi init
```

Edit the file to set your **branch prefix** (e.g. `NWDEXP-`), worktree folder naming, env and workspace options.

## Run a switch

From **any directory inside your repo** (subfolders are fine — the git root is detected):

```bash
cd ~/src/my-monorepo
taskasi switch 1587
```

This typically:

1. Creates a worktree under `.worktrees/<folder>/` on branch `{prefix}1587` (or attaches to that branch if it already exists).
2. Mirrors env files into the worktree (unless `--no-env`).
3. Writes a per-task workspace file and updates `.gitignore` (unless `--no-workspace`).

## Next steps

- [Installation](/guide/installation) — `npm link`, versions, global vs local
- [Configuration](/guide/configuration) — all options in `~/.taskasi/config.yaml`
- [Environment files](/guide/env-files) — discovery rules and gitignore hints
- [Workspaces](/guide/workspaces) — template discovery and path rewriting
- [CLI reference](/reference/commands) — `init`, `config`, `switch` flags
