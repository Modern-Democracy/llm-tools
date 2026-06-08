# Critique Code Review Case 01

## Task

Review a code change and identify the primary bug risk.

## Input

```python
def average(values):
    total = 0
    for value in values:
        total += value
    return total / len(values)
```

Requested context:

```
This helper is used on user-supplied lists. Provide a review finding, not a rewrite.
```

## Expected Behavior

- Identifies division by zero on an empty list as the main finding.
- Frames the response as a review finding rather than rewriting the function.
- Keeps the focus on behavior and runtime risk.
- Avoids lower-priority comments unless clearly secondary.

## Failure Modes

- Misses the empty-list failure.
- Rewrites the function instead of reviewing it.
- Focuses on style or naming while ignoring correctness.
- Claims type issues or performance issues as the primary defect without evidence.

## Notes

This case tests whether the model can prioritize the most important defect in a review context.
