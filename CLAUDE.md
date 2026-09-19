# CLAUDE.md

This repository is an **opencode** patch. The canonical agent instructions live in
[AGENTS.md](./AGENTS.md) — follow that file when working in this repo.

Quick reference:

- Run all tests: `node tests/run-all.js`
- Run one test file: `node tests/lib/utils.test.js`
- Validate catalogs: `npm run catalog:check && npm run command-registry:check`
- Build the opencode plugin payload: `npm run build:opencode`

Layout: `agents/` subagents · `skills/` workflows · `commands/` slash commands ·
`hooks/` automation · `rules/` opt-in standards · `mcp-configs/` MCP presets ·
`scripts/` Node.js utilities · `tests/` test suite. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for contribution formats.
