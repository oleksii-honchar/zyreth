# Config keys

Defaults apply when a key is omitted from **`~/.taskasi/config.yaml`**.

## Top level

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `branchPrefix` | string | `NWDEXP-` | Prepended to `<id>` for the branch name. |
| `worktreeRelativeDir` | string | `.worktrees` | Directory under repo root holding worktrees. |
| `worktreeFolderTemplate` | string | `{branch}` | Folder name under `worktreeRelativeDir`. See [Placeholders](/reference/placeholders). |

## `env`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | boolean | `true` | Run env copy/mirror when false is not passed on CLI. |
| `source` | string | — | If set, **legacy**: copy only this file to worktree root as `.env`. If unset, use [env discovery](/guide/env-files). |
| `fileNames` | string[] | — | Extra **exact** basenames to always mirror. |
| `useGitignoreHints` | boolean | `true` | Use `git check-ignore` for `*.env`-style files. |
| `skipDirs` | string[] | — | Extra directory **names** to skip when walking (see built-in skips in [env guide](/guide/env-files)). |

### `env.useGitignoreHints`

When **`true`**, patterns from **`git check-ignore -v`** must pass an internal “env-related” check (e.g. contains `.env`, `*.env`, etc.). Unrelated ignores (e.g. `*.log`) do not trigger copies.

## `workspace`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | boolean | `true` | Write workspace file when not disabled via CLI. |
| `source` | string | — | Explicit path to template workspace JSON. |
| `output` | string | `{basename}-{id}.workspace` | Output path; relative paths resolve against **repo root**. |
| `gitignore.enabled` | boolean | `true` | Maintain `# >>> taskasi` block in repo `.gitignore`. |

See [Workspaces](/guide/workspaces) for discovery order when **`source`** is unset.
