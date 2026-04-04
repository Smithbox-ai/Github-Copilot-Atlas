# Active Notes

## Current Task
**Atlas Comprehensive Modernization & Refactoring** — bishx-inspired upgrade

## Scope Boundaries
- All 14 items from comparative analysis (8 recommendations + 6 improvements)
- New agents: Skeptic-subagent, DryRun-subagent
- Architecture decisions: Skeptic as separate agent (not Challenger expansion), 5-iteration max loop, all items in scope

## Plan Assumptions
- VS Code Copilot Agent Mode does not support dynamic model routing (static `model:` frontmatter)
- All schema modifications are additive-only (backward compatible)
- Executor agent for all phases: Sisyphus-subagent (markdown/JSON/JS work)
- Template externalization saves ~800-900 tokens per Atlas invocation

## Unresolved Questions
- Behavioral eval semantic testing requires external eval runner (LangSmith/Braintrust) — structural checks only in v1
- Skill library growth/review process TBD
- Adaptive model routing deferred until platform supports dynamic dispatch
- Token budget net impact needs post-implementation analysis

## Plan File
`plans/atlas-modernization-plan.md` — 9 phases, 4 waves
