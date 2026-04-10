# OMX Adoption Decision Record

Audit date: 2026-04-09
Source project: oh-my-codex (OMX) v0.12.4 — `E:\WORK\Github\oh-my-codex-main`

## Purpose

Document which oh-my-codex patterns ControlFlow should adopt, adapt, or reject, with evidence-based rationale tied to named ControlFlow files. This record prevents scope drift during implementation and serves as the authoritative reference for future OMX-inspired proposals.

## Evidence Baseline

### OMX artifacts reviewed

| Surface | Key files |
|---|---|
| Prompt governance | `docs/guidance-schema.md`, `docs/prompt-guidance-contract.md` |
| Workflow skills | `skills/deep-interview/SKILL.md`, `skills/ralplan/SKILL.md`, `skills/team/SKILL.md` |
| State management | `src/mcp/state-paths.ts`, `src/mcp/state-server.ts`, `src/mcp/memory-server.ts` |
| Hooks and integration | `docs/codex-native-hooks.md`, `docs/hooks-extension.md`, `src/config/codex-hooks.ts` |
| Setup and operations | `src/cli/setup.ts`, `src/cli/doctor.ts`, `skills/doctor/SKILL.md`, `skills/omx-setup/SKILL.md` |
| Team runtime | `skills/team/SKILL.md`, `docs/interop-team-mutation-contract.md`, `src/team/contracts.ts` |
| AGENTS contract | `AGENTS.md`, `templates/AGENTS.md` |

### ControlFlow anchors

| Surface | Key files |
|---|---|
| Prompt structure | `docs/agent-engineering/PART-SPEC.md` |
| Shared policy | `.github/copilot-instructions.md` |
| Orchestration | `Orchestrator.agent.md`, `Planner.agent.md` |
| Governance | `governance/tool-grants.json`, `governance/runtime-policy.json` |
| Validation | `evals/validate.mjs`, `evals/README.md` |
| Continuity | `NOTES.md`, plan artifacts in `plans/` |
| Project context | `plans/project-context.md` |

## Adoption Matrix

### ADOPT NOW — low coupling, high value

#### 1. Prompt Behavior Contract

| Field | Value |
|---|---|
| OMX evidence | `docs/prompt-guidance-contract.md` defines 4 core behavioral rules enforced across all prompt surfaces with regression tests |
| ControlFlow gap | P.A.R.T covers structure (section order); no complementary document governs behavioral consistency (quality-first output, automatic follow-through, scoped overrides, evidence-backed completion) |
| ControlFlow target | `docs/agent-engineering/PROMPT-BEHAVIOR-CONTRACT.md` (new) |
| Affected files | `.github/copilot-instructions.md`, `Planner.agent.md`, `Orchestrator.agent.md`, `Researcher-subagent.agent.md`, `CodeMapper-subagent.agent.md` |
| Coupling risk | None — additive document beside PART-SPEC; no runtime dependency |

#### 2. Behavior-Regression Tests

| Field | Value |
|---|---|
| OMX evidence | `src/hooks/__tests__/prompt-guidance-contract.test.ts` and related test files verify prompt behavior fragments against the contract document |
| ControlFlow gap | `evals/validate.mjs` checks structural integrity only (schemas, references, P.A.R.T order, tool grants); no checks for prompt-behavior drift |
| ControlFlow target | `evals/tests/prompt-behavior-contract.test.mjs`, `evals/tests/orchestration-handoff-contract.test.mjs` (new) |
| Affected files | `evals/package.json`, `evals/README.md` |
| Coupling risk | None — Node test:test layer alongside existing validate.mjs |

#### 3. Onboarding Layering and Operator Preflight

| Field | Value |
|---|---|
| OMX evidence | `README.md` separates happy-path onboarding from operator surfaces; `skills/doctor/SKILL.md` provides installation diagnostics |
| ControlFlow gap | `README.md` Installation section is a flat list with no first-run path or troubleshooting guide |
| ControlFlow target | `docs/agent-engineering/OPERATOR-PREFLIGHT.md` (new), `README.md` (modify) |
| Coupling risk | None — documentation only |

#### 4. Artifact-Backed Handoff Discipline

| Field | Value |
|---|---|
| OMX evidence | `skills/deep-interview/SKILL.md` and `skills/ralplan/SKILL.md` require context snapshots in `.omx/context/` and spec artifacts in `.omx/specs/` before execution handoff |
| ControlFlow gap | Planner creates plan artifacts and Orchestrator owns PLAN_REVIEW, but the clarify→plan→execute discipline is implicit rather than contractually stated |
| ControlFlow target | Formalize in `PROMPT-BEHAVIOR-CONTRACT.md` and reinforce in `Planner.agent.md` handoff guidance |
| Coupling risk | None — aligns with existing architecture |

### ADAPT LATER — useful concept, premature implementation

#### 5. Durable State Root

| Field | Value |
|---|---|
| OMX evidence | `.omx/state/` with session-scoped resolution, single authoritative writer, and MCP read/write tools (`src/mcp/state-paths.ts`) |
| ControlFlow current | `NOTES.md` + plan artifacts in `plans/` + `governance/runtime-policy.json` |
| Defer rationale | ControlFlow has no CLI or runtime that owns a hidden state directory. Adding one without a runtime to manage it creates orphan state. Revisit only if `NOTES.md` continuity proves insufficient in practice |
| Portable principles | Single authoritative state writer, session-scoped resolution, non-destructive resume checks |

#### 6. Bootstrap/Doctor Scripts

| Field | Value |
|---|---|
| OMX evidence | `src/cli/setup.ts` (8-step install), `src/cli/doctor.ts` (6-check diagnostic) |
| ControlFlow current | Manual copy + reload per `README.md` Installation section |
| Defer rationale | ControlFlow is not yet a packaged tool. A script that manages user-home config or .codex/ directories would be premature. Documentation-only preflight covers the same diagnostic need with less maintenance cost |
| Portable principles | Directory existence checks, required-file validation, legacy-artifact cleanup |

### REJECT — architectural collision or ControlFlow-incompatible

#### 7. Keyword-Triggered Workflow Activation

| Field | Value |
|---|---|
| OMX evidence | `AGENTS.md` keyword_detection table routes 17+ keyword families to workflow skills |
| Collision | ControlFlow uses explicit agent entry points (`@Planner`, `@Orchestrator`, `@Researcher`, `@CodeMapper`) with deterministic routing. Keyword activation would create ambiguous routing paths and conflict with Orchestrator's conductor role |
| ControlFlow files preserved | `.github/copilot-instructions.md` entry-point table, `plans/project-context.md` agent entry points |

#### 8. Native Codex Hook Wiring

| Field | Value |
|---|---|
| OMX evidence | `docs/codex-native-hooks.md` mapping matrix, `.codex/hooks.json` ownership, `src/config/codex-hooks.ts` |
| Collision | ControlFlow runs inside VS Code Copilot agent context which has no equivalent shell lifecycle hooks. Codex hook event names (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`) have no VS Code analogs |
| ControlFlow files preserved | Agent frontmatter `tools:` lists, `governance/tool-grants.json` |

#### 9. tmux/psmux Team Runtime

| Field | Value |
|---|---|
| OMX evidence | `skills/team/SKILL.md`, `src/team/contracts.ts`, `docs/interop-team-mutation-contract.md` |
| Collision | ControlFlow already coordinates agents inside VS Code's subagent model with wave-based parallel dispatch. tmux panes, worktree management, and direct team-state mutation APIs add operational mass without improving the existing coordination model |
| ControlFlow files preserved | `Orchestrator.agent.md` wave execution, `plans/project-context.md` executor agent set |

#### 10. Exact-Model Prompt Branching

| Field | Value |
|---|---|
| OMX evidence | `docs/prompt-guidance-contract.md` exact-model mini adaptation seam, gated on `gpt-5.4-mini` string equality |
| Collision | ControlFlow declares model recommendations per agent in `plans/project-context.md` but does not compose prompts conditionally based on resolved model strings. Adding model-gated prompt branches would create brittle maintenance without a runtime that controls model resolution |
| ControlFlow files preserved | `plans/project-context.md` Model Recommendation column |

#### 11. OMX Parity Scorecard

| Field | Value |
|---|---|
| OMX evidence | `COVERAGE.md` project-history artifact |
| Collision | A parity scorecard is an OMX-specific roadmap tracking tool. ControlFlow already tracks compliance via `docs/agent-engineering/COMPLIANCE-GAPS.md` which is tied to the 9-item P.A.R.T checklist |
| ControlFlow files preserved | `docs/agent-engineering/COMPLIANCE-GAPS.md` |

## Standing Policy

Future proposals to adopt OMX patterns must:
1. Map to a named ControlFlow file or gap.
2. Demonstrate that the pattern works without Codex CLI, tmux, native hooks, or user-home config.
3. Not duplicate functionality already covered by P.A.R.T, PLAN_REVIEW, or the existing governance stack.
4. Be classified as ADOPT, ADAPT, or REJECT in this record before implementation begins.
