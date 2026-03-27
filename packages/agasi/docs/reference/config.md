# Config file reference

**Path:** `~/.agasi/config.yaml` (unless overridden).

## Top level

| Key | Type | Description |
|-----|------|-------------|
| `version` | number | Currently `1`. |
| `sources` | array | Named local skill roots. |
| `targets` | array | Where to symlink each source’s skills. |

## Source entry

```yaml
sources:
  - name: rules
    path: ~/Documents/agent-rules-n-skills/skills
```

| Field | Description |
|-------|-------------|
| `name` | Unique string. |
| `path` | Directory whose **immediate subdirectories** are skills (each must contain `SKILL.md`). |

## Target entry

```yaml
targets:
  - id: my-app
    source: rules
    repoRoot: /abs/path/to/repo
    destinations:
      - type: cursor
      - type: agents
```

| Field | Description |
|-------|-------------|
| `id` | Unique string. |
| `source` | References `sources[].name`. |
| `repoRoot` | Required for `cursor` / `agents` / `path` (can use `~`). Use `""` for codex-only. |
| `destinations` | List of destination objects. |

## Destination object

**Built-in types:**

```yaml
destinations:
  - type: cursor
  - type: agents
  - type: codex
  - type: path
    relative: tools/my-skills
```

| `type` | Extra fields | Resolves to |
|--------|--------------|-------------|
| `cursor` | — | `<repoRoot>/.cursor/skills` |
| `agents` | — | `<repoRoot>/.agents/skills` |
| `codex` | — | `$CODEX_HOME/skills` or `~/.codex/skills` |
| `path` | `relative` (required) | `<repoRoot>/<relative>` |

## Example: codex-only

```yaml
targets:
  - id: codex
    source: rules
    repoRoot: ""
    destinations:
      - type: codex
```
