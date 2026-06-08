# LLM-Assisted Project Template

This document describes the reusable project-template package for setting up disciplined LLM-assisted software projects.

## Purpose

The template package standardizes project administration, design workflow, source layout, wiki structure, local automation, and optional database and web UI support.

The core design principle is that Git-tracked files are canonical. Generated JSON, database rows, and UI state are derived from those files or recorded as patch proposals.

## Location

The package lives at:

```text
project-templates/llm-assisted-software/
```

Generated artifacts are written under:

```text
build/project-templates/llm-assisted-software/
```

## Template Shape

The package is split into a small core and optional modules:

| Module | Purpose |
| --- | --- |
| `core` | Project model, role-gated workflow, wiki scaffold, decisions, and source layout conventions. |
| `automation` | Container-first commands for validation, rendering, linting, diagnostics, backup, restore, and upgrade checks. |
| `web-ui` | Low-dependency project-model viewer/editor using Node, static HTML, CSS, and first-party JavaScript. |
| `database-postgres` | Optional PostgreSQL materialization schema for querying project models and patch proposals. |
| `llm-tools` | Optional assistant, role, and tool-boundary configuration guidance. |

## Canonical Model

Canonical template definitions are YAML and Markdown files stored in Git:

- `project/model.yaml`
- `project/apis/*.yaml`
- `project/screens/*.yaml`
- `project/workflows/*.yaml`
- `project/decisions/*.md`
- `wiki/`

Generated model files are disposable and should be recreated from canonical files.

## Web UI Boundary

The first web UI reads generated project-model JSON and writes patch proposal files. It does not directly rewrite canonical template files.

This keeps UI editing reviewable through Git while still allowing a visual model editor.

## Dependency Posture

The template uses limited dependencies by default:

- Docker and Git are the primary host prerequisites.
- Node is used inside the automation container and can also run directly for local verification.
- PostgreSQL is optional and only used when a project needs database materialization.
- Third-party UI frameworks are out of scope for v1.

## Sources

- `project-templates/llm-assisted-software/template.yaml`
- `project-templates/llm-assisted-software/modules/core/README.md`
- `project-templates/llm-assisted-software/modules/automation/commands.yaml`
