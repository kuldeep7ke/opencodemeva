# opencodemeva — development notes

Guiding rules for contributing to this repository. These apply to any opencode
session working on opencodemeva itself.

## 1. Security (non-negotiable)

- Never commit, print, or log secrets: API keys, tokens, passwords, `.env`
  contents. Use environment variables or `.env`, and keep `.env*` out of git
  (`.gitignore` already excludes them).
- Never commit machine-specific paths into `options/`. The bundle config must
  stay portable (e.g. the `memory` MCP server is a placeholder that the
  installer patches at install time).
- Do not read or modify `.env` unless the task explicitly asks.

## 2. Behavior

- Ask before running destructive/irreversible commands.
- Verify before claiming: back claims about tests/lint/build with fresh
  command output. `npm run validate` and `npm test` must both pass before
  finishing a change.
- Keep changes surgical: touch only what the task requires, match the file's
  existing style, clean up only your own mess.
- Do not add emojis to files or comments unless asked.

## 3. Architecture

- `options/` — the curated patch bundle. This is what gets installed into a
  user's `~/.config/opencode/`. Contents must stay generic and portable.
- `src/` — the Node.js CLI installer (`cli.js`, `installer.js`, `paths.js`,
  `merge.js`).
- `scripts/` — `validate.mjs` (frontmatter/config checks on `options/`) and
  `test-cli.mjs` (end-to-end install/uninstall round-trip).
- `install.ps1` (Windows) and `install.sh` (Ubuntu/Debian) are thin wrappers
  around `node src/cli.js install`.
- The installer's merge policy: **the user's existing config always wins** on
  conflicts; the bundle only fills in missing options. Never change this in a
  way that could overwrite user settings.

## 4. Workflow

- Prefer small, verifiable steps. Run `node src/cli.js validate`, then a
  `--dry-run` install into a temp `--target`, before any real install.
- After implementation, run `npm run validate` and `npm test`.
- Read `options/opencode.json` before touching the bundle: plugins, MCP
  servers, and permissions listed there must match files in `options/`.

## 5. Testing

- Use `npm test` (script-based, no external test framework). Add coverage for
  any new installer behavior, especially merge and uninstall paths.