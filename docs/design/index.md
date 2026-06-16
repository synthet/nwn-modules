---
type: Index
title: Design documents
description: OKF-style index for architecture, toolchain, external tools, and operations design knowledge.
resource: docs/design/
tags: [design, architecture, okf]
timestamp: 2026-06-16T00:00:00Z
---

# Design documents

This subtree captures durable project decisions and operating knowledge for the NWN:EE persistent-world starter kit.

## Concepts

- [Persistent world project design](persistent-world-project.md) — product goals, constraints, architecture, and repository growth plan.
- [Toolchain baseline](toolchain.md) — pinned NWN:EE, Nasher, compiler, and art-tool versions.
- [NWN tools directory layout](nwn-tools-layout.md) — external `NWN_TOOLS` install layout and command surface.
- [Server operations](server-operations.md) — Docker Compose startup, shutdown, backup, restore, deployment, and monitoring runbook.

## Maintenance

When adding new design concepts, create a focused Markdown file with OKF frontmatter, link it from this index, and prefer stable repository-relative links over prose-only references.
