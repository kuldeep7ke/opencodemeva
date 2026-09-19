# opencodemeva

A curated [opencode](https://opencode.ai) option pack plus a small, safe patch
installer for Windows and Ubuntu/Debian.

`opencodemeva` takes a hand-picked set of high-quality opencode options —
agents, commands, skills, plugins, MCP servers, LSP settings — and merges them
into *your* opencode config at `~/.config/opencode/`. It never overwrites your
settings, never touches secrets, and uninstalls back to exactly what you had.

This repository is both the source of truth for the pack (`options/`) and the
installer that ships it (`src/`, `install.ps1`, `install.sh`).

---

## What you get

| Category | Count | Highlights |
| --- | --- | --- |
| **Agents** | 40 | planning, review, security, database, design, language agents (Node, Python, Go, Java, Laravel, Flutter), vibe testing, SEO, multimodal-looker, codebase-memory/scout/auditor |
| **Commands** | 26 | `/code-review`, `/security`, `/design`, `/tdd`, `/plan`, `/go-build`, `/e2e`, `/checkpoint`, `/dev-loop`, ... |
| **Skills** | 80 | framework patterns, design systems, image/video gen, reasoning, deep research, SEO, TDD, debugging, codebase-memory |
| **Plugins** | 10 | console-log-warning, dangerous-command-blocker, env-protection, notification, pr-helper, pre-commit-check, session-summary, tool-guardrails, type-checker, cbm-augment |
| **MCP servers** | 6 | context7, playwright, sequential-thinking (enabled); memory, firecrawl, postgres (disabled until configured) |
| **LSP** | on | `"lsp": true` |
| **Instructions** | 1 | global `AGENTS.md` describing the pack and session rules |

Everything lives in [`options/`](./options/) and is installed verbatim into
`~/.config/opencode/` (agents, commands, skills, plugins, `opencode.json`,
`AGENTS.md`).

### Agents

100% subagent-safe. Curated for daily coding, design, and review work:

- **Planning & orchestration** — `planner`, `architect`, `orchestrator`, `spec-verifier`, `explore`
- **Review & quality** — `code-reviewer`, `reviewer`, `security-reviewer`, `database-reviewer`, `php-reviewer`, `python-reviewer`, `java-reviewer`, `go-reviewer`, `spec-verifier`
- **Fixing & verification** — `fixer`, `build-error-resolver`, `go-build-resolver`, `refactor-cleaner`, `test-engineer`, `tdd-guide`, `vibe-tester`, `docs-lookup`
- **Language specialists** — `node-developer`, `python`, `go-developer`, `java-developer`, `laravel`, `flutter`, `frontend-react`, `frontend-nuxt`, `database`, `devops`, `git-agent`, `fast-coder`
- **Creative** — `designer`, `seo`, `multimodal-looker`, `e2e-runner`

### Commands

```text
/analyze-visual  /build-fix      /checkpoint      /code-review
/debug           /deploy         /design          /dev-loop
/document        /e2e            /go-build        /go-review
/go-test         /orchestrate    /plan            /python-review
/quality-gate    /refactor       /refactor-clean  /review
/security        /security-scan  /status          /tdd
/test-coverage    /verify
```

### Skills

Framework patterns (Node, React, Next.js, Nuxt, Vue, Flutter, Django, Laravel,
FastAPI, Spring Boot, Go, PostgreSQL, MySQL, Redis, Prisma, Docker), design
(design-system, shadcn-ui, ui-styling, ui-ux-pro-max, theme-factory,
banner/canvas design), image & video gen (imagegen-frontend-web/mobile,
algorithmic-art, ui-demo), reasoning (deep-research, council, brainstorming,
plan-orchestrate, recursive-decision-ledger), testing (tdd-workflow, e2e,
vibe-testing, writing-tests), and methodology (systematic-debugging,
verification-before-completion, search-first).

### Plugins

Active TypeScript plugins loaded from `~/.config/opencode/plugins/`:

- `console-log-warning` — flags stray `console.log` in diffs
- `dangerous-command-blocker` — blocks destructive shell commands on autopilot
- `env-protection` — refuses to read/edit `.env`-style secrets
- `notification` — desktop notifications on long-running tasks
- `pr-helper` — PR summary/description helper
- `pre-commit-check` — runs tests/lint gate before commit
- `session-summary` — writes an end-of-session summary
- `tool-guardrails` — permission guardrails around risky tools
- `type-checker` — runs the project type checker after edits
- `cbm-augment` — auto-augments `grep`/`glob` with codebase-memory graph hits

### Permissions

Sensible defaults keep you in control: read/edit allowed, bash commands
`ask` by default (with safe `git`/`ls` presets allowed), web tools on,
external directories allowed except `~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.kube`,
`~/.docker`, and `~/secrets`. All settings are merged under yours and can be
changed freely in your `opencode.json`.

---

## Requirements

- **Node.js >= 18**
- A machine with opencode installed (any platform)
- Windows PowerShell or Ubuntu/Debian Bash (or run the CLI directly anywhere)

## Install

Clone (or copy) this repo, then run one wrapper. All paths below do exactly the
same thing and never touch your existing settings without you seeing them
first.

### Windows (PowerShell)

```powershell
.\install.ps1
```

### Ubuntu / Debian (Bash)

```bash
./install.sh
```

### Anywhere (Node CLI)

```bash
node src/cli.js install
```

During install you get a live preview of every file that will be added, and
you confirm before anything changes. Run `--dry-run` first to see the plan
without touching anything:

```bash
node src/cli.js install --dry-run
```

After installing, **restart opencode** — config is loaded at startup, not
hot-reloaded.

## CLI reference

```
opencodemeva install    [--target <dir>] [--overwrite] [--dry-run]
opencodemeva uninstall  [--target <dir>] [--dry-run]
opencodemeva status     [--target <dir>]
opencodemeva validate
```

| Flag | Meaning |
| --- | --- |
| `--target <dir>` | Install into an explicit config dir instead of `~/.config/opencode` |
| `--overwrite` | Replace existing user agent/command/skill/plugin files |
| `--dry-run` | Show the plan (adds/keeps/overwrites) without making changes |
| `-y`, `--yes` | Skip the interactive confirmation prompt |

## Safety model

The installer's merge policy is one direction only: **your existing config
always wins.**

- `opencode.json` is deep-merged. Bundle keys fill gaps; any key you already
  set (model, providers, LSP, permissions, MCP servers, plugins) is preserved
  exactly as you had it.
- Bundle MCP servers are only added when you don't already define that name;
  same-named servers keep your definition.
- Agent/command/skill/plugin files that already exist are kept. Use
  `--overwrite` to replace them.
- Before merging, your current `opencode.json` is backed up to
  `~/.config/opencode/.opencodemeva-backups/`. `uninstall` restores it.
- A manifest (`opencodemeva.manifest.json`) tracks every installed file so
  `uninstall` removes only what this project added — never your own files.
- The `memory` MCP server ships disabled. If a `codebase-memory-mcp` binary is
  found on the machine at install time, the installer enables it with the
  machine's own path — never a hardcoded one. Your personal `memory` server is
  never touched.

## Uninstall

```bash
node src/cli.js uninstall        # or uninstall --dry-run to preview
```

This removes the files this project installed, restores your pre-install
`opencode.json` from backup, and cleans up empty directories it created. Your
own config and files are left intact.

## Development

```bash
npm install         # no runtime deps; dev only
npm run validate    # static checks on the options/ bundle (frontmatter, refs)
npm test            # end-to-end install/uninstall round-trip tests
node src/cli.js validate   # same checks via the CLI entry point
```

### Repository layout

```text
options/            The curated patch bundle (the product)
  opencode.json     portable bundle config (plugins, MCP, permissions, lsp)
  AGENTS.md         global instructions installed with the pack
  agents/          40 agents         commands/   26 commands
  skills/          80 skills         plugins/    10 TS plugins
src/                Node.js CLI installer
  cli.js           CLI entry (install/uninstall/status/validate)
  installer.js     install/uninstall logic, backup, manifest
  merge.js         deep-merge (user config wins)
  paths.js         platform config-dir + memory-binary resolution
scripts/            validate.mjs (bundle checks), test-cli.mjs (e2e tests)
install.ps1         Windows wrapper            install.sh   Ubuntu/Debian wrapper
```

### Tests

`npm test` (`scripts/test-cli.mjs`) is dependency-free and covers: fresh
install, idempotent reinstall, user-config-wins merge, plugin union,
uninstall restoring user config, and uninstall removing a config created on an
empty install.

---

## Contributing

The bundle must stay **generic and portable**:

- No machine-specific paths in `options/` (see how the `memory` MCP server is
  patched at install time).
- No secrets anywhere.
- Match existing file style; keep changes surgical.

## License

MIT. See [LICENSE](LICENSE).