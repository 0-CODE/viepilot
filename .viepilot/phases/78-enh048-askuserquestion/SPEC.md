# Phase 78 — ENH-048: AskUserQuestion Integration — Adapter-Aware Interactive Prompting

## Goal
Integrate `AskUserQuestion` tool into all vp-* workflows/skills that currently ask users
questions via plain-text numbered lists. Implement adapter-aware conditional pattern so
Claude Code (terminal) gets structured interactive UI while Cursor, Codex, Antigravity,
and other adapters gracefully fall back to existing text prompts.

## Version
2.14.0 → **2.15.0**

## Background
`AskUserQuestion` is a Claude Code native tool rendering structured click-to-select UI
(options with descriptions, multi-select, preview panels). Research confirmed:
- **Claude Code terminal**: fully supported ✅
- **Claude Code VS Code ext**: partial (terminal yes, UI no — issue #12609) ⚠️
- **Cursor Plan Mode**: `AskQuestion` exists but Plan Mode only ⚠️
- **Cursor Agent/Skills Mode**: not supported ❌
- **Codex CLI**: not native (community MCP only) ❌
- **Antigravity native agent**: not supported (Artifact model, no MCP) ❌

## Adapter-Aware Pattern (canonical definition)
Applied to every question block in all affected workflows/skills:

```markdown
> **Adapter-aware prompt — choose your method:**
> - **Claude Code (terminal):** use `AskUserQuestion` tool with structured options below
> - **Cursor / Codex / Antigravity / other:** use text list below

**[AskUserQuestion spec]** ← describes what tool call to make
**[Text fallback]** ← existing numbered list (always present)
```

## Dependencies
Phase 77 ✅ (ENH-047)

## Affected Files
- `workflows/crystallize.md` (Task 78.1)
- `workflows/brainstorm.md` (Task 78.2)
- `workflows/request.md` (Task 78.3)
- `workflows/evolve.md` (Task 78.3)
- `skills/vp-crystallize/SKILL.md` (Task 78.4)
- `skills/vp-brainstorm/SKILL.md` (Task 78.4)
- `skills/vp-request/SKILL.md` (Task 78.4)
- `tests/unit/vp-enh048-askuserquestion.test.js` (Task 78.4 — new)
- `CHANGELOG.md` (Task 78.5)
- `package.json` (Task 78.5)

## Tasks

### Task 78.1 — Adapter Pattern + workflows/crystallize.md
Define canonical adapter-aware pattern. Apply to crystallize.md:
Step 1 (project type / stack / UI direction questions) + Step 1C/1D where applicable.

### Task 78.2 — workflows/brainstorm.md
Apply adapter-aware pattern to brainstorm.md topic gathering, goals/scope questions.

### Task 78.3 — workflows/request.md + workflows/evolve.md
Apply to request.md (request type detection, severity/priority selects) and
evolve.md (intent detection, feature info gathering).

### Task 78.4 — skills/vp-{crystallize,brainstorm,request}/SKILL.md + tests
Add "Adapter Compatibility" section to each SKILL.md. Write contract tests
asserting the adapter-aware instruction block is present in affected workflow files.

### Task 78.5 — CHANGELOG + version 2.15.0
Update CHANGELOG.md `[2.15.0]` section. Bump package.json to `2.15.0`.

## Acceptance Criteria (Phase-level)
- [ ] Adapter-aware pattern defined canonically in SPEC.md
- [ ] `workflows/crystallize.md` — all question blocks updated with AUQ spec + fallback
- [ ] `workflows/brainstorm.md` — all question blocks updated
- [ ] `workflows/request.md` — type detection + detail gathering updated
- [ ] `workflows/evolve.md` — intent + feature info questions updated
- [ ] Each updated workflow has adapter compatibility table
- [ ] `skills/vp-crystallize/SKILL.md` has Adapter Compatibility section
- [ ] `skills/vp-brainstorm/SKILL.md` has Adapter Compatibility section
- [ ] `skills/vp-request/SKILL.md` has Adapter Compatibility section
- [ ] ≥6 contract tests passing
- [ ] CHANGELOG `[2.15.0]` present; `package.json` = `"2.15.0"`
