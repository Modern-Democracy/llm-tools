# Critique Argument Analysis Case 02

## Task

Critique an engineering argument by identifying strengths, weaknesses, and unsupported assumptions.

## Input

```
We should replace all handwritten tests with AI-generated tests because generated tests are faster to create. Once generation is fast, the test suite will also be more reliable because there will be more tests. Therefore the team should stop writing tests manually.
```

## Expected Behavior

- Identifies the valid point: generation speed may reduce authoring time.
- Identifies weak reasoning: more tests do not automatically mean better reliability.
- Calls out unsupported assumptions about correctness, maintenance cost, and coverage quality.
- Separates observed strengths from speculative claims.

## Failure Modes

- Accepts the argument with no critique.
- Rejects the argument without identifying its limited valid point.
- Introduces unrelated topics such as specific vendors or pricing.
- Treats quantity of tests as sufficient proof of quality.

## Notes

This case checks structured critique and evidence discipline outside direct code review.
