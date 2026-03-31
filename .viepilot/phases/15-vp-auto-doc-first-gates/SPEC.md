# Phase 15 Specification — vp-auto doc-first execution gates (BUG-001)

## Metadata

- **Phase**: 15
- **Milestone**: M1.12 — Doc-first autonomous execution
- **Request**: BUG-001
- **Priority**: high
- **Status**: in_progress

## Objective

Make `/vp-auto` behavior **predictably doc-first**: validate task contract and record pre-execution artifacts **before** implementation, so “code first, docs later” cannot pass silently.

## Scope

1. Harden `workflows/autonomous.md` with an explicit **pre-execution gate** sequence (ordered steps, hard stop).
2. Align `skills/vp-auto/SKILL.md` with the same ordering and enforcement language.
3. Extend `templates/phase/TASK.md` with a **Pre-execution documentation gate** checklist.
4. Extend `workflows/audit.md` with heuristic checks for **execute-first / docs-later** risk.

## Out of scope

- Auto-fixing historical phases that never used the new checklist.
- Changing runtime CLI behavior of `vp-tools` (documentation-only enforcement in workflow/skills).

## Success criteria

- [ ] Autonomous workflow states a single canonical order: validate → pre-doc gate → implement → verify → state updates.
- [ ] Task template forces visible pre-execution checklist items.
- [ ] Audit can flag suspected ordering violations (documented heuristics).
