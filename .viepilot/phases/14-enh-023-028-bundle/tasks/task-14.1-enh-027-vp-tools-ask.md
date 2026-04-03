# Task 14.1: ENH-027 — vp-tools `ask` (TUI)

## Meta
- **Phase**: 14-enh-023-028-bundle
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: none
- **Git Tag**: `viepilot-vp-p14-t14.1`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - bin/vp-tools.cjs
  - package.json
  - package-lock.json
  - workflows/brainstorm.md
  - skills/vp-brainstorm/SKILL.md
recovery_budget: M
can_parallel_with: []
recovery_overrides:
  L3: { block: false, reason: "" }
```

## Objective
Implement `node bin/vp-tools.cjs ask` with `@clack/prompts`: `--single` and `--multi`; stdout result; non-TTY fallback. Document integration in brainstorm workflow (at least one Q&A path).

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-027.md
  - docs/brainstorm/session-2026-04-03.md
```

## Acceptance Criteria
- [ ] Matches ENH-027 acceptance criteria
- [ ] `@clack/prompts` in package.json dependencies

## Paths
```yaml
files_to_modify:
  - bin/vp-tools.cjs
  - package.json
files_to_create: []
```

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per vp-auto protocol

## Post-Completion
_(AI fills after PASS)_
