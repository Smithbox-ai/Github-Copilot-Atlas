# Copilot Atlas

A multi-agent orchestration system for VS Code Copilot that enables complex software development workflows through intelligent agent delegation and parallel execution.

> Built upon the foundation of [copilot-orchestra](https://github.com/ShepAlderson/copilot-orchestra) by ShepAlderson, with agent naming conventions inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode).

> **Note:** Best supported on VS Code Insiders (as of January 2026) for access to the latest agent orchestration features.

## Overview

This repository contains custom agent prompts that work together to handle the complete software development lifecycle: **Planning → Implementation → Review → Commit**. The system uses a conductor-delegate pattern where a main orchestrator (Atlas) coordinates specialized subagents to efficiently tackle complex development tasks.

## Architecture

### Primary Agents

- **Atlas** (`Atlas.agent.md`) - The ORCHESTRATOR
  - **Model:** Claude Sonnet 4.5 (copilot)
  - Orchestrates the full development lifecycle
  - Delegates to specialized subagents for research, implementation, and review
  - Manages context conservation and parallel execution
  - Handles phase tracking and user approval gates

- **Prometheus** (`Prometheus.agent.md`) - The AUTONOMOUS PLANNER
  - **Model:** GPT-5.2 High (if reasoning set to high, check requirements block below)
  - Researches requirements and analyzes codebases
  - Writes comprehensive TDD-driven implementation plans
  - Automatically hands off to Atlas for execution
  - Supports parallel research across multiple subsystems

### Specialized Subagents

- **Oracle-subagent** (`Oracle-subagent.agent.md`) - THE RESEARCHER
  - **Model:** GPT-5.2 (copilot)
  - Gathers comprehensive context about tasks
  - Can delegate to Explorer for large-scope research
  - Returns structured findings to parent agents
  - Supports parallel research across independent subsystems

- **Sisyphus-subagent** (`Sisyphus-subagent.agent.md`) - THE IMPLEMENTER
  - **Model:** Claude Sonnet 4.5 (copilot)
  - Executes implementation following strict TDD principles
  - Writes tests first, then minimal code to pass
  - Handles linting and formatting
  - Can be invoked in parallel for disjoint features

- **Explorer-subagent** (`Explorer-subagent.agent.md`) - THE SCOUT
  - **Model:** Gemini 3 Flash (Preview) (copilot)
  - Rapid file/usage discovery across codebases
  - Read-only exploration (no edits/commands)
  - Returns structured results with file lists and analysis
  - MANDATORY parallel search strategy (3-10 simultaneous searches)

- **Code-Review-subagent** (`Code-Review-subagent.agent.md`) - THE REVIEWER
  - **Model:** GPT-5.2 (copilot)
  - Reviews code for correctness, quality, and test coverage
  - Returns structured feedback (APPROVED/NEEDS_REVISION/FAILED)
  - Can be invoked in parallel for independent phases
  - Focus on blocking issues vs nice-to-haves

- **Frontend-Engineer-subagent** (`Frontend-Engineer-subagent.agent.md`) - THE UI/UX SPECIALIST
  - **Model:** Gemini 3 Pro (Preview) (copilot)
  - Implements user interfaces, styling, and responsive layouts
  - Expert in modern frontend frameworks and tooling
  - Follows TDD principles for frontend (component tests first)
  - Focuses on accessibility and responsive design

## Key Features

### � Context Conservation: The Game Changer

**Why This Matters:** Traditional single-agent approaches force one model to handle everything—research, implementation, review, documentation—all within a limited context window. This quickly exhausts precious tokens on context that could be used for your actual code.

**How Copilot Atlas Solves It:** By delegating tasks to specialized subagents, we radically improve context efficiency:

- **Researcher agents** (Oracle, Explorer) read and analyze large codebases, returning only high-signal summaries—not the raw 50,000 lines of code
- **Implementer agents** (Sisyphus) focus solely on the files they're modifying, not rereading the entire project architecture
- **Reviewer agents** (Code-Review) examine only changed files, not context from the research phase
- **The Conductor** (Atlas) orchestrates everything without ever touching the bulk of your codebase

**The Result:** What would take 80-90% of a monolithic agent's context now takes 10-15%, leaving 70-80% more tokens for deeper analysis, better reasoning, and faster iterations.

---

### 🔄 Parallel Agent Execution
- Launch multiple subagents simultaneously for independent tasks
- Explorer: 3-10 parallel searches in first batch
- Oracle: Parallel research across multiple subsystems
- Sisyphus: Parallel implementation for disjoint features
- Maximum 10 parallel agents per phase

### 🧪 Test-Driven Development
- Every phase follows red-green-refactor cycle
- Tests written first, run to fail, then minimal code
- Explicit test → code → test steps in all plans
- No manual testing unless explicitly requested

### 🤝 Proper Agent Handoffs
- VS Code Custom Agent handoff configuration
- Prometheus → Atlas automatic handoff option
- Each agent can declare available delegations
- Clear handoff workflow with user approval gates

### 📋 Structured Planning
- Atlas-compatible plan format
- 3-10 incremental, self-contained phases
- Open questions with options/recommendations
- Risk assessment and mitigation strategies

## Installation

1. **Clone or download this repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/copilot-atlas.git
   ```

2. **Copy agent files to VS Code User prompts directory:**
   - **Windows:** `%APPDATA%\Code\User\prompts\` (or `%APPDATA%\Code - Insiders\User\prompts\` if using Insiders)
   - **macOS:** `~/Library/Application Support/Code/User/prompts/` (or `~/Library/Application Support/Code - Insiders/User/prompts/` if using Insiders)
   - **Linux:** `~/.config/Code/User/prompts/` (or `~/.config/Code - Insiders/User/prompts/` if using Insiders)

3. **Reload VS Code** to recognize the new agents

## Usage

### Planning a Feature with Prometheus

```
Plan a comprehensive implementation for adding user authentication to the app
```

Prometheus will:
1. Research the codebase (delegating to Explorer/Oracle as needed)
2. Write a detailed TDD plan with 3-10 phases
3. Offer to invoke Atlas automatically or let you review first

### Executing a Plan with Atlas

```
Implement the plan devised by Promethus
```

OR: Accept the hand-off from Prometheus by clicking `Start implementation with Atlas`


Atlas will:
1. Review the plan
2. Delegate Phase 1 implementation to Sisyphus
3. Delegate review to Code-Review
4. Present results and wait for commit approval
5. Continue through all phases

### Direct Research with Oracle

```
Let @Oracle research how the database layer is structured
```

Oracle will:
1. Delegate to Explorer for file discovery (if >10 files)
2. Analyze key files and patterns
3. Return structured findings

### Quick Exploration with Explorer

```
Let @Explorer find all files related to authentication
```

Explorer will:
1. Launch 3-10 parallel searches immediately
2. Read necessary files to confirm relationships
3. Return structured results with file list and analysis

## Workflow Example

```
User: Prometheus, plan adding a user dashboard feature

Prometheus:
  ├─ @Explorer (find UI components)
  ├─ @Oracle (research data fetching patterns)
  ├─ @Oracle (research state management)
  └─ Writes plan → Offers to invoke Atlas

User: Yes, invoke Atlas

Prometheus:
  └─ Atlas, implement the plan...

Atlas: Phase 1/4 - Test Infrastructure
  └─ @Sisyphus Implement Phase 1
      ├─ Writes tests (fail)
      ├─ Writes minimal code
      └─ Tests pass ✓

Atlas: Reviewing Phase 1
  └─ @Code-Review Review Phase 1
      └─ Status: APPROVED ✓

Atlas: Phase 1 complete! [commit message provided]
```

## Configuration

### Plan Directory
Agents check for plan directory configuration:
1. Look for `AGENTS.md` file in workspace
2. Find plan directory specification (e.g., `.sisyphus/plans`)
3. Default to `plans/` if not specified

### Tool Requirements
All agents declare their required tools in YAML frontmatter:
- `agent` - For delegating to other agents
- `edit` - File editing capabilities
- `search` - Semantic/grep search
- `runCommands/runTasks` - Terminal execution
- etc.

### Handoff Declarations
Prometheus declares its handoff to Atlas:
```yaml
handoff:
  - label: Start implementation with Atlas
    agent: Atlas
    prompt: Implement the plan
```

### Adding Custom Agents

You can extend the Atlas and Promethus agents with your own specialized agents for domain-specific tasks (e.g., database experts, API specialists, security reviewers, etc.).

#### Quick Method: Let the AI Do It

The fastest way to add a custom agent is to simply ask:

```
@Atlas Create a new subagent called Database-Expert that specializes in SQL optimization, schema design, and query analysis. Integrate it with Prometheus and Atlas so they can delegate database-related tasks to it.
```

Atlas will:
1. Create the agent file with proper YAML frontmatter
2. Add it to Prometheus's research delegation list
3. Add it to Atlas's implementation delegation list
4. Update documentation

#### Manual Method: Step-by-Step

**1. Create Your Agent File**

Create a new file in your prompts directory: `YourAgent-subagent.agent.md`

```yaml
---
description: 'Brief description of what this agent does'
argument-hint: What kind of task to delegate (e.g., "Analyze database schema")
tools: ['search', 'usages', 'edit', 'runCommands', ...]  # Tools your agent needs
model: Claude Sonnet 4.5 (copilot)  # Or GPT-5.2, Gemini, etc.
---

You are a [ROLE] SUBAGENT called by a parent CONDUCTOR agent.

**Your specialty:** [Describe the domain expertise]

**Your scope:** [Define what tasks this agent handles]

**Core workflow:**
1. [Step 1 of your agent's process]
2. [Step 2 of your agent's process]
3. [Return structured findings/results]

[Add any additional instructions, constraints, or examples]
```

**2. Integrate with Prometheus** (for research tasks)

Edit `Prometheus.agent.md` and add your agent to the research delegation section:

```markdown
**YourAgent-subagent**:
- Provide a clear research goal related to [domain]
- Instruct to analyze [specific aspects]
- Tell them to return structured findings
```

Also add to Prometheus's constraints if it shouldn't delegate to your agent:
```markdown
- You CAN delegate to YourAgent-subagent for [domain] research
```

**3. Integrate with Atlas** (for implementation/review tasks)

Edit `Atlas.agent.md`:

a. Add to the subagent list at the top:
```markdown
6. YourAgent-subagent: THE [ROLE]. Expert in [domain expertise]
```

b. Add to the subagent instructions section:
```markdown
**YourAgent-subagent**:
- Use #runSubagent to invoke for [task type] tasks
- Provide [specific context needed]
- Instruct to follow [workflow/principles]
- Remind them to report back with [expected output]
```

**4. Test Your Integration**

Try invoking your agent:
```
Let @YourAgent analyze the current database schema
```

Or through Atlas:
```
@Atlas Use YourAgent to optimize our SQL queries in the user service
```

**5. Document Usage** (Optional)

Add an entry to the README's Specialized Subagents section describing when to use your custom agent.

#### Best Practices for Custom Agents

- **Single Responsibility**: Each agent should have one clear domain of expertise
- **Clear Scope**: Define exactly what the agent does and doesn't handle
- **Model Selection**: Choose the right model for the task (Sonnet for complex reasoning, Flash for speed, GPT for research)
- **Tool Minimalism**: Only declare tools the agent actually needs
- **Return Format**: Always return structured findings (not raw dumps)
- **Parallel-Aware**: Consider if your agent can run in parallel with others

#### Example Custom Agents

- **Security-Auditor**: Reviews code for vulnerabilities, dependency issues, auth flaws
- **Performance-Analyzer**: Profiles code, identifies bottlenecks, suggests optimizations
- **API-Designer**: Reviews/designs REST/GraphQL APIs, ensures consistency
- **Documentation-Writer**: Generates comprehensive docs from code
- **Migration-Expert**: Handles database migrations, version upgrades, refactoring

## Requirements

- **VS Code Insiders** (recommended for latest agent features and bug fixes)
- **GitHub Copilot** subscription with multi-agent support
- **VS Code Settings:**
  ```json
  {
    "chat.customAgentInSubagent.enabled": true,
    "github.copilot.chat.responsesApiReasoningEffort": "high"
  }
  ```
  - `customAgentInSubagent.enabled`: Allow subagents to use custom agents defined in a '-agents.md' files like the ones above 
  - `responsesApiReasoningEffort`: Set to "high" for enhanced reasoning in planning agents (GPT models)

## Best Practices

1. **Use Prometheus for complex features** - Let it research and plan before implementation
2. **Leverage parallel execution** - Invoke multiple Explorers/Oracles for large tasks
3. **Trust the TDD workflow** - Each phase is self-contained with tests
4. **Review before proceeding** - Check completed phases before moving forward
5. **Commit frequently** - After each approved phase after properly testing and ensuring phase functionality
6. **Delegate appropriately** - Let subagents handle heavy lifting


## Adding Custom Agents

You can extend the Atlas and Promethus agents with your own specialized subagents for domain-specific tasks (e.g., database experts, API specialists, security reviewers, etc.).

#### Quick Method: Let the AI Do It

The fastest way to add a custom agent is to simply ask Atlas:

```
@Atlas Create a new subagent called Database-Expert that specializes in SQL optimization, schema design, and query analysis. Integrate it with Prometheus and Atlas so they can delegate database-related tasks to it.
```

Atlas will:
1. Create the agent file with proper YAML frontmatter
2. Add it to Prometheus's research delegation list
3. Add it to Atlas's implementation delegation list
4. Update documentation

#### Manual Method: Step-by-Step

**1. Create Your Agent File**

Create a new file in your prompts directory: `YourAgent-subagent.agent.md`

```yaml
---
description: 'Brief description of what this agent does'
argument-hint: What kind of task to delegate (e.g., "Analyze database schema")
tools: ['search', 'usages', 'edit', 'runCommands', ...]  # Tools your agent needs
model: Claude Sonnet 4.5 (copilot)  # Or GPT-5.2, Gemini, etc.
---

You are a [ROLE] SUBAGENT called by a parent CONDUCTOR agent.

**Your specialty:** [Describe the domain expertise]

**Your scope:** [Define what tasks this agent handles]

**Core workflow:**
1. [Step 1 of your agent's process]
2. [Step 2 of your agent's process]
3. [Return structured findings/results]

[Add any additional instructions, constraints, or examples]
```

**2. Integrate with Prometheus** (for research tasks)

Edit `Prometheus.agent.md` and add your agent to the research delegation section:

```markdown
**YourAgent-subagent**:
- Provide a clear research goal related to [domain]
- Instruct to analyze [specific aspects]
- Tell them to return structured findings
```

Also add to Prometheus's constraints if it shouldn't delegate to your agent:
```markdown
- You CAN delegate to YourAgent-subagent for [domain] research
```

**3. Integrate with Atlas** (for implementation/review tasks)

Edit `Atlas.agent.md`:

a. Add to the subagent list at the top:
```markdown
6. YourAgent-subagent: THE [ROLE]. Expert in [domain expertise]
```

b. Add to the subagent instructions section:
```markdown
**YourAgent-subagent**:
- Use #runSubagent to invoke for [task type] tasks
- Provide [specific context needed]
- Instruct to follow [workflow/principles]
- Remind them to report back with [expected output]
```

**4. Test Your Integration**

Try invoking your agent through Atlas 
```
Let @YourAgent analyze the current database schema and optimize our SQL queries in the user service
```

**5. Document Usage** (Optional)

Add an entry to the README's Specialized Subagents section describing when to use your custom agent.

#### Best Practices for Custom Agents

- **Single Responsibility**: Each agent should have one clear domain of expertise
- **Clear Scope**: Define exactly what the agent does and doesn't handle
- **Model Selection**: Choose the right model for the task (Sonnet for complex reasoning, Flash for speed, GPT for research)
- **Tool Minimalism**: Only declare tools the agent actually needs
- **Return Format**: Always return structured findings (not raw dumps)
- **Parallel-Aware**: Consider if your agent can run in parallel with others

#### Example Custom Agents

- **Security-Auditor**: Reviews code for vulnerabilities, dependency issues, auth flaws
- **Performance-Analyzer**: Profiles code, identifies bottlenecks, suggests optimizations
- **API-Designer**: Reviews/designs REST/GraphQL APIs, ensures consistency
- **Documentation-Writer**: Generates comprehensive docs from code
- **Migration-Expert**: Handles database migrations, version upgrades, refactoring

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

This project builds upon the excellent work of:
- **[copilot-orchestra](https://github.com/ShepAlderson/copilot-orchestra)** by [ShepAlderson](https://github.com/ShepAlderson) - Foundation and concept for multi-agent orchestration
- **[oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)** by [code-yeongyu](https://github.com/code-yeongyu) - Inspiration for agent naming conventions and templates

---

**Note:** These agents are designed to work together. While individual agents can be used standalone, the full power comes from Atlas orchestrating the complete workflow with intelligent delegation and parallel execution.
