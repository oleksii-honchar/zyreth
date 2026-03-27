# Troubleshooting

## `fatal: not a git repository`

Run **`taskasi`** from inside a directory that belongs to a Git working tree (any subfolder of the repo is fine). The tool uses **`git rev-parse --show-toplevel`**.

## Worktree path already exists

Remove the old worktree directory or use a different **`worktreeFolderTemplate`** / task id. Git may also refuse if the path is on disk — remove or pick a new folder name via config.

## No env files copied

- Run **`taskasi config`** and confirm **`env.enabled`** is true.
- If you use **`env.source`**, the file must exist at the resolved path.
- For discovery mode, ensure files match [env rules](/guide/env-files) and are not under [skipped directories](/reference/config-keys#env-skipdirs).

## Workspace template not found

Set **`workspace.source`** explicitly to the template file path, or add **`{reponame}.workspace`** / **`.code-workspace`** in the repo or parent directory per [discovery](/guide/workspaces#template-discovery).

## Search in the docs site does nothing

Search is generated at **build time** for static hosting. Run **`npm run docs:build`** and serve the **`docs/.vitepress/dist`** folder; the dev server **`npm run docs:dev`** includes search in development.

## Publish / scope errors

See **[PUBLISHING.md](https://github.com/oleksii-honchar/zyreth/blob/main/packages/taskasi/PUBLISHING.md)** in the repository for `npm login`, `@zyreth` scope, and OTP.
