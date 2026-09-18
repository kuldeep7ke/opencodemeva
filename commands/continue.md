---
description: Reconstruct task state after session resume or context compression. Restore progress, active tasks, and memory context before continuing work.
---

# Continue Command

Invoke `/continue` after resuming a session (e.g., after `/reset`, after context compression, or at the start of a new CLI session).

## When to Use

- After `/reset`
- After context compression
- Starting a new session for an existing project
- User returns after a break and says "where were we?"

## How It Works

The command runs a 3-step recovery protocol:

### Step 1: Recall Memory Context

Query the project knowledge graph (`memory`) and recent state for context:
1. `search_graph` / `get_architecture` over the indexed codebase — restore module structure and conventions
2. `git log --oneline -5` + `git status` — reconstruct what the last session changed
3. Review ADR records (via `manage_adr`) — restore architecture decisions from previous sessions
4. `todowrite` cache — restore in-flight task items if present
5. `trace_path` on symbols mentioned in the last session's notes — reconnect callers/callees

### Step 2: Verify Against Codebase

Quick sanity check: do the files mentioned in memory still exist? If not, flag as stale:

```
Reconciling with codebase...
- src/services/notification.service.ts — EXISTS ✅
- src/components/NotificationBell.vue — EXISTS ✅
- src/components/Header.vue — EXISTS ✅
All files from last session present.
```

### Step 3: Report to User

```markdown
Session resumed.

## What We Were Doing
Working on notification feature:
- ✅ DB-001: Migration done
- 🔄 BE-002: API endpoint (route handler done, validation pending)
- ⏳ FE-001: NotificationBell (blocked on BE-002)

## Memory Restored
- 12 previous sessions found
- User preferences: minimal output, Nuxt UI components
- Conventions: services in src/services/, singular file names
- Lessons: none new since last session

Shall I continue with BE-002 (validation middleware)?
```

## Integration

This command relies on:
- `agent-memory-workflow` skill — for the session start recall ritual
- `progress-tracking` skill — for task status recovery
- `memory` — for persistent project knowledge (code index + ADR records)
