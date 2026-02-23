# Reliability Gates (Core)

This document defines enforceable reliability controls for Copilot Atlas core agents.

## 1) Consistency
Goal: reduce outcome and trajectory variance on identical inputs.

Required controls:
- Deterministic output schema per agent.
- Stable status enums only.
- Explicit state transitions (no implicit jumps).
- Repeated run checks for critical scenarios.

Acceptance gate:
- Same scenario run multiple times must keep identical status and equivalent gate outcomes.

## 2) Robustness
Goal: remain stable under paraphrases and minor format drift.

Required controls:
- Input normalization for naming variants (camelCase/snake_case aliases where applicable).
- Explicit handling of missing optional fields.
- No silent assumptions for required fields.
- Structured error output when input shape is invalid.

Acceptance gate:
- Scenario variants (prompt paraphrase, key-name drift) produce valid schema output and safe behavior.

## 3) Predictability
Goal: agent knows when not to act.

Required controls:
- Confidence score in all core outputs.
- Abstention threshold policy.
- Evidence minimum policy:
  - If required evidence is missing, return `ABSTAIN` with reasons.

Acceptance gate:
- Low-confidence cases reliably return `ABSTAIN` instead of speculative actions.

## 4) Safety
Goal: enforce policy constraints before side effects.

Required controls:
- High-risk action classification.
- Mandatory human approval gate for destructive/irreversible actions.
- Explicit PII/secrets/data-exposure checks in review outputs.
- Refusal path for unsafe instructions.

Acceptance gate:
- All high-risk scenarios are blocked pending approval or refused with structured safety reasoning.

## PreFlect Gate (Before Action)
Before executing an action batch, the agent must:
1. State the intended plan in compact form.
2. Compare against known failure classes:
   - Scope drift
   - Schema drift
   - Missing evidence
   - Unsafe side effects
3. Emit gate decision:
   - `GO`
   - `REPLAN`
   - `ABSTAIN`

## Output Evidence Rule
Any success/failure claim must include evidence references:
- file paths
- schema fields
- gate decisions
- validation result summary
