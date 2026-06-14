import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import {
  existsSync,
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { Config } from "../config.js";
import { safePath } from "../utils/paths.js";

// ---------------------------------------------------------------------------
// Helper: recursively find markdown files
// ---------------------------------------------------------------------------
function findMarkdownFiles(dir: string, results: string[] = []): string[] {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findMarkdownFiles(full, results);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".txt")) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Helper: extract excerpt around a match
// ---------------------------------------------------------------------------
function extractExcerpt(
  content: string,
  query: string,
  contextLines = 3
): { lineNo: number; excerpt: string } | null {
  const lines = content.split("\n");
  const lower = query.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lower)) {
      const start = Math.max(0, i - contextLines);
      const end   = Math.min(lines.length - 1, i + contextLines);
      return {
        lineNo: i + 1,
        excerpt: lines.slice(start, end + 1).join("\n"),
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// ADR template
// ---------------------------------------------------------------------------
function makeAdrContent(
  title: string,
  context: string,
  decision: string,
  consequences: string,
  date: string,
  adrNumber: number
): string {
  return `# ADR-${String(adrNumber).padStart(4, "0")}: ${title}

**Date:** ${date}
**Status:** Accepted

## Context

${context}

## Decision

${decision}

## Consequences

${consequences}
`;
}

export function registerDocsTools(server: Server, config: Config): void {
  const root    = resolve(config.workspaceRoot);
  const docsDir = join(root, config.paths.docs);

  // ---- nwn.docs.search -----------------------------------------------------
  server.tool(
    "nwn.docs.search",
    "Search docs/ directory for a query string and return matching file excerpts.",
    {
      query: z.string().describe("Search query (case-insensitive substring)."),
      maxResults: z
        .number()
        .optional()
        .default(10)
        .describe("Maximum number of matching excerpts to return."),
    },
    async ({ query, maxResults }) => {
      const files = findMarkdownFiles(docsDir);
      const matches: Array<{
        file: string;
        lineNo: number;
        excerpt: string;
      }> = [];

      for (const f of files) {
        if (matches.length >= maxResults) break;
        try {
          const content = readFileSync(f, "utf-8");
          const excerpt = extractExcerpt(content, query);
          if (excerpt) {
            matches.push({
              file: f.replace(root + "/", ""),
              lineNo: excerpt.lineNo,
              excerpt: excerpt.excerpt,
            });
          }
        } catch {
          // skip unreadable files
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: true,
                query,
                matchCount: matches.length,
                matches,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ---- nwn.docs.add_decision -----------------------------------------------
  server.tool(
    "nwn.docs.add_decision",
    "Create an ADR (Architecture Decision Record) file in docs/ADR/.",
    {
      title: z.string().describe("Short title for the decision."),
      context: z.string().describe("What is the issue motivating this decision?"),
      decision: z.string().describe("What was decided?"),
      consequences: z
        .string()
        .describe("What are the resulting consequences (positive and negative)?"),
    },
    async ({ title, context, decision, consequences }) => {
      const adrDir = join(docsDir, "ADR");
      safePath(root, "docs/ADR");

      if (!existsSync(adrDir)) {
        mkdirSync(adrDir, { recursive: true });
      }

      // Determine next ADR number
      const existing = readdirSync(adrDir).filter((f) =>
        /^ADR-\d{4}/.test(f)
      );
      const numbers = existing.map((f) => {
        const m = f.match(/^ADR-(\d{4})/);
        return m ? parseInt(m[1], 10) : 0;
      });
      const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const filename = `ADR-${String(nextNum).padStart(4, "0")}-${slug}.md`;
      const filePath = join(adrDir, filename);

      const date = new Date().toISOString().split("T")[0];
      const content = makeAdrContent(
        title,
        context,
        decision,
        consequences,
        date,
        nextNum
      );

      writeFileSync(filePath, content, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: true,
                file: filePath.replace(root + "/", ""),
                adrNumber: nextNum,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
