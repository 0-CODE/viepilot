# Phase 170 Spec — ENH-125: Tool-use policy for skills and agents

## Goal
Every ViePilot skill, workflow, agent and dispatch prompt states one adapter-mapped tool policy — Read to read, Grep/Glob to search, Edit to change, Write to create, Task to delegate, TodoWrite (TaskCreate family) to track — and never edits files through sed/python/heredoc. A lint test and an optional PreToolUse hook enforce it.

## Requests
`.viepilot/requests/ENH-125.md`

## Design decisions
- Policy source lives in `templates/tool-policy.md` + `lib/tool-policy.cjs`; SKILL/agent blocks are generated from it, not hand-copied.
- Hook default mode `warn`; `block` and `off` via `vp-tools config set tools.policy`.
- Host/system instructions win over the policy; the agent reports the conflict instead of silently deviating.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).

## Target Version
3.18.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 170.1 | Policy source + classifier | M |
| 170.2 | Inject policy into skills, workflows, agents, dispatch prompts | L |
| 170.3 | PreToolUse policy hook (consent-gated) | M |
| 170.4 | Lint tests for policy presence and forbidden instructions | M |
| 170.5 | CHANGELOG 3.18.0 + resolve ENH-125 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 170 --phase-complete` → exit 0
- [ ] version = 3.18.0
