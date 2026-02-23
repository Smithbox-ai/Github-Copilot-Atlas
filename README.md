# Copilot Atlas (Fork)

> Modified fork of [bigguy345/Github-Copilot-Atlas](https://github.com/bigguy345/Github-Copilot-Atlas).

A multi-agent orchestration system for VS Code Copilot. This fork replaces vibe-based prompts with deterministic **P.A.R.T contracts** (Prompt → Archive → Resources → Tools), strict JSON Schema outputs, and reliability gates.

## Key Features

- **Context Conservation** — agents summarize and compress context at delegation boundaries to stay within token limits.
- **Parallel Agent Execution** — Atlas dispatches independent subagents in parallel when tasks have no dependencies.
- **Structured Planning** — Prometheus produces phased plans with explicit task IDs, dependencies, and acceptance criteria before any code is written.
- **Deterministic Handoffs** — every subagent returns a structured JSON report; Atlas validates schema compliance before accepting results.
- **Reliability Gates** — PreFlect (pre-execution review), human approval gates for destructive operations, and explicit abstention when confidence is low.
- **TDD Integration** — Code-Review and implementation agents enforce test-first methodology.

## Agent Architecture

### Primary Agents

| Agent | File | Model | Role |
|-------|------|-------|------|
| **Atlas** | `Atlas.agent.md` | Claude Sonnet 4.6 | Orchestrator, gate controller, delegation |
| **Prometheus** | `Prometheus.agent.md` | Claude Opus 4.6 | Planning-only, phased implementation plans |

### Specialized Subagents

| Agent | File | Model | Role |
|-------|------|-------|------|
| **Oracle** | `Oracle-subagent.agent.md` | GPT-5.3-Codex | Evidence-first research |
| **Explorer** | `Explorer-subagent.agent.md` | Gemini 3 Flash | Read-only codebase discovery |
| **Code-Review** | `Code-Review-subagent.agent.md` | GPT-5.3-Codex | Verification, safety gate reviewer |
| **Sisyphus** | `Sisyphus-subagent.agent.md` | Claude Sonnet 4.6 | Implementation with execution reports |
| **Frontend-Engineer** | `Frontend-Engineer-subagent.agent.md` | Gemini 3.1 Pro | Frontend implementation with execution reports |

## Reliability Model

Contracts are aligned to four dimensions:

1. **Consistency** — deterministic statuses and gate transitions.
2. **Robustness** — graceful behavior under paraphrase and naming drift.
3. **Predictability** — explicit abstention when confidence or evidence is low.
4. **Safety** — mandatory human approval gates for destructive and irreversible operations.

Reference: `docs/agent-engineering/RELIABILITY-GATES.md`.

## Usage

### Planning with Prometheus

Ask Prometheus to produce a structured plan for your task. Review the phased plan, approve it, then hand off to Atlas.

### Executing with Atlas

Atlas orchestrates phase execution: dispatches subagents, runs PreFlect gates before each batch, and requires human approval for high-risk operations. Continue phase-by-phase with explicit approvals where required.

### Direct Research with Oracle

For research-only tasks, invoke Oracle directly. It returns structured findings with evidence citations and confidence scores.

### Quick Exploration with Explorer

For fast codebase discovery, invoke Explorer. It performs parallel searches and returns a discovery report without modifying files.

## Workflow Example

```
User Request
    └── Prometheus (creates phased plan)
         └── Atlas (orchestrates execution)
              ├── Explorer (codebase discovery)
              ├── Oracle (research & evidence)
              ├── Sisyphus (implementation)
              ├── Frontend-Engineer (UI implementation)
              └── Code-Review (verification & safety)
```

## Installation

1. Clone this repository.
2. Copy `*.agent.md` files to your VS Code prompts directory.
3. Reload VS Code.

## Configuration

### VS Code Settings

```json
{
  "chat.customAgentInSubagent.enabled": true,
  "github.copilot.chat.responsesApiReasoningEffort": "high"
}
```

### Adding Custom Agents

**Quick method:** Create a new `.agent.md` file following the P.A.R.T structure (Prompt → Archive → Resources → Tools).

**Manual method:** Copy an existing agent file (e.g., `Sisyphus-subagent.agent.md`) and modify the sections for your use case.

Every custom agent should include:
- A JSON Schema output contract in `schemas/`.
- Non-Negotiable Rules (no fabrication, abstain on uncertainty).
- Explicit tool restrictions in the `## Tools` section.

## Requirements

- VS Code Insiders recommended.
- GitHub Copilot with custom agent support.

## What Changed (Fork vs Upstream)

### P.A.R.T Migration

- All 7 agents migrated from vibe-based prompts to deterministic P.A.R.T contracts.
- Strict JSON Schema 2020-12 output contracts for all agents.
- Planning vs Acting split made explicit.
- PreFlect gate added before execution batches.
- Human approval gates for destructive and irreversible operations.
- Context compaction and agentic memory policy standardized.

### Post-Migration Revision

- Restored delegation heuristics and routing templates for Atlas and Prometheus.
- Added parallel search mandates and merging protocols for Explorer.
- Restored uncertainty protocols and confidence criteria for Oracle.
- Added stopping rules and best practices for Sisyphus and Frontend-Engineer.
- Strengthened Code-Review verdict schema with explicit approval/rejection criteria.

### New Artifacts

**Governance docs:**
- `docs/agent-engineering/PART-SPEC.md`
- `docs/agent-engineering/RELIABILITY-GATES.md`
- `docs/agent-engineering/MIGRATION-CORE-FIRST.md`

**Schema contracts:**
- `schemas/atlas.gate-event.schema.json`
- `schemas/prometheus.plan.schema.json`
- `schemas/oracle.research-findings.schema.json`
- `schemas/explorer.discovery.schema.json`
- `schemas/code-review.verdict.schema.json`
- `schemas/sisyphus.execution-report.schema.json`
- `schemas/frontend.execution-report.schema.json`

**Eval fixtures:**
- `evals/README.md`
- `evals/scenarios/consistency-repeatability.json`
- `evals/scenarios/robustness-paraphrase.json`
- `evals/scenarios/predictability-abstain.json`
- `evals/scenarios/safety-approval-gate.json`
- `evals/scenarios/sisyphus-contract.json`
- `evals/scenarios/frontend-contract.json`

## Migration Status

Complete. All 7 agents have:
- P.A.R.T instruction architecture
- JSON Schema 2020-12 output contracts
- PreFlect and human approval gates
- Explicit abstention paths for low confidence
- Non-Negotiable Rules (no fabrication, no code generation without evidence)

> Core contracts prioritize strict schema outputs. This is a controlled breaking change for consumers expecting free-form output. See `docs/agent-engineering/MIGRATION-CORE-FIRST.md`.

## License

MIT License

Copyright (c) 2026 Copilot Atlas Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

This fork builds upon:
- [Github-Copilot-Atlas](https://github.com/bigguy345/Github-Copilot-Atlas)
- [copilot-orchestra](https://github.com/ShepAlderson/copilot-orchestra)
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
