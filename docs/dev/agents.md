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

Since v3.2.0 (ENH-086), all 9 agents are **native Claude Code agent definitions** installed
to `~/.claude/agents/` and visible in the `/agents` dialog.

```
~/.claude/agents/                        ← All 9 agents visible in /agents (v3.2.0+)
    │
    ├── vp-task-executor.md              ← Task implementation worker
    ├── vp-phase-planner.md              ← Phase dependency + cluster planner
    ├── vp-quality-gate.md               ← Verification runner
    ├── tracker-agent.md                 ← .viepilot/TRACKER.md read/write
    ├── research-agent.md                ← WebSearch + WebFetch (isolated context)
    ├── file-scanner-agent.md            ← Glob + Grep (repo-wide scanning)
    ├── changelog-agent.md               ← CHANGELOG + version bump (single authority)
    ├── test-generator-agent.md          ← tests/*.test.js generation + run
    └── doc-sync-agent.md                ← skills/*/SKILL.md bulk update

~/.claude/viepilot/agents/               ← Spec files retained for non-CC adapters
    └── (same 6 workflow agents, spec format for Cursor/Codex/Antigravity)
```

Native definitions live in `agents/claude-code/` and spec files in `agents/`.
Both are installed by `vp-tools install --target claude-code`.

## Agent Catalog

### tracker-agent
**Files**: `agents/tracker-agent.md` (spec), `agents/claude-code/tracker-agent.md` (native, v3.2.0+)
**Purpose**: Read/write TRACKER.md — phase status, task status, decision log, request table.
**When to invoke**: vp-auto (task start/complete/phase complete), vp-request (Step 5), vp-evolve (phase creation).
**Claude Code subagent_type**: `tracker-agent` (native since v3.2.0)

### research-agent
**Files**: `agents/research-agent.md` (spec), `agents/claude-code/research-agent.md` (native, v3.2.0+)
**Purpose**: WebSearch + WebFetch + summarize for feasibility studies and tech research.
**When to invoke**: vp-request (Step 2B — auto-triggered for Feature/platform requests), vp-brainstorm (external validation).
**Claude Code subagent_type**: `research-agent` (native since v3.2.0; uses claude-sonnet-4-6)

### file-scanner-agent
**Files**: `agents/file-scanner-agent.md` (spec), `agents/claude-code/file-scanner-agent.md` (native, v3.2.0+)
**Purpose**: Glob + Grep across repo to find affected files, detect stale refs.
**When to invoke**: vp-audit (Tier 1+2 scan steps), vp-evolve (impact analysis), vp-rollback (state restore).
**Claude Code subagent_type**: `file-scanner-agent` (native since v3.2.0)

### changelog-agent
**Files**: `agents/changelog-agent.md` (spec), `agents/claude-code/changelog-agent.md` (native, v3.2.0+)
**Purpose**: Atomically append CHANGELOG entry + bump package.json version.
**When to invoke**: vp-auto post-phase (last task), vp-evolve (milestone ship).
**Claude Code subagent_type**: `changelog-agent` (native since v3.2.0)
**Note**: Single authority for version bumps — resolves ENH-053.

### test-generator-agent
**Files**: `agents/test-generator-agent.md` (spec), `agents/claude-code/test-generator-agent.md` (native, v3.2.0+)
**Purpose**: Generate contract tests from acceptance criteria, run suite, report pass/fail.
**When to invoke**: Last task of each phase — triggered by `autonomous.md` when task has `## Acceptance Criteria`.
**Claude Code subagent_type**: `test-generator-agent` (native since v3.2.0)

### doc-sync-agent
**Files**: `agents/doc-sync-agent.md` (spec), `agents/claude-code/doc-sync-agent.md` (native, v3.2.0+)
**Purpose**: Bulk-apply the same change to ≥5 `.md` files (adapter rows, banners, etc.).
**When to invoke**: Auto-triggered by autonomous.md when task Paths block has ≥5 identical file types.
**Claude Code subagent_type**: `doc-sync-agent` (native since v3.2.0)

## Invocation Patterns

### Claude Code (terminal) — v3.2.0+

Use the agent's name directly as `subagent_type`:

```js
Agent({
  subagent_type: "changelog-agent",   // direct native agent type
  description: "Bump to {version} + CHANGELOG",
  prompt: "version: {version}. date: {today}. entries: {entries}."
})
```

No "Load agents/X.md" preamble needed — the system prompt is baked into the native definition.

### Cursor / Codex / Antigravity

Execute the equivalent operation inline in the same session. The agent `.md` file
describes the exact steps — follow them as a scoped sub-prompt.

## Adapter Behavior Table

| Agent | Claude Code | Cursor | Codex | Antigravity |
|-------|------------|--------|-------|-------------|
| tracker-agent | Native: `tracker-agent` (v3.2.0+) | Inline | Inline | Inline |
| research-agent | Native: `research-agent` (v3.2.0+) | Inline if web available | Inline if web available | Inline if web available |
| file-scanner-agent | Native: `file-scanner-agent` (v3.2.0+) | Inline | Inline | Inline |
| changelog-agent | Native: `changelog-agent` (v3.2.0+) | Inline | Inline | Inline |
| test-generator-agent | Native: `test-generator-agent` (v3.2.0+) | Inline | Inline | Inline |
| doc-sync-agent | Native: `doc-sync-agent` (v3.2.0+) | Sequential inline | Sequential inline | Sequential inline |

## Adding a New Agent

1. Create `agents/{name}-agent.md` with all required sections:
   - `## Purpose`
   - `## Inputs`
   - `## Outputs`
   - `## Invocation Pattern` (Claude Code + text fallback)
   - `## Adapter Behavior` (table covering all 4 adapters)
   - `## Notes`

2. Create `agents/claude-code/{name}-agent.md` with YAML frontmatter (name, description,
   model, tools, disallowedTools) and focused system prompt. Reference `vp-task-executor.md`.

3. Add the agent to the delegation table in `workflows/autonomous.md`
   under `## Agent Delegation`.

4. Wire invocation into the relevant workflow steps using `subagent_type: "{name}-agent"`.

5. `claudeAgentsSrc: 'agents/claude-code'` already covers all files — no install config change needed.

5. Write a contract test in `tests/unit/` verifying the file exists and has required sections.

## Naming Conventions

- File: `agents/{name}-agent.md` (kebab-case, always ends in `-agent`)
- Reference: `{name}-agent` (e.g., `tracker-agent`, not `tracker`)
- Invocation: `Load agents/{name}-agent.md for full spec.`

## Hook Events Reference (ENH-099)

Complete list of 28 hook events supported in Claude Code (as of May 2026).
Source: [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)

| Hook | Fires When | Blocking | Key ViePilot Use |
|------|-----------|---------|-----------------|
| `SessionStart` | Session begins/resumes | No | Inject context, set env, watch paths |
| `SessionEnd` | Session terminates | No | Cleanup, logging |
| `UserPromptSubmit` | User submits prompt | Yes | Block/augment prompts; set session title |
| `UserPromptExpansion` | Slash command expands | Yes | Audit `/vp-*` invocations |
| `PreToolUse` | Before any tool executes | Yes | Block destructive commands, log ops |
| `PostToolUse` | After tool succeeds | No | Validate output, add context |
| `PostToolUseFailure` | After tool fails | No | Log failures |
| `PostToolBatch` | After parallel tools resolve | Yes | Validate parallel fan-out batch results |
| `PermissionRequest` | Permission dialog appears | Yes | Auto-approve known safe patterns |
| `PermissionDenied` | Tool call denied | No | Signal retry allowed |
| `Stop` | Claude finishes responding | Yes | Continue autonomous loop without re-prompt |
| `StopFailure` | Turn ends due to API error | No | Error logging |
| `Notification` | Claude Code sends notification | No | Desktop notification / terminal bell |
| `SubagentStart` | Subagent spawned | No | Log agent start, inject context |
| `SubagentStop` | Subagent finishes | Yes | Block premature stop, collect output |
| `TaskCreated` | TaskCreate tool used | Yes | Enforce naming conventions |
| `TaskCompleted` | Task marked complete | Yes | Trigger quality gate automatically |
| `TeammateIdle` | Agent team teammate idle | Yes | Keep agent alive / assign next task |
| `CwdChanged` | Working directory changes | No | Reactive env setup (direnv) |
| `FileChanged` | Watched file changes | No | React to test/code file saves |
| `ConfigChange` | Config file changes | Yes | Block unexpected config changes |
| `WorktreeCreate` | Worktree being created | Yes | Custom worktree setup |
| `WorktreeRemove` | Worktree being removed | No | Cleanup |
| `PreCompact` | Before context compaction | Yes | Block compaction during critical phase steps |
| `PostCompact` | After compaction completes | No | Re-inject phase context |
| `Setup` | `--init-only` / `-p --init` | No | One-time dependency installation |
| `InstructionsLoaded` | CLAUDE.md / rules loaded | No | Audit logging |
| `Elicitation` | MCP server requests user input | Yes | Auto-respond to MCP prompts |

### Exit code behavior
- **Exit 0**: success; JSON output processed
- **Exit 2**: blocking error; stderr shown, event blocked
- **Other non-zero**: non-blocking; first line of stderr shown

### Most impactful hooks for ViePilot autonomous runs
- `TaskCreated` + `TaskCompleted` → hook-driven quality gates (no manual trigger needed)
- `PreCompact` + `PostCompact` → protect long phases from mid-run context loss
- `SubagentStart` + `SubagentStop` → trace agent orchestration
- `Stop` → enables fully autonomous `/vp-auto` without re-prompting
- `PostToolBatch` → validate parallel fan-out results (ENH-096/097 pattern)

## Agent Teams (Experimental)

Agent Teams allow multiple Claude Code sessions to communicate via message passing.
Requires: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable.

### Tools

| Tool | Description |
|------|-------------|
| `TeamCreate` | Create a named team with multiple teammate sessions |
| `TeamDelete` | Disband team and clean up all teammate processes |
| `SendMessage` | Send a message to a teammate by name, or resume a stopped subagent |

### Architecture

```
TeamCreate → defines lead + teammates
TeamLead   → assigns tasks via SendMessage
Teammates  → work independently, respond via SendMessage back to lead
TeamDelete → cleanup after all work complete
```

### ViePilot roadmap

Agent Teams represent a future upgrade path for the vp-auto orchestration model (ENH-096/097).
Currently, vp-auto uses fire-and-forget `Agent` spawning (no back-and-forth). Agent Teams
would enable:
- Lead orchestrator assigns tasks AND receives status updates
- Teammates can ask questions mid-task
- Better handling of inter-task dependency resolution

**Status**: experimental — requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.
Not yet used in ViePilot workflows. Tracked via ENH-099.
