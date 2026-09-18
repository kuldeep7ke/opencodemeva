---
name: codebase-memory-mcp
description: 'Persistent project memory via the codebase-memory-mcp knowledge graph: index repos, search symbols, trace call paths, read architecture, record ADR decisions. Use for cross-session continuity, codebase onboarding, impact analysis, and recall of past decisions.'
---

# Codebase Memory (codebase-memory-mcp)

Provides persistent cross-session memory for coding agents using the **codebase-memory-mcp** knowledge graph. This is the pack's memory layer: it stores what the agent should know across sessions — code structure, call chains, hot paths, and architecture decisions — not what it can re-derive from reading files.

## Principle

The knowledge graph is the agent's **external hippocampus**. The user should never have to repeat past decisions or re-explain the codebase. If the code changes, the graph is the ground truth; if memory disagrees with code, trust the code and re-index.

## Tool Reference

| Tool | Purpose |
|------|---------|
| `list_projects` | See which repos are indexed and their health (nodes/edges) |
| `index_status` | Index health: coverage gaps, parse issues, git context |
| `check_index_coverage` | Before trusting graph results: verify the exact files you rely on are indexed |
| `index_repository` | Index a new repo (or force-refresh after a large external change) |
| `search_graph` | Find symbols/routes/classes by name, query, or semantics |
| `search_code` | Grep+graph: find code by literal text, enriched with structure |
| `trace_path` | Who calls a function; what it calls; data flow; cross-service calls |
| `get_code_snippet` | Read a function/class body by qualified name |
| `get_architecture` | High-level architecture overview (layers, clusters, hotspots) |
| `query_graph` | Raw Cypher for multi-hop patterns, dead code, hot paths, complexity |
| `manage_adr` | Persistent Architecture Decision Records for cross-session decisions |
| `detect_changes` | Blast radius of a diff (base_branch...HEAD) |

## Session Start Ritual (MANDATORY)

Before productive work, reconstruct context:

1. `list_projects` — is the current repo indexed?
2. `get_architecture` — module structure, entry points, hot spots.
3. `search_graph(query: "<project's main features>")` — locate the code touched last session.
4. `manage_adr (mode: sections)` — restore architecture decisions from previous sessions.
5. Check `git log --oneline -5` + `git status` — what the last session changed.

## Decision Recording (Session End / Auto-Save)

Record durable decisions as ADRs via `manage_adr` (mode: `update`). Category conventions:

| Category | Where it lives |
|----------|----------------|
| Architecture decisions | ADR via `manage_adr` |
| Project conventions | ADR via `manage_adr` (or `docs/knowledge.md`) |
| User preferences | `docs/knowledge.md` or `.opencode/memory/*.json` |
| Session log | `.opencode/memory/session-<date>.md` |
| Code structure findings | graph itself (live via code search) |

Auto-save triggers: user states a preference, a decision with trade-offs, a non-obvious bug with a workaround, or a custom convention. The heuristic: if the user would be annoyed repeating this next session, record it now.

## Hygiene

- Before trusting graph results, run `check_index_coverage` on the exact paths you rely on. A clean result means no *recorded* gap — not proof of completeness. When a file is only partially indexed, grep the flagged ranges.
- After big external changes (new deps, generated code), re-index with `index_repository`.
- Use `trace_path` for callers/callees instead of grep when possible — it is faster and precise.
- Complexity/hot-path signals live on Function/Method nodes (`complexity`, `transitive_loop_depth`, `linear_scan_in_loop`, `alloc_in_loop`).

## Cross-Agent Discipline

Subagents do NOT get direct graph access in shared contexts by default. The orchestrating agent should:

1. Query the graph and check coverage in the parent session.
2. Pass tier, project, scope, qualified symbols, paths, and call-chain findings to the subagent.
3. Have the subagent verify by reading exact source ranges.
4. Save the subagent's findings back to ADR/memory via `manage_adr`.

## Fallback (graph unavailable)

If `codebase-memory-mcp` tools are absent, fall back to:
- Save decisions to `.opencode/memory/decision-<date>.md` and `docs/knowledge.md`
- Recall by reading `.opencode/memory/` and `docs/knowledge.md`
- Report: "codebase-memory-mcp offline — using file-based fallback"
