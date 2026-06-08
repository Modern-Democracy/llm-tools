# evaluations

Benchmark cases for testing prompt quality and model behavior on repeatable LLM-assisted engineering tasks.

## Case Format

Each case should use the same five sections:

1. `Task`
   Short statement of the task being evaluated.

2. `Input`
   The source material, prompt, or scenario given to the model.

3. `Expected Behavior`
   What a good response should do. Focus on observable behavior, not style preferences alone.

4. `Failure Modes`
   Common ways the response can go wrong.

5. `Notes`
   Extra context, scoring hints, or constraints that matter during evaluation.

## Initial Benchmark Set

- `summarization/basic-case-01.md`
- `summarization/constraint-case-02.md`
- `critique/code-review-case-01.md`
- `critique/argument-analysis-case-02.md`
- `refactoring-guidance/pattern-alignment-case-01.md`
- `bug-triage/logical-diagnosis-case-01.md`
- `failure-examples/over-scoped-prompt-case-01.md`
- `failure-examples/hallucination-pressure-case-02.md`

## Usage

Use these cases to compare:

- different prompt variants
- different providers or model versions
- different prompt overlays such as reviewer or debugging modes

Treat these cases as behavioral checks. They are intended to reveal drift, weak instruction following, and unsupported claims.
