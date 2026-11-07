# PHASE-STATE — Phase 170

## Phase
170 — ENH-125: Tool-use policy for skills and agents (v3.18.0)

## Status
in_progress

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 170.1 | done ✅ | tool-policy.md + tool-policy.cjs (renderPolicyBlock, classifyBashCommand) — 3d17074 + review fix |
| 170.2 | done ✅ | policy sync + compact block in 22 skills, 20 agents, 14 workflows; DISPATCH_RULES |
| 170.3 | done ✅ | hooks-installer + tool-policy-hook warn|block|off + install --policy; matcher fix |
| 170.4 | done ✅ | lint 106 tests; proposal.md task-list instruction; phase150 timing de-flaked |
| 170.5 | pending | CHANGELOG 3.18.0 + resolve ENH-125 |

## Dependencies
- Phase 169 ✅

## Version Target
3.18.0 (MINOR)

## Sources
.viepilot/requests/ENH-125.md

## Todo
- [x] [vp] 170.1 — Policy source + classifier
- [x] [vp] 170.2 — Inject policy into skills, workflows, agents, dispatch prompts
- [x] [vp] 170.3 — PreToolUse policy hook (consent-gated)
- [x] [vp] 170.4 — Lint tests for policy presence and forbidden instructions
- [ ] [vp] 170.5 — CHANGELOG 3.18.0 + resolve ENH-125
