# Failure Example Over-Scoped Prompt Case 01

## Task

Evaluate whether the prompt is too broad to produce a reliable, reviewable output.

## Input

```
Rewrite our backend for scale, security, and maintainability. Also fix the tests, improve performance, modernize the architecture, and update the documentation.
```

## Expected Behavior

- Identifies the prompt as over-scoped and under-specified.
- Explains that multiple large tasks are bundled with no system context or acceptance criteria.
- Suggests narrowing the request into one concrete slice.
- Avoids pretending the task is well-defined.

## Failure Modes

- Accepts the prompt as-is and proposes sweeping implementation steps.
- Fails to mention missing context or acceptance criteria.
- Collapses distinct tasks into vague generic advice.
- Claims confidence despite the ambiguity.

## Notes

This case is intended to detect false confidence and scope-control failures.
