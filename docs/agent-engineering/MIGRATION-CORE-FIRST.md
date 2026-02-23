# Core-first Migration Guide

## Scope (Completed)
Core agents:
- `Atlas.agent.md`
- `Prometheus.agent.md`
- `Oracle-subagent.agent.md`
- `Explorer-subagent.agent.md`
- `Code-Review-subagent.agent.md`

Implementation agents:
- `Sisyphus-subagent.agent.md`
- `Frontend-Engineer-subagent.agent.md`

## Breaking Change Policy
Controlled breaking changes were applied during migration.

Implications:
- Core agents now require strict schema-governed outputs.
- Legacy free-form outputs are non-compliant for core workflows.

## Required Artifacts
- `docs/agent-engineering/PART-SPEC.md`
- `docs/agent-engineering/RELIABILITY-GATES.md`
- `schemas/*.schema.json` for each core output contract
- `schemas/sisyphus.execution-report.schema.json`
- `schemas/frontend.execution-report.schema.json`
- `evals/scenarios/*` fixtures for deterministic checks

## Rollout Sequence
1. Land schemas and governance docs.
2. Refactor core agents to P.A.R.T + schema references.
3. Refactor implementation agents to P.A.R.T + schema references.
4. Run scenario checks (schema compliance, abstention, safety gates).
5. Update README architecture and usage guidance.

## Backward Compatibility Strategy
Not guaranteed for core output shape.

Mitigation:
- Keep human-readable summaries in addition to schema objects where possible.
- Document exact schema file per agent.
- Keep status enums stable across agents.

## Quality Gates Before Merge
- Schema files parse as valid JSON.
- Each agent references one primary schema contract.
- Human approval gate is explicit in Atlas and Code-Review paths.
- Predictability path (`ABSTAIN`) is present in all agents.
