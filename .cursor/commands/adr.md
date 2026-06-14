Create an Architecture Decision Record in `docs/ADR/`.

## Input

Title after the command, e.g. `/adr use-campaign-db-for-prototypes`. Additional context may follow in the conversation.

## Steps

1. MCP `nwn.docs.add_decision` with `title`, `context`, `decision`, `consequences` — preferred
2. Fallback: create `docs/ADR/ADR-NNNN-<slug>.md` manually with next sequence number

Gather context, decision, and consequences from the user if not provided.

## ADR template

```markdown
# ADR-NNNN: <Title>

## Status
Accepted

## Context
...

## Decision
...

## Consequences
...
```

## Output format

```markdown
## ADR created
- File: docs/ADR/ADR-NNNN-<slug>.md
- Number: NNNN
```
