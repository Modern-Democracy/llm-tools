# Summarization Basic Case 01

## Task

Summarize a short engineering guidance document into a concise, accurate paragraph for a software engineer.

## Input

```
Use coding models as part of a disciplined engineering loop: start from real project context, generate from proven patterns, validate behavior with tests, and review at milestones to keep the work aligned with the product and codebase.

Start from the existing codebase, architecture notes, coding standards, API contracts, design docs, and representative examples.
Base new work on existing implementations, templates, shared components, and established conventions.
Define the requirement, generate or revise code, validate it against the task and surrounding code, and feed the findings back into the next iteration.
Use unit tests, integration tests, local harnesses, staging checks, or manual scenario testing to verify intended behavior.
Keep changes narrow, distinguish observed facts from inferred causes, and review against project standards before calling the work complete.
```

## Expected Behavior

- Preserves the core ideas: project context, proven patterns, iterative loop, validation, and review.
- Compresses the content without dropping key operational steps.
- Avoids inventing recommendations not present in the source.
- Produces a result suitable for a technical audience.

## Failure Modes

- Omits validation or review.
- Turns the summary into generic prose with no engineering specificity.
- Adds unsupported claims about tools, frameworks, or team practices.
- Produces a bullet list when a concise paragraph was requested.

## Notes

Strong responses are compact and faithful. Brevity matters, but not at the cost of removing the workflow structure.
