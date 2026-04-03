# Task 20.2: ENH-031 — Slim vp-auto SKILL

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: not_started
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

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
