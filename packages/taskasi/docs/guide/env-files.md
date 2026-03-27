# Environment files

When **`env.source`** is **unset** in `~/.taskasi/config.yaml`, taskasi **discovers** env files in the **main repository checkout** and **mirrors** them to the **same relative paths** inside the new worktree.

## What gets copied (discovery)

### 1. Dotenv-style names (always)

Any file whose **basename** is:

- **`.env`**, or  
- starts with **`.env.`** (e.g. `.env.local`, `.env.development`, `.env.tpl`)

These are included **whether or not** Git ignores them — so a local gitignored `.env` still copies to the worktree for development.

### 2. Gitignore hints (optional)

If **`env.useGitignoreHints`** is **`true`** (default), taskasi also considers files whose basename **ends with `.env`** (e.g. `config.prod.env`). It runs **`git check-ignore -v`** on those paths and copies them when:

- Git reports the path as **ignored**, and  
- The **matched ignore pattern** looks [env-related](/reference/config-keys#env-usegitignorehints) (e.g. `*.env`, `.env.*`).

This covers repos where only some `*.env` files are ignored.

### 3. Extra basenames

**`env.fileNames`** lists additional **exact** basenames to always mirror (e.g. `.envrc`).

## What is skipped when scanning

The walk skips common vendor and tool directories, including:

- `.git`, `node_modules`, `dist`, `coverage`, `.nx`, `.turbo`
- The configured **`worktreeRelativeDir`** (e.g. `.worktrees`) so sibling worktrees are not used as sources
- **`env.skipDirs`** — extra directory names you configure

## Legacy mode: single file

If **`env.source`** is set to a path (relative to repo root or absolute), taskasi **only** copies that file into the worktree **root** as **`.env`**. Discovery above is **not** used.

## Disabling env copy

Use the CLI flag:

```bash
taskasi switch 1587 --no-env
```

Or set:

```yaml
env:
  enabled: false
```

## Tips

- Keep **templates** (e.g. `.env.example`) committed; keep **secrets** gitignored — taskasi copies both when they match the rules above.
- For very large trees, discovery is limited to file walks under the repo root with the skips above.
