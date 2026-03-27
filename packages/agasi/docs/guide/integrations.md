# Integrations — Cursor, Codex, and other agents

agasi does not load skills inside the IDE itself. It **prepares the filesystem** so each tool’s documented skills locations contain **symlinks** to your shared skills tree.

## Cursor

Cursor discovers project skills under:

- **`.cursor/skills/<skill>/`** — use destination **`cursor`** with a **`--repo`** (or `repoRoot` in YAML) pointing at the project root.

Optional user-level skills (`~/.cursor/skills`) are not created by agasi’s built-in types; use a **custom** `path:` destination and set `repoRoot` to your home directory if you need that layout (advanced).

::: warning Symlinks and discovery
Some Cursor builds have had limitations around **symlink** visibility for skill discovery. If skills do not appear, check [Cursor Agent Skills](https://www.cursor.com/docs/context/skills) for the current behavior and [community threads](https://forum.cursor.com/t/agent-skills-must-see-symlinks/150093/3).
:::

## `.agents/skills`

Many workflows use a repo-level **`.agents/skills`** tree. agasi maps destination **`agents`** to:

`<repoRoot>/.agents/skills/<skill>/`

Use this when your editor or orchestration expects skills next to the repo (sometimes shared with other tools).

## Codex (OpenAI CLI)

Codex loads skills from **`$CODEX_HOME/skills`** when **`CODEX_HOME`** is set, otherwise typically **`~/.codex/skills`**.

Register a target with **only** `--dest codex` (and the same **`--source`** as your rules). **`repoRoot`** can be empty for codex-only targets.

Example:

```bash
agasi target add --id codex-global --source rules --dest codex
agasi install --target codex-global
```

Restart Codex after changing global skills if your version caches paths.

## “Plugin” usage in practice

In this README we use **plugin** loosely: agasi is a **CLI plugin to your workflow** — you run it once per machine (or in CI) to wire repos to a shared skills checkout. It is **not** a VS Code/Cursor marketplace extension.

Typical setups:

| Setup | What you do |
|-------|-------------|
| **Solo dev, one skills repo** | `source add` once; `target add` per application repo; `install` / `sync` after pulls |
| **Team** | Commit **not** the symlinks if policies require; document `agasi sync` in onboarding, or commit symlinks if your VCS allows |
| **Multiple machines** | Same `config.yaml` (or re-run `source`/`target` commands); paths may differ — use `~` in YAML where possible |

## Custom destination

Use **`path:relative/path`** under **`--repo`** when a tool expects skills somewhere else, e.g. a nested tooling folder:

```bash
agasi target add --id custom --source rules --repo ~/proj --dest path:tools/agent-skills
```

This installs symlinks at `~/proj/tools/agent-skills/<skill>`.
