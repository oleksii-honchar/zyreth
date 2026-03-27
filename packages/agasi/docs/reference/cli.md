# CLI reference

Global option (all commands):

| Option | Description |
|--------|-------------|
| `--config <file>` | Path to config file (default `~/.agasi/config.yaml` or `AGASI_CONFIG_PATH`) |

---

## `agasi init`

Creates `~/.agasi/` and default `config.yaml` if missing. Prints the config path.

---

## `agasi config`

Prints config path and effective configuration as **JSON**.

---

## `agasi source list`

Lists all sources: `name` and `path`.

---

## `agasi source add <name> <path>`

Adds a **local** skills root. `path` may use `~`.

Fails if `name` already exists or `path` is not a directory.

---

## `agasi source remove <name>`

Removes a source. **Fails** if any target still references `name`.

---

## `agasi target list`

Lists targets and, when possible, **resolved absolute directories** for each destination.

---

## `agasi target add`

### Required flags

| Flag | Description |
|------|-------------|
| `--id <id>` | Unique target id. |
| `--source <name>` | Must match an existing source name. |
| `--dest <kind>` | Repeatable. See below. |

### Optional

| Flag | Description |
|------|-------------|
| `--repo <root>` | Repository root (required for `cursor`, `agents`, `path`; omit for codex-only). |

### `--dest` values

Repeat `--dest` for multiple install locations:

| Value | Installs under |
|-------|----------------|
| `cursor` | `<repo>/.cursor/skills/<skill>` |
| `agents` | `<repo>/.agents/skills/<skill>` |
| `codex` | `$CODEX_HOME/skills` or `~/.codex/skills` |
| `path:relative/path` | `<repo>/<relative/path>/<skill>` |

Examples:

```bash
agasi target add --id app --source rules --repo ~/projects/my-app --dest cursor --dest agents
agasi target add --id codex --source rules --dest codex
```

---

## `agasi target remove <id>`

Removes a target by id.

---

## `agasi install [skill...]`

Creates symlinks for **all** skills under the source (that have `SKILL.md`), or only the named skills.

| Option | Description |
|--------|-------------|
| `--target <id>` | Restrict to one target. |
| `--force` | Replace symlinks that point to the wrong location. |

Does **not** remove real directories. See [Safety](#safety-behavior) below.

---

## `agasi sync [skill...]`

Reconciles links: adds missing, **replaces wrong symlinks** (same as install with reconciliation). Same options as `install`, plus:

| Option | Description |
|--------|-------------|
| `--prune` | Remove stale **symlinks** for skill names no longer in the source tree. |
| `--force` | Replace wrong symlinks. |
| `--yes` | Reserved (see Safety). |

---

## `agasi doctor`

Read-only checks: missing source paths, broken symlinks, targets pointing at missing `SKILL.md`. Exits non-zero if hard errors are found.

---

## Safety behavior

- **Wrong symlink:** use **`sync`** or **`install --force`** to replace.
- **Real directory** at destination: agasi **stops**; it does **not** delete folders. Remove or rename manually, then re-run.
- **`sync --prune`:** only removes **symlinks** that pointed at the old skill path for a name that no longer exists in the source.
