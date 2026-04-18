# ViePilot Agents Layer

Developer reference for the agents system introduced in ENH-057 (v2.20.0).

## Why Agents?

Before v2.20.0, vp-* skills handled everything inline: research web fetches, TRACKER.md
updates, CHANGELOG writes, file scans, test generation, and doc updates all ran
sequentially in the main LLM context. This caused:

1. **Context bloat** — long skill runs exhausted context with intermediate data
2. **Sequential bottleneck** — research + write + verify ran one-at-a-time
3. **Skill coupling** — each skill re-implemented the same patterns (tracker update, version bump)
4. **No parallelism** — vp-auto tasks that could run concurrently didn't

The agents layer delegates these operations to dedicated sub-agents — isolated contexts
that run in parallel or in sequence without polluting the calling skill's conversation.

## Architecture

```
vp-* skill (orchestrator)
    │
    ├── tracker-agent      ← .viepilot/TRACKER.md read/write
    ├── research-agent     ← WebSearch + WebFetch (isolated context)
    ├── file-scanner-agent ← Glob + Grep (repo-wide scanning)
    ├── changelog-agent    ← CHANGELOG + version bump (single authority)
    ├── test-generator-agent ← tests/*.test.js generation + run
    └── doc-sync-agent     ← skills/*/SKILL.md bulk update
```

Agent definitions live in `agents/` at the repo root. They are installed to
`{viepilotDir}/agents/` alongside workflows and templates.

## Agent Catalog

### tracker-agent
**File**: `agents/tracker-agent.md`
**Purpose**: Read/write TRACKER.md — phase status, task status, decision log, request table.
**When to invoke**: vp-auto (task start/complete/phase complete), vp-request (Step 5), vp-evolve (phase creation).
**Claude Code subagent_type**: `general-purpose`

### research-agent
**File**: `agents/research-agent.md`
**Purpose**: WebSearch + WebFetch + summarize for feasibility studies and tech research.
**When to invoke**: vp-request (Step 2B — auto-triggered for Feature/platform requests), vp-brainstorm (external validation).
**Claude Code subagent_type**: `general-purpose`

### file-scanner-agent
**File**: `agents/file-scanner-agent.md`
**Purpose**: Glob + Grep across repo to find affected files, detect stale refs.
**When to invoke**: vp-audit (Tier 1–4), vp-evolve (impact analysis), vp-rollback (state restore).
**Claude Code subagent_type**: `Explore` (specialized for codebase scanning)

### changelog-agent
**File**: `agents/changelog-agent.md`
**Purpose**: Atomically append CHANGELOG entry + bump package.json version.
**When to invoke**: vp-auto post-phase (last task), vp-evolve (milestone ship).
**Claude Code subagent_type**: `general-purpose`
**Note**: Single authority for version bumps — resolves ENH-053.

### test-generator-agent
**File**: `agents/test-generator-agent.md`
**Purpose**: Generate contract tests from acceptance criteria, run suite, report pass/fail.
**When to invoke**: Last task of each phase (the `N.last` contract-test task pattern).
**Claude Code subagent_type**: `general-purpose`

### doc-sync-agent
**File**: `agents/doc-sync-agent.md`
**Purpose**: Bulk-apply the same change to ≥5 `.md` files (adapter rows, banners, etc.).
**When to invoke**: Auto-triggered by autonomous.md when task Paths block has ≥5 identical file types.
**Claude Code subagent_type**: `general-purpose`

## Invocation Patterns

### Claude Code (terminal)

Use the `Agent` tool with the appropriate `subagent_type`:

```js
Agent({
  subagent_type: "general-purpose",  // or "Explore" for file-scanner
  description: "{agent-name}: {operation-summary}",
  prompt: `
    Load agents/{agent-name}.md for the full specification.
    Execute operation: {operation}
    Inputs: {inputs}
  `
})
```

### Cursor / Codex / Antigravity

Execute the equivalent operation inline in the same session. The agent `.md` file
describes the exact steps — follow them as a scoped sub-prompt.

## Adapter Behavior Table

| Agent | Claude Code | Cursor | Codex | Antigravity |
|-------|------------|--------|-------|-------------|
| tracker-agent | Subagent (general-purpose) | Inline | Inline | Inline |
| research-agent | Subagent (general-purpose) | Inline if web available | Inline if web available | Inline if web available |
| file-scanner-agent | Subagent (Explore) | Inline | Inline | Inline |
| changelog-agent | Subagent (general-purpose) | Inline | Inline | Inline |
| test-generator-agent | Subagent (general-purpose) | Inline | Inline | Inline |
| doc-sync-agent | Subagent (general-purpose) | Sequential inline | Sequential inline | Sequential inline |

## Adding a New Agent

1. Create `agents/{name}-agent.md` with all required sections:
   - `## Purpose`
   - `## Inputs`
   - `## Outputs`
   - `## Invocation Pattern` (Claude Code + text fallback)
   - `## Adapter Behavior` (table covering all 4 adapters)
   - `## Notes`

2. Add the agent to the delegation table in `workflows/autonomous.md`
   under `## Agent Delegation`.

3. Wire invocation into the relevant workflow steps.

4. Add to `installSubdirs` in the adapter that should include `agents/`.

5. Write a contract test in `tests/unit/` verifying the file exists and has required sections.

## Naming Conventions

- File: `agents/{name}-agent.md` (kebab-case, always ends in `-agent`)
- Reference: `{name}-agent` (e.g., `tracker-agent`, not `tracker`)
- Invocation: `Load agents/{name}-agent.md for full spec.`
