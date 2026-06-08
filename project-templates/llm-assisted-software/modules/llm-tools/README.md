# LLM Tools Module

This optional module records assistant, prompt, role, and tool-boundary conventions for projects created from the template.

## Provides

- Role names and routing expectations.
- Prompt placement guidance.
- Tool-boundary guidance for filesystem, database, browser, and automation work.
- A rule that durable project knowledge belongs in the project wiki, not only in chat history.

## Role Set

| Role | Purpose |
| --- | --- |
| Project Management | Classify objective, scope, affected artifacts, ambiguity, and next role. |
| Business Analyst | Clarify behavior, requirements, success criteria, scenarios, and edge cases. |
| Coding Architect | Decide module boundaries, interfaces, schemas, dependencies, and QA approach. |
| Implementation | Apply approved changes with the smallest practical scope. |
| QA Reviewer | Verify acceptance claims with discriminating evidence. |

## Tool Boundary

- Database read tools may inspect materialized state.
- Database write paths go through scripts or migrations.
- UI tools may inspect generated model state and submit patch proposals.
- Generated outputs are reproducible and disposable.

## Sources

- `modules/core/project/workflows/role-gated-delivery.yaml`
