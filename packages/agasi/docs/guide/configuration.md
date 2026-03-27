# Configuration

## Location

| Mechanism | Path |
|-----------|------|
| Default | `~/.agasi/config.yaml` |
| CLI | `agasi --config /path/to/config.yaml …` |
| Env | `AGASI_CONFIG_PATH=/path/to/config.yaml` |

`agasi config` prints the resolved path and the merged JSON view.

## Minimal example

```yaml
version: 1

sources:
  - name: rules
    path: /Users/you/Documents/agent-rules-n-skills/skills

targets:
  - id: rules-repo
    source: rules
    repoRoot: /Users/you/Documents/agent-rules-n-skills
    destinations:
      - type: cursor
      - type: agents

  - id: codex-global
    source: rules
    repoRoot: ""
    destinations:
      - type: codex
```

## Keys

### `sources`

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique id referenced by targets. |
| `path` | Yes (v0.1) | Absolute path or `~/…` to the **skills root** (folder of skill directories). |

Git-only sources are **not** supported until phase 2.

### `targets`

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique target name; use with `agasi install --target <id>`. |
| `source` | Yes | Must match a `sources[].name`. |
| `repoRoot` | Depends | Required for `cursor`, `agents`, and `path` destinations (absolute or `~`). May be empty for **codex-only** targets. |
| `destinations` | Yes | Non-empty list of destination objects (see below). |

### Destination objects

| `type` | Extra | Resolves to |
|--------|--------|-------------|
| `cursor` | — | `<repoRoot>/.cursor/skills` |
| `agents` | — | `<repoRoot>/.agents/skills` |
| `codex` | — | `$CODEX_HOME/skills` or `~/.codex/skills` |
| `path` | `relative: "dir/sub"` | `<repoRoot>/<relative>` |

## CLI vs hand-edited YAML

You can manage the same file with:

```bash
agasi source add …
agasi target add …
```

or edit YAML directly. Invalid YAML or unknown references produce errors on `install` / `config`.

## See also

- [CLI reference](/reference/cli)
- [Config file](/reference/config) (quick schema summary)
