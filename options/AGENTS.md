# opencodemeva global instructions

These instructions apply to every opencode session after the opencodemeva
patch is installed.

## 1. Security (non-negotiable)

- Never print, log, or commit secrets: API keys, tokens, passwords, `.env`
  contents. Use environment variables; keep `.env*` out of git.
- Flag hardcoded credentials, injection, XSS, path traversal, and insecure
  dependencies when reviewing code.
- Never read or modify `.env` files unless the task explicitly asks.

## 2. Behavior

- Ask before running destructive/irreversible commands (force push, delete
  branches, `rm -rf`, production migrations).
- Verify before claiming: back claims about tests/lint/build with fresh
  command output from this session.
- Keep changes surgical: touch only what the task requires, match existing
  style, clean up only your own mess.
- Do not add emojis or gratuitous comments to code unless asked.

## 3. Workflow

- Prefer `/plan` or the `@planner` and `@architect` agents for planning work.
- Use `/tdd` for test-driven work.
- Delegate specialized work via subagents (`@code-reviewer`,
  `@security-reviewer`, `@database`, `@designer`). Give each subagent one
  clear task and the exact context it needs.
- After implementation, run `/code-review`; before shipping
  security-sensitive changes, run `/security`.
- Prefer small verifiable steps over one giant change.

## 4. Available options in this patch

This patch adds curated opencode options grouped as:

- **Coding** — daily code agents, commands, and language skills
  (Node, Python, Go, React, Next.js, Vue/Nuxt, Flutter, Java, Laravel,
  PostgreSQL, Docker).
- **Vibe coding** — `@vibe-tester`, `/checkpoint`, `/dev-loop`,
  `vibe-app-audit`, `vibe-testing`, `visual-dev-loop`.
- **Design** — `@designer`, `/design`, `design`, `design-system`,
  `ui-styling`, `frontend-design`, `shadcn-ui`, `theme-factory`.
- **Image generation** — `imagegen-frontend-web`, `imagegen-frontend-mobile`,
  `banner-design`, `canvas-design`, `algorithmic-art`.
- **Video generation** — `ui-demo` (record UI demo videos), `notebooklm`.
- **Reasoning** — `sequential-thinking` MCP, `brainstorming`, `council`,
  `deep-research`, `recursive-decision-ledger`, `plan-orchestrate`.
- **SEO** — `@seo` agent, `seo` skill.
- **MCP** — `context7`, `playwright`, `sequential-thinking`, plus optional
  `memory`, `firecrawl`, `postgres` (disabled by default; enable in
  `opencode.json` and provide required env vars — the installer auto-enables
  `memory` when it finds the codebase-memory-mcp binary). Codebase-memory agents and
  the `codebase-memory` skill use the `memory` MCP server when enabled.
- **LSP** — `lsp: true` plus the `lsp-validation` skill.
- **Plugins** — console-log-warning, dangerous-command-blocker, env-protection,
  notification, pr-helper, pre-commit-check, session-summary, tool-guardrails,
  type-checker, cbm-augment (auto-augments `grep`/`glob` with codebase-memory
  graph hits).

## 5. MCP usage

- Prefer MCP tools over guessing APIs: check `context7` before assuming
  library signatures.
- Enable network-heavy servers (`firecrawl`, `playwright`) only when the task
  actually needs them.

## 6. Restart requirement

Config is loaded once at startup and is not hot-reloaded. After any change to
`opencode.json`, agents, commands, skills, or plugins, quit and restart
opencode.