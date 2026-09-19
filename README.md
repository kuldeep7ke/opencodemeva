<p align="center">
  <img src="assets/opencode-icon.svg" alt="Opencode Patch - Offline patch for opencode CLI" width="128" />
</p>

<p align="center">
  <strong>Language:</strong>
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/kuldeep7ke/opencodemeva"><img src="https://img.shields.io/github/stars/kuldeep7ke/opencodemeva?style=flat&logo=github" alt="Stars" /></a>
  <a href="https://github.com/kuldeep7ke/opencodemeva/network/members"><img src="https://img.shields.io/github/forks/kuldeep7ke/opencodemeva?style=flat&logo=github" alt="Forks" /></a>
  <a href="https://github.com/kuldeep7ke/opencodemeva/graphs/contributors"><img src="https://img.shields.io/github/contributors/kuldeep7ke/opencodemeva?style=flat&logo=github" alt="Contributors" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white" alt="Markdown" />
</p>

# Opencode Patch

Current release: **2.2.1** ([changelog](CHANGELOG.md), [releases](https://github.com/kuldeep7ke/opencodemeva/releases)).

Your opencode terminal gains a **whole team** — 68 specialized agents, 292 skills, 94 commands, 122 rules, 24 guardrail hooks, and 31 MCP presets — all offline, all in `~/.config/opencode`.

```text
install → delegate → review → verify → done
```

No accounts. No cloud. No lock-in. Everything stays on your machine.

Access to 68 agents, 292 skills, and 94 commands, plus hooks, rules, memory, and MCP presets.

| Included | Count | What it gives you |
|----------|-------|-------------------|
| Agents | 68 agents | Planning, review, build repair, security, architecture, and domain work |
| Skills | 292 skills | TDD, research, security, docs, frontend, data, ML, operations, and more |
| Commands | 94 commands | Convenient entry points for every workflow |
| Rules | 122 | Per-stack coding standards (TypeScript, Python, Go, Rust, etc.) |
| Hooks | 24 | Guardrails: safety, validation, context management |
| MCP Presets | 31 | Ready-made server configs (Supabase, Context7, Playwright, etc.) |

## Install

### Windows (10/11)

Download the latest `.exe` from [GitHub Releases](https://github.com/kuldeep7ke/opencodemeva/releases/latest) and run it. One click applies the patch to your opencode config.

### Ubuntu / Debian

```bash
sudo apt install ./opencodemeva-patch.deb
opencodemeva-patch
```

### Build from Source (Any OS)

```bash
git clone https://github.com/kuldeep7ke/opencodemeva
cd opencodemeva
npm install
npm run build:opencode
npx opencode-patch install
```

## Quick Start

```bash
# After installing, just run opencode
opencode

# Delegate to specialized agents
@planner "Add user authentication with OAuth"
@code-reviewer
@security-reviewer

# Load skills on demand
skill tdd-workflow
skill security-review

# Run slash commands
/plan "Add auth"
/code-review
/security-scan
```

## What's Inside

```text
opencodemeva/
|-- agents/           # 68 specialized subagents for delegation
|-- skills/           # 292 reusable workflows loaded on demand
|-- commands/         # 94 maintained slash-command shims
|-- rules/            # opt-in common and language standards
|-- hooks/            # runtime automation and enforcement
|-- scripts/          # install, repair, sync, orchestration, and checks
|-- .opencode/        # opencode plugin, commands, and instructions
|-- mcp-configs/      # 31 ready-made MCP server configurations
|-- docs/             # public setup, architecture, and operating guides
```

## Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design and scalability | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code quality and maintainability | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code |
| build-error-resolver | Fix build/type errors | When build fails |
| e2e-runner | End-to-end Playwright testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation and codemaps | Updating docs |
| ...and 58 more | | |

All agents are in `agents/` and auto-discovered by opencode.

## Skills (292)

Skills are the primary workflow surface — battle-tested playbooks for:

- **TDD & Testing** — `tdd-workflow`, `golang-testing`, `python-testing`, `rust-testing`
- **Security** — `security-review`, `security-scan`, `django-security`, `laravel-security`
- **Database** — `postgres-patterns`, `database-migrations`, `prisma-patterns`
- **Frontend** — `frontend-patterns`, `react-patterns`, `nextjs-patterns`, `frontend-design`
- **Languages** — `golang-patterns`, `python-patterns`, `rust-patterns`, `kotlin-patterns`, `java-coding-standards`
- **Architecture** — `backend-patterns`, `api-design`, `deployment-patterns`, `docker-patterns`
- **ML/Data** — `mle-workflow`, `pytorch-patterns`, `recsys-pipeline-architect`, `clickhouse-io`
- **And 270+ more** — search with `skill-scout`

## Rules (122)

Per-stack coding standards. Start with `rules/common` plus one language pack:

```text
rules/
├── common/
├── typescript/
├── python/
├── go/
├── rust/
├── java/
├── kotlin/
├── cpp/
└── ...
```

## Hooks (24)

Guardrail hooks for safety and validation:

- Pre-tool validation
- Post-tool enforcement
- Context budget monitoring
- Session summarization
- Continuous learning extraction

## MCP Presets (31)

Ready-made MCP server configs in `mcp-configs/`:

- `context7` — Up-to-date library docs
- `playwright` — Browser automation
- `supabase` — Database access
- `github` — Repository operations
- `filesystem` — Local file access
- And 26 more...

## Advanced Options

### Choose Components Only

```bash
# Install specific skills
npx opencode-patch install --skills tdd-workflow,security-review

# Install specific agents
npx opencode-patch install --agents planner,code-reviewer

# Minimal profile (no hooks)
npx opencode-patch install --profile minimal
```

### Project-Local Rules

```bash
cd your-project
mkdir -p .opencode/rules
cp -R /path/to/opencodemeva/rules/common .opencode/rules/
cp -R /path/to/opencodemeva/rules/typescript .opencode/rules/
```

### Hooks

Do not copy the raw repo `hooks/hooks.json` into your opencode config. That file is repo-oriented; use the installer so hook command paths are resolved correctly:

```bash
npx opencode-patch install
```

### Self-Hosted Models

Opencode Patch works with any model provider. Configure your gateway in opencode:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
opencode
```

## Memory & MCP Server

Keep durable context across sessions with the memory vault:

```bash
opencode-patch memory init
opencode-patch memory save --stdin < note.md
opencode-patch memory search "auth decision"
```

Expose the vault to MCP clients through the optional local stdio server:

```bash
npm install -g opencode-patch
opencode-patch-memory-mcp
```

## Uninstall

```bash
npx opencode-patch uninstall --dry-run
npx opencode-patch uninstall
```

Restores your original opencode config.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

## Links

- **GitHub:** https://github.com/kuldeep7ke/opencodemeva
- **Issues:** https://github.com/kuldeep7ke/opencodemeva/issues
- **Releases:** https://github.com/kuldeep7ke/opencodemeva/releases
