/**
 * ControlFlow — Orchestration Handoff Contract Regression Tests
 *
 * Verifies that the Orchestrator agent preserves handoff discipline,
 * review gating, escalation thresholds, and delegation routing invariants.
 *
 * Separate from prompt-behavior-contract tests because handoff discipline
 * is concentrated in a single agent (Orchestrator) with complex state-machine
 * requirements that justify dedicated coverage.
 *
 * Exit 0 on all checks passed, exit 1 on any failure.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function check(label, ok) {
  if (ok) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

const orch = readFileSync(join(ROOT, 'Orchestrator.agent.md'), 'utf8');

// ──────────────────────────────────────────────
// PLAN_REVIEW gate invariants
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — PLAN_REVIEW Gate ===');

// No implicit approval from Planner handoff
check(
  'Handoff ≠ approval: plan_path does not bypass PLAN_REVIEW',
  /plan.*artifact.*not.*implicit.*approval|plan_path.*does not bypass/i.test(orch)
);

// Four-way OR trigger conditions
check(
  'Trigger: ≥ min_phases phases condition present',
  /min_phases|≥.*phases/i.test(orch)
);
check(
  'Trigger source: runtime-policy is authoritative for PLAN_REVIEW gate conditions',
  /authoritative source.*runtime-policy\.json.*plan_review_gate_trigger_conditions|runtime-policy\.json.*plan_review_gate_trigger_conditions.*authoritative/i.test(orch)
);
check(
  'Trigger: confidence < threshold condition present',
  /confidence.*threshold|confidence.*0\.9/i.test(orch)
);
check(
  'Trigger: destructive/high-risk scope condition present',
  /destructive.*high.risk|high.risk.*operations/i.test(orch)
);
check(
  'Trigger: risk_review HIGH + unresolved condition present',
  /risk_review.*HIGH|HIGH.*disposition.*resolved/i.test(orch)
);

// ──────────────────────────────────────────────
// Complexity-aware delegation routing
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Complexity-Aware Routing ===');

check(
  'TRIVIAL: skips PLAN_REVIEW entirely',
  /TRIVIAL.*skip.*PLAN_REVIEW|TRIVIAL.*no.*PlanAuditor/i.test(orch)
);
check(
  'SMALL: PlanAuditor only, max 2 iterations',
  /SMALL.*PlanAuditor.*only|SMALL.*max 2/i.test(orch)
);
check(
  'MEDIUM: PlanAuditor + AssumptionVerifier parallel',
  /MEDIUM.*PlanAuditor.*AssumptionVerifier/i.test(orch)
);
check(
  'LARGE: full pipeline — all 3 reviewers',
  /LARGE.*full pipeline|LARGE.*PlanAuditor.*AssumptionVerifier.*ExecutabilityVerifier/i.test(orch)
);

// ──────────────────────────────────────────────
// Iterative review loop constraints
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Review Loop ===');

// Max 5 iterations
check(
  'Review loop: max_iterations are sourced from runtime-policy tiers',
  /max_iterations_by_tier|up to `max_iterations`|iteration_index.*max_iterations/i.test(orch)
);
check(
  'Review loop source: State Machine defers detailed PLAN_REVIEW flow to Execution Protocol',
  /State Machine[\s\S]*Execution Protocol §4|detailed PLAN_REVIEW flow.*Execution Protocol|Execution Protocol section 4.*PLAN_REVIEW/i.test(orch)
);

// Convergence detection: 5% threshold
check(
  'Convergence: 5% improvement stagnation threshold',
  /5%.*improvement|improvement.*5%|stagnation/i.test(orch)
);

// Stagnation gate at 3+ iterations
check(
  'Stagnation: detected at iteration_index ≥ 3',
  /iteration_index.*3|iteration.*3.*stagnation|≥ 3/i.test(orch)
);

check(
  'Revision loop: sensitive or ambiguous changes fall back to full rerun',
  /full rerun/i.test(orch) &&
  /Planner\.agent\.md|Planner/i.test(orch) &&
  /Orchestrator\.agent\.md|Orchestrator/i.test(orch) &&
  /runtime-policy\.json/i.test(orch) &&
  /review routing/i.test(orch) &&
  /verification commands/i.test(orch) &&
  /policy surfaces/i.test(orch) &&
  /phase structure/i.test(orch) &&
  /task or file paths|task\/file paths|file paths/i.test(orch) &&
  /contracts/i.test(orch) &&
  /risk_review/i.test(orch) &&
  /complexity_tier/i.test(orch) &&
  /executability-bearing/i.test(orch) &&
  /ambiguous/i.test(orch)
);

check(
  'Revision loop: selective rerun is limited to reviewer-local wording or evidence citations only',
  /selective rerun/i.test(orch) &&
  /reviewer-local summary wording/i.test(orch) &&
  /evidence-citation text only/i.test(orch) &&
  /no changes to plan artifacts, prompts, policy surfaces, tests, routing, commands|no plan\/prompt\/policy\/test\/routing\/command changes/i.test(orch)
);

check(
  'Revision loop: closed-world reruns default to full rerun outside the narrow exception',
  /does not match the narrow selective exception exactly|if a revision does not match.*selective exception.*full rerun|closed-world rule/i.test(orch)
);

check(
  'Revision loop: ExecutabilityVerifier is never bypassed when current tier or risk override keeps it in scope',
  /ExecutabilityVerifier/i.test(orch) &&
  /never bypass/i.test(orch) &&
  /current tier/i.test(orch) &&
  /risk override/i.test(orch) &&
  /in scope/i.test(orch)
);

// ──────────────────────────────────────────────
// Failure classification and escalation
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Failure Handling ===');

// All 4 failure classifications with routing
check(
  'Failure routing: transient → retry (budget 3)',
  /transient.*retry|transient.*3/i.test(orch)
);
check(
  'Failure routing: fixable → retry with fix hint (budget 1)',
  /fixable.*retry.*fix hint|fixable.*1/i.test(orch)
);
check(
  'Failure routing: needs_replan → delegate to Planner',
  /needs_replan.*Planner|needs_replan.*replan/i.test(orch)
);
check(
  'Failure routing: escalate → STOP + WAITING_APPROVAL',
  /escalate.*STOP|escalate.*WAITING_APPROVAL/i.test(orch)
);

// 3-strike escalation policy
check(
  'Escalation: 3 failures with same classification → escalate to user',
  /same.*failure_classification.*escalate|fails 3 times.*same.*escalate/i.test(orch)
);

// ──────────────────────────────────────────────
// Phase verification checklist (blocking)
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Phase Verification ===');

check(
  'Phase verification: tests pass required',
  /Phase Verification.*Mandatory|tests pass/i.test(orch) && /Tests pass/i.test(orch)
);
check(
  'Phase verification: build state PASS required',
  /build.*PASS|Build passes/i.test(orch)
);
check(
  'Phase verification: lint/problems clean required',
  /lint.*clean|problems clean/i.test(orch)
);
check(
  'Phase verification: review APPROVED required',
  /review.*APPROVED/i.test(orch)
);

// ──────────────────────────────────────────────
// Todo lifecycle (blocking prerequisite)
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Todo Lifecycle ===');

check(
  'Todo-before-advance: todo marking is blocking prerequisite',
  /todo.*blocking prerequisite|no phase transition.*todo/i.test(orch)
);

// ──────────────────────────────────────────────
// Observability: trace ID propagation
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Observability ===');

check(
  'Trace ID: UUID v4 generated at task start',
  /trace_id.*UUID.*v4|trace_id.*uuid/i.test(orch)
);
check(
  'Trace ID: propagated to all gate events and delegations',
  /propagate.*gate.*event|propagate.*delegation/i.test(orch)
);

// ──────────────────────────────────────────────
// Delegation protocol: parallel dispatch
// ──────────────────────────────────────────────
console.log('\n=== Orchestrator — Delegation Protocol ===');

check(
  'Parallel dispatch: PlanAuditor + AssumptionVerifier dispatched in parallel',
  /PlanAuditor.*AssumptionVerifier.*parallel|parallel.*PlanAuditor.*AND.*AssumptionVerifier|dispatch.*parallel/i.test(orch)
);
check(
  'Sequential gating: ExecutabilityVerifier runs after PlanAuditor approval',
  /ExecutabilityVerifier[\s\S]*after[\s\S]*PlanAuditor|PlanAuditor[\s\S]*APPROVED[\s\S]*dispatch[\s\S]*ExecutabilityVerifier/i.test(orch)
);

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Orchestration Handoff: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);
console.log(`${'═'.repeat(50)}\n`);

if (failed > 0) {
  console.log('Orchestration handoff contract regression detected ❌');
  process.exit(1);
} else {
  console.log('All orchestration handoff checks passed ✅');
  process.exit(0);
}
