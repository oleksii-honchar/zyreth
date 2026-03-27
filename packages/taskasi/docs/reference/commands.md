# CLI commands

All commands resolve the **git repository root** from the current working directory.

## `taskasi init`

Creates **`~/.taskasi/config.yaml`** with default values **if the file does not exist**, then prints the path.

```bash
taskasi init
```

## `taskasi config`

Ensures the config file exists, then prints its path and the **merged** configuration (defaults + file contents) as JSON.

```bash
taskasi config
```

## `taskasi switch <id>`

Creates or attaches a **git worktree** and runs optional env and workspace steps.

```bash
taskasi switch 1587
taskasi switch 1587 --no-env
taskasi switch 1587 --no-workspace
```

### Arguments

| Argument | Description |
|----------|-------------|
| `<id>` | Task id (e.g. ticket number). Combined with **`branchPrefix`** for the branch name. |

### Options

| Option | Description |
|--------|-------------|
| `--no-env` | Skip env mirroring / legacy copy. |
| `--no-workspace` | Skip workspace file write and repo **`.gitignore`** updates for taskasi. |

### Exit codes

Non-zero if Git operations fail or configuration is invalid; messages are printed to **stderr**.

## Global options

```bash
taskasi --help
taskasi -V
```
