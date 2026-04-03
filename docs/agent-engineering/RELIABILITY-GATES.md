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

## 5) Clarification Reliability
Goal: ensure agents ask for clarification when ambiguity would materially change the output.

Required controls:
- Positive trigger list for known ambiguity classes.
- Threshold rule: clarification required only for decisions with material output impact.
- Structured clarification payloads when returning `NEEDS_INPUT`.

Acceptance gate:
- When presented with enumerated ambiguity classes, agents with `askQuestions` use it proactively.
- Agents without `askQuestions` return `NEEDS_INPUT` with structured `clarification_request`.
- Clarification does not fire for questions answerable from codebase evidence.

## 6) Tool Routing Reliability
Goal: agents use the correct knowledge source for their role.

Required controls:
- Local-first rule: prefer codebase search before external sources.
- External-doc rule: when task depends on third-party APIs, frameworks, or current best practices, use external tools before finalizing output.
- MCP/Context7 rule: when granted, use for library documentation resolution before planning around third-party behavior.
- No phantom grants: tools in frontmatter must have body-level routing rules.

Acceptance gate:
- Agents with external tools use them when the task domain requires external knowledge.
- Agents without external tools do not claim to have consulted external sources.
- No tool listed in frontmatter goes unreferenced in body instructions.

## 7) Retry Reliability
Goal: prevent silent failures and hung pipelines during parallel agent execution.

Required controls:
- Silent failure detection: empty responses, timeouts, and rate-limit errors (HTTP 429) must be caught and logged.
- Retry budget: each phase has a cumulative retry budget of 5 attempts across all failure classifications. Exceeding the budget triggers mandatory user escalation.
- Per-wave throttling: if 2+ subagents in the same wave return `transient` failures, reduce parallelism for subsequent waves by 50%.
- Exponential backoff signaling: retry attempts include a `retry_attempt` counter in delegation payloads.
- Escalation threshold: 3 consecutive failures with the same classification on the same phase triggers escalation regardless of individual retry limits.

Acceptance gate:
- No pipeline step proceeds after unhandled subagent failure.
- Rate-limit scenarios are covered by throttling policy, not by infinite retry.
- Retry budget exhaustion always escalates to user with accumulated failure evidence.

## 8) Executability
Goal: plans must be actionable by a cold-start executor without additional clarification.

Required controls:
- Every phase must specify concrete file paths, input/output contracts, and verification commands.
- Plans are audited for cold-start executability by Challenger (executability_checklist in schema).
- If a plan cannot be executed from the artifact alone, Challenger raises at minimum a MAJOR finding.

Acceptance gate:
- Challenger populates executability_checklist for the first 3 tasks of every audited plan.
- Plans with any executability failure produce a MAJOR or CRITICAL finding — they do not silently pass.

## 9) Semantic Risk Coverage
Goal: plans must surface non-functional and contextual risks before phase decomposition, not after.

Required controls:
- Prometheus evaluates all 7 semantic risk categories (`data_volume`, `performance`, `concurrency`, `access_control`, `migration_rollback`, `dependency`, `operability`) at step 0.5 of the Mandatory Workflow — after clarification, before research delegation.
- Every plan must emit a `risk_review` array with one entry per category.
- Any category with `applicability: applicable` AND `impact: HIGH` that cannot be resolved from available evidence must set `disposition: research_phase_added` and include a dedicated research phase before implementation phases begin.
- Atlas triggers Challenger whenever any `risk_review` entry has `applicability: applicable` AND `impact: HIGH` AND `disposition` is not `resolved` — even for plans with fewer than 3 phases and confidence ≥ 0.9.
- Challenger maps applicable HIGH-impact risk entries to its audit focus areas (see Semantic Risk Taxonomy in `plans/project-context.md`).

Acceptance gate:
- Plans with `HIGH`-impact applicable risk entries and no corresponding research phase or `resolved` disposition are non-compliant.
- Challenger must check the `risk_review` field when `audit_scope` includes `performance` focus area.
- A missing `risk_review` array in the plan schema is a schema validation failure — the plan is rejected before Challenger review.
