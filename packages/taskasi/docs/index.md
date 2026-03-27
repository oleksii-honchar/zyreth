---
layout: home

hero:
  name: taskasi
  text: Worktrees & workspaces
  tagline: Git worktrees, env mirroring, and VS Code / Cursor multi-root workspaces — from one command.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: CLI reference
      link: /reference/commands

features:
  - title: Git worktrees
    details: Resolves the repository root from any subdirectory, adds a worktree under .worktrees/, and creates or attaches to a task branch (configurable prefix).
  - title: Env files
    details: Mirrors .env and .env.* across the tree; optional git check-ignore hints for patterns like *.env. Legacy single-file copy still supported.
  - title: Workspace JSON
    details: Duplicates your template .workspace / .code-workspace, rewrites folder paths to the new worktree, and can maintain .gitignore rules for per-task copies.
---

## Search

Use the **search box** in the header (built from the Markdown index — no backend required after `vitepress build`).

## Package

Published as **`@zyreth/taskasi`** on npm. Global binary: **`taskasi`**.

```bash
npm install -g @zyreth/taskasi
```

See [Installation](/guide/installation) for `npm link` and development setup.
