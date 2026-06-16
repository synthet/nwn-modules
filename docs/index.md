---
type: Index
title: Documentation bundle
description: OKF-style entry point for repository documentation about the NWN:EE persistent-world starter kit.
resource: docs/
tags: [docs, okf, nwn]
timestamp: 2026-06-16T00:00:00Z
---

# Documentation bundle

This directory is organized as an **Open Knowledge Format (OKF)-style bundle** based on the Google Cloud OKF introduction: each concept is a Markdown file with YAML frontmatter, normal Markdown body content, and links to related concepts. The bundle stays human-readable in Git while giving agents structured fields to query.

## Concepts

- [Build](BUILD.md) — canonical Nasher build workflow and generated artifact rules.
- [Testing](testing.md) — mock unit-test, compile-check, and runtime validation strategy.
- [NWN Project MCP Server](mcp-tools.md) — structured AI-assistant tool surface.
- [Attribution](ATTRIBUTION.md) — third-party content, AI-generated asset, license, and permission tracking.
- [Design](design/index.md) — architecture, operations, and pinned toolchain knowledge.
- [Release notes](release-notes/README.md) — release-note requirements.

## OKF conventions for this repository

Reference: [Introducing the Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing).

- Every documentation concept should start with YAML frontmatter.
- `type` is required and should describe the concept class, such as `Runbook`, `Design Document`, or `Index`.
- `title`, `description`, `resource`, `tags`, and `timestamp` should be present when practical so humans and agents can summarize, filter, and trace documentation.
- Use normal relative Markdown links to connect concepts.
- Use `index.md` files for navigation and progressive disclosure.
- Use `log.md` files for chronological documentation-structure changes.
