# Automation Module

This module defines container-first automation for the template package.

## Commands

The command contract is declared in `commands.yaml`.

The local implementation is `tools/llm-template.mjs`; Docker runs that same tool inside a Node container.

## Command Boundary

- `validate`: validate canonical files and write `validation-report.json`.
- `render`: validate and render deterministic generated model artifacts.
- `wiki-lint`: check wiki scaffold frontmatter, source sections, and relative links.
- `doctor`: report environment and repository status.
- `backup`: reserved command for future backup packaging.
- `restore`: reserved command for future backup restore.
- `upgrade-check`: reserved command for template version compatibility checks.

## Sources

- `commands.yaml`
- `docker-compose.template.yaml`
