# Phase 83 Spec — ViePilot Agents System (ENH-057)

## Goal
Create a lightweight **agents layer** for ViePilot: 6 dedicated sub-agents that handle
repetitive, parallelizable, or background tasks currently embedded inline in skill
workflows. This reduces context bloat, eliminates skill coupling, and enables true
parallelism for heavy operations.

## Context
- ENH-057 filed 2026-04-18
- Root problem: skills handle everything inline (research, tracker updates, changelog,
  file scanning, test generation, doc updates) — causing sequential bottlenecks + context bloat
- This phase creates the agent `.md` files and wires the highest-impact ones (tracker,
  changelog, research, doc-sync) into their primary callers

## Version Target
2.19.0 → **2.20.0** (MINOR — new agent layer + workflow integration)

## Agents to Create

| Agent | File | Primary Callers |
|-------|------|----------------|
| `tracker-agent` | `viepilot/agents/tracker-agent.md` | autonomous.md, request.md, evolve.md |
| `research-agent` | `viepilot/agents/research-agent.md` | request.md, brainstorm.md |
| `file-scanner-agent` | `viepilot/agents/file-scanner-agent.md` | audit.md, evolve.md, rollback.md |
| `changelog-agent` | `viepilot/agents/changelog-agent.md` | autonomous.md, evolve.md |
| `test-generator-agent` | `viepilot/agents/test-generator-agent.md` | autonomous.md (last task of each phase) |
| `doc-sync-agent` | `viepilot/agents/doc-sync-agent.md` | evolve.md, autonomous.md (bulk SKILL.md edits) |

## Affected Files

### New files
- `viepilot/agents/tracker-agent.md`
- `viepilot/agents/research-agent.md`
- `viepilot/agents/file-scanner-agent.md`
- `viepilot/agents/changelog-agent.md`
- `viepilot/agents/test-generator-agent.md`
- `viepilot/agents/doc-sync-agent.md`
- `docs/developer/agents.md`
- `tests/unit/vp-agents-system.test.js`

### Modified files
- `viepilot/workflows/autonomous.md` — delegate tracker updates + changelog to agents; integrate test-generator call
- `viepilot/workflows/request.md` — add research-agent gate for feasibility studies
- `CHANGELOG.md` — [2.20.0] entry
- `package.json` — bump to 2.20.0
- `README.md` — badge + test count update

## Tasks
| ID | Title | Complexity |
|----|-------|------------|
| 83.1 | Create 6 agent `.md` files in `viepilot/agents/` | M |
| 83.2 | Wire tracker-agent + changelog-agent into `autonomous.md` | M |
| 83.3 | Wire research-agent into `request.md` feasibility gate | S |
| 83.4 | Wire doc-sync-agent into `autonomous.md` bulk-edit pattern | S |
| 83.5 | Contract tests + `docs/developer/agents.md` + CHANGELOG + version 2.20.0 | S |

## Acceptance Criteria
- [ ] `viepilot/agents/` contains exactly 6 `.md` files
- [ ] Each agent file has: purpose, inputs, outputs, invocation pattern, adapter behavior table
- [ ] `autonomous.md` delegates tracker update to tracker-agent (Step 4, 6, post-phase)
- [ ] `autonomous.md` delegates changelog + version bump to changelog-agent
- [ ] `request.md` Step 1 auto-triggers research-agent when feasibility context needed
- [ ] doc-sync-agent documented + invocation pattern in autonomous.md Step 7 (bulk SKILL.md)
- [ ] Contract tests: ≥6 tests (one per agent — file exists + has required sections)
- [ ] `docs/developer/agents.md` covers architecture, invocation, adapter behavior
- [ ] package.json = "2.20.0"
