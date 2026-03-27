# Getting started

**agasi** keeps a **single canonical folder** of skills (each subfolder contains `SKILL.md`) and creates **symlinks** into every tool-specific location you care about: Cursor, a generic `.agents` tree, Codex’s global skills directory, or a custom path.

## Mental model

1. **Source** — A named path to your flat skills root (e.g. `~/Documents/agent-rules-n-skills/skills`).
2. **Target** — A named binding: which source to use, which repository root (if needed), and one or more **destinations** (`cursor`, `agents`, `codex`, or `path:...`).
3. **Install / sync** — Create or fix symlinks under each destination. **`install`** adds missing links; **`sync`** also replaces wrong symlinks; **`sync --prune`** removes stale symlinks when a skill was removed from the source tree.

## One-minute flow

```bash
agasi init
agasi source add rules ~/path/to/skills
agasi target add --id myapp --source rules --repo ~/path/to/repo --dest cursor --dest agents
agasi install
agasi doctor
```

After you change skills in the source tree, run:

```bash
agasi sync
```

## What is *not* in v0.1

**Git-backed sources** (clone/fetch into a cache, then install) are planned as **phase 2**. Today only **local `path` sources** are supported.

## Next

- [Installation](/guide/installation)
- [Integrations](/guide/integrations) — how this maps to Cursor, Codex, and other agents
- [Configuration](/guide/configuration)
