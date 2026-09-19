# Contributing to Opencode Patch

Thanks for wanting to contribute! This repo is a community resource for
**opencode** users: agents, skills, commands, rules, hooks, and MCP presets
that install into `~/.config/opencode`.

## What We're Looking For

### Agents

New agents that handle specific tasks well:

- Language-specific reviewers (Python, Go, Rust)
- Framework experts (Django, Rails, Laravel, Spring)
- DevOps specialists (Kubernetes, Terraform, CI/CD)
- Domain experts (ML pipelines, data engineering, mobile)

### Skills

Workflow definitions and domain knowledge:

- Language best practices
- Framework patterns
- Testing strategies
- Architecture guides

### Hooks

Useful automations:

- Linting/formatting hooks
- Security checks
- Validation hooks
- Notification hooks

### Commands

Slash commands that invoke useful workflows:

- Deployment commands
- Testing commands
- Code generation commands

## Quick Start

```bash
# 1. Fork and clone
gh repo fork kuldeep7ke/opencodemeva --clone
cd opencodemeva

# 2. Create a branch
git checkout -b feat/my-contribution

# 3. Add your contribution (see sections below)

# 4. Test locally with opencode
opencode
# then invoke your agent / skill / command in a session

# 5. Run the repo checks
npm run catalog:check
npm run command-registry:check
node tests/run-all.js

# 6. Submit PR
git add . && git commit -m "feat: add my-skill" && git push -u origin feat/my-contribution
```

## Contributing Skills

Skills are knowledge modules that opencode loads based on context.

> **Comprehensive Guide:** For detailed guidance on creating effective skills,
> see [Skill Development Guide](docs/SKILL-DEVELOPMENT-GUIDE.md).

Each skill lives in `skills/<skill-name>/SKILL.md` with frontmatter:

```yaml
---
name: my-skill
description: What this skill does and when opencode should use it. Be specific!
---
```

Then: When to Use, How It Works, Examples. Keep skills focused and
self-contained; reference other skills instead of duplicating them.

## Contributing Agents

Agents are specialists in `agents/<agent-name>.md` with frontmatter:

```yaml
---
name: my-reviewer
description: What this agent does and when opencode should invoke it. Be specific!
---
```

Mirror the new agent in `.opencode/opencode.json` under `agent` if it should be
available as an opencode subagent, and add its prompt file under
`.opencode/prompts/agents/` when the agent needs a dedicated prompt.

## Contributing Hooks

Hooks are automatic behaviors triggered by opencode plugin events. The
opencode plugin lives in `.opencode/plugins/`; hook handlers map to opencode
events (`tool.execute.before`, `tool.execute.after`, `file.edited`,
`session.created`, `session.idle`, `session.deleted`, `permission.ask`, …).

- Keep hooks fast and non-blocking; log via the plugin logger.
- Gate new hooks behind the `minimal` / `standard` / `strict` profile system.
- Add tests under `tests/` covering the new behavior.

## Contributing Commands

Commands are slash-command entries. Add the command markdown under
`commands/<command-name>.md` with description frontmatter, mirror it in
`.opencode/opencode.json` under `command` when it should be an opencode
command, and regenerate the registry:

```bash
npm run command-registry:write
npm run catalog:sync
```

Retired short-name shims live in `legacy-command-shims/` — do not add new
commands there.

## MCP Presets

`mcp-configs/mcp-servers.json` holds opt-in MCP server templates. All
`YOUR_*_HERE` values must stay placeholders resolved from env-vars at install
time — never commit real credentials. Document the new preset in the README
MCP section.

## Pull Request Process

1. Keep the diff scoped: one skill, agent, command, or fix per PR.
2. Run the checks: `npm run catalog:check`, `npm run command-registry:check`,
   `node tests/run-all.js`, and `npm run lint` for touched files.
3. Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
   `chore:`.
4. Describe what changed, how you tested it in opencode, and any docs updated.
5. Security-sensitive changes: validate inputs, no hardcoded secrets, and note
   the threat model in the PR body.

## Questions

Open an issue at <https://github.com/kuldeep7ke/opencodemeva/issues> — include
what you tried in opencode, the expected behavior, and the relevant
agent/skill/command name.
