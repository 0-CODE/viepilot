# Task 20.2: ENH-031 — Slim vp-auto SKILL

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: in_progress
- **Complexity**: S
- **Git Tag**: `viepilot-vp-p20-t20.2`

## Task Metadata
```yaml
type: build
complexity: S
write_scope:
  - skills/vp-auto/SKILL.md
recovery_budget: S
```

## Objective
Reduce duplicate process text in `vp-auto` SKILL; keep routing + pointers to `workflows/autonomous.md` as single source of truth (ENH-031 direction **C**).

## Paths
| Path | Action |
|------|--------|
| `skills/vp-auto/SKILL.md` | Replace long `<process>` / success blocks with short summary + explicit “load autonomous.md” |

## File-Level Plan
- Preserve YAML frontmatter, `cursor_skill_adapter`, `scope_policy`, `implementation_routing_guard` (BUG-004 / ENH-021).
- Replace `<objective>` wall of duplicated workflow steps with 3–5 lines + bullet “state/git/recovery live in workflow”.
- Drop inlined Initialize banner pseudo-code and step-by-step process mirror; link to `docs/user/features/autonomous-mode.md` for flags.

## Best Practices to Apply
- [x] English for new skill body sections where mixed with existing Vietnamese policy text.
- [x] No behavior change for install path — skill still points `@$HOME/.cursor/viepilot/workflows/autonomous.md` for bundle context.

## Verification
```bash
wc -l skills/vp-auto/SKILL.md
grep -n 'workflows/autonomous.md' skills/vp-auto/SKILL.md | head -5
! grep -n '### 3. Execute Phase Loop' skills/vp-auto/SKILL.md
npm run cold-start:manifest
```
**Expected:** `SKILL.md` well under 120 lines; autonomous references present; third grep exits 1 (section removed); manifest updates SKILL byte count.

## Pre-execution documentation gate
- [x] Written plan in this file
- [x] `PHASE-STATE.md` task 20.2 `in_progress` before first implementation commit

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - skills/vp-auto/SKILL.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [ ] SKILL is routing-focused; no long duplicate of autonomous steps
- [ ] Install/template copy of skill stays consistent if mirrored from repo

## Implementation Notes
_(post-completion)_

## Files Changed
_(post-completion)_

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
