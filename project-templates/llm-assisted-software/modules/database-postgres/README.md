# Database PostgreSQL Module

This optional module materializes canonical project files into PostgreSQL for UI querying and reporting.

## Boundary

Git files remain canonical. Database rows are derived and rebuildable.

## Tables

| Table | Purpose |
| --- | --- |
| `project_model.import_batch` | Track deterministic imports. |
| `project_model.import_record_event` | Track added, changed, unchanged, and removed records. |
| `project_model.template` | Active template package records. |
| `project_model.model_node` | Module, API, screen, workflow, decision, and wiki nodes. |
| `project_model.patch_proposal` | Patch proposal metadata from UI or CLI sources. |

## Sources

- `schema.sql`
