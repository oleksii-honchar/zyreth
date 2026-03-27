# Configuration

Global defaults live in **`~/.taskasi/config.yaml`**. If the file is missing, **`taskasi init`** (or the first run of **`config`** / **`switch`**) creates it with built-in defaults.

View the effective merged config:

```bash
taskasi config
```

## File location

| Path | Purpose |
|------|---------|
| `~/.taskasi/config.yaml` | User defaults (YAML) |

The directory `~/.taskasi` is created automatically when needed.

## Merging

Unknown keys are ignored by the loader; missing keys fall back to [built-in defaults](/reference/config-keys). Nested objects (e.g. `env`, `workspace`) are deep-merged with defaults.

## Quick reference

| Area | What to edit |
|------|----------------|
| Branches | `branchPrefix`, `worktreeRelativeDir`, `worktreeFolderTemplate` |
| Env | `env.enabled`, `env.source`, `env.fileNames`, `env.useGitignoreHints`, `env.skipDirs` |
| Workspace | `workspace.enabled`, `workspace.source`, `workspace.output`, `workspace.gitignore.enabled` |

Full key list: [Config keys](/reference/config-keys). Placeholder tokens: [Placeholders](/reference/placeholders).

## Example: custom branch prefix

```yaml
branchPrefix: "NWDEXP-"
worktreeRelativeDir: ".worktrees"
worktreeFolderTemplate: "{branch}"
```

## Example: disable workspace generation

```yaml
workspace:
  enabled: false
```

## Example: legacy single `.env` at worktree root

```yaml
env:
  source: ".env"
```

When `env.source` is set, taskasi copies **only** that file into the worktree root as **`.env`** (legacy). Unset `env.source` to use [env discovery](/guide/env-files).
