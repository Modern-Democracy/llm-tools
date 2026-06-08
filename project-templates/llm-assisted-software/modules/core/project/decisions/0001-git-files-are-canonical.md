# 0001: Git Files Are Canonical

## Status

Accepted.

## Decision

Template definitions, project models, API contracts, screen contracts, workflows, decisions, and wiki pages are canonical as Git-tracked files.

Generated JSON, database rows, web UI state, and patch proposals are derived or review artifacts.

## Rationale

Git gives versioned review, branch comparison, release tags, template copying, and reproducible setup. A database is useful for querying and UI support, but it should not become the only place where project design decisions exist.

## Consequences

- The web UI reads generated JSON and writes patch proposals.
- Database materialization is optional and rebuildable.
- Automation must render deterministic generated output from canonical files.
- Direct database-only edits are not accepted as durable template changes.
