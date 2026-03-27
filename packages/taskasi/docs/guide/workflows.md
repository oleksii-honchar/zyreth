# Workflows

## Typical task branch

1. `cd` into your project (any subfolder of the repo).
2. Run:

   ```bash
   taskasi switch 1597
   ```

3. Open the generated **`{reponame}-1597.workspace`** in VS Code or Cursor (or the path you set in `workspace.output`).
4. Work in the worktree under `.worktrees/...`, push the branch, open a PR.

## Same branch, new worktree path

If the branch **`NWDEXP-1597`** already exists, taskasi **attaches** a new worktree at the configured path instead of creating the branch with `-b`.

## Monorepo

Git root is always the **repository root**, even if you run `taskasi` from `apps/foo`. Worktree paths and env mirroring are relative to that root.

## CI / headless

taskasi is interactive only via the shell; it does not start editors. Use it in scripts as long as **`git`** is available and the working tree is writable.

## Global config across repos

`~/.taskasi/config.yaml` is shared. Use **`branchPrefix`** and templates per your org; override **`workspace.output`** if some repos need different naming.
