# Phase 168 Spec — ENH-118: Native todo mirror (mandatory)

## Goal
Make `/vp-evolve` and `/vp-auto` always build and maintain a task list in the **host's native todo
tool** (Claude Code `TaskCreate`/`TaskUpdate`/`TaskList`, legacy `TodoWrite`, Antigravity
`write_todos`, others once verified), so ViePilot follows the host's own working flow and no work is
skipped. Today this is optional and therefore skipped (user report). The mirror becomes a **gate**:
no todo list → no task dispatch; todo drift → no task/phase completion. When the host has no todo
tool, a `## Todo` checklist in `PHASE-STATE.md` is the fallback and is checked the same way.

## Request
- `.viepilot/requests/ENH-118.md`

## Execution order (branch `from-3.12.2`)
Planned after 165–167 but **executed first: 168 → 166 → 167**, so phases 166/167 run under the new
gate and serve as its first real trial. Versions: 168 → 3.14.0, 166 → 3.15.0, 167 → 3.16.0.

## Principles
- `PHASE-STATE.md` stays the **source of truth**; the native todo list is a **mirror**.
- Claude Code tasks do not survive compaction/resume → rebuild from PHASE-STATE on every
  `/vp-auto`, `/vp-resume`, and after compaction.
- Only manage items prefixed `[vp]`; never touch the user's own todo items.
- Detect tools at runtime; never hard-code one name. Unverified tool names → fallback.

## Existing infrastructure to REUSE
- `lib/adapter-context.cjs` — has `todo_read`/`todo_write` keys (claude-code `TodoRead`/`TodoWrite`, others null; unused).
- `bin/vp-tools.cjs` — `phase-info`, `task-status`, `git-persistence`, `hooks install` (writes `~/.claude/settings.json`).
- `agents/claude-code/tracker-agent.md` — all state transitions go through it (ENH-057).
- `workflows/autonomous.md` — TaskCreate already mentioned for Teams mode only (generalize).

## Target Version
3.14.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 168.1 | `lib/adapter-context.cjs` `todo` capability for 5 adapters (tools, mode, verified, enable_hint); verify Cursor/Codex/Copilot tool names from official docs | M |
| 168.2 | `lib/todo-mirror.cjs` (new) + `vp-tools todo list|sync|check|payload --phase N` with `## Todo` fallback checklist and drift detection | L |
| 168.3 | Workflows + skills: mandatory Todo Mirror step in evolve; phase-start gate, per-transition updates, phase-complete `todo check` gate and resume rebuild in autonomous/resume-work; tracker-agent sync hook | L |
| 168.4 | `vp-tools todo enable --adapter claude-code` — consent-gated write of `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` to settings `env` (dry-run, `--yes`); installer prints the hint only | S |
| 168.5 | Resilient tests + CHANGELOG `[3.14.0]` (via changelog-agent) | M |

## Dependencies
- Phase 165 ✅. FEAT-021 ADAPTER_CONTEXT, ENH-057 tracker-agent, ENH-096/097 delegation.
- Anchor: `feedback_resilient_page_count_asserts` (>= N; run full npm test).

## Paths (planned)
- `lib/adapter-context.cjs`, `lib/todo-mirror.cjs` (new), `bin/vp-tools.cjs`
- `workflows/evolve.md`, `workflows/autonomous.md`, `workflows/resume-work.md`
- `skills/vp-evolve/SKILL.md`, `skills/vp-auto/SKILL.md`, `agents/claude-code/tracker-agent.md`
- `lib/viepilot-install.cjs` (hint only)
- `tests/unit/phase168-enh118-native-todo-mirror.test.js` (new)
- `CHANGELOG.md`, `package.json`

## Verification
- [ ] `npx jest tests/unit/phase168-enh118-native-todo-mirror.test.js --no-coverage` → pass
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 168` → exit 0 after phase complete
- [ ] version = 3.14.0
