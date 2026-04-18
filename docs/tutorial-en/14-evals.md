# Chapter 14 — Eval Harness

## Why this chapter

Understand **how the ControlFlow repository is tested**: what `npm test` checks, how scenarios work, and how to add a new check after making a change.

## Key Concepts

- **Eval harness** — a set of offline checks in `evals/` that do not call live agents.
- **Scenario** — a JSON file in `evals/scenarios/` that pairs an input with an expected output.
- **Drift check** — a test that verifies agent files haven't gone out of sync with contracts and governance files.
- **Companion rule** — a `_must_contain` assertion about which sections must be present in an agent file.

## What the Eval Harness Is

A **Node.js test runner** in `evals/` with three modes:

| Command | What it runs | Speed |
|---------|-------------|-------|
| `cd evals && npm test` | Full suite (~410 checks) | Slower |
| `npm run test:structural` | Schemas and P.A.R.T. structure | Fast |
| `npm run test:behavior` | Prompt-behavior + orchestration-handoff | Fast |

**Key properties:**
- **No network** — no live agents, no LLM calls.
- **Offline only** — runs in CI without credentials.
- **Deterministic** — same input always produces the same pass/fail.

## `evals/` Structure

```
evals/
  package.json         — scripts: test, test:structural, test:behavior
  validate.mjs         — main structural validator (Passes 1–4)
  drift-checks.mjs     — drift detection (Pass 4b)
  tests/               — behavior test files (.test.mjs)
  scenarios/           — JSON scenario fixtures
    <agent-name>/      — folder per agent
      <scenario>.json  — individual scenario
```

## What Each Pass Checks

### Pass 1: Schema Validity

- Each `schemas/*.json` is a valid JSON Schema (draft 2020-12).
- No syntax errors.

### Pass 2: Scenario Validity

- Each `evals/scenarios/**/*.json` file is valid against its corresponding schema.
- Schema filename is inferred from the folder name: `scenarios/planner/` → `schemas/planner.plan.schema.json`.

### Pass 3: Agent File References

- Each agent file that mentions a schema has the correct path.
- `skill_references[]` values point to files that exist in `skills/patterns/`.

### Pass 4: Structural Drift — P.A.R.T. Order

- Each `*.agent.md` has sections in this exact order: **Prompt → Archive → Resources → Tools**.
- Any missing or reordered section fails.

### Pass 4b: Companion Rules

- Each `*.agent.md` has `_must_contain` rules: mandatory text snippets.
- Example: "Orchestrator.agent.md must contain the string `trace_id`".
- Ensures critical contracts are not silently removed.

### Pass 5–7: Prompt-Behavior Contract

- Tests against `docs/agent-engineering/PROMPT-BEHAVIOR-CONTRACT.md`.
- Checks behavioral invariants: output format, required fields, blocked actions.

### Pass 8: Orchestration Handoff

- Tests that Orchestrator correctly dispatches subagents.
- Checks PLAN_REVIEW trigger conditions, tier routing, delegation payload format.

## Scenarios — Purpose and Examples

A scenario is a JSON fixture describing an input/output pair. It is used for two purposes:
1. **Schema validation** — verifies the structure.
2. **Regression testing** — verifies behavior doesn't change unexpectedly.

**Examples of scenario types:**

| Scenario | Folder | Checked against |
|----------|--------|----------------|
| Planner plan with 5 phases | `scenarios/planner/` | `planner.plan.schema.json` |
| PlanAuditor APPROVED verdict | `scenarios/plan-auditor/` | `plan-auditor.plan-audit.schema.json` |
| CoreImplementer NEEDS_INPUT | `scenarios/core-implementer/` | `core-implementer.execution-report.schema.json` |
| Orchestrator gate event | `scenarios/orchestrator/` | `orchestrator.gate-event.schema.json` |

## Reading the Output

A typical `npm test` result:

```
Pass 1 (schema validity): 15 schemas — OK
Pass 2 (scenario validity): 47 scenarios — OK
Pass 3 (agent references): 13 agents — OK
Pass 4 (P.A.R.T. order): 13 agents — OK
Pass 4b (companion rules): 23 rules — OK
Pass 5-7 (prompt-behavior): 180 checks — OK
Pass 8 (orchestration-handoff): 32 checks — OK
Total: 410 checks passed
```

If a check fails:
```
FAIL Pass 4 — P.A.R.T. order
  CoreImplementer-subagent.agent.md: 
  Section order is [Prompt, Resources, Archive, Tools] 
  Expected [Prompt, Archive, Resources, Tools]
```

The error tells you exactly what file, what check, and what the diff is.

## Adding a New Scenario (Flowchart)

```mermaid
flowchart TD
    New[Need to add a scenario] --> Which[Which schema does it cover?]
    Which --> Folder[Create file in\nevals/scenarios/<agent-name>/]
    Folder --> Write[Write valid JSON\nagainst the schema]
    Write --> Run[cd evals && npm test]
    Run -->|passed| Done[Scenario added]
    Run -->|failed| Fix[Fix JSON or schema]
    Fix --> Run
```

## Adding a New Agent or Schema (4 Steps)

1. **Create the agent file** — `<Name>.agent.md` (P.A.R.T. order).
2. **Create the schema** — `schemas/<name>.schema.json`.
3. **Add eval scenarios** — at least one scenario in `evals/scenarios/<name>/`.
4. **Register** the agent in `plans/project-context.md`.

After each step, run `npm test` to verify nothing is broken.

## What Evals Do NOT Check

- **Does the agent solve the task correctly?** — Not verified; that's a human review.
- **Does the LLM follow behavioral invariants at runtime?** — Not verified at eval time (only at code review).
- **Network dependencies** — no live tools, no API calls.
- **UI rendering** — no visual output.

## CI Configuration

`.github/workflows/ci.yml`:
```yaml
- run: cd evals && npm test
  env:
    NODE_ENV: test
```

The CI gate requires all 410+ checks to pass. No partial passes.

## Common Mistakes

- **Running `npm test` from the repo root** instead of `evals/`. The command works only from `evals/`.
- **Adding a scenario file but forgetting the folder** (wrong naming convention → schema not found).
- **Changing `agents:` frontmatter but not updating `plans/project-context.md`** — companion rule fails.
- **Reordering P.A.R.T. sections** — Pass 4 fails immediately.
- **Treating eval failures as "optional"** — CI uses the same command; a local failure is a CI failure.

## Exercises

1. **(beginner)** Run `cd evals && npm test`. How many checks pass? Check `evals/out.txt` for the last run.
2. **(beginner)** Open `evals/scenarios/` — how many agent folders are there?
3. **(intermediate)** Add a `ABSTAIN` verdict scenario for PlanAuditor. What JSON fields are required?
4. **(intermediate)** What companion rule exists for `Orchestrator.agent.md`? Find the rule in `drift-checks.mjs`.
5. **(advanced)** Write a test for a new `needs_replan` scenario for BrowserTester. What fields are required in the schema?

## Review Questions

1. How many checks does the full eval suite run?
2. Can the eval harness make LLM calls?
3. What does Pass 4 check?
4. How many steps are needed to add a new agent to the repo?
5. What command do you run before declaring a change "done"?

## See Also

- [Chapter 04 — P.A.R.T. Specification](04-part-spec.md)
- [Chapter 09 — Schemas](09-schemas.md)
- [Chapter 10 — Governance](10-governance.md)
- [evals/README.md](../../evals/README.md)
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
