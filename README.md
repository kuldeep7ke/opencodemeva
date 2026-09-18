# opencodemeva — All-in-One OpenCode Configuration

**54 agents · 83 commands · 295 skills · 9 plugins · MCP servers · built-in LSP** — a complete, pre-configured setup for [opencode](https://opencode.ai), the open-source AI coding agent.

Searching for "opencode config", "opencode agents", "opencode skills", or an "everything-opencode" collection of agents, commands, and MCP servers? This pack merges six popular open-source repos into a single, validated, ready-to-install configuration. Clone it, copy it into `~/.config/opencode/`, restart opencode, and you instantly get a full team of coding agents, a library of slash commands, hundreds of skill playbooks, and safety plugins.

**What you get:**

- **54 AI agents** (`@code-reviewer`, `@tdd-guide`, `@security-reviewer`, `@planner`, `@leader`, stack specialists, vibe-coding tools, and more) for planning, review, security, TDD, and every major stack — Next.js, React, Nuxt, Django, Laravel, Spring Boot, Flutter, Android, Go, Rust, Python, .NET, Swift, and more
- **83 slash commands** (`/plan`, `/tdd`, `/code-review`, `/security`, `/build-fix`, `/e2e`, ...) for repeatable agent workflows
- **295 skill packages** — patterns, workflows, and audits across every major stack
- **9 plugins** — secret protection, dangerous-command blocking, type checking, session summaries, and more
- **Preconfigured MCP servers** — Context7, Playwright, sequential-thinking, and memory (codebase-memory-mcp: project knowledge graph + persistent decisions)
- **Built-in LSP servers** — editor-grade diagnostics and navigation feedback for the agent across TypeScript, Python, Go, Rust, Java, C/C++, PHP, and more (started on demand)

---

## Table of Contents

- [What's inside](#whats-inside)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Supported apps & integrations](#supported-apps--integrations)
- [OS configuration](#os-configuration)
- [Hardware configuration](#hardware-configuration)
- [Testing & verification](#testing--verification)
- [Troubleshooting](#troubleshooting)
- [Uninstalling](#uninstalling)
- [Rebuilding from source](#rebuilding-from-source)
- [Credits & license](#credits--license)

---

## What's inside

```
opencodemeva/
├── agents/          # 54 subagents (Markdown, opencode agent format)
├── commands/        # 83 slash commands (Markdown)
├── skills/          # 295 skill packages (each a folder with SKILL.md)
├── plugins/         # 9 opencode plugins (TypeScript)
├── scripts/
│   ├── merge.mjs    # rebuild the pack from source repos
│   └── validate.mjs # structural validation of the whole pack
├── opencode.json    # portable config: plugins, permissions, MCP servers
├── AGENTS.md        # global rule book applied to every session
└── package.json     # tool metadata (name: opencodemeva)
```

### Agents (54)

| Group | Agents |
| --- | --- |
| **Core / orchestration** | `@leader`, `@orchestrator`, `@planner`, `@architect`, `@explore`, `@fixer`, `@fast-coder` |
| **Quality** | `@code-reviewer`, `@reviewer`, `@security-reviewer`, `@spec-verifier`, `@vibe-tester`, `@tdd-guide`, `@test-engineer`, `@e2e-runner` |
| **Build & fix** | `@build-error-resolver`, `@go-build-resolver`, `@debugger`, `@refactor-cleaner`, `@refactoring-specialist`, `@docs-fetcher`, `@doc-updater`, `@git-agent` |
| **Stack specialists** | `@android`, `@angular`, `@ci3`, `@cpp`, `@dotnet`, `@flutter`, `@frontend-nuxt`, `@frontend-react`, `@go-developer`, `@java-developer`, `@kotlin-reviewer`, `@laravel`, `@node-developer`, `@python`, `@rust`, `@swift` |
| **Specialists** | `@database`, `@database-reviewer`, `@designer`, `@devops`, `@seo`, `@sonarqube`, `@security-reviewer`, `@multimodal-looker`, `@harness-optimizer`, `@leading` |

All agents are model-agnostic (no hardcoded model — they use your session's default model).

### Commands (83)

Workflow commands including `/plan`, `/tdd`, `/research`, `/code-review`, `/security`, `/build-fix`, `/e2e`, `/verify`, `/checkpoint`, `/remember`, `/recall`, `/dev-loop`, `/design` (per-stack generators), `/go-build`, `/go-test`, `/python-review`, `/go-review`, `/security-scan`, `/status`, plus the merged command sets from all six source repos.

### Skills (295)

Auto-load on demand across: **agent engineering** (agent-architecture-audit, autonomous-loops, eval-harness, gan-style-harness, ...), **workflows** (tdd-workflow, systematic-debugging, writing-plans, writing-tests, ...), **patterns** (backend, frontend, python, golang, rust, kotlin, django, fastapi, nextjs, react, flutter, springboot, laravel, postgres, redis, ...), **design/UX** (frontend-design, ui-ux-pro-max, make-interfaces-feel-better, ...), **content** (article-writing, humanize, stop-slop, ...), and **ops/security** (security-review, production-audit, vibe-app-audit, ...).

### Plugins (9)

`console-log-warning`, `dangerous-command-blocker`, `env-protection`, `notification`, `pr-helper`, `pre-commit-check`, `session-summary`, `tool-guardrails`, `type-checker`.

> Heavy/intrusive plugins (auto-format, test-watcher) and plugins with missing deps were intentionally excluded.

---

## Requirements

### OS

| OS | Supported | Notes |
| --- | --- | --- |
| **Windows** | ✅ Primary target | Paths: `C:\Users\<you>\.config\opencode\` |
| **macOS** | ✅ | Paths: `~/.config/opencode/` |
| **Linux** | ✅ | Paths: `~/.config/opencode/` |

The config content is fully cross-platform (Markdown + JSON + TypeScript plugins). The only OS-specific part is where opencode looks for the files.

### Runtime

| Tool | Version | Why |
| --- | --- | --- |
| **opencode** | any recent (Desktop or CLI) | The tool this pack configures. CLI: `opencode.ai`. Desktop app supported. |
| **Node.js** | ≥ 18 (24 recommended) | Runs the validation/merge scripts and optional `npx`-based MCP servers |
| **git** | ≥ 2.30 | Some plugins and commands (`/commits`, `pr-helper`, pre-commit-check) |
| **npx** | ships with Node | Downloads the default MCP servers on first launch |

Optional per-feature runtimes: any stack tool you actually develop with (python, node, go, rust, docker, flutter SDK, ...) — skills and agent prompts only help if the binary exists on `PATH`.

### Network

- **First launch:** opencode downloads its model provider SDKs; enabled MCP servers are fetched on demand (`context7` is remote; `playwright`, `sequential-thinking` via `npx`; `memory` is a local binary — install it and adjust its path in `opencode.json`). Playwright drives your installed Chrome — no browser download required.
- **Runtime:** model API access required (Anthropic, OpenAI, or any provider configured in opencode).

---

## Installation

### 1. Install opencode (if you haven't)

```bash
# CLI
npm install -g opencode-ai
# or Desktop: download from https://opencode.ai
```

### 2. Install the pack

Clone (or download) this repo, then copy its contents into the **global opencode config directory**:

```bash
git clone https://github.com/your-user/opencodemeva.git opencodemeva
cd opencodemeva

# Windows (PowerShell)
$dest = "$env:USERPROFILE\.config\opencode"
Copy-Item -Recurse -Force agents, commands, plugins, skills $dest
Copy-Item -Force opencode.json, AGENTS.md $dest

# macOS / Linux
cp -r agents commands plugins skills "$HOME/.config/opencode/"
cp opencode.json AGENTS.md "$HOME/.config/opencode/"
```

If you already have an opencode config, **back it up first**:

```bash
cp -r "$HOME/.config/opencode" "$HOME/.config/opencode.bak"
```

### 3. Optional: install plugin type deps

```bash
# in the copied config dir, if you want to develop/typecheck the plugins
# cd ~/.config/opencode
# npm init -y && npm i -D @opencode-ai/plugin
```

Plugins load without this; the dependency only matters if you edit them with strict TypeScript tooling.

### 4. Restart opencode

Config is **not hot-reloaded**. Fully quit and relaunch opencode (Desktop: close the app; CLI: exit the TUI).

---

## Usage

### Delegating to agents

Type `@` and pick an agent, or call one directly:

```
@code-reviewer review the changes in src/ and report issues with severity
@planner design an implementation plan for the checkout feature
@security-reviewer audit the auth endpoints
@tdd-guide get me started with tests for the API service
@leader split the frontend work into parallel tasks and review the result
```

### Running commands

```
/plan     # break a feature into an implementation plan
/tdd      # test-first workflow
/code-review
/security
/build-fix
/e2e
/verify   # run the project's verification loop before claiming done
/remember /recall   # store & recall project knowledge via memory
/status   # visual progress snapshot
```

### Skills

Skills auto-load based on what you're doing — just describe the task. Examples:

- working on a React app → `react-patterns`, `react-testing`, `frontend-a11y` load as needed
- starting a Go service → `golang-patterns`, `golang-testing`
- debugging a failure → `systematic-debugging`
- about to ship → `/code-review` then `/verify`

---

## Configuration

### opencode.json

Ships with safe defaults:

- **Permissions** — `.env*` never read/edited, `~/.ssh/**`, `~/.aws/**` etc. blocked, destructive bash verbs prompt (`ask`/`doom_loop`).
- **Plugins** — enabled by default (the 9 listed above).
- **LSP servers** — enabled (`"lsp": true`); opencode's built-in language servers start on demand when a matching file is opened (TypeScript, Python, Go, Rust, Java, C/C++, PHP, and more). Disable with `"lsp": false`.
- **MCP servers** — a curated catalog of the most-used, open-source, officially recommended servers:
  - ✅ **enabled** (no keys, low context cost):
    - `context7` — up-to-date library/framework docs (remote)
    - `playwright` — official cross-browser automation, headless, uses your installed Chrome (`--browser chrome`, no download)
    - `sequential-thinking` — structured multi-step reasoning
    - `memory` (codebase-memory-mcp) — local project knowledge graph: auto-indexes your code (functions, classes, call chains) and persists cross-session decisions (ADR records). The `/remember` + `/recall` commands route through it. See "[Enabling project memory](#enabling-project-memory)" below.
  - ❌ **configured, disabled by default** — flip `"enabled": true` when needed:
    - `firecrawl` — web scraping (needs `FIRECRAWL_API_KEY`)
    - `postgres` — official Postgres server (needs `DATABASE_URI`)
    - `sentry` — error/issues context (official OAuth remote)

### Enabling project memory (memory)

The pack's single memory server is exposed in config as `memory` (binary: `codebase-memory-mcp`; the generic `server-memory` was removed as redundant). It indexes the repo into a searchable knowledge graph and persists architecture decisions/notes across sessions — the `/remember` and `/recall` commands route through it.

1. Install the `codebase-memory-mcp` binary on your machine (this repo uses a Windows build at `C:\Users\Admin\AppData\Local\Programs\codebase-memory-mcp\`).
2. Adjust the `command` path of the `memory` entry in `opencode.json` to your install location (or remove the entry to rely on a global config).
3. Index your projects with `/index-repository` (or the server's `index_repository` tool), then use `/remember` and `/recall`.

### GitHub (no MCP needed)

GitHub work is covered by the bundled `@github` agent + `github-ops` skill using the installed `gh` CLI — the official `github-mcp-server` previously in this pack was removed because it overlaps `gh`. To add it back if you need a token-based server, see [github/github-mcp-server](https://github.com/github/github-mcp-server).

### Model providers

Agents use **your default opencode model**. To pin a different model globally or per-provider, use opencode's own provider config (`opencode.auth.json` or provider blocks) — nothing in this pack hardcodes models, so anything you configure flows through.

### Project-level rules

`AGENTS.md` is loaded from the opencode config dir (global). Teams can add a project-level `AGENTS.md` or `.opencode/` in a repo; project rules refine (not override) the global ones.

---

## Supported apps & integrations

| Integration | How | Enabled |
| --- | --- | --- |
| **MCP servers** | `opencode.json` → `mcp` | 4 on, 3 off (see [Configuration](#configuration)) |
| **LSP servers** | `opencode.json` → `lsp` | built-ins enabled, on demand |
| **Cloudflare** | bundled skills (`cloudflare`, `wrangler`, `durable-objects`, ...) | on demand |
| **Supabase** | add your project MCP (`https://mcp.supabase.com/mcp?project_ref=<ref>`) | add manually |
| **GitHub** | `@github` agent + `github-ops` skill + `gh` CLI | on demand |
| **Browser automation** | `playwright` MCP + `e2e-testing` skill | enabled |
| **Google Workspace** | `google-workspace-ops` skill | on demand |
| **Docker / K8s** | `docker-patterns`, `kubernetes-patterns` skills | on demand |

---

## OS configuration

Where the pack reads/writes on each platform:

| Purpose | Windows | macOS / Linux |
| --- | --- | --- |
| Global config root | `C:\Users\<you>\.config\opencode\` | `~/.config/opencode/` |
| Agents | `<root>\agents\` | `<root>/agents/` |
| Commands | `<root>\commands\` | `<root>/commands/` |
| Skills | `<root>\skills\` | `<root>/skills/` |
| Plugins | `<root>\plugins\` + `opencode.json` `plugin` array | same |
| Global rules | `<root>\AGENTS.md` (referenced from `opencode.json`) | same |

**Windows-specific notes**

- PowerShell 5.1 is the default shell used by opencode on Windows. The plugin permissions (`bash` rules) cover `git`, `ls`, `pwd`, `whoami`, `echo` as allow-on-sight; everything else asks.
- Enable **long paths** if you ever touch huge nested trees:
  `git config --system core.longpaths true` (admin).
- If `opencode` is not on `PATH`, restart the terminal after `npm i -g opencode-ai`, or add the npm bin dir.

**macOS / Linux notes**

- `~/.config` is XDG; some shells hide dotfiles — the dir is still there.
- `chmod +x` any scripts you add under `scripts/` if you run them directly.

---

## Hardware configuration

| Resource | Minimum | Comfortable |
| --- | --- | --- |
| **CPU** | any 64-bit (1+ core) | 4+ cores |
| **RAM** | 4 GB | 8+ GB (300 skills load lazily; only used skills consume anything) |
| **Disk** | ~50 MB for the pack | 1 GB free (model caches, MCP packages via npx) |
| **GPU** | none required | none required — all model inference is API-side |

There is **no local model inference**. All compute happens at the model provider; the pack is only files. Skill packages are lazy-loaded — only descriptions are read at startup, full files only when triggered — so idle memory/CPU impact is near zero.

---

## Testing & verification

### Structural validation

```bash
node scripts/validate.mjs .          # from the repo root
npm run validate
```

Checks, across `agents/`, `commands/`, `skills/`:

- every agent: valid frontmatter + `name` + `description`, sane filename, no corrupt bytes
- every command: valid frontmatter + `description`, no empty bodies, `agent:` references that actually exist
- every skill: folder has `SKILL.md` with `name` + `description`
- whole pack: no duplicated component names, no replacement characters

Exit code `0` + `problems: 0` = good.

### Runtime smoke test

1. Start opencode (Desktop or CLI).
2. Type `/` — you should see the 83 commands.
3. Type `@` — you should see the 54 agents.
4. Ask one tiny thing, e.g. `@fast-coder tell me in one line if the repo has a README` — the agent should spawn and answer.
5. Trigger `/verify` on any small task — it should run your project's verification loop.

### CI note

Validation is plain Node — drop `npm run validate` into a GitHub Action if you want a gate.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| New agents/commands/skills don't show up | Restart opencode; global config is cached at launch. |
| A plugin errors at startup | Comment it out in `opencode.json` `plugin` array, restart. |
| Skill doesn't trigger | Rephrase toward its description; or invoke `/verify` and read the error. |
| `npx` MCP server slow first run | Expected — it downloads once. Let it finish. |
| Command says "agent not found" | That command references a custom agent name; check it exists in `agents/` (or `rm` the command file). |
| Secret protection too tight | Don't relax `.env` rules — instead put secrets in env vars / `opencode.auth.json`. |
| Windows: `opencode` not recognized | Reopen terminal or add npm bin dir to `PATH`; use the Desktop app. |

---

## Uninstalling

```bash
# remove the pack's directories from the global config
rm -rf ~/.config/opencode/{agents,commands,skills,plugins}
# restore your previous config backup (if you made one)
cp -r ~/.config/opencode.bak/* ~/.config/opencode/
```

---

## Rebuilding from source

The pack is **generated**, so you can re-merge any time a source repo updates:

```bash
# 1. clone the six source repos next to scripts/
mkdir sources
git clone <repo1> sources/repo-defuj
git clone <repo2> sources/repo-noahain
# ... (see scripts/merge.mjs REPOS list for expected folder names)

# 2. rerun the merge -> regenerates ./agents ./commands ./skills ./plugins
node scripts/merge.mjs          # or: npm run merge
node scripts/validate.mjs .     # confirm it's clean
```

Merge rules (baked into `scripts/merge.mjs`):

- **Dedup priority:** defuj > noahain > jakezp > karma > speedoa > kevinlupera (first repo wins).
- **Normalization:** agent refs in commands are de-quoted/un-namespaced; `EO-` prefixes stripped; skill names forced to `kebab-case`; `tools:` converted to `permission`; per-agent `model:` removed so all agents use the session default.
- **Selective plugin inclusion:** only self-contained plugins known to work are shipped.

---

## FAQ

**People also search for:** opencode config · opencode agents · opencode commands · opencode skills · opencode plugins · opencode MCP setup · everything-opencode · everything-claude-code · claude code configuration collection · AI coding agent setup · programming agents for opencode.

| Question | Answer |
| --- | --- |
| **What is this?** | An all-in-one configuration pack for OpenCode — the open-source, terminal-based AI coding agent. It adds 54 specialized subagents, 83 slash commands, 295 skills, 9 plugins, and preconfigured MCP servers to a stock opencode install. |
| **How do I install opencode agents, commands, and skills?** | Copy the pack into `~/.config/opencode/` (plus `opencode.json`) and restart opencode. OpenCode auto-detects it. See [Installation](#installation). |
| **Does this work with Claude Code?** | Skills use the portable SKILL.md format shared with Claude Code and other AI coding CLIs, but the pack is *packaged for opencode*. Use it to bootstrap or extend an opencode setup. |
| **Which stacks are covered?** | Next.js, React, Nuxt, Vue, Node.js, Django, FastAPI, Laravel, CodeIgniter, Spring Boot, Rust, Go, Python, C#, Flutter, Android/Kotlin, Swift, C++, Angular — plus review, security, TDD, E2E, refactoring, SEO, and database specialists. |
| **What MCP servers are included?** | Enabled by default: Context7 (live docs), Playwright (installed Chrome), sequential-thinking, memory (codebase-memory-mcp: project knowledge graph + persistent decisions). Opt-in: Firecrawl, Postgres, Sentry. See [Configuration](#configuration). |
| **How big is the pack?** | 54 agents, 83 commands, 295 skills, 9 plugins — every component validated with `npm run validate`. |

---

## Credits & license

Built by merging these open-source projects (dedup priority order):

1. [defuj/opencode-agent-kit](https://github.com/defuj/opencode-agent-kit)
2. [Noahain-s-Opencode-Setup](https://github.com/Noahain-s-Opencode-Setup)
3. [jakezp/everything-opencode](https://github.com/jakezp/everything-opencode)
4. [karma-works/everything-opencode](https://github.com/karma-works/everything-opencode)
5. [SPeeDoA1/everything-opencode](https://github.com/SPeeDoA1/everything-opencode)
6. [kevinlupera/everything-opencode](https://github.com/kevinlupera/everything-opencode)

Individual agents/commands/skills/plugins keep their original intent and are attributed via their source repos. This pack is MIT licensed — use it as-is or fork it into your own "everything" config.

---

*opencodemeva — one config to vibe-code them all.*