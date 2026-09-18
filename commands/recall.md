---
description: Usage
---

Search past session observations, decisions, and lessons stored in the project knowledge graph (`memory`) for relevant context. Replaces the removed generic `memory` server — cross-session knowledge now lives in `memory` (code index + ADR records + notes).

## Usage

```
/recall [query]
```

## Instructions

1. Query the `memory` server:
   - `search_graph` over the indexed codebase for matching functions, classes, and relationships relevant to the query.
   - ADR/decision lookup for architecture choices tagged with the query's concepts.
   - Any notes/observations already stored for this project.
2. Also read `docs/knowledge.md` if present (fallback store).
3. Combine results and present to the user:
   - Group by type (pattern, preference, architecture, bug, workflow, fact)
   - Show title and context for each
   - Highlight high-importance and architecture items
4. If no results, suggest 2-3 alternative search terms.
5. **Never hallucinate results.** Only present what the MCP tools actually return.