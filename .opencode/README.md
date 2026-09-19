# Opencode Patch Plugin for opencode

Opencode Patch plugin for opencode — agents, commands, hooks, and skills. If
you installed via npm (e.g. `npm install opencode-patch`), the
`opencode-patch` CLI sets up rules and agents for you; refer to the root
[README](../README.md) for the full guide.

## Installation Overview

There are two ways to use Opencode Patch:

1. **npm package (recommended for most users)**
   Install via npm and use the `opencode-patch` CLI to set up rules and agents.

2. **Direct clone / plugin mode**
   Clone the repository and run opencode directly inside it.

Choose the method that matches your workflow below.

### Option 1: npm Package

```bash
npm install opencode-patch
```

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-patch"]
}
```

This loads the Opencode Patch opencode plugin module from npm:

- hook/event integrations
- bundled custom tools exported by the plugin

It does **not** auto-register the full command/agent/instruction catalog in
your project config. For the full setup, either:

- run opencode inside this repository, or
- copy the relevant `.opencode/commands/`, `.opencode/prompts/`,
  `.opencode/instructions/`, and the `instructions`, `agent`, and `command`
  config entries into your own project

After installation, the `opencode-patch` CLI is also available:

```bash
npx opencode-patch install
```

### Option 2: Direct Use

Clone and run opencode in the repository:

```bash
git clone https://github.com/kuldeep7ke/opencodemeva
cd opencodemeva
opencode
```

If you also want to apply the Opencode Patch home install
(`node scripts/install-apply.js --target opencode --profile full`), build the
plugin first so the compiled payload at `.opencode/dist/` exists:

```bash
node scripts/build-opencode.js   # or: npm run build:opencode
node scripts/install-apply.js --target opencode --profile full
```

Without `.opencode/dist/index.js`, opencode will detect the slash commands
but silently skip plugin hooks and tools. The installer fails fast with a
pointer to this command if the build step is missing.

## Features

### Agents (26)

| Agent | Description |
|-------|-------------|
| build | Primary coding agent for development work |
| planner | Implementation planning |
| architect | System design |
| code-reviewer | Code review |
| security-reviewer | Security analysis |
| tdd-guide | Test-driven development |
| build-error-resolver | Build error fixes |
| e2e-runner | E2E testing |
| doc-updater | Documentation |
| refactor-cleaner | Dead code cleanup |
| go-reviewer | Go code review |
| go-build-resolver | Go build errors |
| database-reviewer | Database optimization |
| docs-lookup | Documentation lookup via Context7 |
| harness-optimizer | Harness config tuning |
| java-reviewer | Java code review |
| java-build-resolver | Java build errors |
| kotlin-reviewer | Kotlin code review |
| kotlin-build-resolver | Kotlin build errors |
| loop-operator | Autonomous loop execution |
| php-reviewer | PHP code review |
| python-reviewer | Python code review |
| rust-reviewer | Rust code review |
| rust-build-resolver | Rust build errors |
| cpp-reviewer | C++ code review |
| cpp-build-resolver | C++ build errors |

### Commands (26)

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/tdd` | TDD workflow |
| `/code-review` | Review code changes |
| `/security` | Security review |
| `/build-fix` | Fix build errors |
| `/e2e` | E2E tests |
| `/refactor-clean` | Remove dead code |
| `/orchestrate` | Multi-agent workflow |
| `/learn` | Extract patterns |
| `/checkpoint` | Save progress |
| `/verify` | Verification loop |
| `/eval` | Evaluation |
| `/update-docs` | Update docs |
| `/update-codemaps` | Update codemaps |
| `/test-coverage` | Coverage analysis |
| `/setup-pm` | Package manager |
| `/go-review` | Go code review |
| `/go-test` | Go TDD |
| `/go-build` | Go build fix |
| `/skill-create` | Generate skills |
| `/instinct-status` | View instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |
| `/evolve` | Cluster instincts |
| `/promote` | Promote project instincts |
| `/projects` | List known projects |

### Plugin Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| Prettier | `file.edited` | Auto-format JS/TS |
| TypeScript | `tool.execute.after` | Check for type errors |
| console.log | `file.edited` | Warn about debug statements |
| Notification | `session.idle` | Desktop notification (cross-platform) |
| Security | `tool.execute.before` | Check for secrets |
| Git Push Reminder | `tool.execute.before` | Remind to review before pushing |
| Doc File Warning | `tool.execute.before` | Warn about unnecessary documentation |
| Long Command Reminder | `tool.execute.before` | Remind about long-running commands |
| Session Context | `session.created` | Load project context |
| Console Log Audit | `session.idle` | Audit edited files for console.log |
| File Watcher | `file.watcher.updated` | Track file system changes |
| Todo Progress | `todo.updated` | Log task completion progress |
| Shell Environment | `shell.env` | Inject environment variables |
| Session Compacting | `experimental.session.compacting` | Preserve context across compaction |
| Permission Auto-Approve | `permission.ask` | Auto-approve safe operations |

### Custom Tools

| Tool | Description |
|------|-------------|
| run-tests | Run test suite with options |
| check-coverage | Analyze test coverage |
| security-audit | Security vulnerability scan |
| format-code | Detect formatter and return command |
| lint-check | Detect linter and return command |
| git-summary | Generate git summary with branch, status, and diff |
| changed-files | List files changed in session as a navigable tree |
| dependency-analyzer | Analyze dependencies for outdated, vulnerable, and unused packages |

## Hook Events

Opencode plugin hooks listen to opencode's native events:

| Event | When it fires |
|-------|---------------|
| `tool.execute.before` | Before a tool runs |
| `tool.execute.after` | After a tool runs |
| `file.edited` | After a file is edited |
| `session.created` | When a session starts |
| `session.idle` | When a session goes idle |
| `session.deleted` | When a session ends |

opencode exposes 20+ events; this plugin subscribes to the session, tool,
file, todo, shell, compaction, and permission events listed above.

### Hook Runtime Controls

```bash
export OPENCODE_PATCH_HOOK_PROFILE=standard
export OPENCODE_PATCH_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

- `OPENCODE_PATCH_HOOK_PROFILE`: `minimal`, `standard` (default), `strict`
- `OPENCODE_PATCH_DISABLED_HOOKS`: comma-separated hook IDs to disable

## Skills

The default opencode config loads 11 curated skills via the `instructions`
array:

- coding-standards
- backend-patterns
- frontend-patterns
- frontend-slides
- security-review
- tdd-workflow
- strategic-compact
- eval-harness
- verification-loop
- api-design
- e2e-testing

Additional specialized skills are shipped in `skills/` but not loaded by
default to keep opencode sessions lean:

- article-writing
- content-engine
- market-research
- investor-materials
- investor-outreach

## Configuration

Full configuration in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./plugins"],
  "instructions": [
    "skills/tdd-workflow/SKILL.md",
    "skills/security-review/SKILL.md"
  ],
  "agent": { "...": "see opencode.json for the 26 subagents" },
  "command": { "...": "see opencode.json for the 26 commands" }
}
```

The reference config intentionally leaves model selection to opencode. Connect
a provider and select a model in opencode; the primary agent uses that global
selection, and subagents inherit the invoking primary agent's model.

## License

MIT
