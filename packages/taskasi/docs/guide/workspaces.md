# Workspaces (VS Code / Cursor)

taskasi can **duplicate** a **multi-root workspace** JSON file (`.code-workspace` or `.workspace`) and **rewrite** `folders[].path` entries so they point at the **new worktree** instead of the main checkout.

## Template discovery

If **`workspace.source`** is **not** set, taskasi searches in order:

1. `{repo}/{repo-name}.code-workspace`
2. `{repo}/{repo-name}.workspace`
3. `{parent-of-repo}/{repo-name}.code-workspace`
4. `{parent-of-repo}/{repo-name}.workspace`

`{repo-name}` is the directory name of the git root (e.g. `subscriptions`).

## Default output

By default the copy is written **inside the repository**:

```
{repo-name}-{id}.workspace
```

Example: `subscriptions-1587.workspace` next to your tracked `subscriptions.workspace` template.

Override with **`workspace.output`** using [placeholders](/reference/placeholders).

## Path rewriting

- **`path: "."`** (workspace root) becomes a **relative path** from the output file’s directory to the **worktree absolute path**.
- **In-repo** relative paths (e.g. `apps/api`) become paths under that worktree, expressed relative to the output file.
- Paths starting with **`../`** or **absolute** paths are **left unchanged** (e.g. sibling repos like `../subscriptions-deploy`).

## `.gitignore` integration

When **`workspace.gitignore.enabled`** is **`true`** (default), taskasi appends or updates a **marked block** in the repo’s `.gitignore`:

```text
# >>> taskasi
# Local per-task workspace copies (template file stays tracked).
subscriptions-*.workspace
subscriptions-*.code-workspace
# <<< taskasi
```

The patterns use your **repo folder name** as prefix — so **`subscriptions.workspace`** (no hyphen after `subscriptions`) **does not** match `subscriptions-*`, while **`subscriptions-1587.workspace`** does.

Disable automatic updates:

```yaml
workspace:
  gitignore:
    enabled: false
```

## Disabling workspace generation

```bash
taskasi switch 1587 --no-workspace
```

Or:

```yaml
workspace:
  enabled: false
```
