# Task 14.1: ENH-027 — vp-tools `ask` (TUI)

## Meta
- **Phase**: 14-enh-027-vp-tools-ask
- **Status**: complete
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p14-t14.1`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - bin/vp-tools.cjs
  - package.json
  - workflows/brainstorm.md
  - skills/vp-brainstorm/SKILL.md
recovery_budget: M
```

## Objective
`node bin/vp-tools.cjs ask` with `@clack/prompts`; `--single` / `--multi`; TTY fallback; at least one brainstorm workflow hook.

## Paths
```yaml
files_to_create: []
files_to_modify:
  - bin/vp-tools.cjs
  - package.json
  - workflows/brainstorm.md
  - skills/vp-brainstorm/SKILL.md
```

## File-Level Plan
- `bin/vp-tools.cjs`: add `ask` subcommand parsing for `--single` / `--multi`, option normalization, `@clack/prompts` integration for interactive TTY, and stdout-friendly fallback output for non-TTY/script usage.
- `package.json`: add runtime dependency required for the new TUI prompt flow.
- `workflows/brainstorm.md`: document the `vp-tools ask` path as the preferred interactive Q&A mechanism with fallback to plain numbered prompts.
- `skills/vp-brainstorm/SKILL.md`: update routing guidance so brainstorm sessions prefer `vp-tools ask` when terminal interaction is available.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-027.md
```

## Acceptance Criteria
- [x] `vp-tools ask --single` renders arrow-key selection in terminal
- [x] `vp-tools ask --multi` renders checkbox selection in terminal
- [x] Selected value(s) printed to stdout on confirm
- [x] Graceful fallback to text prompt when TTY not available
- [x] `@clack/prompts` added to `package.json` dependencies
- [x] Used in at least one brainstorm Q&A step (demo integration)

## Verification
```yaml
automated:
  - command: "node bin/vp-tools.cjs help ask || true"
    expected: "help output includes ask usage once subcommand is wired"
  - command: "npm test -- --runInBand"
    expected: "targeted test suite passes or existing unrelated failures are identified"
manual:
  - description: "Run `node bin/vp-tools.cjs ask --single ...` in a TTY and confirm arrow-key selection prints the selected key"
    required: true
  - description: "Run the same command in non-interactive mode and confirm graceful plain-text fallback"
    required: true
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per vp-auto protocol

## Implementation Notes
- Reuse the existing prompt utilities pattern in `bin/vp-tools.cjs` where possible, but do not regress current non-interactive behavior for existing commands.
- Normalize options so both brainstorm docs examples (`A|Label`) and request examples (`A=Label`) can be supported if implementation cost stays low.
- Keep stdout machine-friendly: confirmed selections should emit only the selected key or comma-separated keys after prompt completion.
- Brainstorm integration can be documentation-first for this phase as long as at least one brainstorm Q&A step explicitly routes through `vp-tools ask` when TTY is present and falls back otherwise.

## Post-Completion
- `bin/vp-tools.cjs`: shipped `ask` subcommand with `@clack/prompts` TTY mode plus readline/non-interactive fallback.
- `workflows/brainstorm.md` and `skills/vp-brainstorm/SKILL.md`: now point brainstorm Q&A to `vp-tools ask` when terminal interaction is available.
- Verification: `node --check bin/vp-tools.cjs`, `node bin/vp-tools.cjs help ask`, TTY smoke for `--single` and `--multi`, and `npm test -- --runInBand` all passed on 2026-04-03.
