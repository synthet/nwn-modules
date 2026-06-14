---
name: adr
description: Create an Architecture Decision Record in docs/ADR/. Use when user says /adr.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write, Bash
---

Create an Architecture Decision Record.

## Input

Title in $ARGUMENTS, e.g. `/adr use-campaign-db-for-prototypes`.

## Steps

1. MCP `nwn.docs.add_decision` with title, context, decision, consequences — preferred
2. Fallback: create `docs/ADR/ADR-NNNN-<slug>.md` manually

Gather context from user if not provided.

## Output

Report ADR file path and number.
