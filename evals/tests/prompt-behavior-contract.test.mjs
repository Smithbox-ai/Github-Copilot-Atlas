/**
 * ControlFlow — Prompt Behavior Contract Regression Tests
 *
 * Verifies that agent prompt files preserve behavioral invariants
 * defined in docs/agent-engineering/PROMPT-BEHAVIOR-CONTRACT.md.
 *
 * These tests complement validate.mjs (structural) by checking
 * behavioral consistency: evidence discipline, follow-through,
 * abstention rules, and output contracts.
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

function readAgent(name) {
  return readFileSync(join(ROOT, `${name}.agent.md`), 'utf8');
}

function readShared() {
  return readFileSync(join(ROOT, '.github', 'copilot-instructions.md'), 'utf8');
}

// ──────────────────────────────────────────────
// Planner behavioral invariants
// ──────────────────────────────────────────────
console.log('\n=== Planner — Behavioral Invariants ===');
{
  const src = readAgent('Planner');

  // Confidence threshold gate
  check(
    'Confidence threshold: ABSTAIN or REPLAN when below 0.9',
    /confidence.*0\.9/i.test(src) && /ABSTAIN|REPLAN_REQUIRED/i.test(src)
  );

  // Mandatory workflow gates (sequential order)
  check(
    'Mandatory gate: Idea Interview Gate present',
    /Idea Interview Gate/i.test(src)
  );
  check(
    'Mandatory gate: Clarification Gate present',
    /Clarification Gate/i.test(src)
  );
  check(
    'Mandatory gate: Semantic Risk Discovery Gate present',
    /Semantic Risk Discovery Gate/i.test(src)
  );
  check(
    'Mandatory gate: Complexity Gate present',
    /Complexity Gate/i.test(src)
  );

  // Gate ordering: Idea Interview < Clarification < Semantic Risk < Complexity
  const ideaIdx = src.search(/Idea Interview Gate/i);
  const clarIdx = src.search(/Clarification Gate/i);
  const riskIdx = src.search(/Semantic Risk Discovery Gate/i);
  const compIdx = src.search(/Complexity Gate/i);
  check(
    'Gate ordering: Idea Interview → Clarification → Semantic Risk → Complexity',
    ideaIdx < clarIdx && clarIdx < riskIdx && riskIdx < compIdx
  );

  // Artifact-before-response contract
  check(
    'Output contract: artifact file created before chat response',
    /create the markdown plan file first/i.test(src) ||
    /plan file.*before.*chat/i.test(src) ||
    /do not produce any chat output until the file is saved/i.test(src)
  );

  // Chat-after-artifact: no inline plan content in chat
  check(
    'Output contract: chat must not contain inline plan breakdowns',
    /must NOT contain inline phase breakdowns/i.test(src) ||
    /concise handoff message/i.test(src)
  );

  // Quality standards: incremental, TDD, specific, testable, practical
  check(
    'Quality standards: Incremental + TDD + Specific + Testable + Practical',
    /Incremental/i.test(src) && /TDD/i.test(src) && /Specific/i.test(src) &&
    /Testable/i.test(src) && /Practical/i.test(src)
  );

  // Phase count bounds (3–10)
  check(
    'Phase count bounds: 3–10 enforced',
    /phase count.*3.*10|3[–-]10/i.test(src)
  );

  // Semantic risk heuristics should anchor to the canonical taxonomy source.
  check(
    'Semantic risk taxonomy: Planner points to project-context canonical source',
    /plans\/project-context\.md/i.test(src) && /Semantic Risk Taxonomy/i.test(src)
  );

  // All 7 semantic risk categories required
  check(
    'Semantic risk: all 7 categories referenced or delegated to canonical taxonomy',
    (
      /data_volume/i.test(src) && /performance/i.test(src) &&
      /concurrency/i.test(src) && /access_control/i.test(src) &&
      /migration_rollback/i.test(src) && /dependency/i.test(src) &&
      /operability/i.test(src)
    ) || /plans\/project-context\.md.*Semantic Risk Taxonomy|Semantic Risk Taxonomy.*plans\/project-context\.md/i.test(src)
  );

  const complexityGateSection = src.match(/4\. Complexity Gate:[\s\S]*?5\. Skill Selection:/i)?.[0] ?? '';

  check(
    'Complexity gate: Planner emits complexity_tier but defers tier routing to Orchestrator/runtime-policy',
    /complexity_tier/i.test(complexityGateSection) &&
    /Orchestrator/i.test(complexityGateSection) &&
    /runtime-policy\.json/i.test(complexityGateSection) &&
    /LARGE[\s\S]*mandatory Researcher pre-research phase/i.test(complexityGateSection) &&
    !/MEDIUM[\s\S]*(PlanAuditor|AssumptionVerifier|ExecutabilityVerifier|full review|iteration)/i.test(complexityGateSection) &&
    !/LARGE[\s\S]*(PlanAuditor|AssumptionVerifier|ExecutabilityVerifier|full review|all agents active|iteration)/i.test(complexityGateSection)
  );

  // Terminal states still produce artifacts
  check(
    'Terminal states: ABSTAIN and REPLAN_REQUIRED must produce plan file',
    /ABSTAIN.*REPLAN_REQUIRED.*must produce.*plan file|Both.*ABSTAIN.*REPLAN_REQUIRED.*MUST produce/i.test(src)
  );

  // No ABSTAIN without clarification attempt
  check(
    'ABSTAIN discipline: clarification must be attempted first',
    /do not return.*ABSTAIN.*without.*clarification/i.test(src)
  );
}

// ──────────────────────────────────────────────
// Researcher behavioral invariants
// ──────────────────────────────────────────────
console.log('\n=== Researcher — Behavioral Invariants ===');
{
  const src = readAgent('Researcher-subagent');

  // Every claim requires evidence with file/line
  check(
    'Evidence discipline: every claim requires file/line evidence',
    /every claim.*evidence/i.test(src) && /file.*line/i.test(src)
  );

  // ABSTAIN on insufficient evidence
  check(
    'ABSTAIN: required when evidence is insufficient',
    /insufficient.*ABSTAIN|ABSTAIN.*insufficient/i.test(src) ||
    /evidence.*insufficient.*ABSTAIN/i.test(src)
  );

  // No speculative inference
  check(
    'No speculation: facts separated from hypotheses',
    /separate.*facts.*hypotheses|speculative/i.test(src)
  );

  // Status enum bounded to 3 values
  check(
    'Status enum: COMPLETE, ABSTAIN, INSUFFICIENT_EVIDENCE only',
    /COMPLETE/i.test(src) && /ABSTAIN/i.test(src) && /INSUFFICIENT_EVIDENCE/i.test(src)
  );

  // Convergence: 2+ sources required
  check(
    'Convergence: 2+ independent sources required',
    /2\+.*sources.*agree|2\+.*independent.*sources/i.test(src)
  );
}

// ──────────────────────────────────────────────
// CodeMapper behavioral invariants
// ──────────────────────────────────────────────
console.log('\n=== CodeMapper — Behavioral Invariants ===');
{
  const src = readAgent('CodeMapper-subagent');

  // Read-only constraint
  check(
    'Read-only: no file edits, no command execution',
    /read.only/i.test(src) && /no.*edit/i.test(src)
  );

  // Parallel-first search mandate (3–10)
  check(
    'Parallel-first: 3–10 independent searches before sequential reads',
    /parallel.*3.*10|3[–-]10.*parallel|parallel batch.*3/i.test(src) ||
    (/parallel/i.test(src) && /3.*search/i.test(src))
  );

  // PreFlect evaluation before output
  check(
    'PreFlect: evaluation required before returning discovery report',
    /PreFlect/i.test(src)
  );

  // ABSTAIN on contradictory/insufficient results
  check(
    'ABSTAIN: required on contradictory or insufficient results',
    /ABSTAIN/i.test(src) && /contradict|insufficient/i.test(src)
  );

  // No speculative claims
  check(
    'No speculation: no claims without references',
    /speculative.*claim|no.*claim.*without.*ref/i.test(src)
  );
}

// ──────────────────────────────────────────────
// Shared policy behavioral invariants
// ──────────────────────────────────────────────
console.log('\n=== Shared Policy — Behavioral Invariants ===');
{
  const src = readShared();

  // Failure classification: all 4 categories present
  check(
    'Failure classification: transient, fixable, needs_replan, escalate',
    /transient/i.test(src) && /fixable/i.test(src) &&
    /needs_replan/i.test(src) && /escalate/i.test(src)
  );

  // Structured text output (no raw JSON in chat)
  check(
    'Output format: structured text, no raw JSON in chat',
    /do NOT output raw JSON/i.test(src)
  );

  // NOTES.md maintenance required
  check(
    'NOTES.md: persistent state maintenance required',
    /NOTES\.md/i.test(src) && /persistent state/i.test(src)
  );

  // P.A.R.T section order enforced
  check(
    'P.A.R.T: Prompt → Archive → Resources → Tools order enforced',
    /Prompt.*Archive.*Resources.*Tools/i.test(src)
  );

  // Complexity tiers defined
  check(
    'Complexity tiers: TRIVIAL / SMALL / MEDIUM / LARGE',
    /TRIVIAL/i.test(src) && /SMALL/i.test(src) &&
    /MEDIUM/i.test(src) && /LARGE/i.test(src)
  );
}

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Behavior Contract: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);
console.log(`${'═'.repeat(50)}\n`);

if (failed > 0) {
  console.log('Behavior contract regression detected ❌');
  process.exit(1);
} else {
  console.log('All behavior contract checks passed ✅');
  process.exit(0);
}
