# Phase 5: Hotfix — Install Path Convention + Logic Gaps — State

## Overview
- **Started**: 2026-04-03
- **Status**: complete ✅
- **Progress**: 5/5 tasks (100%)
- **Current Task**: —

## Execution State
```yaml
current: not_started
status: not_started
available_transitions:
  on_start: executing
  on_pass: pass
  on_fail_l1: recovering_l1
  on_fail_l2: recovering_l2
  on_fail_l3: recovering_l3
  on_exhausted: control_point
recovery_budget:
  l1_used: 0
  l2_used: 0
  l3_used: 0
```

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 5.1 | Revert SKILL.md source path convention | done | 2026-04-03 | 2026-04-03 | vp2-p5-t5.1 |
| 5.2 | Revert crystallize.md workflow path | done | 2026-04-03 | 2026-04-03 | vp2-p5-t5.2 |
| 5.3 | Fix install script — workflow rewrite step | done | 2026-04-03 | 2026-04-03 | vp2-p5-t5.3 |
| 5.4 | Fix HANDOFF.log event naming gaps | done | 2026-04-03 | 2026-04-03 | vp2-p5-t5.4 |
| 5.5 | Version bump 2.0.0 → 2.0.1 + CHANGELOG | done | 2026-04-03 | 2026-04-03 | vp2-p5-t5.5 |

## Sub-task Tracking
| Sub-task | Description | Status | Attempts |
|----------|-------------|--------|----------|

## Blockers
_None currently_

## Decisions Made (This Phase)
| Decision | Rationale | Task |
|----------|-----------|------|
| Revert `.claude/` → `.cursor/` in source | Install script convention: source=.cursor, rewrite to .claude for Claude Code target. Task 4.6a inadvertently reversed this. | 5.1/5.2 |
| Add workflow rewrite step | Install script only rewrites skills dir, not workflows dir — so Claude Code installs had stale .cursor refs in workflow files | 5.3 |

## Files Changed
| File | Action | Task |
|------|--------|------|

## Quality Metrics
- SKILL.md files fixed: 14/14
- Workflow files fixed: 1/1 (crystallize.md)
- Install script: fixed (+2 rewrite steps, +1 test)
- Logic gaps: 2/2 addressed (HANDOFF.log events)

## Notes
Root cause of BUG-A: Task 4.6a changed the source-file convention from `.cursor/viepilot/` to `.claude/viepilot/`, reversing the install script's expected flow. The install script was designed with source=`.cursor/viepilot/` and rewrites to `.claude/viepilot/` only for Claude Code installs. BUG-B: No rewrite step existed for workflow files in the claude-mirrored directory.
