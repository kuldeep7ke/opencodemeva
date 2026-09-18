# Global instructions for every opencode session

These rules apply in all projects. Project-level `AGENTS.md` may refine but not weaken them.

## 1. Security (non-negotiable)

- Never commit, print, or log secrets: API keys, tokens, passwords, `.env` contents.
- Never write secrets into source files or config files that get committed. Use environment variables or `.env`, keep `.env*` out of git (`.gitignore`).
- Never exfiltrate or echo real credentials, even in comments or mock data, unless the task explicitly requires a placeholder.
- Flag hardcoded credentials, SQL injection, XSS, path traversal, and insecure dependencies when reviewing code.
- Do not read or modify `.env` unless the task explicitly asks.

## 2. Behavior

- Ask before running destructive/irreversible commands (force push, delete branches, `rm -rf`, migrate production).
- Verify before claiming: back claims about tests/lint/build with fresh command output from this session. "It should pass" is not evidence.
- Simplify before extending: prefer minimal, idiomatic changes over new abstractions, unless the change is part of a broader request.
- Keep changes surgical: touch only what the task requires, match the file's existing style, and clean up only your own mess.
- Do not add emojis to code or files unless requested.
- Do not add code comments unless asked or the comment explains non-obvious intent.
- Do not auto-document files (READMEs, docs) unless asked.
- Never commit unless the user explicitly asks.

## 3. Workflow (vibe-friendly)

- For planning work, use `/plan` or the `@planner`/`@architect` subagents.
- For test-driven work, use `/tdd`.
- Delegate specialized work to subagents via `@name` (e.g. `@code-reviewer`, `@security-reviewer`, `@database`, `@designer`). Give each subagent one clear task and the exact context it needs.
- After implementation, run `/code-review` (or `@code-reviewer`); before shipping security-sensitive changes, run `/security`.
- For iteration, prefer small verifiable steps over one giant change.
- When the work is well-defined and small, just do it (`@fixer`, `@fast-coder` are optimized for that).
- Use MCP tools over guessing APIs: check `context7`/`grep` before assuming library signatures; only enable key/network-heavy servers (`github`, `firecrawl`, `playwright`) when the task actually needs them.

## 4. Coding style

- Prefer immutability (spread/`const`), small focused files/functions, and clear names over clever code.
- Match existing project conventions and the stack in use (there are stack skills: `frontend-patterns`, `backend-patterns`, `golang-patterns`, `python-patterns`, etc.).
- Prefer extending existing patterns over introducing parallel ones.

## 5. Testing

- Write tests for behavior that is hard or risky to change without them.
- Follow TDD where the project uses it (`/tdd`).
- Aim for meaningful coverage of new logic, not a fixed number.

## 6. Git

- Keep commits small and scoped; use conventional messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Do not commit secrets, build output, or dependency artifacts.