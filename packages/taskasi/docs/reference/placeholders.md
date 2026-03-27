# Placeholders

Used in **`worktreeFolderTemplate`**, **`workspace.source`**, **`workspace.output`**, and similar string fields. Surround with `{` `}`.

## Context variables

| Token | Example | Meaning |
|-------|---------|---------|
| `{id}` | `1587` | Task id from `taskasi switch <id>`. |
| `{branch}` | `NWDEXP-1587` | `branchPrefix` + `id`. |
| `{prefix}` | `NWDEXP-` | Value of `branchPrefix`. |
| `{prefixLower}` | `nwdexp-` | Lowercased `branchPrefix`. |
| `{basename}` | `subscriptions` | Directory name of the git root. |
| `{repo}` | `/Users/me/subscriptions` | Absolute path to repository root. |
| `{parent}` | `/Users/me` | Parent directory of the repository root. |

## `worktreeFolderTemplate`

Example:

```yaml
worktreeFolderTemplate: "{branch}"
```

Produces a folder name like `NWDEXP-1587` (subject to sanitization: no path separators in the final name).

## `workspace.output`

Example — output next to the repo in the parent directory:

```yaml
workspace:
  output: "{parent}/{basename}-{id}.code-workspace"
```

Example — inside the repo (default behavior uses basename + id + `.workspace`):

```yaml
workspace:
  output: "{basename}-{id}.workspace"
```

Paths without a leading `/` are resolved relative to the **repository root**.
