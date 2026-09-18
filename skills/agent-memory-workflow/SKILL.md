---
name: agent-memory-workflow
description: 'Consistent cross-session memory protocol: mandatory recall at session start, structured save at session end, memory categories, auto-save triggers, and memory audit procedures. Memory layer: codebase-memory-mcp.'
---

# Agent Memory Workflow

Protocols for persistent cross-session memory using the **codebase-memory-mcp** knowledge graph as the memory layer. This skill turns the graph + ADR records from an optional tool into a disciplined, reliable memory system.

## Core Principle

Treat codebase-memory-mcp as the agent's **external hippocampus** — it stores what the agent should know across sessions (structure, decisions, conventions), not what it can re-derive from the codebase. The goal is continuity: the user should never have to repeat preferences, past decisions, or discovered conventions.

## Memory Categories

Every durable decision gets recorded. Category conventions:

| Category | Where it lives |
|----------|---------------|
| User Preferences | `docs/knowledge.md` or `.opencode/memory/preferences.md` |
| Architecture | ADR via `manage_adr` (mode: update) |
| Project Convention | ADR via `manage_adr` or `docs/knowledge.md` |
| Bug / Lesson | `.opencode/memory/lessons.md` (linked into ADR) |
| Session Log | `.opencode/memory/session-<date>.md` (volatile, overwritten) |
| Code structure | the graph itself — re-derive with search_graph / trace_path |

### Example saves

```text
# architecture → as an ADR section
manage_adr(mode: update, content: "Chose Zod over Yup because Zod has better
  TypeScript inference and edge runtime support (src/lib/validation.ts).")

# convention → as an ADR section
manage_adr(mode: update, content: "All API service files go under
  src/services/ with singular names (auth.service.ts, market.service.ts).")

# lesson / preference → file-backed notes
Write .opencode/memory/lessons.md — "Nuxt 4 auto-imports: components/ are
  auto-imported but NOT recursively; nested dirs need manual export."

# session log — always overwrite the same file
Write .opencode/memory/session-<date>.md — what was done, files touched, next steps.
```

## Session Start Ritual (MANDATORY)

Every new session (or after `/reset`) MUST execute this sequence before productive work:

```markdown
## Memory Recall Protocol
1. list_projects — is the current repo indexed?
2. get_architecture — module structure, entry points, hot spots.
3. search_graph(query: "<project keywords>") — find the code areas from last session.
4. manage_adr(mode: sections) — restore architecture decisions.
5. git log --oneline -5 && git status — what the last session changed.
6. Read .opencode/memory/ if present — preferences, lessons, last session log.
```

### Synthesise Findings

After recall, produce a one-paragraph context summary:

```
Previous context: 3 sessions found. User prefers minimal output.
Architecture: Zod validation, JWT auth with jose library.
Conventions: services under src/services/, singular names.
Last session: MarketCard component created, auth refactor pending.
```

If no context found, report: "No prior memory found — starting fresh."

## Session End Ritual (MANDATORY)

Before the session ends (user says "done", "bye", or after completing a significant task), execute:

```markdown
## Memory Save Protocol
1. Write session log (.opencode/memory/session-<date>.md) — what was done, next steps
2. Save new user preferences discovered (docs/knowledge.md)
3. Save new conventions observed (manage_adr / docs/knowledge.md)
4. Save lessons/bugs encountered (.opencode/memory/lessons.md)
5. Save architecture decisions made (manage_adr mode: update)
```

Use `search_graph` / read `docs/knowledge.md` first to check you're not duplicating something already saved.

## Auto-Save Triggers (Mid-Session)

Save immediately (don't wait for session end) when these occur:

| Trigger | Action |
|---------|--------|
| User states a preference | Append to `docs/knowledge.md` |
| Decision with trade-offs | `manage_adr` (architecture) |
| Non-obvious bug found | Append to `.opencode/memory/lessons.md` |
| Custom convention discovered | `manage_adr` or `docs/knowledge.md` |
| User corrects your approach | `manage_adr` + knowledge.md |

The heuristic: **if the user would be annoyed repeating this next session, save it now.**

## Memory Audit & Hygiene

Periodically (or when user says "organise memory" / "memory review"):

1. `index_status` — check graph health and coverage gaps.
2. `search_graph` for repeating symbol lookups you keep doing manually — the graph should cover them.
3. Read `docs/knowledge.md` and `.opencode/memory/` — prune stale notes (user confirmation for deletions).
4. Regenerate ADR sections if the architecture moved on.

### Duplicate Prevention

Before every save, check whether the same information already exists (search graph / read memory files). Overwrite if stale, skip if identical.

## Edge Cases

### No codebase-memory-mcp server
If the tools are absent, fall back to file-based memory (`.opencode/memory/` + `docs/knowledge.md`) and report: "codebase-memory-mcp offline — using file-based fallback".

### First session ever
If no prior context is found, skip the full recall ritual and note: "Fresh project — no prior memory. Starting clean."

### Conflict between memory and codebase
Codebase is always the source of truth. If memory says one thing but the code shows another, trust the code, save a correction, and re-index if needed.

## Cross-Agent Memory Discipline

When the IT Leader delegates to a subagent, the subagent does NOT have direct graph access in shared contexts. Instead:

1. **IT Leader recalls** relevant context before delegating (search_graph + ADR).
2. **IT Leader includes** the synthesis in the delegation contract (see agent-delegation-contract skill).
3. **Subagent reports** any new findings at the end.
4. **IT Leader saves** the subagent's findings (manage_adr + memory files).

This prevents memory pollution from subagents running in shared or unclear contexts.
