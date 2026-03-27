# Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `Unknown source` | `agasi source list` — `target.source` must match a source `name`. |
| `needs repoRoot` / cursor requires repo | Add `--repo` or set `repoRoot` in YAML for non-codex destinations. |
| `Symlink points elsewhere` on **install** | Another link exists. Use **`agasi sync`** or **`agasi install --force`** to replace wrong symlinks. |
| Destination is a **real directory** | agasi **never** deletes directories. Remove or rename it manually, then run **`install`** again. |
| Cursor does not list skills | Symlink following may be limited in some builds; verify paths and see [Cursor docs](https://www.cursor.com/docs/context/skills). |
| Wrong config file | `agasi config` prints the path; set `AGASI_CONFIG_PATH` or `--config`. |
| Git source / fetch | Not implemented in v0.1 — use a local `path` or wait for phase 2. |

## Verbose debugging

1. `agasi doctor` — sources exist, symlinks readable, `SKILL.md` present under link targets.
2. `agasi config` — confirm merged structure.
3. `ls -la <repo>/.cursor/skills` — expect symlinks to your source skill folders.

## Getting help

- Repo: [zyreth packages/agasi](https://github.com/oleksii-honchar/zyreth/tree/main/packages/agasi)
- Issues: use the **zyreth** repository issue tracker linked from the package `package.json` if configured.
