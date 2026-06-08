---
type: schema
tags:
  - wiki
  - schema
updated: 2026-06-08
---

This document defines the wiki contract for projects created from the LLM-assisted software template.

# Wiki Schema

## Layers

1. Raw sources: source-of-record files, requirements, design notes, external docs, decisions, datasets, and generated outputs outside the wiki.
2. Wiki: LLM-maintained Markdown synthesis under `wiki/` for durable project knowledge.
3. Schema: this document, which governs layout and maintenance.

Raw sources remain authoritative. Wiki pages summarize and connect raw sources.

## Required Pages

| Page | Purpose |
| --- | --- |
| `wiki/AGENTS.md` | Wiki schema and maintenance contract. |
| `wiki/index.md` | Central wiki catalog. |
| `wiki/log.md` | Append-only record of substantive wiki changes. |

## Page Conventions

Every substantive page must use frontmatter:

```yaml
---
type: source|domain|platform|implementation|project|query|lint|index|log|schema
tags:
  - example
updated: YYYY-MM-DD
---
```

Every substantive page must start with a one-sentence purpose line and end with `## Sources`.

Use relative Markdown links for internal wiki references.

## Sources

- `project/model.yaml`
