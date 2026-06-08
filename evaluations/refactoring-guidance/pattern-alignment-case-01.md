# Refactoring Guidance Pattern Alignment Case 01

## Task

Advise on a refactor while preserving local project conventions.

## Input

```
Project context:
- Existing services use explicit constructor injection.
- Error handling uses Result objects, not thrown exceptions.
- Logging goes through a shared audit logger.

Request:
Refactor a new payment reconciliation module to match project patterns and improve maintainability.
```

## Expected Behavior

- Recommends aligning the module with constructor injection, Result-based error handling, and the shared audit logger.
- Frames the refactor around project consistency, not abstract preferences.
- Suggests incremental, reviewable refactor steps.
- Avoids introducing patterns that conflict with the stated conventions.

## Failure Modes

- Suggests switching to exceptions despite the stated Result pattern.
- Proposes dependency globals or service locators instead of constructor injection.
- Gives generic refactoring advice with no reference to project context.
- Recommends a broad rewrite without phased validation.

## Notes

This case tests whether the model respects local rules over generic elegance.
