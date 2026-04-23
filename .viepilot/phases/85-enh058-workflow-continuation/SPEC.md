# Phase 85 Spec — Workflow Continuation Prompt (ENH-058)

## Goal
Add `AskUserQuestion` continuation prompts at the end of `vp-evolve` and `vp-request`
workflows so users are actively asked whether to proceed immediately to the next step,
eliminating the need to manually re-type commands.

## Context
- ENH-058 filed 2026-04-18
- Current: static "Next:" text list shown at completion — user must manually type next command
- Desired: AUQ prompt asks "Execute now? → /vp-auto" or "Plan now? → /vp-evolve"
- Selecting a live option immediately invokes the next skill in the same session
- Consistent with ENH-048 (AUQ across all skills) and ENH-055 (AUQ enforcement)

## Version Target
2.21.0 → **2.22.0** (MINOR — new interactive UX behavior)

## Affected Files

### Modified
- `viepilot/workflows/evolve.md` — Step 5: replace static "Next action" text with AUQ block
- `viepilot/workflows/request.md` — Step 6: replace static "Next:" list with AUQ block
- `skills/vp-evolve/SKILL.md` — add Step 5 continuation AUQ to "Prompts using AUQ" table
- `skills/vp-request/SKILL.md` — add Step 6 continuation AUQ to "Prompts using AUQ" table

### New
- `tests/unit/vp-workflow-continuation.test.js` (or extend existing workflow test)
- `CHANGELOG.md` — [2.22.0] entry
- `package.json` — bump to 2.22.0
- `README.md` — badge update

## AUQ Prompt Designs

### vp-evolve — Step 5 (Confirm & Suggest Next)
```
AskUserQuestion:
  question: "Phase plan ready. What would you like to do next?"
  options:
    - label: "Execute now → /vp-auto"
      description: "Start implementing Phase {N} immediately in this session (Recommended)"
    - label: "Create another request → /vp-request"
      description: "Log more requests before implementing"
    - label: "Done for now"
      description: "Exit — come back later with /vp-auto"
```
On "Execute now": invoke `vp-auto` skill immediately.

### vp-request — Step 6 (Confirm & Next Steps)
```
AskUserQuestion:
  question: "Request {ID} logged. What next?"
  options:
    - label: "Plan phase + tasks → /vp-evolve"
      description: "Create ROADMAP entry, phase dir, and task files now (Recommended)"
    - label: "Create another request → /vp-request"
      description: "Log more requests first"
    - label: "Done for now"
      description: "Exit — requests are saved in backlog"
```
On "Plan phase + tasks": invoke `vp-evolve` skill immediately.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code (terminal) | ✅ AUQ — REQUIRED; invoke next skill on selection |
| Cursor / Codex / Antigravity | ❌ Text fallback: show static "Next:" list as before |

## Tasks
| ID | Title | Complexity |
|----|-------|------------|
| 85.1 | AUQ continuation in `evolve.md` Step 5 + `request.md` Step 6 + SKILL.md AUQ tables | S |
| 85.2 | Contract tests + CHANGELOG + version 2.22.0 | S |

## Dependencies
- Phase 83 ✅ (touches `request.md` at Step 1B — must complete before Phase 85 edits Step 6)
- ENH-048 ✅ (AUQ foundation), ENH-055 ✅ (AUQ enforcement)

## Acceptance Criteria
- [ ] `evolve.md` Step 5 has AUQ block with 3 options; "Execute now" invokes vp-auto
- [ ] `request.md` Step 6 has AUQ block with 3 options; "Plan phase" invokes vp-evolve
- [ ] Both SKILL.md files updated: Step 5 / Step 6 entries in "Prompts using AUQ" table
- [ ] Text fallback documented for non-Claude Code adapters
- [ ] Contract tests: ≥4 tests (AUQ present in evolve.md, request.md, both SKILL.md)
- [ ] `CHANGELOG.md` has `[2.22.0]` entry
- [ ] `package.json` = "2.22.0"
