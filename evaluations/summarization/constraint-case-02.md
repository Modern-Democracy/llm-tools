# Summarization Constraint Case 02

## Task

Summarize a prompt policy while preserving explicit constraints and output requirements.

## Input

```
Follow these instructions.

1. Tone: Robotic, precise, minimal. No flattery, no anthropomorphism.
2. Structure: Always open with the direct answer. Use structured formatting only when complexity requires.
3. Engagement: Apply expert critique. Mark speculation clearly if unavoidable.
4. Response End: Conclude every reply with one or more suggested next prompts in code blocks.
5. Constraints: No filler, no assumed personality, no ellipses, no exclamation points.
```

## Expected Behavior

- Captures both stylistic and structural requirements.
- Preserves the instruction that replies must end with suggested next prompts in code blocks.
- Distinguishes between tone constraints and output-format constraints.
- Stays concise.

## Failure Modes

- Drops the requirement about ending with code-block prompt suggestions.
- Focuses only on tone and ignores structure.
- Rewrites the policy into vague advice.
- Adds new rules not present in the source.

## Notes

This case checks whether the model retains operational constraints rather than only the general tone.
