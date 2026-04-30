# Changelog

All notable changes to the `controlflow-codex` plugin are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-04-30

### Added

- `controlflow-executability-verifier/references/executability-checklist.md` — extracted the 8-point cold-start checklist, TDD walk-through, and blocker classification table from `SKILL.md` into a proper reference document.
- `controlflow-planning/references/llm-behavior-guidelines.md` — Codex-adapted port of the main project's behavioral guardrails (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution).
- `controlflow-orchestration/references/tdd-patterns.md` — port of the main project's RED -> GREEN -> REFACTOR discipline and test quality signals.
- `controlflow-review/references/security-review-discipline.md` — confidence threshold (>80%), exclusion list, and focus areas for the security-review pass.
- `README.md` — top-level link to the section in the main repository README; skills listed as a table with Codex invocation syntax; explicit installation command block.
- Cross-references between skills so `controlflow-plan-audit`, `controlflow-orchestration`, and `controlflow-review` can load the new behavioral, TDD, and security references.

### Changed

- `controlflow-executability-verifier/SKILL.md` — workflow steps now point to `references/executability-checklist.md` instead of inlining the checklist.
- Plugin manifest version bumped from `0.2.0` to `0.3.0`.

### Notes

- No breaking changes for existing plan or review artifacts; all template paths and section names are unchanged.
- VS Code-specific governance (`governance/model-routing.json`, `agent-grants.json`, P.A.R.T section validator, eval suite) is intentionally still **not** ported — Codex handles model routing and tool grants natively.

## [0.2.0] - prior

- Strict workflow entry point added (`controlflow-strict-workflow`).
- Pre-execution review pipeline: `controlflow-plan-audit`, `controlflow-assumption-verifier`, `controlflow-executability-verifier`.
- Strict planner output contract and ControlFlow-shaped Markdown plan template.
- Local artifact validator (`scripts/validate-strict-artifacts.ps1`).
- Home-local installer (`scripts/install-home-local.ps1`).

## [0.1.0] - initial

- Initial portable skills: `controlflow-router`, `controlflow-planning`, `controlflow-orchestration`, `controlflow-review`, `controlflow-memory-hygiene`.
- Codex plugin manifest scaffold under `.codex-plugin/plugin.json`.
