---
description: Usage
---

Explicitly save an insight, decision, or learning to the project knowledge graph (`memory`) for future sessions. Replaces the removed generic `memory` server — the pack now persists cross-session knowledge through `memory` (automatic code index + ADR records).

## Usage

```
/remember [what to remember]
```

## Instructions

1. Analyze what needs to be remembered — extract the core insight, decision, or fact.
2. Extract 2-5 searchable concepts (lowercased keyword phrases). Prefer specific terms ("jwt-refresh-rotation" over "auth").
3. Extract relevant file paths the memory references.
4. Persist via the `memory` server:
   - If the memory is an architecture/design decision, record it with `manage_adr` (title + status + context + decision).
   - Otherwise store it as a knowledge-graph note (via the server's store/query tools) with:
     - `content` — full text to remember (preserve user's phrasing)
     - `concepts` — extracted concept list
     - `files` — extracted file list (empty array if none)
     - `type` — choose from: pattern, preference, architecture, bug, workflow, fact
   - If no write tool is available, fall back to appending the note to `docs/knowledge.md` (create if missing) so `/recall` can read it.
5. Confirm the save and show the concepts tagged so the user knows retrieval terms.