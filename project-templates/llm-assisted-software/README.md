# LLM-Assisted Software Project Template

This package defines a versioned starter template for LLM-assisted software projects.

## Contract

- Git-tracked files are the canonical source of truth.
- Generated artifacts are written under `build/project-templates/llm-assisted-software/`.
- The web UI reads generated JSON and writes patch proposals.
- Container-first automation is preferred over host-specific setup.
- Optional modules extend the core without forcing every project into a full stack.

## Main Files

| Path | Purpose |
| --- | --- |
| `template.yaml` | Package manifest and module list. |
| `schemas/` | JSON Schemas for the manifest, project model, APIs, screens, workflows, and patch proposals. |
| `modules/core/` | Canonical project model, role workflow, decisions, and wiki source scaffold. |
| `modules/automation/` | Container-first command definitions and runtime files. |
| `modules/web-ui/` | Low-dependency project model viewer/editor module spec. |
| `modules/database-postgres/` | Optional PostgreSQL materialization schema. |
| `modules/llm-tools/` | Optional assistant and tool-boundary configuration guidance. |
| `tools/llm-template.mjs` | No-dependency render, validate, lint, and diagnostic tool. |
| `patches/` | UI patch proposal output path. |

## Commands

Run directly with Node:

```powershell
node project-templates\llm-assisted-software\tools\llm-template.mjs validate
node project-templates\llm-assisted-software\tools\llm-template.mjs render
node project-templates\llm-assisted-software\tools\llm-template.mjs wiki-lint
```

Run with Docker using the automation module files:

```powershell
docker compose -f project-templates\llm-assisted-software\modules\automation\docker-compose.template.yaml run --rm llm-template validate
```

## Generated Output

The render command creates:

```text
build/project-templates/llm-assisted-software/project-model.json
build/project-templates/llm-assisted-software/project-model.graph.json
build/project-templates/llm-assisted-software/validation-report.json
build/project-templates/llm-assisted-software/generated-wiki-preview/
build/project-templates/llm-assisted-software/generated-db/
build/project-templates/llm-assisted-software/generated-web-model/
```
