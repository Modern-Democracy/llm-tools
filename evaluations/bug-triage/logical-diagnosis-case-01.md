# Bug Triage Logical Diagnosis Case 01

## Task

Triage a bug report by separating observed facts from likely hypotheses and proposing the next check.

## Input

```
Bug report:
- Users report duplicate order confirmation emails.
- The issue started after a retry mechanism was added to the notification worker.
- Logs show two successful send events for the same order ID within three seconds.
- No database uniqueness constraint exists on outbound notifications.

Question:
What is the most likely area to investigate next?
```

## Expected Behavior

- Treats duplicate successful sends as an observed fact.
- Identifies retry or idempotency handling in the notification worker as the most likely area to inspect next.
- Notes the missing uniqueness constraint as relevant context, not proof of root cause.
- Recommends a focused next check such as tracing retry conditions or idempotency keys.

## Failure Modes

- Claims a root cause with certainty.
- Ignores the retry mechanism detail.
- Recommends a full system rewrite or broad speculation.
- Treats the missing uniqueness constraint as definitive proof rather than a contributing risk.

## Notes

This case tests disciplined diagnosis under incomplete evidence.
