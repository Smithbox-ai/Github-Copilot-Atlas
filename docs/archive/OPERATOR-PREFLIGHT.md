# Operator Preflight Checklist

Post-installation verification steps for ControlFlow. Run these checks after first setup or after significant changes to the agent system.

## 1. Directory Structure

Verify these directories exist at your ControlFlow root:

| Directory | Purpose |
|---|---|
| `schemas/` | JSON Schema contracts for all agent outputs |
| `docs/agent-engineering/` | Governance policies (PART-SPEC, RELIABILITY-GATES, etc.) |
| `plans/` | Plan artifacts and templates |
| `plans/templates/` | Standardized output templates |
| `governance/` | Operational knobs, tool grants, runtime policy |
| `skills/` | Domain pattern library |
| `skills/patterns/` | Reusable skill pattern files |
| `evals/` | Validation harness and test scenarios |
| `evals/scenarios/` | Eval scenario fixtures |
| `evals/tests/` | Behavioral regression tests |
| `.github/` | Shared policies (copilot-instructions.md) |

## 2. Required Files

These files must exist for the system to function correctly:

| File | Why |
|---|---|
| `.github/copilot-instructions.md` | Shared policies loaded by all agents |
| `plans/project-context.md` | Agent roster, complexity tiers, risk taxonomy |
| `governance/tool-grants.json` | Canonical least-privilege tool sets |
| `governance/runtime-policy.json` | Confidence thresholds, retry budgets, iteration limits |
| `NOTES.md` | Persistent state across context resets |
| `skills/index.md` | Skill library registry |

## 3. Agent File Inventory

Verify all 13 agent files exist at the repo root:

```
Orchestrator.agent.md
Planner.agent.md
PlanAuditor-subagent.agent.md
AssumptionVerifier-subagent.agent.md
ExecutabilityVerifier-subagent.agent.md
CoreImplementer-subagent.agent.md
UIImplementer-subagent.agent.md
PlatformEngineer-subagent.agent.md
CodeReviewer-subagent.agent.md
Researcher-subagent.agent.md
CodeMapper-subagent.agent.md
TechnicalWriter-subagent.agent.md
BrowserTester-subagent.agent.md
```

## 4. VS Code Settings

Confirm these settings are enabled:

```json
{
  "chat.customAgentInSubagent.enabled": true,
  "github.copilot.chat.responsesApiReasoningEffort": "high"
}
```

## 5. Eval Harness

```bash
cd evals && npm install && npm test
```

Expected output: all passes green (structural + behavioral + orchestration handoff). Current pass count: 217+ checks.

Test breakdown:
- `validate.mjs` — structural integrity (schemas, scenarios, references, P.A.R.T order, skills, tool grants)
- `tests/prompt-behavior-contract.test.mjs` — behavioral invariants across core agents
- `tests/orchestration-handoff-contract.test.mjs` — Orchestrator handoff discipline

## 6. Smoke Test

1. Open VS Code with the ControlFlow workspace.
2. In Copilot Chat, type `@Planner` — confirm the agent appears in the suggestion list.
3. Type `@Orchestrator` — confirm available.
4. Send a simple request to `@Planner`: "Plan a hello world test file."
5. Verify: Planner creates a plan artifact in `plans/` and returns a concise handoff message.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Agent not listed in Chat | `chat.customAgentInSubagent.enabled` is false | Enable in VS Code settings, reload |
| Agent doesn't follow instructions | `.github/copilot-instructions.md` missing or not loaded | Verify file exists at correct relative path |
| Eval tests fail | Missing `npm install` in evals/ | Run `cd evals && npm install` |
| Schema compilation errors | Node.js version too old | Requires Node.js 18+ |
| Tool grant mismatches | Agent frontmatter edited without updating tool-grants.json | Sync `governance/tool-grants.json` with agent `tools:` lists |
